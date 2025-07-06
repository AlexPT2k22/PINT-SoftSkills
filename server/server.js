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
const topicoRoutes = require("./routes/topico.route");
const cookieparser = require("cookie-parser");
require("dotenv");
const { connectCloudinary } = require("./database/cloudinary.js");
const notasRoutes = require("./routes/notas.route.js");
const certificadoRoutes = require("./routes/certificado.route.js");
const avaliacaoSincronaRoutes = require("./routes/avaliacaoSincrona.route.js");
const avaliacaoFinalSincronaRoutes = require("./routes/avaliacaoFinalSincrona.route.js");
const aulaSincronaRoutes = require("./routes/aulaSincrona.route.js");
const presencaRoutes = require("./routes/presenca.route");
const notificacaoRoutes = require("./routes/notificacao.route.js");
const quizzassincronoRoutes = require("./routes/quizAssincrono.route.js");
const adminStatsRoutes = require("./routes/adminStats.route.js");
const anuncioRotas = require("./routes/anuncio.route.js");
const forumTopicoRoutes = require("./routes/forumTopico.routes.js");
const forumPostRoutes = require("./routes/forumPost.routes.js");
const forumAvaliacaoRoutes = require("./routes/forumAvaliacao.routes.js");
const forumDenunciaRoutes = require("./routes/forumDenuncia.routes.js");
const percursoFormativo = require("./routes/percursoFormativo.route.js");
const forumSolicitacaoRoutes = require("./routes/forumSolicitacao.routes.js");
const reviewsRoutes = require("./routes/reviews.route.js");
const {
  updateAsyncCoursesStatus,
  updateSyncCoursesStatus,
} = require("./jobs/courseStatusUpdater.js");
const path = require("path");
const port = process.env.PORT || 4000;

app.use(express.json()); // Para ler JSON no corpo da requisição
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://pint-soft-skills.vercel.app",
        "https://pint-soft-skills-alexandres-projects-999f47dc.vercel.app",
      ];

      // Permitir requests sem origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Não permitido pelo CORS"));
      }
    },
    credentials: true, // Permitir cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Set-Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  })
);
app.use(cookieparser()); // Para ler cookies

// Executar atualização a cada hora
setInterval(
  async () => {
    await updateAsyncCoursesStatus();
    await updateSyncCoursesStatus();
  },
  60 * 60 * 1000
);

app.use("/api/notificacoes", notificacaoRoutes); // Rota para notificações
app.use("/api/areas", areaRoute); // Rota para áreas
app.use("/api/anuncios", anuncioRotas); // Rota para anúncios
app.use("/api/user", userRoute); // Rota para usuários
app.use("/api/reviews", reviewsRoutes); // Rota para reviews
app.use("/api/dashboard", dashboardRoute); // Rota para o dashboard
app.use("/api/auth", authRoutes); // Rota para autenticação
app.use("/api/cursos", cursoRoute); // Rota para cursos
app.use("/api/categorias", categoriaRoutes); // Rota para categorias
app.use("/api/progress", progressRoute); // Rota para progresso
app.use("/api/notes", notasRoutes); // Rota para notas
app.use("/api/avaliacoes", avaliacaoSincronaRoutes); // Rota para avaliações síncronas
app.use("/api/avaliacoes-finais", avaliacaoFinalSincronaRoutes); // Rota para avaliações finais
app.use("/api/forum/topicos", forumTopicoRoutes); // Rota para tópicos do fórum
app.use("/api/admin/stats", adminStatsRoutes); // Rota para estatísticas do admin
app.use("/api/forum/posts", forumPostRoutes); // Rota para posts do fórum
app.use("/api/forum/avaliacoes", forumAvaliacaoRoutes); // Rota para avaliações do fórum
app.use("/api/forum/denuncias", forumDenunciaRoutes); // Rota para denúncias do fórum
app.use("/api/forum/solicitacoes", forumSolicitacaoRoutes); // Rota para solicitações do fórum
app.use("/api/percurso-formativo", percursoFormativo); // Rota para percurso formativo
app.use("/api/certificados", certificadoRoutes); // Rota para certificados
app.use(
  "/certificates",
  express.static(path.join(__dirname, "public/certificates"))
); // Rota para certificados estáticos
app.use("/api/quiz", quizzassincronoRoutes); // Rota para quizzes assíncronos
app.use("/api/topicos", topicoRoutes); // Rota para tópicos
app.use("/api/aulas", aulaSincronaRoutes); // Rota para aulas síncronas
app.use("/api/presencas", presencaRoutes); // Rota para presenças
app.use("/uploads", express.static(path.join(__dirname, "public/uploads"))); // Rota para uploads de arquivos
app.get("/", (_, res) => {
  res.status(404).json("404: Página não encontrada!");
}); // Rota para a página 404

// verificar se a API está a funcionar
app.get("/api", (_, res) => {
  res.status(200).json("API funciona");
});

connectDB(); // Conectar ao banco de dados
connectCloudinary(); // Conectar ao Cloudinary
updateAsyncCoursesStatus(); // Atualizar status dos cursos assíncronos
updateSyncCoursesStatus(); // Atualizar status dos cursos síncronos

// Sincronizar os modelos com o banco de dados
(async () => {
  try {
    await sequelize.sync({ force: false, alter: false });
    console.log("Database configurada com sucesso!");
  } catch (error) {
    console.error("Erro a sincronizar base de dados:", error);
  }
})();

app.listen(port, () => {
  console.log("Server started on port: ", port);
});
