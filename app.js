// =====================================
// CONFIG (PRODUCTION BACKEND)
// =====================================

// ✅ HuggingFace Backend URL
const API_BASE =
"https://yashasvi0409-proposal-generator.hf.space";


// =====================================
// Generate Proposal
// =====================================

async function generate() {

  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");

  const data = {
    project_title:
      document.getElementById("title").value,

    industry:
      document.getElementById("industry").value,

    duration_months:
      Number(document.getElementById("duration").value),

    expected_users:
      Number(document.getElementById("users").value),

    tech_stack:
      document.getElementById("tech")
        .value
        .split(",")
        .map(t => t.trim())
  };

  try {

    const response = await fetch(
      `${API_BASE}/generate-proposal`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok)
      throw new Error("API Error");

    const result = await response.json();

    localStorage.setItem(
      "proposal",
      JSON.stringify(result)
    );

    // ✅ GitHub Pages safe navigation
    window.location.href =
      "/proposal_generator/result.html";

  } catch (err) {

    console.error(err);

    alert(
      "⚠ Backend connection failed.\nPlease try again."
    );

    if (loader)
      loader.classList.add("hidden");
  }
}


// =====================================
// Result Page Rendering
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  const output =
    document.getElementById("output");

  if (!output) return;

  const proposal =
    JSON.parse(
      localStorage.getItem("proposal")
    );

  if (!proposal) {
    output.innerHTML =
      "<p>No proposal data found.</p>";
    return;
  }

  function typeEffect(el, text, speed = 20) {

    let i = 0;
    el.innerHTML = "";

    function typing() {
      if (i < text.length) {
        el.innerHTML += text.charAt(i++);
        setTimeout(typing, speed);
      }
    }

    typing();
  }

  output.innerHTML = `
    <h3>Executive Summary</h3>
    <p id="summary"></p>

    <h3>Technical Approach</h3>
    <p id="tech"></p>

    <h3>Timeline</h3>
    <p id="timeline"></p>

    <h3>Risk Assessment</h3>
    <p id="risk"></p>
  `;

  typeEffect(
    document.getElementById("summary"),
    proposal.executive_summary || ""
  );

  setTimeout(() =>
    typeEffect(
      document.getElementById("tech"),
      proposal.technical_approach || ""
    ), 800);

  setTimeout(() =>
    typeEffect(
      document.getElementById("timeline"),
      proposal.timeline || ""
    ), 1600);

  setTimeout(() =>
    typeEffect(
      document.getElementById("risk"),
      proposal.risk_assessment || ""
    ), 2400);

  output.innerHTML += `
    <div class="cost-grid">

      <div class="cost-card">
        Development<br>
        $${proposal.estimated_cost?.development_cost ?? 0}
      </div>

      <div class="cost-card">
        Infrastructure<br>
        $${proposal.estimated_cost?.infrastructure_cost ?? 0}
      </div>

      <div class="cost-card">
        Contingency<br>
        $${proposal.estimated_cost?.contingency ?? 0}
      </div>

      <div class="cost-card total">
        Total<br>
        $${proposal.estimated_cost?.total_estimated_cost ?? 0}
      </div>

    </div>
  `;
});


// =====================================
// Neural Network Background
// =====================================

const canvas = document.getElementById("network");

if (canvas) {

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from(
    { length: 100 },
    () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: Math.random() - 0.5,
      dy: Math.random() - 0.5
    })
  );

  function animate() {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    particles.forEach(p => {

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width)
        p.dx *= -1;

      if (p.y < 0 || p.y > canvas.height)
        p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffff";
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
