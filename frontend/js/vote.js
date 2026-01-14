console.log("VOTE.JS LOADED");



document.addEventListener("DOMContentLoaded", loadCandidates);

async function loadCandidates() {
  const electionId = localStorage.getItem("activeElectionId");

  if (!electionId || !/^[0-9a-fA-F]{24}$/.test(electionId)) {
    Swal.fire("Invalid election!", "Returning to dashboard.", "error");
    return (window.location.href = "/frontend/pages/dashboard.html");
  }

  try {
    // Load Election
    const eRes = await fetch(`${BASE_URL}/elections/${electionId}`);
    const election = await eRes.json();

    if (!eRes.ok) {
      Swal.fire("Election not found!", "", "error");
      return (window.location.href = "/frontend/pages/dashboard.html");
    }

    document.getElementById("electionTitle").innerHTML = `
      <h2>${election.title}</h2>
      <p>${election.description || ""}</p>
    `;

    // Load Candidates
    const cRes = await fetch(`${BASE_URL}/elections/candidates/${electionId}`);
    const candidates = await cRes.json();

    const list = document.getElementById("candidateList");
    list.innerHTML = "";

    if (!Array.isArray(candidates) || candidates.length === 0) {
      list.innerHTML = "<p>No candidates found.</p>";
      return;
    }

    // Render cards
    candidates.forEach((c) => {
      list.innerHTML += `
        <div class="col-md-4 d-flex justify-content-center">
          <div class="candidate-card text-center">

            <img src="http://localhost:5500/uploads/${
              c.candidatePhoto || "default.png"
            }"
              class="candidate-img"
              onerror="this.src='http://localhost:5500/uploads/default.png'">

            <h3>${c.name}</h3>
            <p class="text-info fw-semibold">${c.partyName}</p>
            <p>${c.description || ""}</p>

            <button class="btn-vote" onclick="castVote('${electionId}', '${
        c._id
      }', this)">
              Vote
            </button>

          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("LOAD CANDIDATES ERROR:", err);
    Swal.fire("Error", "Failed to load candidates.", "error");
  }
}

// CAST VOTE FUNCTION

window.castVote = async function (electionId, candidateId, btn) {
  console.log("CLICKED VOTE", electionId, candidateId);

  try {
    const res = await fetch(`${BASE_URL}/vote/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ electionId, candidateId }),
    });

    console.log("REQUEST SENT");

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (!res.ok) {
      return Swal.fire("Error", data.message, "error");
    }

    Swal.fire("Vote Added!", data.message, "success");
  } catch (err) {
    console.error("CAST VOTE ERROR:", err);
  }
};
