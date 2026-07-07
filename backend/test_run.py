import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from my_agent.agent import doctor_agent

result = doctor_agent.run("Test patient has elevated heart rate of 120 bpm.")
print(type(result))
print(result)
