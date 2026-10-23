require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const sanitize = require("sanitize").middleware;

const { testConnection } = require("./config/db.config");

const router = require("./Routes");

const app = express();


app.use(cors());
app.use(helmet());
app.use(express.json());
// app.use(sanitize());

app.use(router);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Simulator Workshop API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await testConnection();
});

module.exports = app;