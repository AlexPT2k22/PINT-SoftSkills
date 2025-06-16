import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/navbar.jsx";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Book,
  Target,
  Folder,
} from "lucide-react";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const Forum = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [topicosForum, setTopicosForum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    categoria: searchParams.get("categoria") || "",
    area: searchParams.get("area") || "",
    topico: searchParams.get("topico") || "",
    search: searchParams.get("search") || "",
  });

  const [stats, setStats] = useState({
    totalTopicos: 0,
    totalPosts: 0,
    usuariosAtivos: 0,
  });

  useEffect(() => {
    fetchCategorias();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filtros.categoria) {
      fetchAreas(filtros.categoria);
    } else {
      setAreas([]);
      setTopicos([]);
    }
  }, [filtros.categoria]);

  useEffect(() => {
    if (filtros.area) {
      fetchTopicos(filtros.area);
    } else {
      setTopicos([]);
    }
  }, [filtros.area]);

  useEffect(() => {
    fetchTopicosForum();
  }, [filtros]);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${URL}/api/categorias`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setCategorias(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchAreas = async (categoriaId) => {
    try {
      const response = await axios.get(`${URL}/api/categorias/com-areas`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const categoriaEncontrada = response.data.find(
          (cat) => cat.ID_CATEGORIA__PK___ === parseInt(categoriaId)
        );

        if (categoriaEncontrada && categoriaEncontrada.AREAs) {
          setAreas(categoriaEncontrada.AREAs);
          //console.log("Áreas da categoria:", categoriaEncontrada.AREAs);
        } else {
          setAreas([]);
          //console.log("Nenhuma área encontrada para esta categoria");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar áreas:", error);
    }
  };

  const fetchTopicos = async (areaId) => {
    try {
      const response = await axios.get(`${URL}/api/topicos/by-area/${areaId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setTopicos(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
    }
  };

  const fetchTopicosForum = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filtros.categoria) params.append("categoriaId", filtros.categoria);
      if (filtros.area) params.append("areaId", filtros.area);
      if (filtros.topico) params.append("topicoId", filtros.topico);

      const response = await axios.get(`${URL}/api/forum/topicos?${params}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setTopicosForum(response.data.topicos);
      }
    } catch (error) {
      console.error("Erro ao buscar tópicos do fórum:", error);
      setError("Erro ao carregar tópicos do fórum");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Implementar endpoint para estatísticas se necessário
      setStats({
        totalTopicos: 42,
        totalPosts: 156,
        usuariosAtivos: 23,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const handleFiltroChange = (key, value) => {
    const newFiltros = { ...filtros, [key]: value };

    // Resetar filtros dependentes
    if (key === "categoria") {
      newFiltros.area = "";
      newFiltros.topico = "";
    } else if (key === "area") {
      newFiltros.topico = "";
    }

    setFiltros(newFiltros);

    // Atualizar URL
    const newSearchParams = new URLSearchParams();
    Object.entries(newFiltros).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const clearFiltros = () => {
    setFiltros({
      categoria: "",
      area: "",
      topico: "",
      search: "",
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <>
      <Navbar />
      <div className="container p-4 mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <MessageSquare size={32} className="me-2" />
                  Fórum de Partilha de Conhecimento
                </h2>
                <p className="text-muted mb-0">
                  Partilhe conhecimentos organizados por categoria, área e
                  tópico
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/forum/solicitar-topico")}
              >
                <Plus size={16} className="me-1" />
                Solicitar Tópico
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <MessageSquare className="text-primary" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1">{stats.totalTopicos}</h4>
                  <small className="text-muted">Tópicos Ativos</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <TrendingUp className="text-success" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1">{stats.totalPosts}</h4>
                  <small className="text-muted">Posts Publicados</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <Users className="text-info" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1">{stats.usuariosAtivos}</h4>
                  <small className="text-muted">Utilizadores Ativos</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title mb-3">
              <Filter size={18} className="me-2" />
              Filtros
            </h6>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Categoria</label>
                <select
                  className="form-select"
                  value={filtros.categoria}
                  onChange={(e) =>
                    handleFiltroChange("categoria", e.target.value)
                  }
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((cat) => (
                    <option
                      key={cat.ID_CATEGORIA__PK___}
                      value={cat.ID_CATEGORIA__PK___}
                    >
                      {cat.NOME__}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Área</label>
                <select
                  className="form-select"
                  value={filtros.area}
                  onChange={(e) => handleFiltroChange("area", e.target.value)}
                  disabled={!filtros.categoria}
                >
                  <option value="">Todas as áreas</option>
                  {areas.map((area) => (
                    <option key={area.ID_AREA} value={area.ID_AREA}>
                      {area.NOME}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Tópico</label>
                <select
                  className="form-select"
                  value={filtros.topico}
                  onChange={(e) => handleFiltroChange("topico", e.target.value)}
                  disabled={!filtros.area}
                >
                  <option value="">Todos os tópicos</option>
                  {topicos.map((topico) => (
                    <option key={topico.ID_TOPICO} value={topico.ID_TOPICO}>
                      {topico.TITULO}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFiltros}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Tópicos do Fórum */}
        <div className="row">
          <div className="col-12">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : topicosForum.length === 0 ? (
              <div className="text-center py-5">
                <MessageSquare size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Nenhum tópico encontrado</h5>
                <p className="text-muted">
                  {Object.values(filtros).some(Boolean)
                    ? "Tente ajustar os filtros para encontrar tópicos."
                    : "Ainda não há tópicos de fórum. Seja o primeiro a solicitar um!"}
                </p>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Tópicos de Discussão</h6>
                </div>
                <div className="list-group list-group-flush">
                  {topicosForum.map((topico) => (
                    <div
                      key={topico.ID_FORUM_TOPICO}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/forum/topico/${topico.ID_FORUM_TOPICO}`)
                      }
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{topico.TITULO}</h6>
                          <p className="mb-2 text-muted">{topico.DESCRICAO}</p>

                          {/* Breadcrumb */}
                          <div className="d-flex align-items-center text-sm text-muted mb-2">
                            <Folder size={14} className="me-1" />
                            <span>{topico.Categoria?.NOME__}</span>
                            <ChevronRight size={14} className="mx-1" />
                            <span>{topico.AREA?.NOME}</span>
                            <ChevronRight size={14} className="mx-1" />
                            <span>{topico.TOPICO?.TITULO}</span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between">
                            <small className="text-muted">
                              Por:{" "}
                              <strong>
                                {topico.Criador?.NOME ||
                                  topico.Criador?.USERNAME}
                              </strong>
                            </small>

                            <div className="d-flex align-items-center gap-3">
                              <small className="text-muted">
                                <MessageSquare size={14} className="me-1" />
                                {topico.TOTAL_POSTS} posts
                              </small>
                              {topico.ULTIMO_POST_DATA && (
                                <small className="text-muted">
                                  Último post:{" "}
                                  {new Date(
                                    topico.ULTIMO_POST_DATA
                                  ).toLocaleDateString()}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight size={20} className="text-muted ms-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Forum;
