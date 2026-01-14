console.log("DASHBOARD SOCKET FILE LOADED");

const BASE_URL = "http://localhost:5500/api";
const SOCKET_URL = "http://localhost:5500";

const electionId = localStorage.getItem("publicElectionId");
const electionName =
  localStorage.getItem("publicElectionName") || "Live Election";

document.getElementById("electionName").innerText = electionName;

const socket = io(SOCKET_URL);
let chart = null;

/* 🔊 SOUND */
const voteSound = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3"
);

/* ================= SOCKET ================= */

socket.on("connect", () => {
  console.log("SOCKET CONNECTED:", socket.id);
  socket.emit("joinElection", String(electionId));
});

socket.on("voteUpdate", (data) => {
  console.log("LIVE UPDATE RECEIVED:", data);

  // 🔊 Play sound on every new vote
  voteSound.play().catch(() => {});

  renderAll(data.candidates);
});

/* ================= INITIAL LOAD ================= */

async function loadInitial() {
  const res = await fetch(`${BASE_URL}/public/candidates/${electionId}`);
  const candidates = await res.json();
  renderAll(candidates);
}

/* ================= RENDER ================= */

function renderAll(candidates) {
  updateUI(candidates);
  drawChart(candidates);
}

/* ================= NUMBER ANIMATION ================= */

function animateCount(el, start, end) {
  let current = start;
  const step = Math.max(1, Math.floor((end - start) / 20));

  const timer = setInterval(() => {
    current += step;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    el.innerText = current;
  }, 20);
}

/* ================= UI ================= */

function updateUI(candidates) {
  const voteList = document.getElementById("voteList");
  voteList.innerHTML = "";

  const maxVotes = Math.max(...candidates.map(c => c.votes));

  candidates
    .sort((a, b) => b.votes - a.votes)
    .forEach((c, index) => {

      const img = c.candidatePhoto || "default.png";
      const percent = maxVotes ? (c.votes / maxVotes) * 100 : 0;
      const isLeader = c.votes === maxVotes && c.votes !== 0;

      voteList.innerHTML += `
        <div class="candidate-card ${isLeader ? "leader" : ""}">
          <div class="candidate-info">
            <img 
              src="http://localhost:5500/uploads/${img}"
              onerror="this.src='http://localhost:5500/uploads/default.png'"
            />
            <div>
              <strong>${isLeader ? "👑 " : ""}${c.name}</strong><br/>
              <small>${c.partyName || ""}</small>

              <div class="progress">
                <div class="progress-bar bg-primary"
                     style="width:${percent}%">
                </div>
              </div>
            </div>
          </div>

          <div class="vote-count" id="count-${c._id}">
            ${c.votes}
          </div>
        </div>
      `;

      const el = document.getElementById(`count-${c._id}`);
      animateCount(el, 0, c.votes);
    });
}

/* ================= BEAUTIFUL CHART ================= */

function drawChart(candidates) {
  const canvas = document.getElementById("voteChart");
  const ctx = canvas.getContext("2d");

  if (chart) chart.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "#0d6efd");
  gradient.addColorStop(1, "#6610f2");

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: candidates.map((c) => c.name),
      datasets: [
        {
          label: "Votes",
          data: candidates.map((c) => c.votes),
          backgroundColor: gradient,
          borderRadius: 12,
          barThickness: 45,
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1200,
        easing: "easeOutElastic",
      },
      plugins: {
        legend: {
          labels: {
            font: { size: 14 },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [5, 5],
          },
        },
      },
    },
  });
}

/* ================= START ================= */

loadInitial();
