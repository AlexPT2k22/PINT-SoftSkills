const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.js");
const dashboardRoute = require("./routes/dashboard.js");
const authRoutes = require("./routes/auth.route.js");
const { connectDB } = require("./database/database.js");
require("./models/index.js"); // Importar todos os modelos para garantir que estão registados
const cookieparser = require("cookie-parser");
const port = process.env.PORT || 4000;

app.use(express.json()); // Para ler JSON no corpo da requisição
app.use(
  cors({
    origin: ["http://localhost:5173", "https://pint-soft-skills.vercel.app/"],
    credentials: true,
  })
); // Permitir cookies e credenciais
app.use(cookieparser()); // Para ler cookies

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

app.listen(port, () => {
  connectDB(); // Conectar ao banco de dados
  console.log("Server started on port: ", port);
});
