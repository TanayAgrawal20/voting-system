const electionSelect = document.getElementById("electionSelect");
const candidateList = document.getElementById("candidateList");

// Load elections in dropdown
async function loadElections() {
  const res = await authFetch(`${BASE_URL}/admin/elections`);
  const elections = await res.json();

  elections.forEach((e) => {
    const opt = document.createElement("option");
    opt.value = e._id;
    opt.textContent = e.title;
    electionSelect.appendChild(opt);
  });

  loadCandidates(electionSelect.value);
}

electionSelect.addEventListener("change", () => {
  loadCandidates(electionSelect.value);
});

// Load candidates of selected election
async function loadCandidates(electionId) {
  candidateList.innerHTML = "Loading...";

  const res = await authFetch(`${BASE_URL}/admin/candidates/${electionId}`);
  const data = await res.json();

  candidateList.innerHTML = "";

  data.forEach((c) => {
    const div = document.createElement("div");
    div.classList.add("candidate-card");
    div.innerHTML = `
      <h3>${c.name}</h3>
      <p>${c.partyName}</p>
      <p>${c.description || ""}</p>
    `;
    candidateList.appendChild(div);
  });
}

// Add Candidate
document
  .getElementById("addCandidateBtn")
  .addEventListener("click", async () => {
    const electionId = electionSelect.value;
    const name = document.getElementById("candidateName").value;
    const partyName = document.getElementById("partyName").value;
    const description = document.getElementById("description").value;

    const photoFile = document.getElementById("candidatePhoto").files[0];
    const symbolFile = document.getElementById("partySymbol").files[0];

    const formData = new FormData();
    formData.append("electionId", electionId);
    formData.append("name", name);
    formData.append("partyName", partyName);
    formData.append("description", description);

    if (photoFile) formData.append("candidatePhoto", photoFile);
    if (symbolFile) formData.append("partySymbol", symbolFile);

    const res = await fetch(`${BASE_URL}/admin/add-candidate`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    });

    const data = await res.json();
    alert(data.message);

    loadCandidates(electionId);
  });
