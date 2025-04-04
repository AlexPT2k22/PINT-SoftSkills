const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.js");
const dashboardRoute = require("./routes/dashboard.js");
const authRoutes = require("./routes/auth.route.js");
const authenticateToken = require("./middlewares/authmiddleware.js");
const { connectDB } = require("./database/database.js");
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use("/api/user", userRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/auth", authRoutes);
app.get("/", (_, res) => {
  res.status(404).json("404: Página não encontrada!");
});

// verificar se a API está a funcionar
app.get("/api", (_, res) => {
  res.status(200).json("API funciona");
});

// verificar se o utilizador está autenticado
app.get("/api/private", authenticateToken, (req, res) => {
  res.json({ message: `Olá ${req.user.username}, estás autenticado!` });
});

app.listen(port, () => {
  connectDB(); // Conectar ao banco de dados
  console.log("Server started on port: ", 8080);
});
