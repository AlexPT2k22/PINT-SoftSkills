const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/users.js")

app.use(express.json());
app.use("/users", userRoute);
app.get("/api", (req, res) => {
  res.status(200).json("API funciona");
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});