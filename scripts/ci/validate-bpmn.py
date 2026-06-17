#!/usr/bin/env python3
"""CI helper: validate Flowable BPMN XML files."""
import glob
import sys
import xml.etree.ElementTree as ET

NS = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
files = sorted(glob.glob("infra/flowable/bpmn/*.bpmn20.xml"))
if not files:
    print("no BPMN files found")
    sys.exit(0)

ok = 0
for f in files:
    try:
        tree = ET.parse(f)
        root = tree.getroot()
        procs = root.findall(".//bpmn:process", NS)
        tasks = root.findall(".//bpmn:userTask", NS)
        gateways = root.findall(".//bpmn:exclusiveGateway", NS)
        start = root.findall(".//bpmn:startEvent", NS)
        end = root.findall(".//bpmn:endEvent", NS)
        name = f.split("/")[-1]
        print(f"  OK {name}: {len(procs)} proc, {len(tasks)} task, {len(gateways)} gw, {len(start)} start, {len(end)} end")
        ok += 1
    except Exception as e:
        print(f"  FAIL {f}: {e}")
        sys.exit(1)

print(f"\nTotal: {ok}/{len(files)} BPMN files valid")