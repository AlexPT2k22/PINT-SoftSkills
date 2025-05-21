const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.js");
const dashboardRoute = require("./routes/dashboard.js");
const authRoutes = require("./routes/auth.route.js");
const cursoRoute = require("./routes/curso.route.js");
const areaRoute = require("./routes/area.route.js");
const progressRoute = require("./routes/progresso.route.js");
const { connectDB, sequelize } = require("./database/database.js");
require("./models/index.js"); // Importar todos os modelos para garantir que estão registados
const categoriaRoutes = require("./routes/categoria.route.js");
const cookieparser = require("cookie-parser");
require("dotenv");
const { connectCloudinary } = require("./database/cloudinary.js");
const notasRoutes = require("./routes/notas.route.js");
const certificadoRoutes = require("./routes/certificado.route.js");
app.use("/api/certificados", certificadoRoutes);
const path = require("path");
const port = process.env.PORT || 4000;

app.use(express.json()); // Para ler JSON no corpo da requisição
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
); // Permitir cookies e credenciais
app.use(cookieparser()); // Para ler cookies

app.use("/api/areas", areaRoute); // Rota para áreas
app.use("/api/user", userRoute); // Rota para usuários
app.use("/api/dashboard", dashboardRoute); // Rota para o dashboard
app.use("/api/auth", authRoutes); // Rota para autenticação
app.use("/api/cursos", cursoRoute); // Rota para cursos
app.use("/api/categorias", categoriaRoutes); // Rota para categorias
app.use("/api/progress", progressRoute); // Rota para progresso
app.use("/api/notes", notasRoutes); // Rota para notas
app.use("/api/certificados", certificadoRoutes);
app.use(
  "/certificates",
  express.static(path.join(__dirname, "public/certificates"))
);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.get("/", (_, res) => {
  res.status(404).json("404: Página não encontrada!");
});

// verificar se a API está a funcionar
app.get("/api", (_, res) => {
  res.status(200).json("API funciona");
});

connectDB(); // Conectar ao banco de dados
connectCloudinary(); // Conectar ao Cloudinary

// Sincronizar os modelos com o banco de dados
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database configurada com sucesso!");
  } catch (error) {
    console.error("Erro a sincronizar base de dados:", error);
  }
})();

app.listen(port, () => {
  console.log("Server started on port: ", port);
});
