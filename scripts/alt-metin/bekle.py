#!/usr/bin/env python3
"""Bir iş akışı günlüğünde belirtilen etiketlerin hepsi sonuçlanana kadar bekler (en çok 50 dk)."""
import json, sys, time
jp, labels = sys.argv[1], set(sys.argv[2:])
t0 = time.time()
while time.time() - t0 < 3000:
    lab, done = {}, set()
    for line in open(jp, encoding='utf-8'):
        o = json.loads(line)
        if o.get('type') == 'started': lab[o['agentId']] = o.get('label', '')
        elif o.get('type') == 'result' and lab.get(o['agentId']) in labels: done.add(lab[o['agentId']])
    if done >= labels:
        print('hazir', sorted(done), round(time.time() - t0)); sys.exit(0)
    time.sleep(20)
print('zaman asimi', sorted(done)); sys.exit(1)
