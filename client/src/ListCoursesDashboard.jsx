import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import {
  Pen,
  Eye,
  BookOpen,
  Calendar,
  Users,
  User,
  Clock,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";
import "./styles/listCoursesDashboard.css";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

function ListCoursesDashboard() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Estados para pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingAssets(true);
        const response = await fetch(`${URL}/api/cursos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setErrorMessage("Erro ao carregar cursos");
        setShowErrorMessage(true);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchCourses();
  }, []);

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.NOME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.AREA?.NOME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.AREA?.Categoria?.NOME__?.toLowerCase().includes(
        searchTerm.toLowerCase()
      );

    const courseType =
      course.CURSO_SINCRONO === null ? "assincrono" : "sincrono";
    const matchesType = filterType === "" || courseType === filterType;

    const courseStatus =
      course.CURSO_SINCRONO === null
        ? course.CURSO_ASSINCRONO?.ESTADO
        : course.CURSO_SINCRONO?.ESTADO;
    const matchesStatus = filterStatus === "" || courseStatus === filterStatus;

    const matchesCategory =
      filterCategory === "" ||
      course.AREA?.Categoria?.NOME__ === filterCategory;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterStatus("");
    setFilterCategory("");
  };

  // Verificar se tem filtros ativos
  const hasActiveFilters =
    searchTerm || filterType || filterStatus || filterCategory;

  // Obter categorias únicas
  const uniqueCategories = [
    ...new Set(
      courses.map((course) => course.AREA?.Categoria?.NOME__).filter(Boolean)
    ),
  ];

  // Obter status únicos
  const uniqueStatuses = [
    ...new Set(
      courses
        .map((course) =>
          course.CURSO_SINCRONO === null
            ? course.CURSO_ASSINCRONO?.ESTADO
            : course.CURSO_SINCRONO?.ESTADO
        )
        .filter(Boolean)
    ),
  ];

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  // Função para obter status badge
  const getStatusBadge = (course) => {
    const status =
      course.CURSO_SINCRONO === null
        ? course.CURSO_ASSINCRONO?.ESTADO
        : course.CURSO_SINCRONO?.ESTADO;

    let badgeClass = "badge ";
    switch (status?.toLowerCase()) {
      case "ativo":
      case "disponível":
        badgeClass += "bg-success";
        break;
      case "inativo":
      case "cancelado":
        badgeClass += "bg-danger";
        break;
      case "programado":
        badgeClass += "bg-primary";
        break;
      case "em andamento":
        badgeClass += "bg-warning";
        break;
      default:
        badgeClass += "bg-secondary";
    }

    return <span className={badgeClass}>{status || "Sem estado"}</span>;
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className="container mt-4 p-4"> 
        <div className="container-fluid">
          {showSuccessMessage && (
            <SuccessMessage
              message={"Curso apagado com sucesso!"}
              onClose={() => setShowSuccessMessage(false)}
            />
          )}
          {showErrorMessage && (
            <ErrorMessage
              message={errorMessage}
              onClose={() => setShowErrorMessage(false)}
            />
          )}

          {/* Header */}
          <div className="courses-management-header">
            <h2 className="courses-title">
              Gerir Cursos
            </h2>
          </div>

          {/* Filtros e Pesquisa */}
          <div className="courses-filters-section">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="search-box">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Pesquisar por nome, área ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="sincrono">Síncrono</option>
                  <option value="assincrono">Assíncrono</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <div className="d-flex justify-content-between align-items-center">
                  {hasActiveFilters && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={clearFilters}
                    >
                      <X size={16} className="me-1" />
                      Limpar
                    </button>
                  )}
                  <span className="badge bg-primary">
                    {filteredCourses.length} cursos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags de filtros ativos */}
          {hasActiveFilters && (
            <div className="courses-active-filters">
              <div className="filter-tags">
                {searchTerm && (
                  <span className="filter-tag filter-tag-primary">
                    Pesquisa: {searchTerm}
                    <button
                      className="filter-tag-close"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterType && (
                  <span className="filter-tag filter-tag-secondary">
                    Tipo:{" "}
                    {filterType === "sincrono" ? "Síncrono" : "Assíncrono"}
                    <button
                      className="filter-tag-close"
                      onClick={() => setFilterType("")}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterStatus && (
                  <span className="filter-tag filter-tag-warning">
                    Estado: {filterStatus}
                    <button
                      className="filter-tag-close"
                      onClick={() => setFilterStatus("")}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterCategory && (
                  <span className="filter-tag filter-tag-info">
                    Categoria: {filterCategory}
                    <button
                      className="filter-tag-close"
                      onClick={() => setFilterCategory("")}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tabela de Cursos */}
          <div className="courses-table-section">
            {isLoadingAssets ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">A carregar...</span>
                </div>
                <p className="mt-3 text-muted">A carregar cursos...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover courses-table">
                  <thead>
                    <tr>
                      <th>
                        <BookOpen size={16} className="me-2" />
                        Curso
                      </th>
                      <th>
                        <Filter size={16} className="me-2" />
                        Categoria/Área
                      </th>
                      <th>Tipo</th>
                      <th>
                        <User size={16} className="me-2" />
                        Formador
                      </th>
                      <th>
                        <Calendar size={16} className="me-2" />
                        Datas
                      </th>
                      <th>
                        <Users size={16} className="me-2" />
                        Vagas
                      </th>
                      <th>Estado</th>
                      <th>
                        <Clock size={16} className="me-2" />
                        Criado
                      </th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <tr key={course.ID_CURSO}>
                          <td>
                            <div className="course-info">
                              <div className="course-name">{course.NOME}</div>
                              <div className="course-id">
                                ID: {course.ID_CURSO}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="category-info">
                              <div className="category-name">
                                {course.AREA?.Categoria?.NOME__}
                              </div>
                              <div className="area-name">
                                {course.AREA?.NOME}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                course.CURSO_SINCRONO === null
                                  ? "bg-info"
                                  : "bg-primary"
                              }`}
                            >
                              {course.CURSO_SINCRONO === null
                                ? "Assíncrono"
                                : "Síncrono"}
                            </span>
                          </td>
                          <td>
                            {course.CURSO_SINCRONO === null ? (
                              <span className="text-muted">N/A</span>
                            ) : (
                              <div className="trainer-info">
                                <User size={14} className="me-1" />
                                {course.CURSO_SINCRONO.UTILIZADOR?.NOME ||
                                  course.CURSO_SINCRONO.UTILIZADOR?.USERNAME ||
                                  "Sem formador"}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="dates-info">
                              <div className="start-date">
                                <strong>Início:</strong>{" "}
                                {formatDate(
                                  course.CURSO_SINCRONO?.DATA_INICIO ||
                                    course.CURSO_ASSINCRONO?.DATA_INICIO
                                )}
                              </div>
                              <div className="end-date">
                                <strong>Fim:</strong>{" "}
                                {formatDate(
                                  course.CURSO_SINCRONO?.DATA_FIM ||
                                    course.CURSO_ASSINCRONO?.DATA_FIM
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {course.CURSO_SINCRONO === null ? (
                              <span className="text-muted">Ilimitadas</span>
                            ) : (
                              <span className="vagas-info">
                                <Users size={14} className="me-1" />
                                {course.CURSO_SINCRONO.VAGAS || "N/A"}
                              </span>
                            )}
                          </td>
                          <td>{getStatusBadge(course)}</td>
                          <td>
                            <div className="created-date">
                              {formatDate(course.DATA_CRIACAO__)}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/course/edit/${course.ID_CURSO}`
                                  )
                                }
                                title="Editar curso"
                              >
                                <Pen size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  navigate(`/course/${course.ID_CURSO}`)
                                }
                                title="Ver curso"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <BookOpen size={48} className="text-muted mb-3" />
                          <h5 className="text-muted">
                            Nenhum curso encontrado
                          </h5>
                          <p className="text-muted">
                            {hasActiveFilters
                              ? "Tente ajustar os filtros de pesquisa"
                              : "Não há cursos criados ainda"}
                          </p>
                          {hasActiveFilters && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={clearFilters}
                            >
                              Limpar filtros
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ListCoursesDashboard;
