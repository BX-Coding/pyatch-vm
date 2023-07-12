import fs from "fs";
import path from "path";
import * as url from "url";
import VirtualMachine from "../src/virtual-machine.mjs";
import Sprite from "../src/sprites/sprite.mjs";
import RenderedTarget from "../src/sprites/rendered-target.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const THREAD_COUNT = 10;
const FRAME_RATE = 60;
const TEST_SECONDS = 10;

const vm = new VirtualMachine();

const sprite = new Sprite(null, vm.runtime);
const target = new RenderedTarget(sprite, vm.runtime);
target.id = "target1";
vm.runtime.addTarget(target);

await vm.runtime.workerLoadPromise;

vm.start();

const file = path.join(__dirname, "./", "input/while-loop.py");

const whileLoopScript = fs.readFileSync(file, "utf8", (err, data) => data);
const targetId = "target1";
const triggerEventId = "event_whenflagclicked";

const threadId = await vm.addThread(targetId, whileLoopScript, triggerEventId);
const monitoredThread = vm.getThreadById(threadId);

for (let threadCount = 1; threadCount < THREAD_COUNT; threadCount += 1) {
    // eslint-disable-next-line no-await-in-loop
    await vm.addThread(targetId, whileLoopScript, triggerEventId);
}

console.log("Starting VM with thread count:", Object.keys(vm.runtime.targets[0].threads).length);
vm.startHats(triggerEventId);

// Run for 10 seconds and each second using set interval record the number of instructions executed
let instructionsExecuted = 0;

setTimeout(() => {
    // Record the number of instructions executed in the last second
    instructionsExecuted = monitoredThread.getInstructionsExecuted();
    console.log("Average Thread Execution Rate: ", instructionsExecuted / TEST_SECONDS / FRAME_RATE, "Instructions/Frame");
}, TEST_SECONDS * 1000);
