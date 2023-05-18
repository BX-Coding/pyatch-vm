import sinonChai from "sinon-chai";
import chai from "chai";
import VirtualMachine from "../../src/virtual-machine.mjs";
import Sprite from "../../src/sprites/sprite.mjs";
import RenderedTarget from "../../src/sprites/rendered-target.mjs";

chai.use(sinonChai);
const { expect } = chai;

let vm = null;
let sprite = null;
let target = null;

before(async () => {
   vm = new VirtualMachine();

   sprite = new Sprite(null, vm.runtime);
   target = new RenderedTarget(sprite, vm.runtime);
   target.id = "target1";
   vm.runtime.addTarget(target);

   vm.start();
});
describe("Pyatch VM Linker & Worker Integration", () => {
   describe("Non-Code", () => { 
      it("Empty", async () => {
         const targetAndCode = {
            target1: [""],
         };

         await vm.run(targetAndCode);

         expect(vm.runtime.targets[0].x).to.equal(0);
         expect(vm.runtime.targets[0].y).to.equal(0);

      });
      it("One Space", async () => {
         const targetAndCode = {
            target1: [" "],
         };

         await vm.run(targetAndCode);

         expect(vm.runtime.targets[0].x).to.equal(0);
         expect(vm.runtime.targets[0].y).to.equal(0);

      });
      it("One Newline", async () => {
         const targetAndCode = {
            target1: ["\n"],
         };

         await vm.run(targetAndCode);

         expect(vm.runtime.targets[0].x).to.equal(0);
         expect(vm.runtime.targets[0].y).to.equal(0);

      });
   });
});