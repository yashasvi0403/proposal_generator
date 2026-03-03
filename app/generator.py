import requests
import re

# Ollama API
OLLAMA_URL = "http://localhost:11434/api/generate"


# ======================================
# SAFE SECTION EXTRACTION
# ======================================
def extract_section(text, start_keywords, end_keywords):

    start_pattern = "|".join(start_keywords)
    end_pattern = "|".join(end_keywords) if end_keywords else "$"

    pattern = rf"({start_pattern})(.*?)(?={end_pattern})"

    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)

    if match:
        return match.group(2).strip()

    return ""


# ======================================
# MAIN GENERATOR FUNCTION
# ======================================
def generate_proposal(prompt: str) -> dict:

    try:
        # ===============================
        # CALL OLLAMA (FAST MODEL)
        # ===============================
        response = requests.post(
            OLLAMA_URL,
            json={
                # ✅ FAST + STABLE MODEL
                "model": "phi3",
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )

        response.raise_for_status()

        proposal_text = response.json().get(
            "response",
            "No response generated."
        )

        # ===============================
        # CLEAN MARKDOWN
        # ===============================
        clean_text = re.sub(r"[#*`]", "", proposal_text)

        # ===============================
        # EXTRACT SECTIONS
        # ===============================
        executive = extract_section(
            clean_text,
            ["Executive Summary"],
            ["Technical Approach", "Timeline", "Implementation Timeline", "Risk Assessment"]
        )

        technical = extract_section(
            clean_text,
            ["Technical Approach"],
            ["Timeline", "Implementation Timeline", "Risk Assessment"]
        )

        timeline = extract_section(
            clean_text,
            ["Implementation Timeline", "Timeline"],
            ["Risk Assessment"]
        )

        risk = extract_section(
            clean_text,
            ["Risk Assessment"],
            []
        )

        # ===============================
        # FALLBACK SAFETY
        # ===============================
        if not executive:
            executive = clean_text

        if not technical:
            technical = (
                "The system architecture includes scalable backend services, "
                "secure APIs, database integration, and cloud deployment."
            )

        if not timeline:
            timeline = (
                "Phase 1: Planning\n"
                "Phase 2: Development\n"
                "Phase 3: Testing\n"
                "Phase 4: Deployment"
            )

        if not risk:
            risk = (
                "Potential risks include scalability challenges, "
                "integration delays, and infrastructure constraints."
            )

        return {
            "executive_summary": executive,
            "technical_approach": technical,
            "timeline": timeline,
            "risk_assessment": risk
        }

    except requests.exceptions.ConnectionError:
        return {
            "executive_summary":
                "❌ Ollama is not running. Start Ollama application.",
            "technical_approach": "",
            "timeline": "",
            "risk_assessment": ""
        }

    except requests.exceptions.Timeout:
        return {
            "executive_summary":
                "❌ Model timeout. Use smaller model like phi3.",
            "technical_approach": "",
            "timeline": "",
            "risk_assessment": ""
        }

    except Exception as e:
        return {
            "executive_summary":
                f"❌ Error generating proposal: {str(e)}",
            "technical_approach": "",
            "timeline": "",
            "risk_assessment": ""
        }