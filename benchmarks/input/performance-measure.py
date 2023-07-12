import time
start = time.perf_counter()
move(10)
end = time.perf_counter()
print('python worker --', (end - start) * 1000, 'ms')