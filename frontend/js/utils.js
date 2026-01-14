// GLOBAL LOGOUT FUNCTION

const BASE_URL = "http://localhost:5500/api"; 


document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token"); // removes JWT
  alert("Logged out successfully!");
  window.location.href = "/frontend/pages/index.html"; // redirect to home/login
});


// SHOW USERNAME IN NAVBAR

function showLoggedInUser() {
  const username = localStorage.getItem("username");

  if (username) {
    const nameSpan = document.getElementById("username");
    if (nameSpan) {
      nameSpan.textContent = "Welcome, " + username;
    }
  }
}

showLoggedInUser();



// AUTH FETCH (Single Version)

async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  // Public endpoints where token should NOT be sent
  const publicRoutes = [
    "/auth/register",
    "/auth/send-otp",
    "/auth/verify-otp"
  ];

  const isPublic = publicRoutes.some((r) => url.includes(r));

  // Create headers object if missing
  if (!options.headers) options.headers = {};

  // Always set JSON content-type except for formData
  if (!(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  // Attach token for protected requests
  if (!isPublic && token) {
    options.headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(url, options);

  // If unauthorized → logout & go to login
  if (res.status === 401 && !isPublic) {
    localStorage.clear();
    window.location.href = "/frontend/pages/login.html";
  }

  return res;
}
