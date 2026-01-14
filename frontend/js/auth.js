// AUTH.JS — Mobile OTP Login System


// ------------------ REGISTER ------------------
async function handleRegister() {
  const name = document.getElementById("nameInput")?.value?.trim();
  const mobile = document.getElementById("mobileInput")?.value?.trim();
  const aadhaar = document
    .getElementById("aadhaarInput")
    ?.value?.replace(/\s+/g, "");
  const address = document.getElementById("addressInput")?.value?.trim();

  if (!name || !mobile || !aadhaar) {
    return alert("Name, mobile and Aadhaar are required.");
  }
  if (!/^\d{10}$/.test(mobile)) return alert("Enter valid 10-digit mobile.");
  if (!/^\d{12}$/.test(aadhaar)) return alert("Enter valid 12-digit Aadhaar.");

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, aadhaar, address }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Registration failed");

    alert(data.message);
    window.location.href = "/frontend/pages/login.html";
  } catch (err) {
    console.error(err);
    alert("Server error.");
  }
}

// ------------------ SEND OTP ------------------
async function sendOtp() {
  const mobile = document.getElementById("loginMobile")?.value?.trim();

  if (!/^\d{10}$/.test(mobile)) return alert("Enter valid 10-digit mobile.");

  try {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    // Switch UI steps
    document.getElementById("stepSend")?.classList.add("d-none");
    document.getElementById("stepVerify")?.classList.remove("d-none");

    alert("OTP sent!");
  } catch (err) {
    console.error(err);
    alert("Error sending OTP.");
  }
}

// ------------------ VERIFY OTP ------------------
async function verifyOtp() {
  const mobile = document.getElementById("loginMobile")?.value?.trim();
  const otp = document.getElementById("otpInput")?.value?.trim();

  if (!mobile || !otp) return alert("Mobile & OTP required.");

  try {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    // Save login details
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.name);
    localStorage.setItem("role", data.user.role);

    alert("Login successful!");
    if (data.user.role === "admin") {
      window.location.href = "/frontend/pages/admin.html";
    } else {
      window.location.href = "/frontend/pages/dashboard.html";
    }
  } catch (err) {
    console.error(err);
    alert("Error verifying OTP.");
  }
}

// ------------------ RESEND OTP ------------------
async function resendOtp() {
  sendOtp();
}

// ------------------ Event Listeners ------------------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

  if (path.includes("register.html")) {
    document.getElementById("registerBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      handleRegister();
    });
  }

  if (path.includes("login.html")) {
    document.getElementById("sendOtpBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      sendOtp();
    });

    document.getElementById("verifyOtpBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      verifyOtp();
    });

    document.getElementById("resendOtpBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      resendOtp();
    });
  }
});
