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
} from "lucide-react";
import "./styles/gerirUsers.css";

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
    } finally {
      setLoading(false);
    }
  };

  // Buscar perfis disponíveis
  const getProfiles = async () => {
    try {
      const response = await axios.get(`${URL}/api/perfis`, {
        withCredentials: true,
      });
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
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
      user.UTILIZADOR_TEM_PERFILs?.some(
        (profile) => profile.PERFIL?.PERFIL === filterProfile
      );

    return matchesSearch && matchesProfile;
  });

  // Função para editar utilizador
  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      selectedProfiles:
        user.UTILIZADOR_TEM_PERFILs?.map((p) => p.ID_PERFIL) || [],
    });
  };

  // Função para salvar alterações
  const handleSaveUser = async () => {
    try {
      const updateData = {
        NOME: editingUser.NOME,
        EMAIL: editingUser.EMAIL,
        LINKEDIN: editingUser.LINKEDIN,
        profiles: editingUser.selectedProfiles,
      };

      await axios.put(
        `${URL}/api/user/${editingUser.ID_UTILIZADOR}`,
        updateData,
        {
          withCredentials: true,
        }
      );

      // Atualizar lista de utilizadores
      await getUsers();
      setEditingUser(null);

      alert("Utilizador atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Erro ao atualizar utilizador");
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Função para desativar/ativar utilizador
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `${URL}/api/user/${userId}/toggle-status`,
        {},
        {
          withCredentials: true,
        }
      );

      await getUsers();
      alert(
        `Utilizador ${currentStatus ? "desativado" : "ativado"} com sucesso!`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Erro ao alterar status do utilizador");
    }
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className="dashboard-content mt-4 p-4">
        <div className="container-fluid">
          <div className="users-management-header">
            <h2 className="users-title">
              <User className="me-2" size={28} />
              Gerir Utilizadores
            </h2>
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

          {/* Tabela de Utilizadores */}
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
                      <th>Perfil(s)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.ID_UTILIZADOR}>
                        <td>
                          <div className="user-info d-flex align-items-center">
                            <div className="me-3">
                              <User size={20} />
                            </div>
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
                            <Mail size={16} className="me-2 text-muted" />
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
                              <Linkedin size={16} className="me-1" />
                              Ver Perfil
                            </a>
                          ) : (
                            <span className="text-muted">Não informado</span>
                          )}
                        </td>
                        <td>
                          <div className="user-profiles">
                            {user.UTILIZADOR_TEM_PERFILs?.map(
                              (profile, index) => (
                                <span
                                  key={index}
                                  className={`badge profile-badge profile-${profile.PERFIL?.PERFIL?.toLowerCase()}`}
                                >
                                  {profile.PERFIL?.PERFIL}
                                </span>
                              )
                            ) || (
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
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className={`btn btn-sm ${
                                user.ATIVO
                                  ? "btn-outline-danger"
                                  : "btn-outline-success"
                              }`}
                              onClick={() =>
                                handleToggleUserStatus(
                                  user.ID_UTILIZADOR,
                                  user.ATIVO
                                )
                              }
                              title={
                                user.ATIVO
                                  ? "Desativar utilizador"
                                  : "Ativar utilizador"
                              }
                            >
                              {user.ATIVO ? (
                                <XCircle size={14} />
                              ) : (
                                <CheckCircle size={14} />
                              )}
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
                    <label className="form-label">Perfis</label>
                    <div className="profiles-checkboxes">
                      {profiles.map((profile) => (
                        <div key={profile.ID_PERFIL} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`profile-${profile.ID_PERFIL}`}
                            checked={editingUser.selectedProfiles.includes(
                              profile.ID_PERFIL
                            )}
                            onChange={(e) => {
                              const profileId = profile.ID_PERFIL;
                              let newProfiles = [
                                ...editingUser.selectedProfiles,
                              ];

                              if (e.target.checked) {
                                newProfiles.push(profileId);
                              } else {
                                newProfiles = newProfiles.filter(
                                  (id) => id !== profileId
                                );
                              }

                              setEditingUser({
                                ...editingUser,
                                selectedProfiles: newProfiles,
                              });
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`profile-${profile.ID_PERFIL}`}
                          >
                            {profile.PERFIL}
                          </label>
                        </div>
                      ))}
                    </div>
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
                >
                  Guardar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingUser && <div className="modal-backdrop show"></div>}
    </>
  );
}

export default GerirUsers;
