const fetch = require("node-fetch");
const io = require("socket.io-client");

// ================= CONFIG =================

const BASE_URL = "http://localhost:5500/api";
const SOCKET_URL = "http://localhost:5500";

const TOKEN = "PASTE_YOUR_JWT_TOKEN_HERE"; 
const electionId = "692c14c1b7968ef74d4106d9";
const candidateId = "692c1572b7968ef74d4106df";

// ========================================

async function testAPI() {
  console.log("\n--- TESTING VOTE API ---");

  const res = await fetch(`${BASE_URL}/vote/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({ electionId, candidateId }),
  });

  const data = await res.json();
  console.log("API RESPONSE:", data);
}

function testSocket() {
  console.log("\n--- TESTING SOCKET ---");

  const socket = io(SOCKET_URL);

  socket.on("connect", () => {
    console.log("SOCKET CONNECTED");

    socket.on("voteUpdate", (data) => {
      console.log("\nLIVE UPDATE RECEIVED:");
      console.log(JSON.stringify(data, null, 2));
      process.exit(0);
    });
  });
}

async function run() {
  testSocket();
  await testAPI();
}

run();
