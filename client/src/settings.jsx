import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Linkedin, Mail, Lock, Save, X, CheckCircle } from "lucide-react";
import useAuthStore from "./store/authStore.js";
import axios from "axios";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import Sidebar from "./components/sidebar.jsx";
import "./styles/settings.css";
import SuccessMessage from "./components/sucess_message.jsx";
import ErrorMessage from "./components/error_message.jsx";

function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    linkedIn: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const userId = user.id;
  const [loadingData, setLoadingData] = useState(true);
  const [userData, setUserData] = useState(null);

  const checkLinkedInUrl = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    return regex.test(url);
  };

  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get(
        `http://localhost:4000/api/user/${userId}`,
        {
          withCredentials: true,
        }
      );

      const userData = response.data;
      setUserData(userData);

      // Preencher formulário com dados da base de dados
      setFormData((prev) => ({
        ...prev,
        nome: userData.NOME || "",
        linkedIn: userData.LINKEDIN || "",
        email: userData.EMAIL || "",
      }));
    } catch (error) {
      console.error("Erro ao carregar dados do utilizador:", error);
      setError("Erro ao carregar dados do utilizador");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("As passwords não coincidem");
      setLoading(false);
      return;
    }
    if (formData.linkedIn && !checkLinkedInUrl(formData.linkedIn)) {
      setError("O URL do LinkedIn não é válido");
      setLoading(false);
      return;
    }
    if (!formData.nome) {
      setError("O nome é obrigatório");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `http://localhost:4000/api/user/change-name`,
        {
          nome: formData.nome,
          linkedIn: formData.linkedIn,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Recarregar dados da base de dados após salvar
      await fetchUserData();

      // Redefinir campos de password
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Exibir mensagem de sucesso
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      {error && (
        <ErrorMessage
          message={error}
          onClose={() => setError("")}
          duration={3000}
        />
      )}

      {success && (
        <SuccessMessage
          message="Alterações guardadas com sucesso!"
          onClose={() => setSuccess(false)}
          duration={3000}
        />
      )}
      <div className={`container mt-4 p-4 `}>
        <div className="settings-container">
          <h2 className="mb-4">Definições</h2>

          <div className="row">
            {/* Perfil do utilizador */}
            <div className="col-lg-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="user-avatar mx-auto mb-3">
                    {/* Placeholder para imagem do utilizador */}
                    <div className="avatar-placeholder-settings">
                      <User size={50} color="#39639C" />
                    </div>
                  </div>
                  <h4 className="mb-1">
                    {userData?.NOME || userData?.USERNAME}
                  </h4>
                  <p className="text-muted mb-2">@{userData?.USERNAME}</p>

                  {userData?.LINKEDIN && (
                    <a
                      href={userData.LINKEDIN}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <span className="d-flex align-items-center">
                        Ver perfil LinkedIn
                      </span>
                    </a>
                  )}
                  <a
                    href={`http://localhost:5173/user/${userData?.ID_UTILIZADOR}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm ms-2"
                  >
                    <span className="d-flex align-items-center">
                      Ver perfil público
                    </span>
                  </a>
                  <hr className="my-4" />

                  <div className="text-start">
                    <p className="mb-1">
                      <strong>Membro desde:</strong>
                    </p>
                    <p className="text-muted">
                      {new Date(
                        userData?.DATA_CRIACAO || new Date()
                      ).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <div className="text-start">
                    <p className="mb-1">
                      <strong>XP:</strong>
                    </p>
                    <p className="text-muted">{userData?.XP || "N/A"} pontos</p>
                  </div>
                  <div className="text-start">
                    <p className="mb-1">
                      <strong>Perfil:</strong>
                    </p>
                    <p className="text-muted">
                      {userData?.PERFILs[0].ID_PERFIL === 3
                        ? "Gestor"
                        : userData?.PERFILs[0].ID_PERFIL === 2
                        ? "Formador"
                        : "Formando"}{" "}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de configurações */}
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSaveChanges}>
                    <h5 className="card-title mb-4">Informações da Conta</h5>

                    <div className="mb-4">
                      <label className="form-label">Nome</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">LinkedIn</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Linkedin size={18} />
                        </span>
                        <input
                          type="url"
                          className="form-control"
                          name="linkedIn"
                          value={formData.linkedIn}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Email</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                      <small className="text-muted">
                        O email não pode ser alterado
                      </small>
                    </div>

                    <hr className="my-4" />
                    <h5 className="card-title mb-4">Alterar Password</h5>

                    <div className="mb-3">
                      <label className="form-label">Password atual</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Nova password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        Confirmar nova password
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-2"
                        onClick={() => navigate("/dashboard")}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            A guardar...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="me-2" />
                            Guardar alterações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
