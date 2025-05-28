import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Linkedin, 
  Mail, 
  Lock, 
  Save, 
  X, 
  CheckCircle 
} from "lucide-react";
import useAuthStore from "./store/authStore.js";
import axios from "axios";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import Sidebar from "./components/sidebar.jsx";
import "./styles/settings.css";

function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true
  });

  useEffect(() => {
    // Carregar dados do usuário ao inicializar
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validar formulário
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("As passwords não coincidem");
      setLoading(false);
      return;
    }

    try {
      // Exemplo de chamada API para salvar alterações
      // Substituir com chamada real à API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação de chamada
      
      // Exemplo de atualização do store
      // useAuthStore.getState().updateUser({ ...user, nome: formData.nome });
      
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
      
      <div className={`container mt-4 p-4 ${collapsed ? "" : "sidebar-active"}`}>
        <div className="settings-container">
          <h2 className="mb-4">Definições</h2>
          
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <X size={20} className="me-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <CheckCircle size={20} className="me-2" />
              Alterações guardadas com sucesso!
            </div>
          )}
          
          <div className="row">
            {/* Perfil do utilizador */}
            <div className="col-lg-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="user-avatar mx-auto mb-3">
                    {/* Placeholder para imagem do utilizador */}
                    <div className="avatar-placeholder">
                      <User size={50} color="#39639C" />
                    </div>
                  </div>
                  <h4 className="mb-1">{user?.nome || user?.username}</h4>
                  <p className="text-muted mb-2">@{user?.username}</p>
                  
                  {user?.linkedin && (
                    <a 
                      href={user.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <Linkedin size={16} className="me-1" />
                      Ver perfil LinkedIn
                    </a>
                  )}
                  
                  <hr className="my-4" />
                  
                  <div className="text-start">
                    <p className="mb-1"><strong>Membro desde:</strong></p>
                    <p className="text-muted">
                      {new Date(user?.dataCriacao || new Date()).toLocaleDateString('pt-PT')}
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
                      <small className="text-muted">O email não pode ser alterado</small>
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
                      <label className="form-label">Confirmar nova password</label>
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
                    
                    <hr className="my-4" />
                    <h5 className="card-title mb-4">Preferências de Notificações</h5>
                    
                    <div className="form-check form-switch mb-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotifications"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="emailNotifications">
                        Receber notificações por email
                      </label>
                      <div className="text-muted small">
                        Receba emails sobre atualizações de cursos, novas aulas e avisos importantes
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
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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