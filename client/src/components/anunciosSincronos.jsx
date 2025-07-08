import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  Calendar,
  User,
  AlertCircle,
  Plus,
  Send,
  Edit,
  Trash2,
} from "lucide-react";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AnunciosView = ({ cursoId, isTeacher = false }) => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAnuncio, setDeletingAnuncio] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
  });

  useEffect(() => {
    fetchAnuncios();
  }, [cursoId]);

  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${URL}/api/anuncios/curso/${cursoId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAnuncios(response.data.anuncios);
      } else {
        setError("Erro ao carregar anúncios");
      }
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      setError("Não foi possível carregar os anúncios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnuncio = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      setError("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post(
        `${URL}/api/anuncios`,
        {
          titulo: formData.titulo,
          conteudo: formData.conteudo,
          cursoId: cursoId,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setFormData({ titulo: "", conteudo: "" });
        setShowCreateModal(false);
        await fetchAnuncios();
        console.log("Anúncio criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      setError(error.response?.data?.message || "Erro ao criar anúncio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAnuncio = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      setError("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.put(
        `${URL}/api/anuncios/${editingAnuncio.ID_ANUNCIO}`,
        {
          titulo: formData.titulo,
          conteudo: formData.conteudo,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setFormData({ titulo: "", conteudo: "" });
        setShowEditModal(false);
        setEditingAnuncio(null);
        await fetchAnuncios();
      }
    } catch (error) {
      console.error("Erro ao editar anúncio:", error);
      setError(error.response?.data?.message || "Erro ao editar anúncio");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnuncio = async () => {
    if (!deletingAnuncio) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await axios.delete(
        `${URL}/api/anuncios/${deletingAnuncio.ID_ANUNCIO}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchAnuncios();
        setShowDeleteModal(false);
        setDeletingAnuncio(null);
      }
    } catch (error) {
      console.error("Erro ao apagar anúncio:", error);
      setError(error.response?.data?.message || "Erro ao apagar anúncio");
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (anuncio) => {
    setEditingAnuncio(anuncio);
    setFormData({
      titulo: anuncio.TITULO,
      conteudo: anuncio.CONTEUDO,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (anuncio) => {
    setDeletingAnuncio(anuncio);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingAnuncio(null);
    setDeletingAnuncio(null);
    setFormData({ titulo: "", conteudo: "" });
    setError(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return "Agora mesmo";
    } else if (diffMinutes < 60) {
      return `Há ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else if (diffDays < 7) {
      return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("pt-PT", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">A carregar anúncios...</span>
        </div>
        <p className="mt-2 text-muted">A carregar os anúncios do curso...</p>
      </div>
    );
  }

  return (
    <div className="anuncios-view">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {isTeacher && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} className="me-1" />
            Novo anúncio
          </button>
        )}
      </div>


      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <AlertCircle size={16} className="me-2" />
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}


      {anuncios.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <MessageSquare size={64} className="text-muted mb-3" />
          <h5 className="text-muted">Ainda não há anúncios</h5>
          <p className="text-muted text-center mb-0">
            {isTeacher
              ? "Você pode criar o primeiro anúncio para este curso."
              : "O formador ainda não publicou anúncios para este curso."}
          </p>
        </div>
      ) : (
        <div className="anuncios-list">
          {anuncios.map((anuncio) => (
            <div key={anuncio.ID_ANUNCIO} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{anuncio.TITULO}</h5>

                  {isTeacher && (
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => openEditModal(anuncio)}
                        title="Editar anúncio"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => openDeleteModal(anuncio)}
                        title="Apagar anúncio"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                  {anuncio.CONTEUDO}
                </p>

                <div className="d-flex align-items-center text-muted small mt-3">
                  <Calendar size={14} className="me-1" />
                  <span className="me-3">
                    {formatDate(anuncio.DATA_CRIACAO)}
                  </span>
                  <User size={14} className="me-1" />
                  <span>
                    Por:{" "}
                    <strong>
                      {anuncio.UTILIZADOR?.NOME ||
                        anuncio.UTILIZADOR?.USERNAME ||
                        "Formador"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Novo anúncio
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>

              <form onSubmit={handleCreateAnuncio}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">
                      Título do anúncio *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      placeholder="Ex: Alteração na data da próxima aula"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="conteudo" className="form-label">
                      Conteúdo do anúncio *
                    </label>
                    <textarea
                      className="form-control"
                      id="conteudo"
                      rows="5"
                      value={formData.conteudo}
                      onChange={(e) =>
                        setFormData({ ...formData, conteudo: e.target.value })
                      }
                      placeholder="Escreva aqui o conteúdo do anúncio..."
                      required
                      disabled={submitting}
                    />
                    <div className="form-text">
                      Será enviado por email para todos os alunos inscritos no
                      curso.
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      <AlertCircle size={16} className="me-2" />
                      {error}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModals}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      submitting ||
                      !formData.titulo.trim() ||
                      !formData.conteudo.trim()
                    }
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        A publicar...
                      </>
                    ) : (
                      <>
                        Publicar anúncio
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Edit size={20} className="me-2" />
                  Editar anúncio
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>

              <form onSubmit={handleEditAnuncio}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editTitulo" className="form-label">
                      Título do anúncio *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editTitulo"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editConteudo" className="form-label">
                      Conteúdo do anúncio *
                    </label>
                    <textarea
                      className="form-control"
                      id="editConteudo"
                      rows="5"
                      value={formData.conteudo}
                      onChange={(e) =>
                        setFormData({ ...formData, conteudo: e.target.value })
                      }
                      required
                      disabled={submitting}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      <AlertCircle size={16} className="me-2" />
                      {error}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModals}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      submitting ||
                      !formData.titulo.trim() ||
                      !formData.conteudo.trim()
                    }
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        A guardar...
                      </>
                    ) : (
                      <>
                        Guardar alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingAnuncio && (
        <div
          className="modal show d-flex align-items-center justify-content-center p-3"
          tabIndex="-1"
          style={{ zIndex: 1050 }}
        >
          <div style={{ maxWidth: "400px", width: "100%" }}>
            <div className="modal-content">
              <div className="modal-header border-0">
                <h6 className="modal-title d-flex align-items-center mb-0">
                  Apagar anúncio
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                  disabled={deleting}
                ></button>
              </div>

              <div className="modal-body text-center pb-4 pt-0">
                <p className="text-muted mb-0">
                  Deseja apagar o anúncio{" "}
                  <strong className="text-danger">
                    "{deletingAnuncio.TITULO}"
                  </strong>
                  ?
                </p>

                <small className="text-muted">
                  Esta ação não pode ser desfeita.
                </small>

                {error && (
                  <div className="alert alert-danger alert-sm mt-3 mb-0">
                    <small>
                      <AlertCircle size={14} className="me-1" />
                      {error}
                    </small>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <div className="d-flex gap-2 w-100">
                  <button
                    type="button"
                    className="btn btn-light flex-fill"
                    onClick={closeModals}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger flex-fill"
                    onClick={handleDeleteAnuncio}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          style={{ width: "14px", height: "14px" }}
                        />
                        A apagar...
                      </>
                    ) : (
                      "Apagar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showCreateModal || showEditModal || showDeleteModal) && (
        <div
          className="modal-backdrop show"
          onClick={closeModals}
          style={{ zIndex: 1040 }}
        />
      )}
    </div>
  );
};

export default AnunciosView;
