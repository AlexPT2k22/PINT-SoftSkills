import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Layers,
  Star,
  Target,
  User,
  BarChart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CheckSquare,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import NavbarDashboard from "./components/navbarDashboard";
import Sidebar from "./components/sidebar";
import ErrorMessage from "./components/error_message";
import "./styles/meuPercurso.css";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const MeuPercurso = () => {
  const navigate = useNavigate();

  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [percurso, setPercurso] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [activeTab, setActiveTab] = useState("visaoGeral");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dataInscricao");
  const [sortOrder, setSortOrder] = useState("desc");
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(new Set());

  // Procurar dados do percurso formativo
  useEffect(() => {
    fetchPercursoFormativo();
  }, []);

  const fetchDetalhesCurso = async (cursoId) => {
    try {
      const response = await axios.get(
        `${URL}/api/percurso-formativo/curso/${cursoId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      console.error("Erro ao procurar detalhes do curso:", error);
      setError("Erro ao carregar detalhes do curso");
    }
    return null;
  };

  const fetchPercursoFormativo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/percurso-formativo/meu`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPercurso(response.data);
      } else {
        setError("Não foi possível obter os dados do percurso formativo");
      }
    } catch (error) {
      console.error("Erro ao Procurar percurso formativo:", error);
      setError(
        error.response?.data?.message ||
          "Erro ao Procurar dados do percurso formativo"
      );
    } finally {
      setLoading(false);
    }
  };

  const expandirDetalhes = (cursoId) => {
    const newDetalhes = new Set(detalhesExpandidos);
    if (newDetalhes.has(cursoId)) {
      newDetalhes.delete(cursoId);
    } else {
      newDetalhes.add(cursoId);
    }
    setDetalhesExpandidos(newDetalhes);
  };

  // Baixar certificado
  const downloadCertificado = async (cursoId) => {
    try {
      const response = await axios.get(
        `${URL}/api/certificados/gerar/${cursoId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.certificado?.url) {
        const link = document.createElement("a");
        link.href = response.data.certificado.url;
        link.setAttribute("download", `certificado-${cursoId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("Certificado não disponível ou URL inválida.");
      }
    } catch (error) {
      console.error("Erro ao baixar certificado:", error);
      setError(
        error.response?.data?.message ||
          "Erro ao baixar certificado. Tente novamente."
      );
    }
  };

  // Acessar curso
  const acessarCurso = (cursoId) => {
    navigate(`/course/${cursoId}`);
  };

  // Toggle para expandir/colapsar detalhes do curso
  const toggleCourse = (cursoId) => {
    const newExpanded = new Set(expandedCourses);
    const newDetalhes = new Set(detalhesExpandidos);

    if (newExpanded.has(cursoId)) {
      newExpanded.delete(cursoId);
      newDetalhes.delete(cursoId);
    } else {
      newExpanded.add(cursoId);
    }

    setExpandedCourses(newExpanded);
    setDetalhesExpandidos(newDetalhes);
  };

  // Filtrar cursos
  const getCursosFiltrados = () => {
    if (!percurso) return { sincronos: [], assincronos: [] };

    // Combinar todos os cursos
    let todosCursos = [
      ...percurso.cursos.sincronos.map((c) => ({
        ...c,
        originalArray: "sincronos",
      })),
      ...percurso.cursos.assincronos.map((c) => ({
        ...c,
        originalArray: "assincronos",
      })),
    ];

    // Aplicar filtro por status
    if (filterStatus !== "todos") {
      todosCursos = todosCursos.filter((curso) => {
        switch (filterStatus) {
          case "completos":
            return curso.percentualConcluido === 100;
          case "andamento":
            return (
              curso.percentualConcluido > 0 && curso.percentualConcluido < 100
            );
          case "naoIniciados":
            return curso.percentualConcluido === 0;
          case "certificados":
            return curso.hasCertificado;
          default:
            return true;
        }
      });
    }

    // Aplicar filtro por tipo
    if (filterType !== "todos") {
      todosCursos = todosCursos.filter(
        (curso) => curso.tipo.toLowerCase() === filterType
      );
    }

    // Aplicar busca por nome
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      todosCursos = todosCursos.filter(
        (curso) =>
          curso.nome.toLowerCase().includes(query) ||
          curso.area.toLowerCase().includes(query) ||
          curso.categoria.toLowerCase().includes(query)
      );
    }

    // Ordenação
    todosCursos.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case "nome":
          valA = a.nome.toLowerCase();
          valB = b.nome.toLowerCase();
          break;
        case "progresso":
          valA = a.percentualConcluido;
          valB = b.percentualConcluido;
          break;
        case "dataInicio":
          valA = new Date(a.dataInicio);
          valB = new Date(b.dataInicio);
          break;
        case "dataInscricao":
          valA = new Date(a.dataInscricao);
          valB = new Date(b.dataInscricao);
          break;
        default:
          valA = new Date(a.dataInscricao);
          valB = new Date(b.dataInscricao);
      }

      return sortOrder === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
        ? 1
        : -1;
    });

    // Separar novamente em síncronos e assíncronos
    return {
      sincronos: todosCursos.filter((c) => c.originalArray === "sincronos"),
      assincronos: todosCursos.filter((c) => c.originalArray === "assincronos"),
    };
  };

  const DetalhesExpandidos = ({ curso }) => {
    const [detalhes, setDetalhes] = useState(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);

    useEffect(() => {
      const carregarDetalhes = async () => {
        setLoadingDetalhes(true);
        const dados = await fetchDetalhesCurso(curso.id);
        setDetalhes(dados);
        setLoadingDetalhes(false);
      };

      if (detalhesExpandidos.has(curso.id)) {
        carregarDetalhes();
      }
    }, [curso.id]);

    if (!detalhesExpandidos.has(curso.id)) return null;

    if (loadingDetalhes) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm me-2" />A carregar
          detalhes...
        </div>
      );
    }

    if (!detalhes) return null;

    return (
      <div className="detalhes-expandidos mt-3">
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0">Detalhes Completos do Curso</h6>
          </div>
          <div className="card-body">
            {/* Objetivos e Habilidades */}
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Objetivos</h6>
                <ul className="list-unstyled">
                  {detalhes.curso.objetivos.map((objetivo, index) => (
                    <li key={index} className="mb-1">
                      <CheckCircle size={14} className="text-success me-2" />
                      {objetivo}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <h6>Habilidades</h6>
                <div className="d-flex flex-wrap">
                  {detalhes.curso.habilidades.map((habilidade, index) => (
                    <span
                      key={index}
                      className="badge bg-light me-1 mb-1"
                      style={{ color: "#373737" }}
                    >
                      {habilidade}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progresso dos Módulos */}
            <div className="mb-3">
              <h6>Progresso dos Módulos</h6>
              <div className="avaliacao-item mb-2 p-2 border rounded">
                {detalhes.progresso.modulos.map((modulo) => (
                  <div key={modulo.id} className="modulo-item mb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {modulo.completo ? (
                          <CheckCircle
                            size={16}
                            className="text-success me-2"
                          />
                        ) : (
                          <Clock size={16} className="text-muted me-2" />
                        )}
                        <span className={modulo.completo ? "text-success" : ""}>
                          {modulo.nome}
                        </span>
                      </div>
                      <small className="text-muted">
                        {formatarHoras(modulo.duracaoMin)}
                        {modulo.completo && modulo.dataCompleto && (
                          <span className="ms-2">
                            ✓ {formatarData(modulo.dataCompleto)}
                          </span>
                        )}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhes específicos por tipo */}
            {detalhes.tipo === "Síncrono" && detalhes.avaliacoes && (
              <div className="mb-3">
                <h6>Avaliações</h6>
                {detalhes.avaliacoes.length > 0 ? (
                  detalhes.avaliacoes.map((avaliacao) => (
                    <div
                      key={avaliacao.id}
                      className="avaliacao-item mb-2 p-2 border rounded"
                    >
                      <div className="d-flex justify-content-between">
                        <strong>{avaliacao.titulo}</strong>
                        <span
                          className={`badge ${
                            avaliacao.submissao
                              ? avaliacao.submissao.NOTA !== null
                                ? "bg-info"
                                : "bg-secondary"
                              : "bg-warning"
                          }`}
                        >
                          {avaliacao.submissao
                            ? avaliacao.submissao.NOTA !== null
                              ? `Nota: ${formatarNota(
                                  avaliacao.submissao.NOTA
                                )}`
                              : "Submetido"
                            : "Pendente"}
                        </span>
                      </div>
                      {avaliacao.dataLimite && (
                        <small className="text-muted">
                          Data limite: {formatarData(avaliacao.dataLimite)}
                        </small>
                      )}
                    </div>
                  ))
                ) : (
                  <small className="text-muted">
                    Nenhuma avaliação disponível
                  </small>
                )}
              </div>
            )}

            {detalhes.tipo === "Assíncrono" && detalhes.quizzes && (
              <div className="mb-3">
                <h6>Quizzes</h6>
                {detalhes.quizzes.length > 0 ? (
                  detalhes.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="quiz-item mb-2 p-2 border rounded"
                    >
                      <div className="d-flex justify-content-between">
                        <strong>{quiz.titulo}</strong>
                        <span
                          className={`badge ${
                            quiz.respostas.length > 0
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {quiz.respostas.length > 0
                            ? `Respondido (${quiz.respostas.length}/${quiz.tentativasPermitidas})`
                            : "Pendente"}
                        </span>
                      </div>
                      {quiz.respostas.length > 0 && (
                        <small className="text-muted">
                          Melhor nota:{" "}
                          {Math.max(
                            ...quiz.respostas.map(
                              (r) => formatarNota(r.NOTA) || 0
                            )
                          )}
                        </small>
                      )}
                    </div>
                  ))
                ) : (
                  <small className="text-muted">Nenhum quiz disponível</small>
                )}
              </div>
            )}

            {/* Certificado */}
            {detalhes.certificado ? (
              <div className="certificado-info p-3 bg-light rounded">
                <h6 className="text-success">
                  <Award size={20} className="me-2" />
                  Certificado Obtido
                </h6>
                <p className="mb-2">
                  <strong>Código:</strong> {detalhes.certificado.codigo}
                </p>
                <p className="mb-2">
                  <strong>Data de Emissão:</strong>{" "}
                  {formatarData(detalhes.certificado.dataEmissao)}
                </p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => downloadCertificado(curso.id)}
                >
                  <Download size={14} className="me-1" />
                  Certificado
                </button>
              </div>
            ) : (
              // Mostrar status de elegibilidade quando não tem certificado
              <div className="certificado-status p-3 rounded bg-light">
                <h6
                  className={
                    curso.elegiveParaCertificado ? "text-info" : "text-warning"
                  }
                >
                  <Award size={20} className="me-2" />
                  Status do Certificado
                </h6>
                {curso.elegiveParaCertificado ? (
                  <>
                    <p className="mb-2">
                      Parabéns! Você é elegível para receber o certificado. Faça
                      o download do mesmo aqui.
                    </p>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => downloadCertificado(curso.id)}
                    >
                      <Award size={16} className="me-1" />
                      Certificado
                    </button>
                  </>
                ) : (
                  <div>
                    <p className="mb-2">
                      Você ainda não é elegível para o certificado.
                    </p>
                    <p className="mb-0">
                      <strong>Pendências:</strong>
                    </p>
                    <ul className="mb-0">
                      {curso.percentualConcluido < 100 && (
                        <li>
                          Completar todos os módulos (
                          {curso.percentualConcluido}% concluído)
                        </li>
                      )}
                      {(() => {
                        const notaMinima = 9.5;
                        const notaAtual = parseFloat(
                          formatarNota(curso.notaMedia)
                        );
                        return (
                          (isNaN(notaAtual) || notaAtual < notaMinima) && (
                            <li>
                              Obter nota média mínima de {notaMinima} valores
                              (atual: {notaAtual || 0}/20 valores)
                            </li>
                          )
                        );
                      })()}
                      {curso.tipo === "Síncrono" &&
                        curso.avaliacoesCompletas < curso.totalAvaliacoes && (
                          <li>
                            Completar todas as avaliações (
                            {curso.avaliacoesCompletas}/{curso.totalAvaliacoes})
                          </li>
                        )}
                      {curso.tipo === "Assíncrono" &&
                        curso.quizzesRespondidos < curso.totalQuizzes && (
                          <li>
                            Responder a todos os quizzes (
                            {curso.quizzesRespondidos}/{curso.totalQuizzes})
                          </li>
                        )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Formatar data
  const formatarData = (dateString) => {
    if (!dateString) return "N/A";
    const data = new Date(dateString);
    return data.toLocaleDateString("pt-PT");
  };

  const formatarNota = (nota) => {
    if (!nota || nota === 0) return "N/A";
    // Converte de 0-100 para 0-20
    const notaConvertida = (nota * 20) / 100;
    return notaConvertida.toFixed(1);
  };

  // Formato de horas
  const formatarHoras = (minutos) => {
    if (!minutos) return "0h";
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    return `${horas}h${min > 0 ? ` ${min}min` : ""}`;
  };

  // Estilo para progresso
  const getProgressStyle = (percentual) => {
    if (percentual >= 100) return "success";
    if (percentual >= 70) return "info";
    if (percentual >= 30) return "warning";
    return "danger";
  };

  // Componente de Loading
  const LoadingState = () => (
    <div className="loading-container">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">A carregar...</span>
      </div>
      <h4>A carregar o seu percurso formativo...</h4>
      <p className="text-muted">Aguarde enquanto processamos os seus dados</p>
    </div>
  );

  // Componente de card de visão geral
  const VisaoGeral = () => {
    if (!percurso) return null;

    const { estatisticas, utilizador } = percurso;

    return (
      <div className="visao-geral-container">
        <div className="row mb-4">
          <div className="col12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title mb-0">Resumo</h4>
              </div>

              <div className="card-body">
                <div className="d-flex justify-content-between mb-1">
                  <span>Progresso geral</span>
                  <span>{estatisticas.percentualConclusao}%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${estatisticas.percentualConclusao}%` }}
                  ></div>
                </div>
                <div className="stats-metrics">
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="stats-metric-item">
                        <div className="stats-metric-icon bg-light">
                          <BookOpen size={20} color={"rgb(57, 99, 156)"} />
                        </div>
                        <div className="stats-metric-text">
                          <span>{estatisticas.totalCursos}</span>
                          <small>Cursos totais</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="stats-metric-item">
                        <div className="stats-metric-icon bg-light">
                          <CheckCircle size={20} color={"rgb(57, 99, 156)"} />
                        </div>
                        <div className="stats-metric-text">
                          <span>{estatisticas.cursosCompletos}</span>
                          <small>Cursos completos</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="stats-metric-item">
                        <div className="stats-metric-icon bg-light">
                          <Clock size={20} color={"rgb(57, 99, 156)"} />
                        </div>
                        <div className="stats-metric-text">
                          <span>
                            {formatarHoras(estatisticas.totalHorasEstudo)}
                          </span>
                          <small>Horas de estudo</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="stats-metric-item">
                        <div className="stats-metric-icon bg-light">
                          <Award size={20} color={"rgb(57, 99, 156)"} />
                        </div>
                        <div className="stats-metric-text">
                          <span>{estatisticas.totalCertificados}</span>
                          <small>Certificados</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de status dos cursos */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Status dos meus cursos</h5>
              </div>
              <div className="card-body">
                <div className="curso-status-chart">
                  {/* Em um projeto real, aqui seria implementado um gráfico com Chart.js ou similar */}
                  <div className="curso-status-bars">
                    <div className="row g-2">
                      <div className="col-md-4">
                        <div className="status-bar-container">
                          <div className="status-bar-label">
                            <CheckCircle
                              size={18}
                              className="text-success me-2"
                            />
                            Completos ({estatisticas.cursosCompletos})
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  (estatisticas.cursosCompletos /
                                    estatisticas.totalCursos) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="status-bar-container">
                          <div className="status-bar-label">
                            <Layers size={18} className="text-warning me-2" />
                            Em curso ({estatisticas.cursosEmAndamento})
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${
                                  (estatisticas.cursosEmAndamento /
                                    estatisticas.totalCursos) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="status-bar-container">
                          <div className="status-bar-label">
                            <Bookmark
                              size={18}
                              className="text-secondary me-2"
                            />
                            Não iniciados ({estatisticas.cursosNaoIniciados})
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar bg-secondary"
                              style={{
                                width: `${
                                  (estatisticas.cursosNaoIniciados /
                                    estatisticas.totalCursos) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos 3 cursos */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Minha Atividade Recente</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setActiveTab("cursos")}
                >
                  Ver todos os cursos
                </button>
              </div>
              <div className="card-body">
                {percurso.cursos.sincronos.length === 0 &&
                percurso.cursos.assincronos.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen size={48} className="text-muted mb-3" />
                    <h5>Você ainda não está inscrito em nenhum curso</h5>
                    <p className="text-muted">
                      Explore nossos cursos e comece seu aprendizado
                    </p>
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => navigate("/courses")}
                    >
                      Descobrir cursos
                    </button>
                  </div>
                ) : (
                  <div className="recent-courses">
                    {getCursosFiltrados()
                      .sincronos.concat(getCursosFiltrados().assincronos)
                      .sort(
                        (a, b) =>
                          new Date(b.dataInscricao) - new Date(a.dataInscricao)
                      )
                      .slice(0, 3)
                      .map((curso) => (
                        <div
                          key={`recent-${curso.id}`}
                          className="recent-course-item"
                        >
                          <div className="recent-course-image">
                            {curso.imagem ? (
                              <img src={curso.imagem} alt={curso.nome} />
                            ) : (
                              <div className="placeholder-image">
                                <BookOpen size={24} />
                              </div>
                            )}
                          </div>
                          <div className="recent-course-info">
                            <h5>{curso.nome}</h5>
                            <div className="recent-course-meta">
                              <span
                                className={`badge bg-${
                                  curso.tipo === "Síncrono" ? "primary" : "info"
                                }`}
                              >
                                {curso.tipo}
                              </span>
                              <span className="text-muted small">
                                {curso.area}
                              </span>
                            </div>
                            <div
                              className="progress mt-2"
                              style={{ height: "8px" }}
                            >
                              <div
                                className={`progress-bar bg-${getProgressStyle(
                                  curso.percentualConcluido
                                )}`}
                                style={{
                                  width: `${curso.percentualConcluido}%`,
                                }}
                              ></div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted">
                                Progresso: {curso.percentualConcluido}%
                              </small>
                              <small className="text-muted">
                                {curso.modulosCompletos}/{curso.totalModulos}{" "}
                                módulos
                              </small>
                            </div>
                          </div>
                          <div className="recent-course-actions">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => acessarCurso(curso.id)}
                            >
                              Acessar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de lista de cursos
  const CursosList = () => {
    const cursosFiltrados = getCursosFiltrados();
    const todosCursos = [
      ...cursosFiltrados.sincronos,
      ...cursosFiltrados.assincronos,
    ];

    return (
      <div className="cursos-list-container">
        {/* Filtros */}
        <div className="filter-section">
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h4 className="mb-0">Filtros</h4>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Procurar curso</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nome, área..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="todos">Todos os status</option>
                    <option value="completos">Completos</option>
                    <option value="andamento">Em curso</option>
                    <option value="naoIniciados">Não iniciados</option>
                    <option value="certificados">Com certificado</option>
                  </select>
                </div>

                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="síncrono">Síncronos</option>
                    <option value="assíncrono">Assíncronos</option>
                  </select>
                </div>

                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Ordenar por</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="dataInscricao">Data de inscrição</option>
                      <option value="nome">Nome</option>
                      <option value="progresso">Progresso</option>
                      <option value="dataInicio">Data de início</option>
                    </select>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-secondary btn-sm me-2"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("todos");
                    setFilterType("todos");
                    setSortBy("dataInscricao");
                    setSortOrder("desc");
                  }}
                >
                  Limpar filtros
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={fetchPercursoFormativo}
                >
                  <RefreshCw size={14} className="me-1" />
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de cursos */}
        {todosCursos.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <BookOpen size={48} className="text-muted mb-3" />
              <h5>Nenhum curso encontrado</h5>
              <p className="text-muted">
                {searchQuery ||
                filterStatus !== "todos" ||
                filterType !== "todos"
                  ? "Tente ajustar seus filtros para ver mais cursos"
                  : "Você ainda não está inscrito em nenhum curso"}
              </p>
              {searchQuery ||
              filterStatus !== "todos" ||
              filterType !== "todos" ? (
                <button
                  className="btn btn-outline-primary mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("todos");
                    setFilterType("todos");
                  }}
                >
                  Limpar filtros
                </button>
              ) : (
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => navigate("/courses")}
                >
                  Explorar cursos
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="results-summary mb-3">
              <span>
                {todosCursos.length}{" "}
                {todosCursos.length === 1
                  ? "curso encontrado"
                  : "cursos encontrados"}
              </span>
            </div>

            <div className="cursos-list">
              {todosCursos.map((curso) => (
                <div key={`list-${curso.id}`} className="curso-card">
                  <div className="card mb-3">
                    <div className="card-header curso-card-header">
                      <div
                        className={`status-indicator ${
                          curso.percentualConcluido === 100
                            ? "completed"
                            : curso.percentualConcluido > 0
                            ? "in-progress"
                            : "not-started"
                        }`}
                      />
                      <div className="d-flex justify-content-between align-items-center flex-grow-1">
                        <h5 className="mb-0">{curso.nome}</h5>
                        <div>
                          <span
                            className={`badge bg-${
                              curso.tipo === "Síncrono" ? "primary" : "info"
                            } me-2`}
                          >
                            {curso.tipo}
                          </span>
                          <button
                            className="btn btn-sm btn-light toggle-button"
                            onClick={() => toggleCourse(curso.id)}
                          >
                            {expandedCourses.has(curso.id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-9">
                          <div className="d-flex flex-column">
                            <div className="curso-info-tags mb-2">
                              <span className="tag">
                                <Calendar className="tag-icon" />
                                Início: {formatarData(curso.dataInicio)}
                              </span>
                              <span className="tag">{curso.categoria}</span>
                              <span className="tag">{curso.area}</span>
                              <span className="tag">{curso.topico}</span>
                            </div>

                            <div className="progress curso-progress">
                              <div
                                className={`progress-bar bg-${getProgressStyle(
                                  curso.percentualConcluido
                                )}`}
                                style={{
                                  width: `${curso.percentualConcluido}%`,
                                }}
                              >
                                {curso.percentualConcluido}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex justify-content-end align-items-center h-100">
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => acessarCurso(curso.id)}
                            >
                              Acessar
                            </button>
                            {curso.hasCertificado && (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => downloadCertificado(curso.id)}
                              >
                                <Award size={16} className="me-1" />
                                Certificado
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedCourses.has(curso.id) && (
                        <div className="curso-details mt-3">
                          <hr />
                          <div className="row">
                            {/* Primeira coluna - Detalhes do curso */}
                            <div className="col-md-4">
                              <div className="detail-group">
                                <h6 className="detail-title">
                                  Informações do curso
                                </h6>
                                <div className="detail-item">
                                  <span className="detail-label">Duração</span>
                                  <span className="detail-value">
                                    {formatarHoras(curso.duracaoTotal)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    Inscrição
                                  </span>
                                  <span className="detail-value">
                                    {formatarData(curso.dataInscricao)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Início</span>
                                  <span className="detail-value">
                                    {formatarData(curso.dataInicio)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Término</span>
                                  <span className="detail-value">
                                    {formatarData(curso.dataFim)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Estado</span>
                                  <span className="detail-value">
                                    <span
                                      className={`status-badge status-${
                                        curso.estado === "Concluído"
                                          ? "completed"
                                          : curso.estado === "Em andamento" ||
                                            curso.estado === "Ativo"
                                          ? "active"
                                          : "pending"
                                      }`}
                                    >
                                      {curso.estado}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Segunda coluna - Progresso */}
                            <div className="col-md-4">
                              <div className="detail-group">
                                <h6 className="detail-title">Progresso</h6>
                                <div className="detail-item">
                                  <span className="detail-label">Módulos</span>
                                  <span className="detail-value">
                                    {curso.modulosCompletos}/
                                    {curso.totalModulos}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    Conclusão
                                  </span>
                                  <span className="detail-value">
                                    {curso.percentualConcluido}%
                                  </span>
                                </div>
                                {curso.tipo === "Síncrono" && (
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Presenças
                                    </span>
                                    <span className="detail-value">
                                      {curso.aulasPresentes}/{curso.totalAulas}{" "}
                                      ({curso.percentualPresenca}%)
                                    </span>
                                  </div>
                                )}
                                {curso.tipo === "Assíncrono" && (
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Quizzes
                                    </span>
                                    <span className="detail-value">
                                      {curso.quizzesRespondidos}/
                                      {curso.totalQuizzes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Terceira coluna - Avaliação */}
                            <div className="col-md-4">
                              <div className="detail-group">
                                <h6 className="detail-title">Avaliação</h6>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    Nota média
                                  </span>
                                  <span className="detail-value">
                                    {curso.notaMedia > 0 ? (
                                      <span className="d-flex align-items-center">
                                        {formatarNota(curso.notaMedia)} valores
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </span>
                                </div>

                                <div className="detail-item">
                                  <span className="detail-label">
                                    Certificado
                                  </span>
                                  <span className="detail-value">
                                    {curso.hasCertificado ? (
                                      <span className="text-success d-flex align-items-center">
                                        <CheckCircle
                                          size={16}
                                          className="me-1"
                                        />
                                        Disponível
                                      </span>
                                    ) : (
                                      <span className="text-secondary d-flex align-items-center">
                                        {curso.percentualConcluido === 100 ? (
                                          (() => {
                                            // Verificar se há pendências por tipo de curso
                                            let temPendencias = false;
                                            let motivoPendencia = "";

                                            // Verificar nota média (deve ser >= 9.5 valores)
                                            const notaMinima = 9.5;
                                            const notaAtual = parseFloat(
                                              formatarNota(curso.notaMedia)
                                            );

                                            if (
                                              isNaN(notaAtual) ||
                                              notaAtual < notaMinima
                                            ) {
                                              temPendencias = true;
                                              motivoPendencia = `Nota média insuficiente (${
                                                notaAtual || 0
                                              }/20 valores - mínimo: ${notaMinima})`;
                                            }

                                            if (curso.tipo === "Síncrono") {
                                              // Para cursos síncronos: verificar se há avaliações por fazer
                                              if (
                                                curso.avaliacoesCompletas <
                                                curso.totalAvaliacoes
                                              ) {
                                                temPendencias = true;
                                                motivoPendencia =
                                                  motivoPendencia
                                                    ? `${motivoPendencia} e ${
                                                        curso.totalAvaliacoes -
                                                        curso.avaliacoesCompletas
                                                      } avaliação(ões) pendente(s)`
                                                    : `${
                                                        curso.totalAvaliacoes -
                                                        curso.avaliacoesCompletas
                                                      } avaliação(ões) pendente(s)`;
                                              }
                                            } else if (
                                              curso.tipo === "Assíncrono"
                                            ) {
                                              // Para cursos assíncronos: verificar se há quizzes por fazer
                                              if (
                                                curso.quizzesRespondidos <
                                                curso.totalQuizzes
                                              ) {
                                                temPendencias = true;
                                                motivoPendencia =
                                                  motivoPendencia
                                                    ? `${motivoPendencia} e ${
                                                        curso.totalQuizzes -
                                                        curso.quizzesRespondidos
                                                      } quiz(zes) pendente(s)`
                                                    : `${
                                                        curso.totalQuizzes -
                                                        curso.quizzesRespondidos
                                                      } quiz(zes) pendente(s)`;
                                              }
                                            }

                                            if (temPendencias) {
                                              return (
                                                <span
                                                  className="text-warning d-flex align-items-center"
                                                  title={motivoPendencia}
                                                >
                                                  <AlertTriangle
                                                    size={16}
                                                    className="me-1"
                                                  />
                                                  Pendente
                                                </span>
                                              );
                                            } else {
                                              return (
                                                <span className="text-info d-flex align-items-center">
                                                  <CheckCircle
                                                    size={16}
                                                    className="me-1"
                                                  />
                                                  Elegível
                                                </span>
                                              );
                                            }
                                          })()
                                        ) : (
                                          <span className="text-secondary d-flex align-items-center">
                                            <XCircle
                                              size={16}
                                              className="me-1"
                                            />
                                            Indisponível
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {curso.tipo === "Síncrono" && (
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      Horas de presença
                                    </span>
                                    <span className="detail-value">
                                      {formatarHoras(curso.horasPresenca * 60)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-center mt-3">
                            <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => expandirDetalhes(curso.id)}
                            >
                              {detalhesExpandidos.has(curso.id) ? (
                                <>
                                  <ChevronUp size={16} className="me-1" />
                                  Ocultar detalhes completos
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={16} className="me-1" />
                                  Ver detalhes completos
                                </>
                              )}
                            </button>
                          </div>
                          <DetalhesExpandidos curso={curso} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />

      <div className="container mt-4 p-4">
        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        <div className="percurso-header">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 className="percurso-title">O meu percurso</h2>
              </div>
              <div className="col-md-4 d-flex justify-content-md-end">
                <button
                  className="btn btn-primary"
                  onClick={fetchPercursoFormativo}
                  disabled={loading}
                >
                  <RefreshCw
                    size={16}
                    className={`me-1 ${loading ? "spin" : ""}`}
                  />
                  {loading ? "Atualizando..." : "Atualizar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="percurso-tabs mb-4">
          <div className="container-fluid">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "visaoGeral" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("visaoGeral")}
                >
                  <BarChart size={18} className="me-2" />
                  Visão geral
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "cursos" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("cursos")}
                >
                  <BookOpen size={18} className="me-2" />
                  Os meus cursos
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="percurso-content">
          <div className="container-fluid">
            {loading ? (
              <LoadingState />
            ) : (
              <div className="tab-content">
                {activeTab === "visaoGeral" && <VisaoGeral />}
                {activeTab === "cursos" && <CursosList />}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeuPercurso;
