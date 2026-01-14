//  DASHBOARD.JS – User Home Dashboard


// Load User Info

async function loadUserInfo() {
  try {
    const res = await authFetch(`${BASE_URL}/auth/me`);
    const user = await res.json();

    const card = document.getElementById("userStatusCard");
    if (!card) return;

    if (user.hasVoted) {
      card.innerHTML = `
        <h3 class="text-success">You have already voted</h3>
        <p>You voted for: <strong>${
          user.votedFor?.name || "Unknown"
        }</strong></p>
        <p>Election: <strong>${user.votedElection?.title}</strong></p>
      `;
    } else {
      card.innerHTML = `
        <h3 class="text-danger">You have not voted yet</h3>
        <p>Please vote in the active election.</p>
      `;
    }
  } catch (err) {
    console.error("User info error:", err);
  }
}


// Load Active Election (MAIN ONE)

async function loadActiveElection() {
  try {
    const res = await authFetch(`${BASE_URL}/elections/active`);
    const data = await res.json();

    const list = document.getElementById("activeList");
    list.innerHTML = "";

    if (!data || !data.election) {
      list.innerHTML = `<p class="text-muted">No active election right now.</p>`;
      return;
    }

    const election = data.election;

    const card = document.createElement("div");
    card.className = "card p-3 mb-2 shadow-sm";

    card.innerHTML = `
      <h5>${election.title}</h5>
      <p><strong>Type:</strong> ${election.type}</p>
      <p><strong>Status:</strong> ${election.status.toUpperCase()}</p>
      <p>${election.description || ""}</p>

      <button class="btn btn-primary mt-2"
              onclick="goToVotePage('${election._id}')">
        Vote Now
      </button>
    `;

    list.appendChild(card);
  } catch (err) {
    console.error("Active election error:", err);
  }
}


// Redirect to Vote Page

function goToVotePage(electionId) {
  localStorage.setItem("activeElectionId", electionId);
  window.location.href = "/frontend/pages/vote.html";
}


// Load Upcoming Elections

async function loadUpcomingElections() {
  try {
    const res = await authFetch(`${BASE_URL}/elections/upcoming`);
    const elections = await res.json();

    renderSection("upcomingList", elections);
  } catch (err) {
    console.error("Upcoming elections error:", err);
  }
}


// Load Past Elections

async function loadPastElections() {
  try {
    const res = await authFetch(`${BASE_URL}/elections/past`);
    const past = await res.json();

    renderSection("pastList", past);
  } catch (err) {
    console.error("Past elections error:", err);
  }
}


// Helper to render lists

function renderSection(containerId, electionArray) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!electionArray || !electionArray.length) {
    container.innerHTML = `<p class='text-muted'>No elections available.</p>`;
    return;
  }

  electionArray.forEach((e) => {
    const card = document.createElement("div");
    card.className = "card p-3 mb-2 shadow-sm";

    card.innerHTML = `
      <h5>${e.title}</h5>
      <p><strong>Type:</strong> ${e.type}</p>
      <p><strong>Status:</strong> ${e.status.toUpperCase()}</p>
      <p>${e.description || ""}</p>
    `;

    container.appendChild(card);
  });
}


// RUN ALL LOADERS

document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  loadActiveElection(); // ONLY this one handles active voting
  loadUpcomingElections();
  loadPastElections();
});
