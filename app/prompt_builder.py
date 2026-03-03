def build_prompt(data):
    return f"""
You are a senior consulting solution architect.
Generate a structured proposal based on the following:

Project Title: {data.project_title}
Industry: {data.industry}
Duration: {data.duration_months} months
Expected Users: {data.expected_users}
Preferred Tech Stack: {', '.join(data.tech_stack)}

Generate:
1. Executive Summary
2. Technical Approach
3. Timeline
4. Risk Assessment

Keep response structured and professional.
"""