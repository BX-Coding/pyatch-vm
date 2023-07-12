import fs from "fs";
import path from "path";
import * as url from "url";
import VirtualMachine from "../src/virtual-machine.mjs";
import Sprite from "../src/sprites/sprite.mjs";
import RenderedTarget from "../src/sprites/rendered-target.mjs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const vm = new VirtualMachine();

const sprite = new Sprite(null, vm.runtime);
const target = new RenderedTarget(sprite, vm.runtime);
target.id = "target1";
vm.runtime.addTarget(target);

await vm.runtime.workerLoadPromise;

vm.start();

const moveFile = path.join(__dirname, "./", "input/move.py");
const moveScript = fs.readFileSync(moveFile, "utf8", (err, data) => data);

const perfFile = path.join(__dirname, "./", "input/performance-measure.py");
const perfScript = fs.readFileSync(perfFile, "utf8", (err, data) => data);

const targetId = "target1";
const triggerEventId = "event_whenflagclicked";

const threadId = await vm.addThread(targetId, moveScript, triggerEventId);
const monitoredThread = vm.getThreadById(threadId);
console.log("Single 'move' instruction ran with:");

// Time how long it takes for the thread finish executing with the performance API
const startTime = performance.now();
await vm.startHats(triggerEventId);
const endTime = performance.now();

// Calculate the time it took to execute the thread
const time = endTime - startTime;
console.log("startHats --", time, "ms");

// Time how long it takes for the startThread function to execute with the performance API
const startThreadStartTime = performance.now();
await monitoredThread.startThread();
const startThreadEndTime = performance.now();

// Calculate the time it took to execute the startThread function
const startThreadTime = startThreadEndTime - startThreadStartTime;
console.log("startThread --", startThreadTime, "ms");

// Time how long it takes for the executeBlock function to execute with the performance API
const blockStartTime = performance.now();
monitoredThread.executeBlock("motion_movesteps", { STEPS: 10 });
const blockEndTime = performance.now();

// Calculate the time it took to execute the executeBlock function
const blockTime = blockEndTime - blockStartTime;
console.log("executeBlock --", blockTime, "ms");

// Time how long it takes for the worker to execute the move block
await monitoredThread.updateThreadScript(perfScript);
await vm.startHats(triggerEventId);
