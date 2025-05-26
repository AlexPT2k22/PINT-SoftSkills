import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import useAuthStore from "./store/authStore";
import CourseCardDashboard from "./components/courseCardDashboard";
import { useEffect, useState } from "react";
import axios from "axios";
import { Book, Clock, Video, BarChart2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});
  const [courses, setCourses] = useState([]);
  const [proximasAulas, setProximasAulas] = useState([]);
  const [metricas, setMetricas] = useState({
    cursosAtivos: 0,
    proximaAula: "14:30",
    videosAssistidos: 0,
    progressoGeral: 0,
  });
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Carregar cursos do usuário
        const cursosResponse = await axios.get(
          "http://localhost:4000/api/user/student-courses",
          { withCredentials: true }
        );

        const cursosData = cursosResponse.data;
        setCourses(cursosData);

        // aulas dos cursos síncronos
        const aulasResponse = await axios.get(
          "http://localhost:4000/api/aulas/all",
          { withCredentials: true }
        );
        console.log("Dados recebidos da API:", aulasResponse.data);

        // Calcular progresso geral
        const progressMap = {};
        let totalProgresso = 0;

        await Promise.all(
          cursosData.map(async (course) => {
            try {
              const progressResponse = await axios.get(
                `http://localhost:4000/api/progress/courses/${course.ID_CURSO}/progress`,
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
            }))
            // Limitar a 5 próximas aulas
            .slice(0, 5);

          setProximasAulas(aulasFormatadas);

          // Também podemos atualizar a métrica de próxima aula
          if (aulasFormatadas.length > 0) {
            setMetricas((prev) => ({
              ...prev,
              proximaAula: aulasFormatadas[0].hora,
            }));
          }
          console.log("Próximas aulas formatadas:", aulasFormatadas);
        } else {
          // Fallback para dados vazios se a API não retornar o esperado
          console.error(
            "Formato de dados de aulas inesperado:",
            aulasResponse.data
          );
          setProximasAulas([]);
        }

        // Atualizar métricas
        setMetricas((prev) => ({
          ...prev,
          cursosAtivos: cursosData.length,
          progressoGeral:
            cursosData.length > 0
              ? Math.round(totalProgresso / cursosData.length)
              : 0,
        }));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleEntrarAula = (aulaId, aulaLink) => {
    // Implementar navegação para a aula
    console.log("Entrando na aula:", aulaId);
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
              <span className="visually-hidden">Carregando...</span>
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
                        Cursos Ativos
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
                        Próxima Aula
                      </h6>
                      <h3 className="card-title mb-0 text-success">
                        {metricas.proximaAula}
                      </h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <Clock size={24} className="text-success" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Nota média
                      </h6>
                      <h3 className="card-title mb-0 text-purple">NOTA</h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <GraduationCap size={24} className="text-purple" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Progresso Geral
                      </h6>
                      <h3 className="card-title mb-0 text-warning">
                        {metricas.progressoGeral}%
                      </h3>
                    </div>
                    <div className="bg-light rounded-circle p-3">
                      <BarChart2 size={24} className="text-warning" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximas Aulas */}
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header bg-white">
                    <h5 className="card-title mb-0 d-flex align-items-center">
                      <Clock size={18} className="me-2" /> Próximas Aulas
                    </h5>
                  </div>
                  <div className="card-body">
                    {proximasAulas.length > 0 ? (
                      proximasAulas.map((aula) => (
                        <div
                          key={aula.id}
                          className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom"
                        >
                          <div className="d-flex align-items-center">
                            <div className="me-4">
                              <h5 className="mb-0">{aula.hora}</h5>
                              <small className="text-muted">
                                {new Date(aula.data).toLocaleDateString()}
                              </small>
                            </div>
                            <div>
                              <h6 className="mb-0">{aula.materia}</h6>
                              <small className="text-muted">
                                {aula.professor}
                              </small>
                              {aula.estado && (
                                <span
                                  className={`badge ${
                                    aula.estado === "Em andamento"
                                      ? "bg-success"
                                      : "bg-info"
                                  }`}
                                >
                                  {aula.estado}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            {aula.link ? (
                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  handleEntrarAula(aula.id, aula.link)
                                }
                                disabled={
                                  !aula.link ||
                                  aula.estado !== "Concluída" ||
                                  aula.estado !== "Cancelada"
                                }
                              >
                                {aula.estado === "Em andamento" ||
                                aula.estado === "Agendada"
                                  ? "Entrar na Aula"
                                  : "Indisponível"}
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary"
                                disabled={!aula.link}
                              >
                                Indisponível
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
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
