const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.js");
const dashboardRoute = require("./routes/dashboard.js");
const authRoutes = require("./routes/auth.route.js");
const cursoRoute = require("./routes/curso.route.js");
const { connectDB, sequelize } = require("./database/database.js");
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
app.use("/api/curso", cursoRoute);
app.get("/", (_, res) => {
  res.status(404).json("404: Página não encontrada!");
});

// verificar se a API está a funcionar
app.get("/api", (_, res) => {
  res.status(200).json("API funciona");
});

connectDB(); // Conectar ao banco de dados

// Sincronizar os modelos com o banco de dados
(async () => {
  try {
    await sequelize.sync({ force: false }); // force false para não apagar os dados existentes
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
})();

app.listen(port, () => {
  console.log("Server started on port: ", port);
});
