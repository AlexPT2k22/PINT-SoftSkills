const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.js");
const dashboardRoute = require("./routes/dashboard.js");

app.use(express.json());
app.use(cors());
app.use("/user", userRoute);
app.use("/dashboard", dashboardRoute);
app.get("/", (req, res) => {
  res.status(404).json("404: Página não encontrada!");
});
app.get("/api", (req, res) => {
  res.status(200).json("API funciona");
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
