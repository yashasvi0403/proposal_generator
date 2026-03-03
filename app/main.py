from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import re
import tempfile

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

from app.schemas import ProposalRequest
from app.prompt_builder import build_prompt
from app.generator import generate_proposal
from app.cost_logic import calculate_cost


# =====================================
# FASTAPI APP
# =====================================
app = FastAPI(title="AI Proposal Generator")


# =====================================
# CORS CONFIG
# =====================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================
# HTML BUILDER
# =====================================
def build_html(proposal_text: str, cost: dict):

    return f"""
    <html>
    <head>
        <title>AI Generated Proposal</title>
    </head>

    <body style="font-family:Arial;margin:40px">

        <h1>🚀 AI Generated Proposal</h1>

        <pre>{proposal_text}</pre>

        <h3>Estimated Cost</h3>
        <p>{cost}</p>

        <a href="/download-proposal">
            <button>Download Proposal</button>
        </a>

    </body>
    </html>
    """


# =====================================
# PDF BUILDER
# =====================================
def build_pdf(proposal_text: str, cost: dict):

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")

    doc = SimpleDocTemplate(temp_file.name, pagesize=A4)
    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("PROJECT PROPOSAL", styles['Title']))
    story.append(Spacer(1, 20))

    clean_text = proposal_text.replace("\n", "<br/>")

    story.append(Paragraph(clean_text, styles['Normal']))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Estimated Cost", styles['Heading2']))
    story.append(Paragraph(str(cost), styles['Normal']))

    doc.build(story)

    return temp_file.name


# =====================================
# TEST HTML PAGE
# =====================================
@app.get("/generate-proposal", response_class=HTMLResponse)
async def generate_get():

    sample = ProposalRequest(
        project_title="AI Healthcare Platform",
        industry="Healthcare",
        duration_months=6,
        expected_users=5000,
        tech_stack=["Python", "FastAPI"]
    )

    prompt = build_prompt(sample)
    result = generate_proposal(prompt)

    cost = calculate_cost(
        sample.duration_months,
        sample.expected_users
    )

    return HTMLResponse(
        content=build_html(
            result["executive_summary"],
            cost
        )
    )


# =====================================
# ✅ MAIN API USED BY FRONTEND
# =====================================
@app.post("/generate-proposal")
async def generate_post(data: ProposalRequest):

    prompt = build_prompt(data)

    result = generate_proposal(prompt)

    cost = calculate_cost(
        data.duration_months,
        data.expected_users
    )

    # ✅ RETURN STRUCTURED JSON
    return {
        "executive_summary": result.get("executive_summary", ""),
        "technical_approach": result.get("technical_approach", ""),
        "timeline": result.get("timeline", ""),
        "risk_assessment": result.get("risk_assessment", ""),
        "estimated_cost": cost
    }


# =====================================
# DOWNLOAD PDF
# =====================================
@app.get("/download-proposal")
async def download_proposal():

    sample = ProposalRequest(
        project_title="AI Healthcare Platform",
        industry="Healthcare",
        duration_months=6,
        expected_users=5000,
        tech_stack=["Python", "FastAPI"]
    )

    prompt = build_prompt(sample)
    result = generate_proposal(prompt)

    cost = calculate_cost(
        sample.duration_months,
        sample.expected_users
    )

    pdf_path = build_pdf(
        result["executive_summary"],
        cost
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename="Project_Proposal.pdf"
    )