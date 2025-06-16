import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./navbar.jsx";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Reply,
  Edit,
  Trash2,
  Paperclip,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Upload,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

const ForumTopicoView = () => {
  const { topicoId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const username = user.USERNAME;

  const [topico, setTopico] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(null);

  // Estados para criação de posts
  const [novoPost, setNovoPost] = useState({
    conteudo: "",
    anexos: [],
  });
  const [submittingPost, setSubmittingPost] = useState(false);

  // Estados para modais
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);
  const [postDenunciado, setPostDenunciado] = useState(null);
  const [denunciaData, setDenunciaData] = useState({
    motivo: "",
    descricao: "",
  });

  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  });

  const toggleDropdown = (postId) => {
    setDropdownAberto(dropdownAberto === postId ? null : postId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownAberto(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTopico();
  }, [topicoId]);

  useEffect(() => {
    fetchPosts(1);
  }, [topicoId]);

  const fetchTopico = async () => {
    try {
      const response = await axios.get(`${URL}/api/forum/topicos/${topicoId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setTopico(response.data.topico);
      }
    } catch (error) {
      console.error("Erro ao buscar tópico:", error);
      setError("Tópico não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (page = 1) => {
    try {
      setLoadingPosts(true);
      const response = await axios.get(
        `${URL}/api/forum/posts/topico/${topicoId}?page=${page}&limit=10`,
        { withCredentials: true }
      );

      if (response.data.success) {
        if (page === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts((prev) => [...prev, ...response.data.posts]);
        }
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!novoPost.conteudo.trim()) return;

    try {
      setSubmittingPost(true);
      const formData = new FormData();
      formData.append("topicoId", topicoId);
      formData.append("conteudo", novoPost.conteudo);

      // Adicionar anexos
      novoPost.anexos.forEach((file) => {
        formData.append("anexos", file);
      });

      const response = await axios.post(`${URL}/api/forum/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        setNovoPost({ conteudo: "", anexos: [] });
        fetchPosts(1); // Recarregar posts
        fetchTopico(); // Atualizar contadores
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      setError("Erro ao criar post");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAvaliarPost = async (postId, tipo) => {
    // Validação inicial
    if (!["LIKE", "DISLIKE"].includes(tipo)) {
      console.error("Tipo de avaliação inválido:", tipo);
      return;
    }

    try {
      // 1. Encontrar o post atual
      const currentPost = posts.find((p) => p.ID_FORUM_POST === postId);
      if (!currentPost) {
        console.error("Post não encontrado:", postId);
        return;
      }

      const avaliacaoAtual = currentPost.userAvaliacao;

      console.log("🎯 Iniciando avaliação:", {
        postId,
        tipoClicado: tipo,
        avaliacaoAtual,
        likesAtuais: currentPost.TOTAL_LIKES,
        dislikesAtuais: currentPost.TOTAL_DISLIKES,
      });

      // 2. Determinar ação baseada no estado atual
      let acao = "";
      let novoTipo = null;

      if (avaliacaoAtual === null) {
        // Usuário não avaliou ainda - adicionar nova avaliação
        acao = "adicionar";
        novoTipo = tipo;
      } else if (avaliacaoAtual === tipo) {
        // Usuário clicou na mesma avaliação - remover
        acao = "remover";
        novoTipo = null;
      } else {
        // Usuário mudou de avaliação - trocar
        acao = "trocar";
        novoTipo = tipo;
      }

      console.log("🔄 Ação determinada:", { acao, novoTipo });

      // 3. Calcular novos valores localmente
      let novosLikes = currentPost.TOTAL_LIKES;
      let novosDisikes = currentPost.TOTAL_DISLIKES;

      // Primeiro, reverter avaliação atual se existir
      if (avaliacaoAtual === "LIKE") {
        novosLikes = Math.max(0, novosLikes - 1);
      } else if (avaliacaoAtual === "DISLIKE") {
        novosDisikes = Math.max(0, novosDisikes - 1);
      }

      // Depois, aplicar nova avaliação se houver
      if (novoTipo === "LIKE") {
        novosLikes += 1;
      } else if (novoTipo === "DISLIKE") {
        novosDisikes += 1;
      }

      console.log("📊 Novos valores calculados:", {
        novosLikes,
        novosDisikes,
        novaAvaliacao: novoTipo,
      });

      // 4. Atualizar estado local de forma otimista
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.ID_FORUM_POST === postId
            ? {
                ...post,
                TOTAL_LIKES: novosLikes,
                TOTAL_DISLIKES: novosDisikes,
                userAvaliacao: novoTipo,
              }
            : post
        )
      );

      // 5. Enviar requisição para o servidor
      const response = await axios.post(
        `${URL}/api/forum/avaliacoes/post/${postId}`,
        { tipo: novoTipo }, // null se for para remover
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao processar avaliação");
      }

      console.log("✅ Resposta do servidor:", response.data);

      // 6. Opcional: Sincronizar com valores do servidor se fornecidos
      if (response.data.contadores) {
        console.log("🔄 Sincronizando com valores do servidor");
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.ID_FORUM_POST === postId
              ? {
                  ...post,
                  TOTAL_LIKES: response.data.contadores.likes,
                  TOTAL_DISLIKES: response.data.contadores.dislikes,
                  userAvaliacao:
                    response.data.action === "removed"
                      ? null
                      : response.data.tipo,
                }
              : post
          )
        );
      }

      console.log("🎉 Avaliação processada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao avaliar post:", error);

      // 7. Reverter mudanças locais em caso de erro
      console.log("🔙 Revertendo mudanças locais...");
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.ID_FORUM_POST === postId
            ? {
                ...post,
                TOTAL_LIKES: currentPost.TOTAL_LIKES,
                TOTAL_DISLIKES: currentPost.TOTAL_DISLIKES,
                userAvaliacao: currentPost.userAvaliacao,
              }
            : post
        )
      );

      // Mostrar erro ao usuário
      setError(
        error.response?.data?.message ||
          "Erro ao processar avaliação. Tente novamente."
      );
    }
  };

  const handleDenunciarPost = async () => {
    try {
      await axios.post(
        `${URL}/api/forum/denuncias/post/${postDenunciado.ID_FORUM_POST}`,
        denunciaData,
        { withCredentials: true }
      );

      setShowDenunciaModal(false);
      setPostDenunciado(null);
      setDenunciaData({ motivo: "", descricao: "" });
      alert("Denúncia enviada com sucesso");
    } catch (error) {
      console.error("Erro ao denunciar post:", error);
      alert("Erro ao enviar denúncia");
    }
  };

  const handleEditPost = async () => {
    try {
      await axios.put(
        `${URL}/api/forum/posts/${editingPost.ID_FORUM_POST}`,
        { conteudo: editContent },
        { withCredentials: true }
      );

      // Atualizar post localmente
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.ID_FORUM_POST === editingPost.ID_FORUM_POST
            ? { ...post, CONTEUDO: editContent, ESTADO: "Editado" }
            : post
        )
      );

      setEditingPost(null);
      setEditContent("");
    } catch (error) {
      console.error("Erro ao editar post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Tem certeza que deseja deletar este post?")) return;

    try {
      await axios.delete(`${URL}/api/forum/posts/${postId}`, {
        withCredentials: true,
      });

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.ID_FORUM_POST !== postId)
      );
      fetchTopico(); // Atualizar contadores
    } catch (error) {
      console.error("Erro ao deletar post:", error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setNovoPost((prev) => ({
      ...prev,
      anexos: [...prev.anexos, ...files],
    }));
  };

  const removeAnexo = (index) => {
    setNovoPost((prev) => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index),
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-PT");
  };

  const getFileIcon = (tipo) => {
    if (tipo.includes("image")) return "🖼️";
    if (tipo.includes("pdf")) return "📄";
    if (tipo.includes("word")) return "📝";
    return "📎";
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <AlertCircle size={24} className="mb-2" />
          <h5>{error}</h5>
          <button
            className="btn btn-primary mt-2"
            onClick={() => navigate("/forum")}
          >
            Voltar ao Fórum
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container p-4 mt-4">
        {/* Header do Tópico */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => navigate("/forum")}
            >
              <ChevronLeft size={16} className="me-1" />
              Voltar ao Fórum
            </button>

            <div className="card">
              <div className="card-body">
                <h2 className="mb-2">{topico?.TITULO}</h2>
                <p className="text-muted mb-3">{topico?.DESCRICAO}</p>

                {/* Breadcrumb */}
                <div className="d-flex align-items-center text-muted small mb-3">
                  <span>{topico?.Categoria?.NOME__}</span>
                  <ChevronRight size={14} className="mx-1" />
                  <span>{topico?.AREA?.NOME}</span>
                  <ChevronRight size={14} className="mx-1" />
                  <span>{topico?.TOPICO?.TITULO}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Criado por: <strong>{topico?.Criador?.NOME}</strong> em{" "}
                    {formatDate(topico?.DATA_CRIACAO)}
                  </small>
                  <small className="text-muted">
                    <MessageSquare size={14} className="me-1" />
                    {topico?.TOTAL_POSTS} posts
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário para Novo Post */}
        {user && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <Reply size={18} className="me-2" />
                    Participar da Discussão
                  </h6>
                </div>
                <form onSubmit={handleCreatePost}>
                  <div className="card-body">
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Partilhe o seu conhecimento ou faça uma pergunta..."
                        value={novoPost.conteudo}
                        onChange={(e) =>
                          setNovoPost((prev) => ({
                            ...prev,
                            conteudo: e.target.value,
                          }))
                        }
                        required
                        disabled={submittingPost}
                      />
                    </div>

                    {/* Anexos */}
                    {novoPost.anexos.length > 0 && (
                      <div className="mb-3">
                        <h6 className="small">Anexos:</h6>
                        {novoPost.anexos.map((file, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center justify-content-between bg-light p-2 rounded mb-2"
                          >
                            <span className="small">
                              {getFileIcon(file.type)} {file.name}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeAnexo(index)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={submittingPost}
                        >
                          <Paperclip size={16} className="me-1" />
                          Anexar Arquivo
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submittingPost || !novoPost.conteudo.trim()}
                      >
                        {submittingPost ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            A publicar...
                          </>
                        ) : (
                          <>
                            <Send size={16} className="me-1" />
                            Publicar post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Posts */}
        <div className="row">
          <div className="col-12">
            {posts.length === 0 ? (
              <div className="text-center py-5">
                <MessageSquare size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Ainda não há posts</h5>
                <p className="text-muted">
                  Seja o primeiro a participar desta discussão!
                </p>
              </div>
            ) : (
              <>
                {posts.map((post, index) => (
                  <div key={post.ID_FORUM_POST} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "40px", height: "40px" }}
                            >
                              <span className="fw-bold text-primary">
                                {post.UTILIZADOR?.NOME?.charAt(0) || "U"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h6 className="mb-0">
                              <a
                                href={`/user/${post.UTILIZADOR?.ID_UTILIZADOR}`}
                                className="text-decoration-none"
                              >
                                {post.UTILIZADOR?.NOME}
                              </a>
                            </h6>
                            <small className="text-muted me-2">
                              @{post.UTILIZADOR?.USERNAME}
                            </small>
                            <small className="text-muted">
                              {formatDate(post.DATA_CRIACAO)}
                              {post.ESTADO === "Editado" && (
                                <span className="ms-2 badge bg-secondary">
                                  Editado
                                </span>
                              )}
                            </small>
                          </div>
                        </div>

                        {user && (
                          <div className="dropdown position-relative">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => toggleDropdown(post.ID_FORUM_POST)}
                              type="button"
                            >
                              ⋯
                            </button>

                            {/* ✅ Dropdown menu controlado por estado */}
                            {dropdownAberto === post.ID_FORUM_POST && (
                              <ul
                                className="dropdown-menu show position-absolute"
                                style={{
                                  right: 0,
                                  left: "auto",
                                  zIndex: 1000,
                                  minWidth: "150px",
                                }}
                              >
                                {/* ✅ Opções do próprio usuário */}
                                {user.id === post.ID_UTILIZADOR && (
                                  <>
                                    <li>
                                      <button
                                        className="dropdown-item d-flex align-items-center"
                                        onClick={() => {
                                          setEditingPost(post);
                                          setEditContent(post.CONTEUDO);
                                          setDropdownAberto(null); // ✅ Fechar dropdown
                                        }}
                                      >
                                        <Edit size={16} className="me-2" />
                                        Editar
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item d-flex align-items-center text-danger"
                                        onClick={() => {
                                          handleDeletePost(post.ID_FORUM_POST);
                                          setDropdownAberto(null); // ✅ Fechar dropdown
                                        }}
                                      >
                                        <Trash2 size={16} className="me-2" />
                                        Deletar
                                      </button>
                                    </li>
                                    <li>
                                      <hr className="dropdown-divider" />
                                    </li>
                                  </>
                                )}

                                {/* ✅ Opção disponível para todos */}
                                <li>
                                  <button
                                    className="dropdown-item d-flex align-items-center"
                                    onClick={() => {
                                      setPostDenunciado(post);
                                      setShowDenunciaModal(true);
                                      setDropdownAberto(null); // ✅ Fechar dropdown
                                    }}
                                  >
                                    <Flag size={16} className="me-2" />
                                    Denunciar
                                  </button>
                                </li>
                              </ul>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Conteúdo do Post */}
                      {editingPost?.ID_FORUM_POST === post.ID_FORUM_POST ? (
                        <div className="mb-3">
                          <textarea
                            className="form-control mb-2"
                            rows="4"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                          <div>
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={handleEditPost}
                            >
                              Salvar
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingPost(null);
                                setEditContent("");
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="mb-3"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {post.CONTEUDO}
                        </div>
                      )}

                      {/* Anexos */}
                      {post.ANEXOS && post.ANEXOS.length > 0 && (
                        <div className="mb-3">
                          <h6 className="small">Anexos:</h6>
                          {post.ANEXOS.map((anexo, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center mb-2"
                            >
                              <span className="me-2">
                                {getFileIcon(anexo.tipo)}
                              </span>
                              <a
                                href={`${URL}${anexo.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                              >
                                {anexo.nome}
                              </a>
                              <a
                                href={`${URL}${anexo.url}`}
                                download={anexo.nome}
                                className="btn btn-outline-primary btn-sm ms-2"
                              >
                                <Download size={14} />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Avaliações */}
                      {user && (
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className={`btn btn-sm ${
                              post.userAvaliacao === "LIKE"
                                ? "btn-success"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              handleAvaliarPost(post.ID_FORUM_POST, "LIKE")
                            }
                            title={
                              post.userAvaliacao === "LIKE"
                                ? "Remover like"
                                : "Dar like"
                            }
                          >
                            <ThumbsUp
                              size={16}
                              className="me-1"
                              fill={
                                post.userAvaliacao === "LIKE"
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                            {post.TOTAL_LIKES}
                          </button>

                          <button
                            className={`btn btn-sm ${
                              post.userAvaliacao === "DISLIKE"
                                ? "btn-danger"
                                : "btn-outline-danger"
                            }`}
                            onClick={() =>
                              handleAvaliarPost(post.ID_FORUM_POST, "DISLIKE")
                            }
                            title={
                              post.userAvaliacao === "DISLIKE"
                                ? "Remover dislike"
                                : "Dar dislike"
                            }
                          >
                            <ThumbsDown size={16} className="me-1" />
                            {post.TOTAL_DISLIKES}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Carregar Mais Posts */}
                {pagination.hasMore && (
                  <div className="text-center">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => fetchPosts(pagination.currentPage + 1)}
                      disabled={loadingPosts}
                    >
                      {loadingPosts ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Carregando...
                        </>
                      ) : (
                        "Carregar Mais Posts"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Denúncia */}
        {showDenunciaModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog">
              <div className="modal-content" style={{ zIndex: 1051 }}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    <Flag size={20} className="me-2" />
                    Denunciar Post
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDenunciaModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Motivo da Denúncia *</label>
                    <select
                      className="form-select"
                      value={denunciaData.motivo}
                      onChange={(e) =>
                        setDenunciaData((prev) => ({
                          ...prev,
                          motivo: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Selecione um motivo</option>
                      <option value="Spam">Spam</option>
                      <option value="Conteudo_Inadequado">
                        Conteúdo Inadequado
                      </option>
                      <option value="Linguagem_Ofensiva">
                        Linguagem Ofensiva
                      </option>
                      <option value="Informacao_Falsa">Informação Falsa</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição (opcional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Descreva o problema..."
                      value={denunciaData.descricao}
                      onChange={(e) =>
                        setDenunciaData((prev) => ({
                          ...prev,
                          descricao: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDenunciaModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDenunciarPost}
                    disabled={!denunciaData.motivo}
                  >
                    <Flag size={16} className="me-1" />
                    Denunciar
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show">
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDenunciaModal(false)}
              ></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ForumTopicoView;
