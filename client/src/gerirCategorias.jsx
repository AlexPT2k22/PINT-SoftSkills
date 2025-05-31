import React, { useState, useEffect } from "react";
import Sidebar from "./components/sidebar.jsx";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";
import {
  ConfirmDeleteCategoriaModal,
  ConfirmDeleteAreaModal,
  ConfirmDeleteTopicoModal,
} from "./components/deleteModals.jsx";

function GerirCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [topicos, setTopicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategorias, setExpandedCategorias] = useState({});
  const [expandedAreas, setExpandedAreas] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteCategoriaModal, setShowDeleteCategoriaModal] =
    useState(false);
  const [showDeleteAreaModal, setShowDeleteAreaModal] = useState(false);
  const [showDeleteTopicoModal, setShowDeleteTopicoModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showTopicoModal, setShowTopicoModal] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({
    NOME__: "",
    DESCRICAO__: "",
  });
  const [novaArea, setNovaArea] = useState({
    NOME: "",
    DESCRICAO: "",
    ID_CATEGORIA: "",
  });
  const [novoTopico, setNovoTopico] = useState({
    NOME: "",
    DESCRICAO: "",
    ID_AREA: "",
  });

  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [editandoArea, setEditandoArea] = useState(null);
  const [editandoTopico, setEditandoTopico] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriasRes, areasRes, topicosRes] = await Promise.all([
        axios.get("http://localhost:4000/api/categorias", {
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/areas", { withCredentials: true }),
        axios.get("http://localhost:4000/api/topicos", {
          withCredentials: true,
        }),
      ]);

      setCategorias(categoriasRes.data);
      setAreas(areasRes.data);
      setTopicos(topicosRes.data);
      console.log("Dados carregados com sucesso!");
      console.log("Categorias:", categoriasRes.data);
      console.log("Áreas:", areasRes.data);
      console.log("Tópicos:", topicosRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMessage("Erro ao carregar dados");
      setShowErrorMessage(true);
    } finally {
      setLoading(false);
    }
  };

  // Funções para Categorias
  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    try {
      if (editandoCategoria) {
        await axios.put(
          `http://localhost:4000/api/categorias/${editandoCategoria.ID_CATEGORIA__PK___}`,
          novaCategoria,
          { withCredentials: true }
        );
        setMessage("Categoria atualizada com sucesso!");
      } else {
        await axios.post(
          "http://localhost:4000/api/categorias",
          novaCategoria,
          {
            withCredentials: true,
          }
        );
        setMessage("Categoria criada com sucesso!");
      }

      setShowSuccessMessage(true);
      setShowCategoriaModal(false);
      resetCategoriaForm();
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      setMessage("Erro ao salvar categoria");
      setShowErrorMessage(true);
    }
  };

  const handleDeleteCategoria = async (categoria) => {
    setItemToDelete(categoria);
    setShowDeleteCategoriaModal(true);
  };

  const confirmDeleteCategoria = async () => {
    try {
      setDeleteLoading(true);

      // Verificar se existem cursos associados à categoria
      const cursosResponse = await axios.get(
        `http://localhost:4000/api/cursos/check-categoria/${itemToDelete.ID_CATEGORIA}`,
        { withCredentials: true }
      );

      if (cursosResponse.data.temCursos) {
        setMessage(
          `Não é possível excluir esta categoria pois existem ${cursosResponse.data.quantidade} curso(s) associado(s) a ela.`
        );
        setShowErrorMessage(true);
        setShowDeleteCategoriaModal(false);
        return;
      }

      await axios.delete(
        `http://localhost:4000/api/categorias/${itemToDelete.ID_CATEGORIA}`,
        {
          withCredentials: true,
        }
      );

      setMessage("Categoria excluída com sucesso!");
      setShowSuccessMessage(true);
      setShowDeleteCategoriaModal(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      setMessage(error.response?.data?.message || "Erro ao excluir categoria");
      setShowErrorMessage(true);
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  // Funções para Áreas
  const handleSubmitArea = async (e) => {
    e.preventDefault();
    try {
      if (editandoArea) {
        await axios.put(
          `http://localhost:4000/api/areas/${editandoArea.ID_AREA}`,
          novaArea,
          { withCredentials: true }
        );
        setMessage("Área atualizada com sucesso!");
      } else {
        await axios.post("http://localhost:4000/api/areas", novaArea, {
          withCredentials: true,
        });
        setMessage("Área criada com sucesso!");
      }

      setShowSuccessMessage(true);
      setShowAreaModal(false);
      resetAreaForm();
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar área:", error);
      setMessage("Erro ao salvar área");
      setShowErrorMessage(true);
    }
  };

  const handleDeleteArea = async (area) => {
    setItemToDelete(area);
    setShowDeleteAreaModal(true);
  };

  const confirmDeleteArea = async () => {
    try {
      setDeleteLoading(true);

      // Verificar se existem cursos associados à área
      const cursosResponse = await axios.get(
        `http://localhost:4000/api/cursos/check-area/${itemToDelete.ID_AREA}`,
        { withCredentials: true }
      );

      if (cursosResponse.data.temCursos) {
        setMessage(
          `Não é possível excluir esta área pois existem ${cursosResponse.data.quantidade} curso(s) associado(s) a ela.`
        );
        setShowErrorMessage(true);
        setShowDeleteAreaModal(false);
        return;
      }

      await axios.delete(
        `http://localhost:4000/api/areas/${itemToDelete.ID_AREA}`,
        {
          withCredentials: true,
        }
      );

      setMessage("Área excluída com sucesso!");
      setShowSuccessMessage(true);
      setShowDeleteAreaModal(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir área:", error);
      setMessage(error.response?.data?.message || "Erro ao excluir área");
      setShowErrorMessage(true);
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  // Funções para Tópicos
  const handleSubmitTopico = async (e) => {
    e.preventDefault();
    try {
      if (editandoTopico) {
        await axios.put(
          `http://localhost:4000/api/topicos/${editandoTopico.ID_TOPICO}`,
          novoTopico,
          { withCredentials: true }
        );
        setMessage("Tópico atualizado com sucesso!");
      } else {
        await axios.post("http://localhost:4000/api/topicos", novoTopico, {
          withCredentials: true,
        });
        setMessage("Tópico criado com sucesso!");
      }

      setShowSuccessMessage(true);
      setShowTopicoModal(false);
      resetTopicoForm();
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar tópico:", error);
      setMessage("Erro ao salvar tópico");
      setShowErrorMessage(true);
    }
  };

  const handleDeleteTopico = async (topico) => {
    setItemToDelete(topico);
    setShowDeleteTopicoModal(true);
  };

  const confirmDeleteTopico = async () => {
    try {
      setDeleteLoading(true);

      // Verificar se existem cursos associados ao tópico
      const cursosResponse = await axios.get(
        `http://localhost:4000/api/cursos/check-topico/${itemToDelete.ID_TOPICO}`,
        { withCredentials: true }
      );

      if (cursosResponse.data.temCursos) {
        setMessage(
          `Não é possível excluir este tópico pois existem ${cursosResponse.data.quantidade} curso(s) associado(s) a ele.`
        );
        setShowErrorMessage(true);
        setShowDeleteTopicoModal(false);
        return;
      }

      await axios.delete(
        `http://localhost:4000/api/topicos/${itemToDelete.ID_TOPICO}`,
        {
          withCredentials: true,
        }
      );

      setMessage("Tópico excluído com sucesso!");
      setShowSuccessMessage(true);
      setShowDeleteTopicoModal(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      setMessage(error.response?.data?.message || "Erro ao excluir tópico");
      setShowErrorMessage(true);
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
      setShowDeleteTopicoModal(false);
    }
  };

  // Funções auxiliares
  const resetCategoriaForm = () => {
    setNovaCategoria({ NOME__: "", DESCRICAO__: "" });
    setEditandoCategoria(null);
  };

  const resetAreaForm = () => {
    setNovaArea({ NOME: "", DESCRICAO: "", ID_CATEGORIA: "" });
    setEditandoArea(null);
  };

  const resetTopicoForm = () => {
    setNovoTopico({ NOME: "", DESCRICAO: "", ID_AREA: "" });
    setEditandoTopico(null);
  };

  const toggleCategoria = (id) => {
    setExpandedCategorias((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleArea = (id) => {
    setExpandedAreas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getAreasByCategoria = (categoriaId) => {
    return areas.filter((area) => area.Categoria.ID_CATEGORIA__PK___ === categoriaId);
  };

  const getTopicosByArea = (areaId) => {
    return topicos.filter((topico) => topico.ID_AREA === areaId);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className={`container mt-4 p-4`}>
        {showSuccessMessage && (
          <SuccessMessage
            message={message}
            onClose={() => setShowSuccessMessage(false)}
          />
        )}
        {showErrorMessage && (
          <ErrorMessage
            message={message}
            onClose={() => setShowErrorMessage(false)}
          />
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gerir Categorias, Áreas e Tópicos</h2>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => setShowCategoriaModal(true)}
            >
              <Plus size={16} className="me-1" />
              Nova Categoria
            </button>
            <button
              className="btn btn-success me-2"
              onClick={() => setShowAreaModal(true)}
            >
              <Plus size={16} className="me-1" />
              Nova Área
            </button>
            <button
              className="btn btn-info"
              onClick={() => setShowTopicoModal(true)}
            >
              <Plus size={16} className="me-1" />
              Novo Tópico
            </button>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {categorias.map((categoria) => (
              <div key={categoria.ID_CATEGORIA__PK___} className="col-12 mb-3">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-link p-0 me-2"
                          onClick={() =>
                            toggleCategoria(categoria.ID_CATEGORIA__PK___)
                          }
                        >
                          {expandedCategorias[categoria.ID_CATEGORIA__PK___] ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                        <h5 className="mb-0">
                          <span className="badge bg-primary me-2">
                            Categoria
                          </span>
                          {categoria.NOME__}
                        </h5>
                        {categoria.DESCRICAO__ && (
                          <small className="text-muted d-block ms-3">
                            {categoria.DESCRICAO__}
                          </small>
                        )}
                      </div>
                      <div>
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => {
                            setEditandoCategoria(categoria);
                            setNovaCategoria({
                              NOME__: categoria.NOME__,
                              DESCRICAO__: categoria.DESCRICAO__,
                            });
                            setShowCategoriaModal(true);
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteCategoria(categoria)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedCategorias[categoria.ID_CATEGORIA__PK___] && (
                    <div className="card-body">
                      {getAreasByCategoria(categoria.ID_CATEGORIA__PK___).map(
                        (area) => (
                          <div key={area.ID_AREA} className="ms-4 mb-3">
                            <div className="card">
                              <div className="card-header bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <button
                                      className="btn btn-link p-0 me-2"
                                      onClick={() => toggleArea(area.ID_AREA)}
                                    >
                                      {expandedAreas[area.ID_AREA] ? (
                                        <ChevronDown size={18} />
                                      ) : (
                                        <ChevronRight size={18} />
                                      )}
                                    </button>
                                    <h6 className="mb-0">
                                      <span className="badge bg-success me-2">
                                        Área
                                      </span>
                                      {area.NOME}
                                    </h6>
                                    {area.DESCRICAO && (
                                      <small className="text-muted d-block ms-3">
                                        {area.DESCRICAO}
                                      </small>
                                    )}
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-outline-primary btn-sm me-2"
                                      onClick={() => {
                                        setEditandoArea(area);
                                        setNovaArea({
                                          NOME: area.NOME,
                                          DESCRICAO: area.DESCRICAO,
                                          ID_CATEGORIA: area.Categoria.ID_CATEGORIA__PK___,
                                        });
                                        setShowAreaModal(true);
                                      }}
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeleteArea(area)}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {expandedAreas[area.ID_AREA] && (
                                <div className="card-body">
                                  {getTopicosByArea(area.ID_AREA).map(
                                    (topico) => (
                                      <div
                                        key={topico.ID_TOPICO}
                                        className="ms-4 mb-2"
                                      >
                                        <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                                          <div>
                                            <div className="d-flex align-items-center">
                                              <h6 className="mb-0">
                                                <span className="badge bg-info me-2">
                                                  Tópico
                                                </span>
                                                {topico.TITULO}
                                              </h6>

                                              {topico.DESCRICAO && (
                                                <div>
                                                  <small className="text-muted ms-3">
                                                    {topico.DESCRICAO}
                                                  </small>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div>
                                            <button
                                              className="btn btn-outline-primary btn-sm me-2"
                                              onClick={() => {
                                                setEditandoTopico(topico);
                                                setNovoTopico({
                                                  NOME: topico.TITULO,
                                                  DESCRICAO: topico.DESCRICAO,
                                                  ID_AREA: topico.ID_AREA,
                                                });
                                                setShowTopicoModal(true);
                                              }}
                                            >
                                              <Edit size={12} />
                                            </button>
                                            <button
                                              className="btn btn-outline-danger btn-sm"
                                              onClick={() =>
                                                handleDeleteTopico(topico)
                                              }
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                  {getTopicosByArea(area.ID_AREA).length ===
                                    0 && (
                                    <div className="text-muted text-center py-3">
                                      Nenhum tópico nesta área
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                      {getAreasByCategoria(categoria.ID_CATEGORIA__PK___)
                        .length === 0 && (
                        <div className="text-muted text-center py-3">
                          Nenhuma área nesta categoria
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Categoria */}
        <div
          className={`modal fade ${showCategoriaModal ? "show" : ""}`}
          style={{ display: showCategoriaModal ? "block" : "none" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editandoCategoria ? "Editar Categoria" : "Nova Categoria"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCategoriaModal(false);
                    resetCategoriaForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmitCategoria}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novaCategoria.NOME__}
                      onChange={(e) =>
                        setNovaCategoria({
                          ...novaCategoria,
                          NOME__: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={novaCategoria.DESCRICAO__}
                      onChange={(e) =>
                        setNovaCategoria({
                          ...novaCategoria,
                          DESCRICAO__: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCategoriaModal(false);
                      resetCategoriaForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editandoCategoria ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Área */}
        <div
          className={`modal fade ${showAreaModal ? "show" : ""}`}
          style={{ display: showAreaModal ? "block" : "none" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editandoArea ? "Editar Área" : "Nova Área"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAreaModal(false);
                    resetAreaForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmitArea}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={novaArea.ID_CATEGORIA}
                      onChange={(e) =>
                        setNovaArea({
                          ...novaArea,
                          ID_CATEGORIA: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((categoria) => (
                        <option
                          key={categoria.ID_CATEGORIA__PK___}
                          value={categoria.ID_CATEGORIA__PK___}
                        >
                          {categoria.NOME__}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novaArea.NOME}
                      onChange={(e) =>
                        setNovaArea({ ...novaArea, NOME: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={novaArea.DESCRICAO}
                      onChange={(e) =>
                        setNovaArea({ ...novaArea, DESCRICAO: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAreaModal(false);
                      resetAreaForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editandoArea ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Tópico */}
        <div
          className={`modal fade ${showTopicoModal ? "show" : ""}`}
          style={{ display: showTopicoModal ? "block" : "none" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editandoTopico ? "Editar Tópico" : "Novo Tópico"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowTopicoModal(false);
                    resetTopicoForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmitTopico}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Área</label>
                    <select
                      className="form-select"
                      value={novoTopico.ID_AREA}
                      onChange={(e) =>
                        setNovoTopico({
                          ...novoTopico,
                          ID_AREA: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Selecione uma área</option>
                      {areas.map((area) => (
                        <option key={area.ID_AREA} value={area.ID_AREA}>
                          {area.NOME} (
                          {categorias.find(
                            (c) => c.ID_CATEGORIA__PK___ === area.Categoria.ID_CATEGORIA__PK___
                          )?.NOME__ || "Sem categoria"}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      value={novoTopico.NOME}
                      onChange={(e) =>
                        setNovoTopico({ ...novoTopico, NOME: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={novoTopico.DESCRICAO}
                      onChange={(e) =>
                        setNovoTopico({
                          ...novoTopico,
                          DESCRICAO: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowTopicoModal(false);
                      resetTopicoForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-info">
                    {editandoTopico ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal de confirmação de exclusão de categoria */}
        <ConfirmDeleteCategoriaModal
          categoria={itemToDelete}
          areas={areas}
          topicos={topicos}
          show={showDeleteCategoriaModal}
          onClose={() => {
            setShowDeleteCategoriaModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteCategoria}
          loading={deleteLoading}
        />

        <ConfirmDeleteAreaModal
          area={itemToDelete}
          topicos={topicos}
          show={showDeleteAreaModal}
          onClose={() => {
            setShowDeleteAreaModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteArea}
          loading={deleteLoading}
        />

        <ConfirmDeleteTopicoModal
          topico={itemToDelete}
          show={showDeleteTopicoModal}
          onClose={() => {
            setShowDeleteTopicoModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteTopico}
          loading={deleteLoading}
        />

        {/* Backdrop para modais */}
        {(showCategoriaModal || showAreaModal || showTopicoModal) && (
          <div className="modal-backdrop fade show"></div>
        )}
        {(showDeleteCategoriaModal ||
          showDeleteAreaModal ||
          showDeleteTopicoModal) && (
          <div className="modal-backdrop fade show"></div>
        )}
      </div>
    </>
  );
}

export default GerirCategorias;
