import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/navbar.jsx";
import {
  MessageSquare,
  TrendingUp,
  Filter,
  Plus,
  ChevronRight,
  Folder,
} from "lucide-react";
import Footer from "./components/footer.jsx";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Forum = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [topicosForum, setTopicosForum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numTopicos, setNumTopicos] = useState(0);
  const [numPosts, setNumPosts] = useState(0);
  const [filtros, setFiltros] = useState({
    categoria: searchParams.get("categoria") || "",
    area: searchParams.get("area") || "",
    topico: searchParams.get("topico") || "",
    search: searchParams.get("search") || "",
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
      console.error("Erro ao procurar categorias:", error);
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
        } else {
          setAreas([]);
        }
      }
    } catch (error) {
      console.error("Erro ao procurar áreas:", error);
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
      console.error("Erro ao procurar tópicos:", error);
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
      console.error("Erro ao procurar tópicos do fórum:", error);
      setError("Erro ao carregar tópicos do fórum");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${URL}/api/forum/topicos/count`, {
        withCredentials: true,
      });
      const response_posts = await axios.get(`${URL}/api/forum/posts`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setNumTopicos(response.data.count);
      }
      if (response_posts.status === 200) {
        setNumPosts(response_posts.data.posts);
      }
    } catch (error) {
      console.error("Erro ao procurar estatísticas:", error);
    }
  };

  const handleFiltroChange = (key, value) => {
    const newFiltros = { ...filtros, [key]: value };

    if (key === "categoria") {
      newFiltros.area = "";
      newFiltros.topico = "";
    } else if (key === "area") {
      newFiltros.topico = "";
    }

    setFiltros(newFiltros);

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
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <h2 className="mb-1">Fórum</h2>
              </div>
              <button
                className="btn btn-primary w-md-auto"
                onClick={() => navigate("/forum/solicitar-topico")}
              >
                <Plus size={16} className="me-1" />
                Solicitar tópico
              </button>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="card h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="bg-opacity-10 p-3 rounded-circle">
                    <MessageSquare className="text-primary" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-0">{numTopicos}</h4>
                </div>
                <div>
                  <h6 className="text-muted mb-0 ms-2">Tópico(s) ativos</h6>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body d-flex align-items-center">
                <div className="me-3">
                  <div className="bg-opacity-10 p-3 rounded-circle">
                    <TrendingUp className="text-success" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-0">{numPosts}</h4>
                </div>
                <div>
                  <h6 className="text-muted mb-0 ms-2">Post(s) publicados</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title mb-3">
              <Filter size={18} className="me-2" />
              Filtros
            </h6>

            <div className="row g-3">
              <div className="col-md-3 col-sm-6">
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

              <div className="col-md-3 col-sm-6">
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

              <div className="col-md-3 col-sm-6">
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

              <div className="col-md-3 col-sm-6 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFiltros}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

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
                  <h6 className="mb-0">Tópicos de discussão</h6>
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
                          <div className="d-flex align-items-center text-sm text-muted mb-2 flex-wrap">
                            <Folder size={14} className="me-1" />
                            <span className="text-truncate">{topico.Categoria?.NOME__}</span>
                            <ChevronRight size={14} className="mx-1 flex-shrink-0" />
                            <span className="text-truncate">{topico.AREA?.NOME}</span>
                            <ChevronRight size={14} className="mx-1 flex-shrink-0" />
                            <span className="text-truncate">{topico.TOPICO?.TITULO}</span>
                          </div>

                          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
                            <small className="text-muted">
                              Por:{" "}
                              <strong>
                                {topico.Criador?.NOME ||
                                  topico.Criador?.USERNAME}
                              </strong>
                            </small>

                            <div className="d-flex align-items-center gap-3 flex-wrap">
                              <small className="text-muted">
                                <MessageSquare size={14} className="me-1" />
                                {topico.TOTAL_POSTS} resposta(s)
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

                        <ChevronRight size={20} className="text-muted ms-2 d-none d-md-block" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Forum;
