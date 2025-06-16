import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar.jsx";
import {
  MessageSquare,
  ChevronLeft,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const ForumSolicitarTopico = () => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    categoriaId: "",
    areaId: "",
    topicoId: "",
    tituloSugerido: "",
    justificativa: "",
  });

  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState([]);
  const [showMinhasSolicitacoes, setShowMinhasSolicitacoes] = useState(false);

  useEffect(() => {
    fetchCategorias();
    fetchMinhasSolicitacoes();
  }, []);

  useEffect(() => {
    if (formData.categoriaId) {
      fetchAreas(formData.categoriaId);
    } else {
      setAreas([]);
      setTopicos([]);
    }
  }, [formData.categoriaId]);

  useEffect(() => {
    if (formData.areaId) {
      fetchTopicos(formData.areaId);
    } else {
      setTopicos([]);
    }
  }, [formData.areaId]);

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

  const fetchMinhasSolicitacoes = async () => {
    try {
      const response = await axios.get(`${URL}/api/forum/solicitacoes`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setMinhasSolicitacoes(response.data.solicitacoes);
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoriaId || !formData.areaId || !formData.topicoId) {
      setError("Selecione categoria, área e tópico");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post(
        `${URL}/api/forum/solicitacoes`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          categoriaId: "",
          areaId: "",
          topicoId: "",
          tituloSugerido: "",
          justificativa: "",
        });
        fetchMinhasSolicitacoes();
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setError(error.response?.data?.message || "Erro ao enviar solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Resetar campos dependentes
      if (field === "categoriaId") {
        newData.areaId = "";
        newData.topicoId = "";
      } else if (field === "areaId") {
        newData.topicoId = "";
      }

      return newData;
    });
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Pendente":
        return (
          <span className="badge bg-warning">
            <Clock size={12} className="me-1" />
            Pendente
          </span>
        );
      case "Aprovado":
        return (
          <span className="badge bg-success">
            <CheckCircle size={12} className="me-1" />
            Aprovado
          </span>
        );
      case "Rejeitado":
        return (
          <span className="badge bg-danger">
            <X size={12} className="me-1" />
            Rejeitado
          </span>
        );
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  return (
    <>
      <Navbar />
      <div className="container p-4 mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => navigate("/forum")}
            >
              <ChevronLeft size={16} className="me-1" />
              Voltar ao Fórum
            </button>

            <h2 className="mb-1">
              <MessageSquare size={32} className="me-2" />
              Solicitar Novo Tópico de Discussão
            </h2>
            <p className="text-muted mb-0">
              Sugira um novo tópico para discussão. As solicitações são
              analisadas pelos gestores.
            </p>
          </div>
        </div>

        <div className="row">
          {/* Formulário */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Nova Solicitação</h5>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  {/* Mensagens */}
                  {error && (
                    <div className="alert alert-danger">
                      <AlertCircle size={16} className="me-2" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success">
                      <CheckCircle size={16} className="me-2" />
                      Solicitação enviada com sucesso! Aguarde a análise dos
                      gestores.
                    </div>
                  )}

                  {/* Seleção de Categoria */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Categoria *</label>
                      <select
                        className="form-select"
                        value={formData.categoriaId}
                        onChange={(e) =>
                          handleChange("categoriaId", e.target.value)
                        }
                        required
                        disabled={submitting}
                      >
                        <option value="">Selecione uma categoria</option>
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

                    <div className="col-md-4">
                      <label className="form-label">Área *</label>
                      <select
                        className="form-select"
                        value={formData.areaId}
                        onChange={(e) => handleChange("areaId", e.target.value)}
                        required
                        disabled={submitting || !formData.categoriaId}
                      >
                        <option value="">Selecione uma área</option>
                        {areas.map((area) => (
                          <option key={area.ID_AREA} value={area.ID_AREA}>
                            {area.NOME}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Tópico *</label>
                      <select
                        className="form-select"
                        value={formData.topicoId}
                        onChange={(e) =>
                          handleChange("topicoId", e.target.value)
                        }
                        required
                        disabled={submitting || !formData.areaId}
                      >
                        <option value="">Selecione um tópico</option>
                        {topicos.map((topico) => (
                          <option
                            key={topico.ID_TOPICO}
                            value={topico.ID_TOPICO}
                          >
                            {topico.TITULO}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Título Sugerido */}
                  <div className="mb-3">
                    <label className="form-label">
                      Título Sugerido para o Tópico de Discussão *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Dúvidas sobre React.js"
                      value={formData.tituloSugerido}
                      onChange={(e) =>
                        handleChange("tituloSugerido", e.target.value)
                      }
                      required
                      disabled={submitting}
                    />
                    <div className="form-text">
                      Sugira um título claro e descritivo para o tópico de
                      discussão.
                    </div>
                  </div>

                  {/* Justificativa */}
                  <div className="mb-3">
                    <label className="form-label">Justificativa *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Explique por que este tópico seria útil para a comunidade..."
                      value={formData.justificativa}
                      onChange={(e) =>
                        handleChange("justificativa", e.target.value)
                      }
                      required
                      disabled={submitting}
                    />
                    <div className="form-text">
                      Explique a importância e relevância deste tópico para a
                      comunidade.
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/forum")}
                      disabled={submitting}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        submitting ||
                        !formData.tituloSugerido.trim() ||
                        !formData.justificativa.trim()
                      }
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="me-1" />
                          Enviar Solicitação
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Minhas Solicitações */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Minhas Solicitações</h6>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    setShowMinhasSolicitacoes(!showMinhasSolicitacoes)
                  }
                >
                  {showMinhasSolicitacoes ? "Ocultar" : "Mostrar"} (
                  {minhasSolicitacoes.length})
                </button>
              </div>

              {showMinhasSolicitacoes && (
                <div className="card-body p-0">
                  {minhasSolicitacoes.length === 0 ? (
                    <div className="p-3 text-center text-muted">
                      <MessageSquare size={32} className="mb-2" />
                      <p className="mb-0">Ainda não fez solicitações</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {minhasSolicitacoes.slice(0, 5).map((solicitacao) => (
                        <div
                          key={solicitacao.ID_FORUM_SOLICITACAO}
                          className="list-group-item"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">
                              {solicitacao.TITULO_SUGERIDO}
                            </h6>
                            {getEstadoBadge(solicitacao.ESTADO)}
                          </div>

                          <p className="text-muted small mb-2">
                            {solicitacao.Categoria?.NOME__} →{" "}
                            {solicitacao.Area?.NOME} →{" "}
                            {solicitacao.Topico?.TITULO}
                          </p>

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {formatDate(solicitacao.DATA_CRIACAO)}
                            </small>

                            {solicitacao.ESTADO === "Aprovado" && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate("/forum")}
                              >
                                Ver Tópico
                              </button>
                            )}
                          </div>

                          {solicitacao.RESPOSTA_GESTOR && (
                            <div className="mt-2 p-2 bg-light rounded">
                              <small className="text-muted">
                                <strong>Resposta:</strong>{" "}
                                {solicitacao.RESPOSTA_GESTOR}
                              </small>
                            </div>
                          )}
                        </div>
                      ))}

                      {minhasSolicitacoes.length > 5 && (
                        <div className="list-group-item text-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate("/forum/minhas-solicitacoes")
                            }
                          >
                            Ver Todas ({minhasSolicitacoes.length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dicas */}
            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">💡 Dicas para uma Boa Solicitação</h6>
              </div>
              <div className="card-body">
                <ul className="mb-0 small">
                  <li className="mb-2">Escolha um título claro e específico</li>
                  <li className="mb-2">Explique por que o tópico seria útil</li>
                  <li className="mb-2">
                    Verifique se já não existe um tópico similar
                  </li>
                  <li className="mb-0">Seja detalhado na justificativa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForumSolicitarTopico;
