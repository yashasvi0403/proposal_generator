// ===============================
// Generate Proposal
// ===============================

function generate() {

  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");

  const data = {
    project_title: document.getElementById("title").value,
    industry: document.getElementById("industry").value,
    duration_months: +document.getElementById("duration").value,
    expected_users: +document.getElementById("users").value,
    tech_stack: document.getElementById("tech").value.split(",")
  };

  fetch("http://127.0.0.1:8000/generate-proposal", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(res => {
    localStorage.setItem("proposal", JSON.stringify(res));
    location.href = "result.html";
  })
  .catch(err => {
    alert("Error generating proposal.");
    console.error(err);
  });
}


// ===============================
// Result Page Rendering
// ===============================

if (document.getElementById("output")) {

  const r = JSON.parse(localStorage.getItem("proposal"));
  const out = document.getElementById("output");

  if (!r) {
    out.innerHTML = "<p>No proposal data found.</p>";
  } else {

    function typeEffect(element, text, speed) {
      let i = 0;
      function typing() {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(typing, speed);
        }
      }
      typing();
    }

    out.innerHTML = `
      <h3>Executive Summary</h3><p id="summary"></p>
      <h3>Technical Approach</h3><p id="tech"></p>
      <h3>Timeline</h3><p id="timeline"></p>
      <h3>Risk Assessment</h3><p id="risk"></p>
    `;

    typeEffect(document.getElementById("summary"), r.executive_summary, 20);
    setTimeout(() => typeEffect(document.getElementById("tech"), r.technical_approach, 15), 800);
    setTimeout(() => typeEffect(document.getElementById("timeline"), r.timeline, 15), 1600);
    setTimeout(() => typeEffect(document.getElementById("risk"), r.risk_assessment, 15), 2400);

    // Cost Cards
    out.innerHTML += `
      <div class="cost-grid">
        <div class="cost-card">
          Development<br>$${r.estimated_cost.development_cost}
        </div>
        <div class="cost-card">
          Infrastructure<br>$${r.estimated_cost.infrastructure_cost}
        </div>
        <div class="cost-card">
          Contingency<br>$${r.estimated_cost.contingency}
        </div>
        <div class="cost-card total">
          Total<br>$${r.estimated_cost.total_estimated_cost}
        </div>
      </div>
    `;
  }
}


// ===============================
// Neural Network Background
// ===============================

const canvas = document.getElementById("network");

if (canvas) {

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5),
      dy: (Math.random() - 0.5)
    });
  }

  function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffff";
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}