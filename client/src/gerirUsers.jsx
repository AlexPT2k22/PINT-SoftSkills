import React, { useEffect, useState } from "react";
import NavbarDashboard from "./components/navbarDashboard";
import Sidebar from "./components/sidebar";
import axios from "axios";
import { Edit, UserX, UserPlus } from "lucide-react";
import "./styles/gerirUsers.css";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function GerirUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loadingButton, setLoadingButton] = useState(false);

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    NOME: "",
    EMAIL: "",
  });
  const [addingTeacher, setAddingTeacher] = useState(false);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => setShowErrorMessage(false), 5000);
  };

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

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    if (!teacherForm.NOME.trim() || !teacherForm.EMAIL.trim()) {
      showError("Nome e email são obrigatórios");
      return;
    }

    try {
      setAddingTeacher(true);

      const response = await axios.post(
        `${URL}/api/user/add-teacher`,
        teacherForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        showSuccess("Formador adicionado com sucesso! Email enviado.");
        setTeacherForm({ NOME: "", EMAIL: "" });
        setShowAddTeacher(false);
        await getUsers();
      }
    } catch (error) {
      console.error("Erro ao adicionar formador:", error);
      showError(error.response?.data?.message || "Erro ao adicionar formador");
    } finally {
      setAddingTeacher(false);
    }
  };

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
    const originalData = {
      NOME: user.NOME,
      EMAIL: user.EMAIL,
      LINKEDIN: user.LINKEDIN,
      selectedProfile: user.PERFILs?.[0]?.ID_PERFIL || null,
    };

    setEditingUser({
      ...user,
      selectedProfile: user.PERFILs?.[0]?.ID_PERFIL || null,
      originalData: originalData,
    });
  };

  const handleSaveUser = async () => {
    try {
      setLoadingButton(true);

      if (editingUser.NOME !== editingUser.originalData?.NOME) {
        updateData.NOME = editingUser.NOME;
      }

      if (editingUser.EMAIL !== editingUser.originalData?.EMAIL) {
        updateData.EMAIL = editingUser.EMAIL;
      }

      if (editingUser.LINKEDIN !== editingUser.originalData?.LINKEDIN) {
        updateData.LINKEDIN = editingUser.LINKEDIN;
      }

      if (
        editingUser.selectedProfile !==
        editingUser.originalData?.selectedProfile
      ) {
        updateData.profileId = editingUser.selectedProfile;
      }

      const response = await axios.put(
        `${URL}/api/user/${editingUser.ID_UTILIZADOR}`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        await getUsers();
        setEditingUser(null);

        const { updated } = response.data;
        let message = "Utilizador atualizado com sucesso!";

        if (updated.dadosPessoais && updated.perfil) {
          message += " (Dados pessoais e perfil alterados)";
        } else if (updated.dadosPessoais) {
          message += " (Dados pessoais alterados)";
        } else if (updated.perfil) {
          message += " (Perfil alterado)";
        }

        showSuccess(message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMsg =
        error.response?.data?.message || "Erro ao atualizar utilizador";

      if (errorMsg.includes("cursos associados")) {
        showError(`${errorMsg}`);
      } else if (errorMsg.includes("Email já está em uso")) {
        showError("Este email já está a ser usado por outro utilizador");
      } else {
        showError(`${errorMsg}`);
      }
    } finally {
      setLoadingButton(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar />
      <div className="container mt-4 p-4">
        <div className="container">
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
            <h2 className="users-title">Gerir Utilizadores</h2>
          </div>

          <div className="users-filters-section">
            <div className="row g-3">
              <div className="col-md-5">
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
                <button
                  className="btn btn-primary add-teacher-button"
                  onClick={() => setShowAddTeacher(true)}
                  disabled={loading}
                >
                  <UserPlus size={16} className="me-2" />
                  Adicionar Formador
                </button>
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
              <div
                className="table-responsive"
                style={{ overflowX: "auto", maxWidth: "100%" }}
              >
                <table
                  className="table table-hover users-table"
                  style={{ minWidth: "800px" }}
                >
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
                                <a
                                  className="text-secondary"
                                  href={`/user/${user.ID_UTILIZADOR}`}
                                >
                                  @{user.USERNAME}
                                </a>
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

      {showAddTeacher && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header text-white">
                <h5 className="modal-title">Adicionar novo formador</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddTeacher(false)}
                  disabled={addingTeacher}
                ></button>
              </div>

              <form onSubmit={handleAddTeacher}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Informação:</strong>
                    <ul className="mb-0 mt-2">
                      <li>
                        O formador receberá um email com as credenciais de
                        acesso
                      </li>
                      <li>
                        Uma password temporária será gerada automaticamente
                      </li>
                      <li>
                        O formador deve alterar a password no primeiro login
                      </li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Nome Completo *</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={teacherForm.NOME}
                      onChange={(e) =>
                        setTeacherForm({ ...teacherForm, NOME: e.target.value })
                      }
                      placeholder="Ex: João Silva"
                      required
                      disabled={addingTeacher}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Email *</strong>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={teacherForm.EMAIL}
                      onChange={(e) =>
                        setTeacherForm({
                          ...teacherForm,
                          EMAIL: e.target.value,
                        })
                      }
                      placeholder="Ex: joao.silva@empresa.com"
                      required
                      disabled={addingTeacher}
                    />
                    <small className="text-muted">
                      O username será gerado automaticamente baseado no email
                    </small>
                  </div>

                  <div className="alert alert-warning">
                    <strong>Importante:</strong> Certifique-se de que o email
                    está correto, pois as credenciais de acesso serão enviadas
                    para este endereço.
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddTeacher(false)}
                    disabled={addingTeacher}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      addingTeacher ||
                      !teacherForm.NOME.trim() ||
                      !teacherForm.EMAIL.trim()
                    }
                  >
                    {addingTeacher ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        A criar conta...
                      </>
                    ) : (
                      <>Criar Formador</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

      {editingUser && <div className="modal-backdrop show"></div>}
    </>
  );
}

export default GerirUsers;
