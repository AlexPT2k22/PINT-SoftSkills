import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import useAuthStore from "./store/authStore";
import CourseCardDashboard from "./components/courseCardDashboard";
import { useEffect, useState } from "react";
import axios from "axios";
import { Book, Clock, Files, File, GraduationCap, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});
  const [courses, setCourses] = useState([]);
  const [proximasAulas, setProximasAulas] = useState([]);
  const [metricas, setMetricas] = useState({
    cursosAtivos: 0,
    proximaAula: "N/A",
    videosAssistidos: 0,
    progressoGeral: 0,
    notaMedia: 0,
  });

  const [notaMedia, setNotaMedia] = useState({
    notaMediaGeral: 0,
    totalAvaliacoes: 0,
    trabalhos: { count: 0, media: 0 },
    quizzes: { count: 0, media: 0 },
  });
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [proximosTrabalhos, setProximosTrabalhos] = useState([]);
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Carregar cursos do usuário
        const cursosResponse = await axios.get(
          `${URL}/api/user/student-courses`,
          { withCredentials: true }
        );

        const cursosData = cursosResponse.data;
        setCourses(cursosData);

        // aulas dos cursos síncronos
        const [
          aulasResponse,
          trabalhosResponse,
          quizzesResponse,
          notaMediaResponse,
        ] = await Promise.all([
          axios.get(`${URL}/api/aulas/all`, {
            withCredentials: true,
          }),
          axios.get(`${URL}/api/avaliacoes/proximas`, {
            withCredentials: true,
          }),
          axios.get(`${URL}/api/quiz/pendentes`, {
            withCredentials: true,
          }),
          axios.get(`${URL}/api/user/nota-media`, {
            withCredentials: true,
          }),
        ]);

        setNotaMedia(notaMediaResponse.data);

        // Calcular progresso geral
        const progressMap = {};
        let totalProgresso = 0;

        await Promise.all(
          cursosData.map(async (course) => {
            try {
              const progressResponse = await axios.get(
                `${URL}/api/progress/courses/${course.ID_CURSO}/progress`,
                { withCredentials: true }
              );

              if (progressResponse.data.success) {
                progressMap[course.ID_CURSO] = {
                  percentualProgresso:
                    progressResponse.data.percentualProgresso,
                  modulosCompletos: progressResponse.data.modulosCompletos,
                  totalModulos: progressResponse.data.totalModulos,
                };

                totalProgresso += progressResponse.data.percentualProgresso;
              }
            } catch (err) {
              console.error(
                `Erro ao buscar progresso do curso ${course.ID_CURSO}:`,
                err
              );
            }
          })
        );

        setCourseProgress(progressMap);

        // Processar e formatar os dados da API para o formato que o componente espera
        if (aulasResponse.data && Array.isArray(aulasResponse.data)) {
          // Se a API retornar um array de aulas
          const aulasFormatadas = aulasResponse.data
            // Ordenar por data/hora
            .sort((a, b) => {
              const dataA = new Date(`${a.DATA_AULA}T${a.HORA_INICIO}`);
              const dataB = new Date(`${b.DATA_AULA}T${b.HORA_INICIO}`);
              return dataA - dataB;
            })
            // Mapear para o formato do componente
            .map((aula) => ({
              id: aula.ID_AULA,
              hora: aula.HORA_INICIO ? aula.HORA_INICIO.substring(0, 5) : "N/A",
              materia: aula.TITULO,
              link: aula.LINK_ZOOM,
              data: new Date(aula.DATA_AULA)
                .toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "-"),
              estado: aula.ESTADO,
              descricao: aula.DESCRICAO,
              presenca: aula.PRESENCA_AULAs[0].PRESENTE,
            }))
            // Filtrar aulas futuras
            .filter((aula) => {
              const dataAula = new Date(`${aula.data}T${aula.hora}`);
              return dataAula >= new Date(); // Apenas aulas futuras
            });

          setProximasAulas(aulasFormatadas);

          // Também podemos atualizar a métrica de próxima aula
          if (aulasFormatadas.length > 0) {
            // Filtrar aulas que não estão canceladas ou concluídas
            const aulasValidas = aulasFormatadas.filter(
              (aula) =>
                aula.estado !== "Cancelada" && aula.estado !== "Concluída"
            );

            if (aulasValidas.length > 0) {
              setMetricas((prev) => ({
                ...prev,
                proximaAula: aulasValidas[0].hora, // Define a hora da próxima aula válida
              }));
            } else {
              setMetricas((prev) => ({
                ...prev,
                proximaAula: "N/A", // Caso não haja aulas válidas
              }));
            }
          }
          //console.log(aulasFormatadas);
        } else {
          // Fallback para dados vazios se a API não retornar o esperado
          console.error(
            "Formato de dados de aulas inesperado:",
            aulasResponse.data
          );
          setProximasAulas([]);
        }

        let trabalhosFormatados = [];
        if (trabalhosResponse.data && Array.isArray(trabalhosResponse.data)) {
          trabalhosFormatados = trabalhosResponse.data
            .sort((a, b) => {
              const dataA = new Date(a.DATA_LIMITE_REALIZACAO);
              const dataB = new Date(b.DATA_LIMITE_REALIZACAO);
              return dataA - dataB;
            })
            .map((trabalho) => {
              const jaSubmetido =
                trabalho.SUBMISSAO_AVALIACAOs &&
                trabalho.SUBMISSAO_AVALIACAOs.length > 0;

              return {
                id: trabalho.ID_AVALIACAO_SINCRONA,
                tipo: "trabalho", // ✅ Adicionar tipo
                titulo: trabalho.TITULO,
                descricao: trabalho.DESCRICAO,
                dataLimite: new Date(trabalho.DATA_LIMITE_REALIZACAO),
                dataFormatada: new Date(
                  trabalho.DATA_LIMITE_REALIZACAO
                ).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
                cursoId: trabalho.ID_CURSO,
                cursoNome:
                  trabalho.CURSO_SINCRONO?.CURSO?.NOME ||
                  "Curso não especificado",
                status:
                  new Date() > new Date(trabalho.DATA_LIMITE_REALIZACAO)
                    ? "Fechado"
                    : "Aberto",
                jaSubmetido: jaSubmetido,
                nota: jaSubmetido && trabalho.SUBMISSAO_AVALIACAOs[0]?.NOTA,
              };
            })
            .filter((trabalho) => trabalho.status === "Aberto");
        }

        // ✅ Processar quizzes pendentes
        let quizzesFormatados = [];
        if (quizzesResponse.data && Array.isArray(quizzesResponse.data)) {
          quizzesFormatados = quizzesResponse.data.map((quiz) => ({
            id: quiz.ID_QUIZ,
            tipo: "quiz", // ✅ Adicionar tipo
            titulo: quiz.TITULO,
            descricao: quiz.DESCRICAO || "Quiz do curso",
            dataLimite: null, // Quizzes geralmente não têm data limite
            dataFormatada: "Disponível", // Texto indicativo
            cursoId: quiz.ID_CURSO,
            cursoNome: quiz.CURSO?.NOME || "Curso não especificado",
            status: "Aberto",
            jaSubmetido: false, // Já filtrados os não submetidos
            nota: null,
            tempoLimite: quiz.TEMPO_LIMITE_MIN,
            notaMinima: quiz.NOTA_MINIMA,
          }));
        }

        // ✅ Combinar trabalhos e quizzes
        const todosItens = [...trabalhosFormatados, ...quizzesFormatados].sort(
          (a, b) => {
            // Priorizar por data limite (trabalhos primeiro, depois quizzes)
            if (a.dataLimite && b.dataLimite) {
              return a.dataLimite - b.dataLimite;
            }
            if (a.dataLimite && !b.dataLimite) return -1;
            if (!a.dataLimite && b.dataLimite) return 1;
            return 0;
          }
        );

        setProximosTrabalhos(todosItens);

        // Atualizar métricas
        setMetricas((prev) => ({
          ...prev,
          cursosAtivos: cursosData.length,
          progressoGeral:
            cursosData.length > 0
              ? Math.round(totalProgresso / cursosData.length)
              : 0,
          notaMedia: notaMediaResponse.data.notaMediaGeral || 0,
        }));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Agendada":
        return "bg-info";
      case "Em andamento":
        return "bg-primary";
      case "Concluída":
        return "bg-success";
      case "Cancelada":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleEntrarAula = (aulaId, aulaLink) => {
    //console.log("A entrar na aula:", aulaId);
    window.open(aulaLink, "_blank");
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />

      <div className="container mt-4 p-4">
        <h2 className="mb-4">Bem-vindo, {user.username}</h2>

        {isLoading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de Métricas */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Cursos ativos
                      </h6>
                      <h3 className="card-title mb-0 text-primary">
                        {metricas.cursosAtivos}
                      </h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <Book size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Próxima aula
                      </h6>
                      <h3 className="card-title mb-0 text-primary">
                        {metricas.proximaAula}
                      </h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <Clock size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted d-flex align-items-center">
                        Nota média
                        {notaMedia.totalAvaliacoes > 0 && (
                          <span
                            className="ms-2 text-primary"
                            style={{ cursor: "help" }}
                            title={`Trabalhos: ${notaMedia.trabalhos.count} (média: ${notaMedia.trabalhos.media}/20)\nQuizzes: ${notaMedia.quizzes.count} (média: ${notaMedia.quizzes.media}/20)`}
                          >
                            <Info size={16} />
                          </span>
                        )}
                      </h6>
                      <h3 className="card-title mb-0 text-primary">
                        {notaMedia.totalAvaliacoes > 0
                          ? `${notaMedia.notaMediaGeral}`
                          : "N/A"}
                      </h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <GraduationCap size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Próximo trabalho/quiz
                      </h6>
                      <h3 className="card-title mb-0 text-primary">
                        {proximosTrabalhos.length > 0
                          ? proximosTrabalhos[0].tipo === "quiz"
                            ? "Quiz disponível"
                            : proximosTrabalhos[0].dataFormatada
                          : "N/A"}
                      </h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <File size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximas Aulas e trabalhos lado a lado */}
            <div className="row mb-4">
              {/* Próximas Aulas */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-white">
                    <h5 className="card-title mb-0 d-flex align-items-center">
                      <Clock size={18} className="me-2" /> Próximas aulas
                    </h5>
                  </div>
                  <div
                    className="card-body pt-0 pb-0 overflow-auto"
                    style={{ maxHeight: "500px" }}
                  >
                    {proximasAulas.length > 0 ? (
                      proximasAulas
                        .slice()
                        .reverse()
                        .map((aula, index, array) => (
                          <div
                            key={aula.id}
                            className={`d-flex align-items-center justify-content-between pt-3 pb-3 ${
                              index !== array.length - 1 ? "border-bottom" : ""
                            }`}
                          >
                            <div className="d-flex align-items-center">
                              <div className="me-4">
                                <h5 className="mb-0">{aula.hora}</h5>
                                <small className="text-muted">
                                  {aula.data}
                                </small>
                              </div>
                              <div className="me-4">
                                <h6 className="mb-0">{aula.materia}</h6>
                                {aula.estado && (
                                  <span
                                    className={`badge ${getStatusBadgeClass(
                                      aula.estado
                                    )}`}
                                  >
                                    {aula.estado}
                                  </span>
                                )}
                              </div>
                              <div className="me-4">
                                <h5 className="mb-0">Sumário</h5>
                                <small className="text-muted">
                                  {aula.descricao || "Sem descrição"}
                                </small>
                              </div>
                            </div>
                            <div>
                              <span
                                className={`badge ${
                                  aula.presenca === true
                                    ? "bg-info"
                                    : "bg-warning"
                                } me-2`}
                              >
                                {aula.presenca === true
                                  ? "Presente"
                                  : "Não presente"}
                              </span>
                              {aula.link &&
                                (aula.estado === "Em andamento" ||
                                  aula.estado === "Agendada") && (
                                  <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                      handleEntrarAula(aula.id, aula.link)
                                    }
                                  >
                                    {aula.estado === "Em andamento" ||
                                    aula.estado === "Agendada"
                                      ? "Entrar na Aula"
                                      : "Indisponível"}
                                  </button>
                                )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center mb-0">
                        Não há aulas agendadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Próximos trabalhos e quizzes */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-white">
                    <h5 className="card-title mb-0 d-flex align-items-center">
                      <Files size={18} className="me-2" /> Próximos
                      trabalhos/quizzes
                    </h5>
                  </div>
                  <div
                    className="card-body pt-0 pb-0 overflow-auto"
                    style={{ maxHeight: "500px" }}
                  >
                    {proximosTrabalhos.length > 0 ? (
                      proximosTrabalhos.map((item, index, array) => (
                        <div
                          key={`${item.tipo}-${item.id}`}
                          className={`d-flex align-items-center justify-content-between pt-3 pb-3 ${
                            index !== array.length - 1 ? "border-bottom" : ""
                          }`}
                        >
                          <div className="d-flex align-items-center">
                            <div className="me-4">
                              <div className="d-flex align-items-center">
                                <h5 className="mb-0 me-2">{item.titulo}</h5>
                                {/* Badge para identificar tipo */}
                                <span
                                  className={`badge ${
                                    item.tipo === "quiz"
                                      ? "bg-info"
                                      : "bg-warning"
                                  } me-2`}
                                  style={{ fontSize: "0.7em" }}
                                >
                                  {item.tipo === "quiz" ? "Quiz" : "Trabalho"}
                                </span>
                              </div>
                              <small className="text-muted">
                                {item.cursoNome}
                              </small>
                              {/* Informações específicas do quiz */}
                              {item.tipo === "quiz" && (
                                <div>
                                  <small className="text-muted d-block">
                                    {item.tempoLimite} min - Mín:{" "}
                                    {((item.notaMinima * 20) / 100).toFixed(1)}
                                    /20
                                  </small>
                                </div>
                              )}
                            </div>
                            <div className="me-4">
                              <h6 className="mb-0">
                                {item.tipo === "quiz"
                                  ? "Status"
                                  : "Data limite"}
                              </h6>
                              <small className="text-muted">
                                {item.dataFormatada}
                              </small>
                            </div>
                          </div>
                          <div>
                            {item.jaSubmetido ? (
                              <span className="badge bg-success me-2">
                                {item.tipo === "quiz"
                                  ? "Completo"
                                  : "Submetido"}
                                {item.nota !== null &&
                                  ` (${item.nota}${
                                    item.tipo === "quiz" ? "%" : "/20"
                                  })`}
                              </span>
                            ) : (
                              <button
                                className={`btn ${
                                  item.tipo === "quiz"
                                    ? "btn-info"
                                    : "btn-primary"
                                }`}
                                onClick={() => {
                                  if (item.tipo === "quiz") {
                                    // Navegar para página do quiz
                                    navigate(
                                      `/dashboard/courses/${item.cursoId}/quiz`
                                    );
                                  } else {
                                    // Navegar para página de trabalhos
                                    navigate(
                                      `/dashboard/synchronous-course/${item.cursoId}?tab=avaliacoes`
                                    );
                                  }
                                }}
                              >
                                {item.tipo === "quiz"
                                  ? "Fazer Quiz"
                                  : "Submeter"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center mb-0">
                        Não há trabalhos ou quizzes para submeter.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
