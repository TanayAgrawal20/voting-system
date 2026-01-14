const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Make io accessible in routes/controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinElection", (electionId) => {
    socket.join(String(electionId));
    console.log(`JOINED ROOM: ${electionId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Models
require("./models/User");
require("./models/Candidate");
require("./models/Election");
require("./models/Vote");

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));
app.use("/pages", express.static(path.join(__dirname, "../frontend/pages")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/elections", require("./routes/electionRoutes"));
app.use("/api/vote", require("./routes/voteRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
