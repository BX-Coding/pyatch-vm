import fs from "fs";
import path from "path";
import * as url from "url";
import VirtualMachine from "../../src/virtual-machine.mjs";
import Sprite from "../../src/sprites/sprite.mjs";
import RenderedTarget from "../../src/sprites/rendered-target.mjs";
import resetTarget from "../fixtures/reset-target.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// Create new csv file in output directory
console.log("Creating output directory and file");
const outputDir = path.join(__dirname, "./", "output");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
const outputFile = path.join(outputDir, "thread-execution-rate.csv");
fs.writeFileSync(outputFile, "instructions, time\n");

console.log("Loading VM");
const vm = new VirtualMachine();

const sprite = new Sprite(null, vm.runtime);
const target = new RenderedTarget(sprite, vm.runtime);
target.id = "target1";
vm.runtime.addTarget(target);

await vm.runtime.workerLoadPromise;

vm.start();

console.log("Loading Thread");

const file = path.join(__dirname, "./", "input/while-loop.py");

const whileLoopScript = fs.readFileSync(file, "utf8", (err, data) => data);
const targetId = "target1";
const triggerEventId = "event_whenflagclicked";

const threadId = await vm.addThread(targetId, whileLoopScript, triggerEventId);
const monitoredThread = vm.getThreadById(threadId);

console.log("Starting Thread");
vm.startHats(triggerEventId);

console.log("Starting Monitor");
// Run for 10 seconds and each second using set interval record the number of instructions executed
let instructionsExecuted = 0;
const startTime = Date.now();
const endTime = startTime + 10000;
const interval = setInterval(() => {
    instructionsExecuted = monitoredThread.getInstructionsExecuted();
    const time = Date.now() - startTime;
    fs.appendFileSync(outputFile, `${instructionsExecuted}, ${time}\n`);
    if (Date.now() >= endTime) {
        clearInterval(interval);
        vm.stopAll();
    }
}, 1000);
