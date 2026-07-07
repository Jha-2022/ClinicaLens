from google.adk.agents.llm_agent import Agent
import os

def create_medassist_agent(audience: str) -> Agent:
    json_schema = (
        "\n\nIMPORTANT: You MUST return your final answer in strict JSON format matching this schema:\n"
        "{\n"
        '  "findings": ["Array of key findings or overview details"],\n'
        '  "advice": ["Array of actionable advice, next steps, or suggested questions"],\n'
        '  "terms": [{"term": "Medical term", "def": "Definition or translation"}]\n'
        "}\n"
        "Do not include markdown code blocks or any conversational text outside the JSON."
    )
    
    if audience.lower() == 'doctor':
        instruction = (
            "You are a clinical AI assistant. Summarize the provided medical text for an attending physician. "
            "Maximize clinical utility and reading efficiency.\n"
            "* Structure: Organize the summary using standard clinical formats (e.g., SOAP note structure or Impression/Plan) mapped into the findings and advice arrays.\n"
            "* Terminology: Retain all precise medical jargon, ICD/CPT concepts, anatomical specifics, and exact quantitative data (lab values, dosages).\n"
            "* Critical Alerts: Explicitly flag any out-of-range lab results, contraindications, or acute findings at the top of the findings array.\n"
            "* Tone: Highly concise, objective, and strictly factual. Omit all conversational filler."
        ) + json_schema
    else:
        instruction = (
            "You are an empathetic medical AI assistant. Summarize the provided medical text for a patient. "
            "Your goal is to make complex health information accessible and reassuring.\n"
            "* Simplify: Translate all medical jargon into plain, accessible language using the terms array.\n"
            "* Structure: Provide an 'Overview of the Report' and 'Key Findings' in the findings array, and 'Suggested Questions for Your Doctor' in the advice array.\n"
            "* Tone: Supportive, calm, and clear. Avoid alarming language.\n"
            "* Mandatory Disclaimer: Conclude the advice array with: 'Note: I am an AI, not a doctor. This summary is to help you understand your results and does not replace professional medical advice.'"
        ) + json_schema

    return Agent(
        model='gemini-2.5-flash',
        name=f'medassist_{audience.lower()}_agent',
        description=f'A medical summarizer assistant tailored for a {audience}.',
        instruction=instruction,
    )

doctor_agent = create_medassist_agent('doctor')
patient_agent = create_medassist_agent('patient')

# Route the root_agent based on the MED_AUDIENCE environment variable so we can switch them dynamically
current_audience = os.getenv("MED_AUDIENCE", "patient").lower()
root_agent = doctor_agent if current_audience == "doctor" else patient_agent
