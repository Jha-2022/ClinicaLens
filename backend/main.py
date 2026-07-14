# from fastapi import FastAPI
# from pydantic import BaseModel
# import subprocess
# import json
# import os

# app = FastAPI()

# class SummaryRequest(BaseModel):
#     text: str
#     audience: str

# @app.post("/api/summarize-report")
# async def summarize_report(req: SummaryRequest):
#     # Prepare the ADK process environment, injecting our target audience
#     env = os.environ.copy()
#     env["MED_AUDIENCE"] = req.audience
    
#     # We will use the adk CLI to execute the agent. 
#     # Make sure we point to the correct venv adk executable.
#     adk_executable = r".\.venv\Scripts\adk.exe" if os.path.exists(r".\.venv\Scripts\adk.exe") else "adk"

#     try:
#         process = subprocess.run(
#             [adk_executable, "run", "my_agent", req.text, "--jsonl"],
#             cwd=r"d:\Projects\adk-project2\backend",
#             capture_output=True,
#             text=True,
#             timeout=120,
#             env=env
#         )
        
#         output_lines = process.stdout.split('\n')
#         final_text = ""
#         logs = []
        
#         for line in output_lines:
#             if not line.strip():
#                 continue
#             try:
#                 event = json.loads(line)
#                 if "content" in event and event["content"].get("role") == "model":
#                     parts = event["content"].get("parts", [])
#                     for part in parts:
#                         if "text" in part:
#                             final_text = part["text"]
#                         elif "functionCall" in part:
#                             func_name = part["functionCall"].get("name", "tool")
#                             logs.append(f"Agent called {func_name}")
#             except json.JSONDecodeError:
#                 pass
                
#         # Clean final text in case the LLM still wrapped it in markdown codeblocks
#         text = final_text.strip()
#         if text.startswith("```json"):
#             text = text[7:]
#         if text.endswith("```"):
#             text = text[:-3]
#         text = text.strip()
        
#         if not text:
#             raise ValueError("No output generated from agent.")

#         # Parse the structured JSON response
#         data = json.loads(text)
#         return {"summary": data, "logs": logs}
        
#     except Exception as e:
#         print("Error or hallucination:", e)
#         # Fallback to prevent app crash on the frontend
#         fallback = {
#             "findings": ["Error connecting to the ADK agent.", str(e)],
#             "advice": ["Please ensure the backend is correctly configured and the ADK is functional."],
#             "terms": []
#         }
#         return {"summary": fallback, "logs": ["Error encountered during generation."]}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=8000)




from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import json
import os
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, you can replace "*" with your specific Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummaryRequest(BaseModel):
    text: str
    audience: str

@app.post("/api/summarize-report")
async def summarize_report(req: SummaryRequest):
    # Prepare the ADK process environment, injecting our target audience
    env = os.environ.copy()
    env["MED_AUDIENCE"] = req.audience
    
    # Render is Linux-based; execute the globally available or env-bound CLI directly
    adk_executable = "adk"

    # Use dynamic relative paths instead of hardcoded local drives
    current_dir = os.path.dirname(os.path.abspath(__file__))

    try:
        process = subprocess.run(
            [adk_executable, "run", "my_agent", req.text, "--jsonl"],
            cwd=current_dir,
            capture_output=True,
            text=True,
            timeout=120,
            env=env
        )
        
        output_lines = process.stdout.split('\n')
        final_text = ""
        logs = []
        
        for line in output_lines:
            if not line.strip():
                continue
            try:
                event = json.loads(line)
                if "content" in event and event["content"].get("role") == "model":
                    parts = event["content"].get("parts", [])
                    for part in parts:
                        if "text" in part:
                            final_text = part["text"]
                        elif "functionCall" in part:
                            func_name = part["functionCall"].get("name", "tool")
                            logs.append(f"Agent called {func_name}")
            except json.JSONDecodeError:
                pass
                
        # Clean final text in case the LLM still wrapped it in markdown codeblocks
        text = final_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        if not text:
            raise ValueError("No output generated from agent.")

        # Parse the structured JSON response
        data = json.loads(text)
        return {"summary": data, "logs": logs}
        
    except Exception as e:
        print("Error or hallucination:", e)
        # Fallback to prevent app crash on the frontend
        fallback = {
            "findings": ["Error connecting to the ADK agent.", str(e)],
            "advice": ["Please ensure the backend is correctly configured and the ADK is functional."],
            "terms": []
        }
        return {"summary": fallback, "logs": ["Error encountered during generation."]}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

