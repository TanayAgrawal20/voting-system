// ADMIN PANEL JS

// const BASE_URL = "http://localhost:5500/api";
const UPLOAD_BASE = "http://localhost:5500/uploads/";

// ================================
// LOAD ALL ELECTIONS
// ================================
async function loadElections() {
  try {
    const res = await authFetch(`${BASE_URL}/elections/admin/elections`);
    const data = await res.json();

    const dropdown = document.getElementById("electionSelect");
    const listContainer = document.getElementById("electionList");

    dropdown.innerHTML = "";
    listContainer.innerHTML = "";

    if (!data.length) {
      listContainer.innerHTML =
        "<p class='text-muted'>No elections created yet.</p>";
      return;
    }

    data.forEach((election) => {
      const opt = document.createElement("option");
      opt.value = election._id;
      opt.textContent = election.title;
      dropdown.appendChild(opt);

      const div = document.createElement("div");
      div.className = "p-3 mb-3 border rounded shadow-sm";

      div.innerHTML = `
        <h5>${election.title}</h5>
        <p><strong>Type:</strong> ${election.type}</p>

        <p>
          <strong>Status:</strong>
          <span class="badge bg-${
            election.status === "active"
              ? "success"
              : election.status === "past"
              ? "danger"
              : "secondary"
          }">
            ${election.status.toUpperCase()}
          </span>
        </p>

        <p class="text-muted">${election.description || "No description"}</p>

        <div class="d-flex gap-2 mt-2">

          <button class="btn btn-info btn-sm"
            onclick="viewCandidates('${election._id}', '${election.title}')">
            View Candidates
          </button>

          <button class="btn btn-success btn-sm"
            onclick="startElection('${election._id}')"
            ${election.status !== "upcoming" ? "disabled" : ""}>
            Start
          </button>

          <button class="btn btn-warning btn-sm"
            onclick="stopElection('${election._id}')"
            ${election.status !== "active" ? "disabled" : ""}>
            Stop
          </button>

          <button class="btn btn-danger btn-sm"
            onclick="deleteElection('${election._id}')">
            Delete
          </button>

        </div>
      `;

      listContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Load Elections Error:", err);
    alert("Failed to load elections.");
  }
}

// ================================
// CREATE ELECTION
// ================================
async function createElection() {
  const title = document.getElementById("electionTitleInput").value.trim();
  const type = document.getElementById("electionTypeInput").value.trim();
  const description = document.getElementById("electionDescInput").value.trim();

  if (!title || !type) return alert("Title & Type are required!");

  try {
    const res = await authFetch(`${BASE_URL}/admin/create-election`, {
      method: "POST",
      body: JSON.stringify({ title, type, description }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("Election created successfully!");
    loadElections();
  } catch (err) {
    console.error("Create Election Error:", err);
    alert("Error creating election.");
  }
}

// ================================
// DELETE ELECTION
// ================================
async function deleteElection(id) {
  if (!confirm("Are you sure?")) return;

  try {
    const res = await authFetch(`${BASE_URL}/admin/delete-election/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("Election deleted!");
    loadElections();
  } catch (err) {
    console.error("Delete Election Error:", err);
    alert("Failed to delete election.");
  }
}

// ================================
// START ELECTION
// ================================
async function startElection(id) {
  try {
    const res = await authFetch(
      `${BASE_URL}/elections/admin/start-election/${id}`,
      { method: "PATCH" }
    );

    const data = await res.json();
    alert(data.message);
    loadElections();
  } catch (err) {
    console.error("Start Election Error:", err);
    alert("Action not allowed.");
  }
}

// ================================
// STOP ELECTION
// ================================
async function stopElection(id) {
  try {
    const res = await authFetch(
      `${BASE_URL}/elections/admin/stop-election/${id}`,
      { method: "PATCH" }
    );

    const data = await res.json();
    alert(data.message);
    loadElections();
  } catch (err) {
    console.error("Stop Election Error:", err);
    alert("Action not allowed.");
  }
}

// ================================
// VIEW CANDIDATES
// ================================
async function viewCandidates(electionId) {
  const container = document.getElementById("candidateDisplay");
  container.innerHTML = `<p class="text-primary">Loading candidates...</p>`;

  try {
    const res = await authFetch(
      `${BASE_URL}/elections/candidates/${electionId}`
    );
    const candidates = await res.json();

    container.innerHTML = "";

    candidates.forEach((c) => {
      const photoURL = c.candidatePhoto
        ? `${UPLOAD_BASE}${c.candidatePhoto}`
        : `${UPLOAD_BASE}default.png`;

      const symbolURL = c.partySymbol
        ? `${UPLOAD_BASE}${c.partySymbol}`
        : `${UPLOAD_BASE}default.png`;

      container.innerHTML += `
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center mb-2">
                <img src="${photoURL}" width="70" height="70"
                     class="rounded-circle me-3">
                <div>
                  <h5>${c.name}</h5>
                  <h6 class="text-muted">${c.partyName}</h6>
                </div>
              </div>
              <p>${c.description || ""}</p>
              <strong>Party Symbol:</strong><br>
              <img src="${symbolURL}" width="60" height="60">
            </div>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-danger">Failed to load candidates.</p>`;
  }
}

// ================================
// PAGE LOAD
// ================================
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("role") !== "admin") {
    alert("Access denied!");
    window.location.href = "../pages/login.html";
    return;
  }

  loadElections();

  document
    .getElementById("createElectionBtn")
    .addEventListener("click", createElection);

  document
    .getElementById("addCandidateBtn")
    .addEventListener("click", addCandidate);
});

// ================================
// ADD CANDIDATE
// ================================
async function addCandidate() {
  const electionId = document.getElementById("electionSelect").value;
  const name = document.getElementById("candidateNameInput").value.trim();
  const partyName = document.getElementById("partyNameInput").value.trim();
  const description = document
    .getElementById("candidateDescInput")
    .value.trim();

  const photoFile = document.getElementById("candidatePhotoInput").files[0];
  const symbolFile = document.getElementById("partySymbolInput").files[0];

  if (!electionId || !name || !partyName) {
    alert("All fields are required!");
    return;
  }

  const formData = new FormData();
  formData.append("electionId", electionId);
  formData.append("name", name);
  formData.append("partyName", partyName);
  formData.append("description", description);
  if (photoFile) formData.append("candidatePhoto", photoFile);
  if (symbolFile) formData.append("partySymbol", symbolFile);

  try {
    const res = await fetch(`${BASE_URL}/admin/add-candidate`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("Candidate added successfully!");
  } catch (err) {
    console.error("Add Candidate Error:", err);
    alert("Failed to add candidate.");
  }
}
