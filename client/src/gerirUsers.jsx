import React, { useEffect, useState } from "react";
import NavbarDashboard from "./components/navbarDashboard";
import Sidebar from "./components/sidebar";
import axios from "axios";
import {
  Edit,
  Eye,
  UserX,
  CheckCircle,
  XCircle,
  Linkedin,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";
import "./styles/gerirUsers.css";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";

const URL =
  import.meta.env.PROD === "production"
    ? "https://pint-softskills-api.onrender.com"
    : "http://localhost:4000";

function GerirUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loadingButton, setLoadingButton] = useState(false);

  // Estados para mensagens
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Função para mostrar mensagem de sucesso
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Função para mostrar mensagem de erro
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => setShowErrorMessage(false), 5000);
  };

  // Buscar utilizadores
  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/api/user`, {
        withCredentials: true,
      });
      setUsers(response.data);
      console.log("Users:", response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  // Buscar perfis disponíveis
  const getProfiles = async () => {
    try {
      const response = await axios.get(`${URL}/api/user/profiles`, {
        withCredentials: true,
      });
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      showError("Erro ao carregar perfis");
    }
  };

  useEffect(() => {
    getUsers();
    getProfiles();
  }, []);

  // Filtrar utilizadores
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.NOME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.USERNAME?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProfile =
      filterProfile === "" ||
      (user.PERFILs &&
        user.PERFILs.length > 0 &&
        user.PERFILs[0].PERFIL === filterProfile);

    return matchesSearch && matchesProfile;
  });

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      selectedProfile: user.PERFILs?.[0]?.ID_PERFIL || null,
    });
  };

  // Função para salvar alterações
  const handleSaveUser = async () => {
    try {
      setLoadingButton(true);
      const updateData = {
        NOME: editingUser.NOME,
        EMAIL: editingUser.EMAIL,
        LINKEDIN: editingUser.LINKEDIN,
        profileId: editingUser.selectedProfile,
      };

      await axios.put(
        `${URL}/api/user/${editingUser.ID_UTILIZADOR}`,
        updateData,
        {
          withCredentials: true,
        }
      );

      await getUsers();
      setEditingUser(null);
      showSuccess("Utilizador atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating user:", error);
      showError("Erro ao atualizar utilizador. Verifique os dados inseridos.");
    } finally {
      setLoadingButton(false);
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className="container t-4 p-4">
        <div className="container">
          {/* Componentes de Mensagem */}
          {showSuccessMessage && (
            <SuccessMessage
              message={successMessage}
              onClose={() => setShowSuccessMessage(false)}
            />
          )}
          {showErrorMessage && (
            <ErrorMessage
              message={errorMessage}
              onClose={() => setShowErrorMessage(false)}
            />
          )}

          <div className="users-management-header">
            <h2 className="users-title">
              <User className="me-2" size={28} />
              Gerir Utilizadores
            </h2>
            <p className="users-subtitle">
              Gerencie os utilizadores, perfis e permissões do sistema
            </p>
          </div>

          {/* Filtros e Pesquisa */}
          <div className="users-filters-section">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="search-box">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar por nome, email ou username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterProfile}
                  onChange={(e) => setFilterProfile(e.target.value)}
                >
                  <option value="">Todos os perfis</option>
                  {profiles.map((profile) => (
                    <option key={profile.ID_PERFIL} value={profile.PERFIL}>
                      {profile.PERFIL}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <div className="users-stats">
                  <span className="badge bg-primary">
                    {filteredUsers.length} utilizadores
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="users-table-section">
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">A carregar...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover users-table">
                  <thead>
                    <tr>
                      <th>Utilizador</th>
                      <th>Email</th>
                      <th>LinkedIn</th>
                      <th>Perfil</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.ID_UTILIZADOR}>
                        <td>
                          <div className="user-info d-flex align-items-center">
                            <div className="user-details">
                              <div className="user-name">
                                {user?.NOME || "Sem nome"}
                              </div>
                              <div className="user-username">
                                @{user.USERNAME}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {user.EMAIL}
                          </div>
                        </td>
                        <td>
                          {user.LINKEDIN ? (
                            <a
                              href={user.LINKEDIN}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="linkedin-link"
                            >
                              Ver Perfil
                            </a>
                          ) : (
                            <span className="text-muted">Não informado</span>
                          )}
                        </td>
                        <td>
                          <div className="user-profiles">
                            {user.PERFILs && user.PERFILs.length > 0 ? (
                              <span
                                className={`badge profile-badge profile-${user.PERFILs[0].PERFIL.toLowerCase()}`}
                              >
                                {user.PERFILs[0].PERFIL}
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                Sem perfil
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEditUser(user)}
                              title="Editar utilizador"
                              disabled={loadingButton}
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center p-4">
                    <UserX size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Nenhum utilizador encontrado</h5>
                    <p className="text-muted">
                      Tente ajustar os filtros de pesquisa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Utilizador</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelEdit}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Nome Completo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.NOME || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, NOME: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editingUser.EMAIL || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          EMAIL: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      className="form-control"
                      value={editingUser.LINKEDIN || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          LINKEDIN: e.target.value,
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Perfil</label>
                    <select
                      className="form-select"
                      value={editingUser.selectedProfile || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          selectedProfile: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                    >
                      <option value="">Selecionar perfil</option>
                      {profiles.map((profile) => (
                        <option
                          key={profile.ID_PERFIL}
                          value={profile.ID_PERFIL}
                        >
                          {profile.PERFIL}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveUser}
                  disabled={
                    !editingUser.NOME || !editingUser.EMAIL || loadingButton
                  }
                >
                  {loadingButton ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop para os modais */}
      {editingUser && <div className="modal-backdrop show"></div>}
    </>
  );
}

export default GerirUsers;
