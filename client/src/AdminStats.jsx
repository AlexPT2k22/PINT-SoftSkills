import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart2,
  PieChart,
  Activity,
  UserCheck,
  GraduationCap,
  Target,
  Clock,
  Search,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  XCircle,
  Loader
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import NavbarDashboard from "./components/navbarDashboard.jsx";
import Sidebar from "./components/sidebar.jsx";
import SuccessMessage from "./components/sucess_message.jsx";
import ErrorMessage from "./components/error_message.jsx";
import "./styles/adminStats.css";


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const AdminStats = () => {
  const navigate = useNavigate();
  
  // Main states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Data states
  const [generalStats, setGeneralStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [cursosStats, setCursosStats] = useState(null);
  const [percursoData, setPercursoData] = useState(null);
  const [loadingPercurso, setLoadingPercurso] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [viewMode, setViewMode] = useState("cards");
  
  // Filters
  const [filters, setFilters] = useState({
    nome: "",
    dataInicio: "",
    dataFim: "",
    perfil: "",
    page: 1
  });

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch percurso data when tab is active or filters change
  useEffect(() => {
    if (activeTab === "percurso") {
      fetchPercursoFormativo();
    }
  }, [activeTab, filters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch general statistics, chart data, and course stats in parallel
      const [generalResponse, chartResponse, cursosResponse] = await Promise.all([
        axios.get(`${URL}/api/admin/stats/general`, { withCredentials: true }),
        axios.get(`${URL}/api/admin/stats/charts`, { withCredentials: true }),
        axios.get(`${URL}/api/admin/stats/cursos`, { withCredentials: true }),
      ]);

      if (generalResponse.data.success) {
        setGeneralStats(generalResponse.data.stats);
      }
      
      if (chartResponse.data.success) {
        setChartData(chartResponse.data.charts);
      }
      
      if (cursosResponse.data.success) {
        setCursosStats(cursosResponse.data);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Erro ao carregar estatísticas. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPercursoFormativo = async () => {
    try {
      setLoadingPercurso(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.nome) params.append("nome", filters.nome);
      if (filters.dataInicio) params.append("dataInicio", filters.dataInicio);
      if (filters.dataFim) params.append("dataFim", filters.dataFim);
      if (filters.perfil) params.append("perfil", filters.perfil);
      params.append("page", filters.page);
      params.append("limit", "20");

      const response = await axios.get(
        `${URL}/api/admin/stats/percurso-formativo?${params}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setPercursoData(response.data);
      }
    } catch (error) {
      console.error("Error fetching formative path:", error);
      setError("Erro ao carregar percurso formativo.");
    } finally {
      setLoadingPercurso(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    if (activeTab === "percurso") {
      await fetchPercursoFormativo();
    }
    setRefreshing(false);
    setSuccessMessage("Dados atualizados com sucesso!");
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value // Reset pagination when changing filters
    }));
  };

  const clearFilters = () => {
    setFilters({
      nome: "",
      dataInicio: "",
      dataFim: "",
      perfil: "",
      page: 1
    });
  };

  const exportData = () => {
    if (percursoData && percursoData.percursos) {
      // Prepare data for export
      const csvData = percursoData.percursos.map(p => ({
        Nome: p.utilizador.NOME,
        Email: p.utilizador.EMAIL,
        Username: p.utilizador.USERNAME,
        Perfil: p.utilizador.PERFILs?.[0]?.PERFIL || 'N/A',
        'Data Registo': new Date(p.utilizador.DATA_CRIACAO).toLocaleDateString('pt-PT'),
        'Último Login': p.utilizador.ULTIMO_LOGIN ? 
          new Date(p.utilizador.ULTIMO_LOGIN).toLocaleDateString('pt-PT') : 'Nunca',
        XP: p.estatisticas.xp,
        'Total Cursos': p.estatisticas.totalCursos,
        'Módulos Completos': p.estatisticas.modulosCompletos,
        'Quizzes Respondidos': p.estatisticas.quizzesRespondidos,
        'Avaliações Submetidas': p.estatisticas.avaliacoesSubmitidas,
        'Presenças': `${p.estatisticas.aulasPresencas}/${p.estatisticas.totalAulas}`,
        'Taxa Presenças (%)': p.estatisticas.percentualPresencas,
        'Nota Média': p.estatisticas.notaMedia
      }));

      // Convert to CSV
      const header = Object.keys(csvData[0]).join(',');
      const csv = [
        header,
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      // Create download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `percurso-formativo-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage("Exportação concluída com sucesso!");
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getProgressColor = (progress) => {
    progress = parseFloat(progress);
    if (progress >= 75) return "success";
    if (progress >= 50) return "warning";
    return "danger";
  };

  // Loading state
  if (loading) {
    return (
      <>
        <NavbarDashboard />
        <Sidebar />
        <div className="admin-stats-container">
          <div className="loading-container text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <h4>Carregando estatísticas...</h4>
            <p className="text-muted">Por favor aguarde enquanto compilamos os dados da plataforma</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      
      <div className="container mt-4 p-4">
        {/* Notifications */}
        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}
        
        {error && (
          <ErrorMessage
            message={error}
            onClose={() => setError("")}
          />
        )}

        {/* Header */}
        <div className="stats-header mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="stats-title">
                <BarChart2 size={28} className="me-2" /> 
                Dashboard Administrativo
              </h1>
              <p className="stats-subtitle text-muted">
                Visão geral e análise de dados da plataforma SoftSkills
              </p>
            </div>
            
            <div className="col-md-4 text-end">
              <div className="stats-actions">
                {activeTab === "percurso" && (
                  <button
                    className="btn btn-outline-success me-2"
                    onClick={exportData}
                    title="Exportar dados para CSV"
                  >
                    <Download size={16} className="me-1" /> Exportar CSV
                  </button>
                )}
                
                <button
                  className="btn btn-primary"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Atualizar dados"
                >
                  <RefreshCw size={16} className={`me-1 ${refreshing ? "spin" : ""}`} />
                  {refreshing ? "Atualizando..." : "Atualizar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs-container mb-4">
          <ul className="nav nav-tabs nav-fill">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <TrendingUp className="me-2" /> Visão Geral
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "cursos" ? "active" : ""}`}
                onClick={() => setActiveTab("cursos")}
              >
                <BookOpen className="me-2" /> Cursos
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "percurso" ? "active" : ""}`}
                onClick={() => setActiveTab("percurso")}
              >
                <GraduationCap className="me-2" /> Percurso Formativo
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "charts" ? "active" : ""}`}
                onClick={() => setActiveTab("charts")}
              >
                <PieChart className="me-2" /> Gráficos
              </button>
            </li>
          </ul>
        </div>

        {/* Content Tabs */}
        <div className="stats-content">
          
          {/* Overview Tab */}
          {activeTab === "overview" && generalStats && (
            <div className="overview-tab">
              
              {/* Summary Cards */}
              <div className="summary-section mb-5">
                <h3 className="section-title mb-3">Resumo Executivo</h3>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="summary-card">
                      <div className="summary-icon bg-primary">
                        <Activity />
                      </div>
                      <div className="summary-content">
                        <h4>Engajamento da Plataforma</h4>
                        <p className="summary-value">{generalStats.resumo.engajamento.utilizacaoPlataforma}</p>
                        <p className="summary-detail">
                          Taxa de utilizadores ativos: <strong>{generalStats.utilizadores.taxaAtivos}%</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="summary-card">
                      <div className="summary-icon bg-success">
                        <TrendingUp />
                      </div>
                      <div className="summary-content">
                        <h4>Crescimento</h4>
                        <p className="summary-value">{generalStats.resumo.engajamento.crescimento}</p>
                        <p className="summary-detail">
                          Novos utilizadores: <strong>+{generalStats.utilizadores.novos30Dias}</strong> últimos 30 dias
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="summary-card">
                      <div className="summary-icon bg-warning">
                        <MessageSquare />
                      </div>
                      <div className="summary-content">
                        <h4>Atividade do Fórum</h4>
                        <p className="summary-value">{generalStats.resumo.engajamento.forumAtividade}</p>
                        <p className="summary-detail">
                          Posts: <strong>{generalStats.forum.postsUltimos30Dias}</strong> últimos 30 dias
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert if there are pending forum solicitations */}
              {generalStats.forum.solicitacoesPendentes > 0 && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <AlertCircle size={20} className="me-2" />
                  <div>
                    <strong>Atenção:</strong> Existem {generalStats.forum.solicitacoesPendentes} solicitações 
                    de tópicos de fórum pendentes de aprovação.
                    <button 
                      className="btn btn-sm btn-outline-warning ms-2"
                      onClick={() => navigate('/forum-admin')}
                    >
                      Ver Solicitações
                    </button>
                  </div>
                </div>
              )}

              {/* Statistics Cards */}
              <div className="stats-sections">
                
                {/* Users Section */}
                <div className="stats-section mb-5">
                  <h4 className="section-title mb-3">
                    <Users className="me-2" /> Utilizadores
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Users />
                          </div>
                          <div className="stat-label">Total Utilizadores</div>
                        </div>
                        <div className="stat-value">{generalStats.utilizadores.total}</div>
                        <div className="stat-footer">
                          <span className="badge bg-success">
                            +{generalStats.utilizadores.novos30Dias} novos
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <GraduationCap />
                          </div>
                          <div className="stat-label">Formandos</div>
                        </div>
                        <div className="stat-value">{generalStats.utilizadores.formandos}</div>
                        <div className="stat-footer">
                          <span className="text-muted">
                            {((generalStats.utilizadores.formandos / generalStats.utilizadores.total) * 100).toFixed(1)}% do total
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <UserCheck />
                          </div>
                          <div className="stat-label">Formadores</div>
                        </div>
                        <div className="stat-value">{generalStats.utilizadores.formadores}</div>
                        <div className="stat-footer">
                          <span className="text-muted">
                            {((generalStats.utilizadores.formadores / generalStats.utilizadores.total) * 100).toFixed(1)}% do total
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Activity />
                          </div>
                          <div className="stat-label">Ativos (30 dias)</div>
                        </div>
                        <div className="stat-value">{generalStats.utilizadores.ativos30Dias}</div>
                        <div className="stat-footer">
                          <div className="progress">
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${generalStats.utilizadores.taxaAtivos}%` }}
                              aria-valuenow={generalStats.utilizadores.taxaAtivos}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {generalStats.utilizadores.taxaAtivos}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses Section */}
                <div className="stats-section mb-5">
                  <h4 className="section-title mb-3">
                    <BookOpen className="me-2" /> Cursos
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <BookOpen />
                          </div>
                          <div className="stat-label">Total Cursos</div>
                        </div>
                        <div className="stat-value">{generalStats.cursos.total}</div>
                        <div className="stat-footer">
                          <span className="badge bg-success">
                            {generalStats.cursos.ativos} ativos
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <UserCheck />
                          </div>
                          <div className="stat-label">Cursos Síncronos</div>
                        </div>
                        <div className="stat-value">{generalStats.cursos.sincronos}</div>
                        <div className="stat-footer">
                          <span className="text-muted">
                            {((generalStats.cursos.sincronos / generalStats.cursos.total) * 100).toFixed(1)}% do total
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Clock />
                          </div>
                          <div className="stat-label">Cursos Assíncronos</div>
                        </div>
                        <div className="stat-value">{generalStats.cursos.assincronos}</div>
                        <div className="stat-footer">
                          <span className="text-muted">
                            {((generalStats.cursos.assincronos / generalStats.cursos.total) * 100).toFixed(1)}% do total
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Calendar />
                          </div>
                          <div className="stat-label">Aulas Próximos 7 Dias</div>
                        </div>
                        <div className="stat-value">{generalStats.aulas.proximos7Dias}</div>
                        <div className="stat-footer">
                          <span className="text-muted">
                            De um total de {generalStats.aulas.total} aulas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrollments Section */}
                <div className="stats-section mb-5">
                  <h4 className="section-title mb-3">
                    <Target className="me-2" /> Inscrições
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Target />
                          </div>
                          <div className="stat-label">Total Inscrições</div>
                        </div>
                        <div className="stat-value">{generalStats.inscricoes.total}</div>
                        <div className="stat-footer">
                          <span className="badge bg-success">
                            +{generalStats.inscricoes.ultimos30Dias} últimos 30 dias
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <UserCheck />
                          </div>
                          <div className="stat-label">Tipo de Inscrição</div>
                        </div>
                        <div className="stat-value">
                          <span className="badge bg-primary me-2">
                            {generalStats.inscricoes.sincronas} síncronas
                          </span>
                          <span className="badge bg-info">
                            {generalStats.inscricoes.assincronas} assíncronas
                          </span>
                        </div>
                        <div className="stat-footer">
                          <div className="progress">
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${(generalStats.inscricoes.sincronas / generalStats.inscricoes.total) * 100}%` }}
                            ></div>
                            <div
                              className="progress-bar bg-info"
                              role="progressbar"
                              style={{ width: `${(generalStats.inscricoes.assincronas / generalStats.inscricoes.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <BarChart2 />
                          </div>
                          <div className="stat-label">Média por Curso</div>
                        </div>
                        <div className="stat-value">{generalStats.inscricoes.mediaPorCurso}</div>
                        <div className="stat-footer">
                          <span className="text-muted">inscrições por curso</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forum Section */}
                <div className="stats-section mb-5">
                  <h4 className="section-title mb-3">
                    <MessageSquare className="me-2" /> Fórum
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <MessageSquare />
                          </div>
                          <div className="stat-label">Tópicos Ativos</div>
                        </div>
                        <div className="stat-value">{generalStats.forum.topicosAtivos}</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <FileText />
                          </div>
                          <div className="stat-label">Total Posts</div>
                        </div>
                        <div className="stat-value">{generalStats.forum.totalPosts}</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <TrendingUp />
                          </div>
                          <div className="stat-label">Posts (30 dias)</div>
                        </div>
                        <div className="stat-value">{generalStats.forum.postsUltimos30Dias}</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <AlertCircle />
                          </div>
                          <div className="stat-label">Solicitações Pendentes</div>
                        </div>
                        <div className="stat-value">
                          {generalStats.forum.solicitacoesPendentes}
                          {generalStats.forum.solicitacoesPendentes > 0 && (
                            <span className="badge bg-danger ms-2">!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessment Section */}
                <div className="stats-section mb-4">
                  <h4 className="section-title mb-3">
                    <Award className="me-2" /> Avaliações
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Award />
                          </div>
                          <div className="stat-label">Quizzes Ativos</div>
                        </div>
                        <div className="stat-value">{generalStats.avaliacoes.quizzesAtivos}</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <CheckCircle />
                          </div>
                          <div className="stat-label">Respostas Quizzes</div>
                        </div>
                        <div className="stat-value">{generalStats.avaliacoes.respostasQuizzes}</div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <FileText />
                          </div>
                          <div className="stat-label">Avaliações Síncronas</div>
                        </div>
                        <div className="stat-value">{generalStats.avaliacoes.avaliacoesSincronas}</div>
                        <div className="stat-footer">
                          <span className="badge bg-info">
                            {generalStats.avaliacoes.submissoes} submissões
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="stat-card">
                        <div className="stat-header">
                          <div className="stat-icon">
                            <Target />
                          </div>
                          <div className="stat-label">Módulos Completos</div>
                        </div>
                        <div className="stat-value">{generalStats.avaliacoes.modulosCompletos}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cursos Tab */}
          {activeTab === "cursos" && cursosStats && (
            <div className="cursos-tab">
              {/* Estatísticas por Categoria */}
              <div className="section mb-5">
                <h3 className="section-title mb-4">
                  <BarChart2 className="me-2" />
                  Distribuição por Categoria
                </h3>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Categoria</th>
                        <th>Total Cursos</th>
                        <th>Síncronos</th>
                        <th>Assíncronos</th>
                        <th>Distribuição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursosStats.estatisticasPorCategoria.map((categoria) => {
                        const total = parseInt(categoria.totalCursos);
                        const totalCursos = generalStats?.cursos.total || 1;
                        const percentual = ((total / totalCursos) * 100).toFixed(1);
                        
                        return (
                          <tr key={categoria.ID_CATEGORIA__PK___}>
                            <td>
                              <strong>{categoria.NOME__}</strong>
                            </td>
                            <td>
                              <span className="badge bg-primary">{total}</span>
                            </td>
                            <td>
                              <span className="badge bg-success">{categoria.cursosSincronos}</span>
                            </td>
                            <td>
                              <span className="badge bg-info">{categoria.cursosAssincronos}</span>
                            </td>
                            <td>
                              <div className="progress" style={{ height: "20px" }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{ width: `${percentual}%` }}
                                  aria-valuenow={percentual}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                >
                                  {percentual}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Cursos */}
              <div className="section mb-4">
                <h3 className="section-title mb-4">
                  <Award className="me-2" />
                  Top 10 Cursos Mais Populares
                </h3>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Curso</th>
                        <th>Categoria</th>
                        <th>Área</th>
                        <th>Inscrições</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursosStats.cursosMaisPopulares.map((curso, index) => (
                        <tr key={curso.ID_CURSO}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{curso.NOME}</strong>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {curso.Area.Categoria.NOME__}
                            </span>
                          </td>
                          <td>{curso.Area.NOME}</td>
                          <td>
                            <span className="badge bg-success">
                              {curso.totalInscricoes}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => navigate(`/course/${curso.ID_CURSO}`)}
                            >
                              <Eye size={14} className="me-1" /> Ver Curso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Percurso Formativo Tab */}
          {activeTab === "percurso" && (
            <div className="percurso-tab">
              {/* Filters */}
              <div className="filters-section mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0"><Filter className="me-2" /> Filtros</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Nome/Email/Username</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <Search size={16} />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Pesquisar..."
                            value={filters.nome}
                            onChange={(e) => handleFilterChange("nome", e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="col-md-2">
                        <label className="form-label">Data Início</label>
                        <input
                          type="date"
                          className="form-control"
                          value={filters.dataInicio}
                          onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
                        />
                      </div>
                      
                      <div className="col-md-2">
                        <label className="form-label">Data Fim</label>
                        <input
                          type="date"
                          className="form-control"
                          value={filters.dataFim}
                          onChange={(e) => handleFilterChange("dataFim", e.target.value)}
                        />
                      </div>
                      
                      <div className="col-md-2">
                        <label className="form-label">Perfil</label>
                        <select
                          className="form-select"
                          value={filters.perfil}
                          onChange={(e) => handleFilterChange("perfil", e.target.value)}
                        >
                          <option value="">Todos</option>
                          <option value="1">Formando</option>
                          <option value="2">Formador</option>
                          <option value="3">Gestor</option>
                        </select>
                      </div>
                      
                      <div className="col-md-2 d-flex align-items-end">
                        <button
                          className="btn btn-secondary w-100"
                          onClick={clearFilters}
                        >
                          Limpar Filtros
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Type Toggle */}
              <div className="view-toggle mb-3 text-end">
                <div className="btn-group">
                  <button
                    className={`btn btn-sm btn-outline-primary ${viewMode === "cards" ? "active" : ""}`}
                    onClick={() => setViewMode("cards")}
                  >
                    Cartões
                  </button>
                  <button
                    className={`btn btn-sm btn-outline-primary ${viewMode === "table" ? "active" : ""}`}
                    onClick={() => setViewMode("table")}
                  >
                    Tabela
                  </button>
                </div>
              </div>

              {/* Users List */}
              {loadingPercurso ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Carregando dados do percurso formativo...</p>
                </div>
              ) : percursoData?.percursos ? (
                <div className="users-percurso-section">
                  {/* Card View */}
                  {viewMode === "cards" && (
                    <div className="row g-4">
                      {percursoData.percursos.map((percurso) => {
                        const isExpanded = expandedUsers.has(percurso.utilizador.ID_UTILIZADOR);
                        const user = percurso.utilizador;
                        const stats = percurso.estatisticas;
                        const perfil = user.PERFILs?.[0]?.PERFIL || "N/A";
                        
                        return (
                          <div className="col-md-6" key={user.ID_UTILIZADOR}>
                            <div className="card user-percurso-card">
                              <div className="card-header">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="user-info">
                                    <h5 className="mb-0">{user.NOME}</h5>
                                    <small className="text-muted">
                                      {user.USERNAME} | {user.EMAIL}
                                    </small>
                                  </div>
                                  <span className={`badge bg-${
                                    perfil === "Formando" ? "primary" : 
                                    perfil === "Formador" ? "success" : 
                                    perfil === "Gestor" ? "warning" : "secondary"
                                  }`}>
                                    {perfil}
                                  </span>
                                </div>
                              </div>
                              <div className="card-body">
                                <div className="row g-3 mb-3">
                                  <div className="col-6">
                                    <div className="percurso-stat">
                                      <div className="stat-label">Total Cursos</div>
                                      <div className="stat-value">{stats.totalCursos}</div>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="percurso-stat">
                                      <div className="stat-label">Módulos Completos</div>
                                      <div className="stat-value">{stats.modulosCompletos}</div>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="percurso-stat">
                                      <div className="stat-label">Nota Média</div>
                                      <div className="stat-value">{stats.notaMedia || "N/A"}</div>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="percurso-stat">
                                      <div className="stat-label">XP Total</div>
                                      <div className="stat-value">{stats.xp}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <label className="form-label mb-1">Taxa de Presenças</label>
                                  <div className="d-flex align-items-center">
                                    <div className="progress flex-grow-1 me-2">
                                      <div
                                        className={`progress-bar bg-${getProgressColor(stats.percentualPresencas)}`}
                                        style={{ width: `${stats.percentualPresencas || 0}%` }}
                                      ></div>
                                    </div>
                                    <span className="badge bg-secondary">
                                      {stats.aulasPresencas}/{stats.totalAulas}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="user-details">
                                  <div className="detail-item">
                                    <span className="detail-label">Registo:</span>
                                    <span className="detail-value">{formatDate(user.DATA_CRIACAO)}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Último Login:</span>
                                    <span className="detail-value">
                                      {user.ULTIMO_LOGIN ? formatDate(user.ULTIMO_LOGIN) : "Nunca"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Expandable Section */}
                              <div className="card-footer">
                                <button
                                  className="btn btn-sm btn-outline-secondary w-100"
                                  onClick={() => toggleUserExpansion(user.ID_UTILIZADOR)}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp size={16} className="me-1" /> Ocultar Detalhes
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} className="me-1" /> Mostrar Detalhes
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              {isExpanded && (
                                <div className="card-body border-top pt-3">
                                  <ul className="nav nav-tabs nav-fill mb-3 small">
                                    <li className="nav-item">
                                      <a className="nav-link active" data-bs-toggle="tab" href={`#cursos-${user.ID_UTILIZADOR}`}>
                                        Cursos
                                      </a>
                                    </li>
                                    <li className="nav-item">
                                      <a className="nav-link" data-bs-toggle="tab" href={`#avaliacoes-${user.ID_UTILIZADOR}`}>
                                        Avaliações
                                      </a>
                                    </li>
                                  </ul>
                                  
                                  <div className="tab-content">
                                    <div className="tab-pane fade show active" id={`cursos-${user.ID_UTILIZADOR}`}>
                                      <h6>Cursos Síncronos</h6>
                                      {percurso.cursos.sincronos.length > 0 ? (
                                        <ul className="list-group list-group-flush small mb-3">
                                          {percurso.cursos.sincronos.map((curso, i) => (
                                            <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                                              <div>
                                                <strong>{curso.curso}</strong>
                                                <br />
                                                <small className="text-muted">{curso.categoria} | {curso.area}</small>
                                              </div>
                                              <span className={`badge bg-${curso.estado === "Concluído" ? "success" : curso.estado === "Em curso" ? "primary" : "secondary"}`}>
                                                {curso.estado}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-muted small">Nenhum curso síncrono.</p>
                                      )}
                                      
                                      <h6>Cursos Assíncronos</h6>
                                      {percurso.cursos.assincronos.length > 0 ? (
                                        <ul className="list-group list-group-flush small">
                                          {percurso.cursos.assincronos.map((curso, i) => (
                                            <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                                              <div>
                                                <strong>{curso.curso}</strong>
                                                <br />
                                                <small className="text-muted">{curso.categoria} | {curso.area}</small>
                                              </div>
                                              <span className={`badge bg-${curso.estado === "Concluído" ? "success" : curso.estado === "Em curso" ? "primary" : "secondary"}`}>
                                                {curso.estado}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-muted small">Nenhum curso assíncrono.</p>
                                      )}
                                    </div>
                                    
                                    <div className="tab-pane fade" id={`avaliacoes-${user.ID_UTILIZADOR}`}>
                                      <h6>Quizzes</h6>
                                      {percurso.atividades.quizzes.length > 0 ? (
                                        <ul className="list-group list-group-flush small mb-3">
                                          {percurso.atividades.quizzes.map((quiz, i) => (
                                            <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                                              <div>
                                                <strong>{quiz.quiz}</strong>
                                                <br />
                                                <small className="text-muted">{quiz.curso}</small>
                                              </div>
                                              <span className={`badge bg-${quiz.nota >= 75 ? "success" : quiz.nota >= 50 ? "warning" : "danger"}`}>
                                                {quiz.nota}%
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-muted small">Nenhum quiz respondido.</p>
                                      )}
                                      
                                      <h6>Avaliações</h6>
                                      {percurso.atividades.avaliacoes.length > 0 ? (
                                        <ul className="list-group list-group-flush small">
                                          {percurso.atividades.avaliacoes.map((avaliacao, i) => (
                                            <li className="list-group-item d-flex justify-content-between align-items-center" key={i}>
                                              <div>
                                                <strong>{avaliacao.avaliacao}</strong>
                                                <br />
                                                <small className="text-muted">{avaliacao.curso}</small>
                                              </div>
                                              <div>
                                                {avaliacao.nota ? (
                                                  <span className={`badge bg-${avaliacao.nota >= 15 ? "success" : avaliacao.nota >= 9.5 ? "warning" : "danger"}`}>
                                                    {avaliacao.nota.toFixed(1)} valores
                                                  </span>
                                                ) : (
                                                  <span className="badge bg-secondary">{avaliacao.estado}</span>
                                                )}
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-muted small">Nenhuma avaliação submetida.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Nome</th>
                            <th>Email / Username</th>
                            <th>Perfil</th>
                            <th>Cursos</th>
                            <th>Nota Média</th>
                            <th>Presenças</th>
                            <th>Último Login</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {percursoData.percursos.map((percurso) => {
                            const user = percurso.utilizador;
                            const stats = percurso.estatisticas;
                            const perfil = user.PERFILs?.[0]?.PERFIL || "N/A";
                            
                            return (
                              <tr key={user.ID_UTILIZADOR}>
                                <td>{user.NOME}</td>
                                <td>
                                  {user.EMAIL}
                                  <br />
                                  <small className="text-muted">{user.USERNAME}</small>
                                </td>
                                <td>
                                  <span className={`badge bg-${
                                    perfil === "Formando" ? "primary" : 
                                    perfil === "Formador" ? "success" : 
                                    perfil === "Gestor" ? "warning" : "secondary"
                                  }`}>
                                    {perfil}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-primary me-1">
                                    {stats.totalCursos}
                                  </span>
                                  <small className="text-muted">
                                    ({percurso.cursos.sincronos.length} S | {percurso.cursos.assincronos.length} A)
                                  </small>
                                </td>
                                <td>{stats.notaMedia || "N/A"}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="progress flex-grow-1 me-2" style={{ height: "10px", width: "80px" }}>
                                      <div
                                        className={`progress-bar bg-${getProgressColor(stats.percentualPresencas)}`}
                                        style={{ width: `${stats.percentualPresencas || 0}%` }}
                                      ></div>
                                    </div>
                                    <small>{stats.percentualPresencas}%</small>
                                  </div>
                                </td>
                                <td>
                                  {user.ULTIMO_LOGIN ? formatDate(user.ULTIMO_LOGIN) : "Nunca"}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => toggleUserExpansion(user.ID_UTILIZADOR)}
                                  >
                                    {expandedUsers.has(user.ID_UTILIZADOR) ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {percursoData.pagination && (
                    <nav className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${percursoData.pagination.currentPage <= 1 ? "disabled" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => handleFilterChange("page", percursoData.pagination.currentPage - 1)}
                          >
                            Anterior
                          </button>
                        </li>
                        
                        {Array.from({ length: percursoData.pagination.totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <li
                              key={page}
                              className={`page-item ${
                                percursoData.pagination.currentPage === page ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handleFilterChange("page", page)}
                              >
                                {page}
                              </button>
                            </li>
                          )
                        )}
                        
                        <li
                          className={`page-item ${
                            percursoData.pagination.currentPage >= percursoData.pagination.totalPages
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handleFilterChange("page", percursoData.pagination.currentPage + 1)}
                          >
                            Próximo
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </div>
              ) : (
                <div className="alert alert-info">
                  <p className="mb-0">Nenhum dado encontrado. Tente ajustar os filtros.</p>
                </div>
              )}
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === "charts" && chartData && (
            <div className="charts-tab">
              <div className="row g-4">
                {/* Enrollments by Month */}
                <div className="col-md-12 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <TrendingUp className="me-2" />
                        Inscrições por Mês (Últimos 12 meses)
                      </h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: "300px" }}>
                        <Line
                          data={{
                            labels: chartData.inscricoesPorMes.map(item => {
                              const [year, month] = item.mes.split('-');
                              return `${month}/${year}`;
                            }),
                            datasets: [
                              {
                                label: "Inscrições",
                                data: chartData.inscricoesPorMes.map(item => item.total),
                                borderColor: "rgba(66, 133, 244, 1)",
                                backgroundColor: "rgba(66, 133, 244, 0.2)",
                                fill: true,
                                tension: 0.3
                              }
                            ]
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              title: {
                                display: false
                              },
                              legend: {
                                position: "top"
                              },
                              tooltip: {
                                mode: "index",
                                intersect: false
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users by Profile */}
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <Users className="me-2" />
                        Utilizadores por Perfil
                      </h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: "300px" }}>
                        <Pie
                          data={{
                            labels: chartData.utilizadoresPorPerfil.map(item => item.perfil),
                            datasets: [
                              {
                                data: chartData.utilizadoresPorPerfil.map(item => item.total),
                                backgroundColor: [
                                  "rgba(66, 133, 244, 0.8)",
                                  "rgba(52, 168, 83, 0.8)",
                                  "rgba(251, 188, 5, 0.8)",
                                  "rgba(234, 67, 53, 0.8)"
                                ]
                              }
                            ]
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "right"
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forum Activity by Month */}
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <MessageSquare className="me-2" />
                        Atividade do Fórum por Mês
                      </h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: "300px" }}>
                        <Bar
                          data={{
                            labels: chartData.atividadeForumPorMes.map(item => {
                              const [year, month] = item.mes.split('-');
                              return `${month}/${year}`;
                            }),
                            datasets: [
                              {
                                label: "Posts",
                                data: chartData.atividadeForumPorMes.map(item => item.posts),
                                backgroundColor: "rgba(251, 188, 5, 0.8)"
                              }
                            ]
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top"
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminStats;