import PatchTargetThread from "./patch-target-thread.mjs";
import ScratchBlock from "./scratch-block.mjs";

import { indentLines, processInputs } from "./scratch-conversion-helper.mjs";

export default class ScratchConversionData {
   /**
    * 
    * @param {Object.<string, ScratchBlock>} blocks 
    * @param {string} blockId 
    * @param {Object.<string, {opcode: string, parameters: string[], exampleParameters: {}}} patchApi 
    * @param {string[]} patchApiKeys 
    * @param {*} partialConverter 
    * @param {*} partialConverterThis 
    * @returns {string}
    */
   convertDataBlock(blocks, currentBlockId, patchApi, patchApiKeys, partialConverter, partialConverterThis) {
      const convertBlocksPart = partialConverter.bind(partialConverterThis);

      const currentBlock = blocks[currentBlockId];
      const { opcode } = currentBlock;

      let script = "";

      switch (opcode) {
         case "data_setvariableto": {
            // Set variable
            const { VARIABLE } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { VALUE } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            script += `${VARIABLE.substring(1, VARIABLE.length - 1)} = ${VALUE}`;
            break;
         }
         case "data_changevariableby": {
            // Change variable by
            const { VARIABLE } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { VALUE } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            script += `${VARIABLE.substring(1, VARIABLE.length - 1)} += ${VALUE}`;
            break;
         }
         case "data_showvariable": {
            // Display variable on screen
            console.warn("WARN: the Show Variable block isn't supported in Patch.");
            break;
         }
         case "data_hidevariable": {
            // Stop displaying variable on screen
            console.warn("WARN: the Hide Variable block isn't supported in Patch.");
            break;
         }
         case "data_addtolist": {
            // Append to list
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { ITEM } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}.append(${ITEM})`;
            break;
         }
         case "data_deleteoflist": {
            // Delete item at index from list
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { INDEX } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}.pop(${INDEX})`;
            break;
         }
         case "data_deletealloflist": {
            // Clear a list
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}.clear()`;
            break;
         }
         case "data_insertatlist": {
            // Insert an item into the list
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { ITEM, INDEX } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}.insert(${INDEX}, ${ITEM})`;
            break;
         }
         case "data_replaceitemoflist": {
            // Replace a list item
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { ITEM, INDEX } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}[${INDEX}] = ${ITEM}`;
            break;
         }
         case "data_itemoflist": {
            // Get a list item
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { INDEX } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}[${INDEX}]`;
            break;
         }
         case "data_itemnumoflist": {
            // Get the index of an item in the list
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { ITEM } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${LIST.substring(1, LIST.length - 1)}.index(${ITEM})`;
            break;
         }
         case "data_lengthoflist": {
            // Get the length of the list
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `len(${LIST.substring(1, LIST.length - 1)})`;
            break;
         }
         case "data_listcontainsitem": {
            // Check if the list contains a certain item
            const { LIST } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false);
            const { ITEM } = processInputs(blocks, currentBlockId, currentBlock, patchApi, patchApiKeys, convertBlocksPart, false, true);
            // Add options to change this based on language later.
            console.warn("WARN: using lists as variables isn't currently supported in Patch. Code will be generated but it may or may not function.");
            script += `${ITEM} in ${LIST.substring(1, LIST.length - 1)}`;
            break;
         }
         case "data_showlist": {
            console.warn("WARN: the Show List block isn't supported in Patch.");
            break;
         }
         case "data_hidelist": {
            console.warn("WARN: the Hide List block isn't supported in Patch.");
            break;
         }
         default: {
            console.warn("The data block conversion couldn't figure out how to handle opcode %s.", currentBlock.opcode);
            break;
         }
      }

      return script;
   }
}