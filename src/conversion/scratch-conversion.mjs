import JSZip from "jszip";

import Scratch3EventBlocks from "../blocks/scratch3_event.mjs";

import Scratch3ControlBlocks from "../blocks/scratch3_control.mjs";

import { convertBlocksPart } from "./scratch-conversion-helper.mjs";

export default class ScratchConverter {
   data = null;

   scratchJson = null;

   /**
    *
    * @param {ArrayBuffer} scratchData An ArrayBuffer representation of the .sb3 file to convert
    */
   constructor(scratchData) {
      this.data = scratchData;
   }

   /**
    * Returns a .ptch1 patch project represented as an array buffer
    *
    * @returns {ArrayBuffer} The Patch project (.ptch1) represented as an array buffer
    */
   async getPatchArrayBuffer() {
      const scratchZip = await JSZip.loadAsync(this.data).then((newZip) => newZip);

      const projectJson = await this.getPatchProjectJsonBlob(scratchZip).then((blob) => blob);
      if (!projectJson) {
         return null;
      }

      const zip = new JSZip();

      zip.file("project.json", projectJson);

      const scratchFilesKeys = Object.keys(scratchZip.files);

      const filePromises = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const key of scratchFilesKeys) {
         if (key !== "project.json") {
            // TODO: consider checking if the file is an actual media file?
            filePromises.push(scratchZip.files[key].async("arraybuffer").then((arrayBuffer) => ({key: key, arrayBuffer: arrayBuffer})));
         }
      }

      const files = await Promise.all(filePromises);
      files.forEach(file => {
         zip.file(file.key, file.arrayBuffer);
      });

      const zippedProject = await zip.generateAsync({ type: "arraybuffer" }).then((content) => content);
      return zippedProject;
   }

   /**
    * 
    * @param {JSZip} zip 
    * @returns {Blob}
    */
   async getPatchProjectJsonBlob(zip) {
      if (!zip.files["project.json"]) {
         console.error("Couldn't find the project.json file in the scratch project. Abort.");
         return null;
      }

      const jsonDataString = await zip.files["project.json"].async("text").then((text) => text);
      const vmState = JSON.parse(jsonDataString);

      const globalVariables = [];

      // This function will convert each target's blocks and local variables into Patch code.
      // Then, it will remove the blocks from the JSON (not strictly necessary) and handle backgrounds and other
      // things that Patch and Scratch store differently. Also, everything will be moved to being a child of a json
      // object called "vmstate" that exists for some reason.
      // TODO: add more validation of scratch project

      // Step 1: blocks + variables to code; then add code
      for (let i = 0; i < vmState.targets.length; i++) {
         vmState.targets[i].threads = this.convertTargetBlocks(vmState.targets[i]);
      }

      // Step 2: remove blocks (this isn't strictly necessary) and variables + broadcasts (this is necessary)
      // Get rid of the variables removing part once sprite-wide variables are a thing. Keep the broadcasts
      // remover however.
      for (let i = 0; i < vmState.targets.length; i++) {
         vmState.targets[i].blocks = {};
         const variableKeys = Object.keys(vmState.targets[i].variables);
         variableKeys.forEach(key => {
            const variable = vmState.targets[i].variables[key];
            console.log(variable);
            if (vmState.targets[i].isStage) {
               // In Scratch, global variables are actually stored as sprite variables on the stage.
               globalVariables.push({name: variable[0], value: variable[1]});
            } else {
               globalVariables.push({name: `${vmState.targets[i].name}_${variable[0]}`, value: variable[1]});
            }
         });
         vmState.targets[i].variables = {};
         vmState.targets[i].lists = {};
         vmState.targets[i].broadcasts = {};
      }

      // Step 3: some odd jobs
      // TODO: implement these

      // Remove monitors as Patch doesn't support them
      vmState.monitors = [];

      // Step 4: make everything a child of "vmstate" and add global variables
      // TODO: global variables
      console.log(globalVariables);
      const baseJson = { vmstate: vmState, globalVariables: globalVariables };

      // Step 4: convert this back to a blob, make everything a child of "vmstate", and return it.
      const newJsonBlob = new Blob([JSON.stringify(baseJson)], { type: "application/json" });
      return newJsonBlob;
   }

   /**
    * Converts an object representation of a Scratch target's blocks into an object
    * representation of the corresponding Patch threads and thread code.
    *
    * @param {Object.<string, ScratchBlock>} blocks
    * @param {Object.<string, [Number, String]>} variables
    * @returns {PatchTargetThread[]} An array of object representations of the patch threads
    */
   convertTargetBlocks(target) {
      // TODO: convert variables
      // https://en.scratch-wiki.info/wiki/Scratch_File_Format#Blocks

      const {blocks} = target;

      const blocksKeys = Object.keys(blocks);

      const returnVal = [];

      const eventBlocks = new Scratch3EventBlocks({ on: () => { }, startHats: () => { } });
      const controlBlocks = new Scratch3ControlBlocks({ on: () => { }, startHats: () => { } });

      const hats = Object.keys({...eventBlocks.getHats(), ...controlBlocks.getHats()});

      const hatLocations = [];

      blocksKeys.forEach(blockId => {
         const block = blocks[blockId];
         if (hats.includes(block.opcode)) {
            hatLocations.push(blockId);
         }
      });

      hatLocations.forEach(hatId => {
         const returnValPart = convertBlocksPart(target, hatId, blocks[hatId].next);

         if (returnValPart.script.includes("math.")) {
            returnValPart.script = `import math\n\n${ returnValPart.script }`;
         }

         if (returnValPart.script.includes("patch_random(")) {
            returnValPart.script = `import random\n\n# This mimics the behavior of Scratch's random block\ndef patch_random(num1, num2):\n  if ((num1 % 1) == 0) and ((num2 % 1) == 0):\n    return random.randint(num1, num2)\n  else:\n    return round(random.uniform(num1, num2), 2)\n\n${ returnValPart.script }`;
         }

         returnVal.push(returnValPart);
      });

      return returnVal;
   }
}
