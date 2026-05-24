const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const now = new Date();
const in30Days = new Date(now);
in30Days.setDate(in30Days.getDate() + 30);
const in60Days = new Date(now);
in60Days.setDate(in60Days.getDate() + 60);

const mockUser = {
  id: 101,
  ID_UTILIZADOR: 101,
  username: "demo.user",
  nome: "Demo Recruiter",
  NOME: "Demo Recruiter",
  email: "demo@softskills.mock",
  perfil: 3,
  isVerified: true,
  primeiroLogin: false,
};

const mockCourses = [
  {
    ID_CURSO: 1,
    NOME: "Comunicação em Equipa",
    DESCRICAO: "Curso prático para melhorar comunicação no contexto profissional.",
    DIFICULDADE_CURSO__: "Iniciante",
    IMAGEM: "https://placehold.co/530x300?text=SoftSkills+Course",
    averageRating: 4.7,
    totalReviews: 18,
    CURSO_ASSINCRONO: {
      ESTADO: "Ativo",
      DATA_INICIO: now.toISOString(),
      DATA_FIM: in60Days.toISOString(),
    },
    MODULOS: [
      { ID_MODULO: 11, TITULO: "Introdução", TEMPO_ESTIMADO_MIN: 20 },
      { ID_MODULO: 12, TITULO: "Escuta ativa", TEMPO_ESTIMADO_MIN: 35 },
      { ID_MODULO: 13, TITULO: "Feedback", TEMPO_ESTIMADO_MIN: 30 },
    ],
  },
  {
    ID_CURSO: 2,
    NOME: "Liderança Colaborativa",
    DESCRICAO: "Fundamentos para liderar equipas remotas com foco em resultados.",
    DIFICULDADE_CURSO__: "Intermédio",
    IMAGEM: "https://placehold.co/530x300?text=Leadership",
    averageRating: 4.5,
    totalReviews: 11,
    CURSO_SINCRONO: {
      ESTADO: "Ativo",
      DATA_INICIO: in30Days.toISOString(),
      DATA_FIM: in60Days.toISOString(),
      VAGAS: 12,
      DATA_LIMITE_INSCRICAO_S: in30Days.toISOString(),
    },
    MODULOS: [
      { ID_MODULO: 21, TITULO: "Mindset", TEMPO_ESTIMADO_MIN: 25 },
      { ID_MODULO: 22, TITULO: "Tomada de decisão", TEMPO_ESTIMADO_MIN: 40 },
    ],
  },
];

const forumTopicos = [
  {
    ID_FORUM_TOPICO: 1,
    TITULO: "Melhores práticas para feedback",
    DESCRICAO: "Partilha como dás feedback construtivo em equipa.",
    totalPosts: 6,
    totalVisualizacoes: 35,
    updatedAt: now.toISOString(),
    UTILIZADOR: { USERNAME: "mentor.team" },
  },
];

const safeUser = () => ({ ...mockUser });

const findCourse = (courseId) =>
  mockCourses.find((course) => course.ID_CURSO === Number(courseId));

app.get("/", (_req, res) => {
  res.status(200).json({ mode: "mock", message: "SoftSkills mock backend" });
});

app.get("/api", (_req, res) => {
  res.status(200).json("API funciona (mock)");
});

app.post("/api/auth/login", (req, res) => {
  const email = req.body?.EMAIL || mockUser.email;
  res.status(200).json({
    success: true,
    user: { ...safeUser(), email },
  });
});

app.get("/api/auth/checkauth", (_req, res) => {
  res.status(200).json({ success: true, user: safeUser() });
});

app.get("/api/auth/logout", (_req, res) => {
  res.status(200).json({ success: true, message: "Logout efetuado (mock)" });
});

app.post("/api/auth/register", (req, res) => {
  res.status(201).json({
    success: true,
    user: {
      ...safeUser(),
      username: req.body?.USERNAME || "novo.user",
      nome: req.body?.NOME || "Novo Utilizador",
      email: req.body?.EMAIL || "novo@softskills.mock",
    },
  });
});

app.post("/api/auth/verifyemail", (_req, res) => {
  res.status(200).json({ success: true, user: safeUser() });
});

app.post("/api/auth/forgotpassword", (_req, res) => {
  res.status(200).json({ success: true, message: "Email mock enviado." });
});

app.post("/api/auth/resetpassword/:token", (_req, res) => {
  res.status(200).json({ success: true, user: safeUser() });
});

app.get("/api/cursos/popular", (_req, res) => {
  res.status(200).json(mockCourses);
});

app.get("/api/cursos/search", (_req, res) => {
  res.status(200).json({
    cursos: mockCourses,
    total: mockCourses.length,
    page: 1,
    pages: 1,
  });
});

app.get("/api/cursos/:courseId", (req, res) => {
  const course = findCourse(req.params.courseId);
  if (!course) {
    return res.status(404).json({ message: "Curso não encontrado" });
  }
  return res.status(200).json(course);
});

app.get("/api/user/student-courses", (_req, res) => {
  res.status(200).json(mockCourses);
});

app.get("/api/user/teacher-courses", (_req, res) => {
  res.status(200).json(mockCourses);
});

app.get("/api/user/teachers", (_req, res) => {
  res.status(200).json([
    { ID_UTILIZADOR: 201, NOME: "Alex Formador", USERNAME: "alex.formador" },
  ]);
});

app.get("/api/user/nota-media", (_req, res) => {
  res.status(200).json({
    notaMediaGeral: 16,
    totalAvaliacoes: 8,
    trabalhos: { count: 4, media: 15.5 },
    quizzes: { count: 4, media: 16.5 },
  });
});

app.get("/api/user/nota-media-avaliacoes-finais", (_req, res) => {
  res.status(200).json({
    notaMediaFinal: 17,
    totalAvaliacoesFinais: 2,
    cursosCompletados: 1,
    escala: "0-20",
  });
});

app.get("/api/user/:userId/statistics", (_req, res) => {
  res.status(200).json({ cursos: 2, certificados: 1, media: 16.2 });
});

app.get("/api/user/:userId", (_req, res) => {
  res.status(200).json(safeUser());
});

app.post("/api/user/verify-course/:courseId", (_req, res) => {
  res.status(200).json({ inscrito: true });
});

app.post("/api/user/enter-course/:courseId", (_req, res) => {
  res.status(201).json({ success: true });
});

app.get("/api/progress/courses/:courseId/progress", (req, res) => {
  const progress = Number(req.params.courseId) === 1 ? 67 : 24;
  res.status(200).json({
    success: true,
    percentualProgresso: progress,
    modulosCompletos: 2,
    totalModulos: 3,
  });
});

app.get("/api/aulas/all", (_req, res) => {
  res.status(200).json([]);
});

app.get("/api/avaliacoes/proximas", (_req, res) => {
  res.status(200).json([]);
});

app.get("/api/quiz/pendentes", (_req, res) => {
  res.status(200).json([]);
});

app.get("/api/quiz/curso/:courseId", (_req, res) => {
  res.status(200).json({ hasQuiz: true, quiz: { ID_QUIZ: 501 } });
});

app.get("/api/quiz/:quizId/resultado", (_req, res) => {
  res.status(200).json({ hasResponse: false });
});

app.post("/api/quiz/submeter", (_req, res) => {
  res.status(201).json({ success: true, nota: 16 });
});

app.get("/api/categorias", (_req, res) => {
  res.status(200).json([
    { ID_CATEGORIA__PK___: 1, NOME: "Soft Skills" },
    { ID_CATEGORIA__PK___: 2, NOME: "Gestão" },
  ]);
});

app.get("/api/areas", (_req, res) => {
  res.status(200).json([{ ID_AREA___PK___: 1, NOME: "Comunicação" }]);
});

app.get("/api/categorias/com-areas", (_req, res) => {
  res.status(200).json([
    {
      ID_CATEGORIA__PK___: 1,
      NOME: "Soft Skills",
      AREAs: [{ ID_AREA___PK___: 1, NOME: "Comunicação" }],
    },
  ]);
});

app.get("/api/topicos", (_req, res) => {
  res.status(200).json([{ ID_TOPICO___PK___: 1, NOME: "Feedback" }]);
});

app.get("/api/topicos/by-area/:areaId", (_req, res) => {
  res.status(200).json([{ ID_TOPICO___PK___: 1, NOME: "Feedback" }]);
});

app.post("/api/topicos", (_req, res) => {
  res.status(201).json({ success: true });
});

app.get("/api/forum/topicos/count", (_req, res) => {
  res.status(200).json({ count: forumTopicos.length });
});

app.get("/api/forum/topicos", (_req, res) => {
  res.status(200).json({ success: true, topicos: forumTopicos });
});

app.get("/api/forum/topicos/:topicoId", (req, res) => {
  const topico = forumTopicos.find(
    (item) => item.ID_FORUM_TOPICO === Number(req.params.topicoId)
  );

  if (!topico) {
    return res.status(404).json({ success: false, message: "Tópico não encontrado" });
  }

  return res.status(200).json({ success: true, topico });
});

app.get("/api/forum/posts", (_req, res) => {
  res.status(200).json({ posts: 14, success: true, data: [] });
});

app.get("/api/forum/posts/topico/:topicoId", (_req, res) => {
  res.status(200).json({ success: true, posts: [], pagination: { totalPages: 1 } });
});

app.post("/api/forum/posts", (_req, res) => {
  res.status(201).json({ success: true, message: "Post criado (mock)" });
});

app.put("/api/forum/posts/:id", (_req, res) => {
  res.status(200).json({ success: true });
});

app.delete("/api/forum/posts/:id", (_req, res) => {
  res.status(200).json({ success: true });
});

app.get("/api/forum/solicitacoes", (_req, res) => {
  res.status(200).json({ success: true, solicitacoes: [] });
});

app.post("/api/forum/solicitacoes", (_req, res) => {
  res.status(201).json({ success: true });
});

app.post("/api/forum/solicitacoes/:id/responder", (_req, res) => {
  res.status(200).json({ success: true });
});

app.get("/api/forum/denuncias", (_req, res) => {
  res.status(200).json({ success: true, denuncias: [] });
});

app.post("/api/forum/denuncias/post/:id", (_req, res) => {
  res.status(201).json({ success: true });
});

app.post("/api/forum/avaliacoes/post/:id", (_req, res) => {
  res.status(200).json({ success: true });
});

app.get("/api/reviews/:courseId", (_req, res) => {
  res.status(200).json({
    success: true,
    estatisticas: { mediaEstrelas: 4.6, totalReviews: 21 },
    reviews: [],
  });
});

app.post("/api/reviews/:courseId", (_req, res) => {
  res.status(201).json({ success: true });
});

app.delete("/api/reviews/:courseId", (_req, res) => {
  res.status(200).json({ success: true });
});

app.get("/api/percurso-formativo/meu", (_req, res) => {
  res.status(200).json({ success: true, percurso: [] });
});

app.get("/api/percurso-formativo/:cursoId", (_req, res) => {
  res.status(200).json({ success: true, percurso: [] });
});

app.get("/api/certificados/verificar/:code", (req, res) => {
  res.status(200).json({
    success: true,
    certificado: {
      codigo: req.params.code.toUpperCase(),
      aluno: "Demo Recruiter",
      curso: "Comunicação em Equipa",
      dataEmissao: now.toISOString(),
      notaFinal: 17,
      entidade: "SoftSkills Academy",
      valido: true,
    },
  });
});

app.get("/api/notificacoes", (_req, res) => {
  res.status(200).json([]);
});

app.post("/api/cron/maintenance", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const expectedToken = process.env.CRON_SECRET || "dev-mock-secret";

  if (token !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized cron request" });
  }

  return res.status(200).json({ ok: true, executed: "maintenance (mock)" });
});

app.all("/api/*", (req, res) => {
  res.status(200).json({
    success: true,
    mock: true,
    method: req.method,
    path: req.path,
    data: [],
  });
});

module.exports = app;
