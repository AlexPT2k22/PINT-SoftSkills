import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  User,
  Calendar,
  BookOpen,
  Star,
  Linkedin,
  Users,
  Trophy,
  Clock,
  CheckCircle,
} from "lucide-react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import "./styles/userPage.css";

const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile data and statistics
        const [userResponse, statisticsResponse] = await Promise.all([
          axios.get(`${URL}/api/user/${userId}`),
          axios.get(`${URL}/api/user/${userId}/statistics`),
        ]);

        setUser(userResponse.data);
        setStatistics(statisticsResponse.data);
      } catch (err) {
        console.error("Erro ao carregar dados do utilizador:", err);
        setError("Utilizador não encontrado ou erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getXPLevel = (xp) => {
    if (xp >= 1000) return { level: "✨Lendário✨", color: "gold" };
    if (xp >= 500) return { level: "Avançado", color: "purple" };
    if (xp >= 250) return { level: "Intermédio", color: "blue" };
    return { level: "Iniciante", color: "green" };
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 pt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">A carregar...</span>
          </div>
          <p className="mt-3 text-muted">A carregar perfil do utilizador...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 pt-5 text-center">
          <div className="alert alert-danger">
            <h4>Erro</h4>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const xpLevel = getXPLevel(statistics?.xp || 0);

  return (
    <>
      <Navbar />
      <div className="user-page-container">
        <div className="container py-5">
          {/* User Header */}
          <div className="user-header-card card border-1 mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="user-avatar">
                    <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center">
                      <User size={48} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div>
                    <h1 className="h3 mb-0 fw-bold">
                      {user.NOME || user.USERNAME}
                    </h1>
                    <p className="text-muted mb-0">@{user.USERNAME}</p>

                    {/* XP e Level Badge */}
                    <div className="mt-2">
                      <span className={`badge bg-outline-${xpLevel.color}`}>
                        Nível: {xpLevel.level}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="user-links mt-3 d-flex gap-2">
                      {user.LINKEDIN && (
                        <a
                          href={user.LINKEDIN}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          <Linkedin size={16} className="me-1" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics and Info */}
          <div className="row g-4">
            {/* Statistics Cards */}
            <div className="col-md-8">
              <div className="card border-1">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Estatísticas de Aprendizagem</h5>

                  <div className="row g-3">
                    {/* XP Card */}
                    <div className="col-md-6">
                      <div className="stat-card border p-3 rounded">
                        <div className="d-flex align-items-center">
                          <div className="stat-icon me-3">
                            <Trophy size={24} className="text-primary" />
                          </div>
                          <div>
                            <h6 className="mb-0 text-primary">
                              Experiência (XP)
                            </h6>
                            <h4 className="mb-0 fw-bold">
                              {statistics?.xp || 0}
                            </h4>
                            <small className="text-muted">
                              Pontos acumulados
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nota Média Card */}
                    <div className="col-md-6">
                      <div className="stat-card border p-3 rounded">
                        <div className="d-flex align-items-center">
                          <div className="stat-icon me-3">
                            <Star size={24} className="text-success" />
                          </div>
                          <div>
                            <h6 className="mb-0 text-success">Nota Média</h6>
                            <h4 className="mb-0 fw-bold">
                              {statistics?.notaMedia
                                ? `${statistics.notaMedia.toFixed(1)}/20`
                                : "N/A"}
                            </h4>
                            <small className="text-muted">
                              {statistics?.totalAvaliacoes || 0} avaliação
                              {statistics?.totalAvaliacoes !== 1 ? "ões" : ""}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Cursos Card */}
                    <div className="col-md-6">
                      <div className="stat-card border p-3 rounded">
                        <div className="d-flex align-items-center">
                          <div className="stat-icon me-3">
                            <BookOpen size={24} className="text-info" />
                          </div>
                          <div>
                            <h6 className="mb-0 text-info">Cursos Inscritos</h6>
                            <h4 className="mb-0 fw-bold">
                              {statistics?.totalCursos || 0}
                            </h4>
                            <small className="text-muted">
                              Total de inscrições
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cursos Completados Card */}
                    <div className="col-md-6">
                      <div className="stat-card border p-3 rounded">
                        <div className="d-flex align-items-center">
                          <div className="stat-icon me-3">
                            <CheckCircle size={24} className="text-warning" />
                          </div>
                          <div>
                            <h6 className="mb-0 text-warning">
                              Cursos Completados
                            </h6>
                            <h4 className="mb-0 fw-bold">
                              {statistics?.cursosCompletados || 0}
                            </h4>
                            <small className="text-muted">
                              {statistics?.totalCursos > 0
                                ? Math.round(
                                    (statistics.cursosCompletados /
                                      statistics.totalCursos) *
                                      100
                                  )
                                : 0}
                              % de conclusão
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {statistics?.totalCursos > 0 && (
                    <div className="mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">
                          Progresso Geral
                        </span>
                        <span className="text-muted small">
                          {Math.round(
                            (statistics.cursosCompletados /
                              statistics.totalCursos) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{
                            width: `${Math.round(
                              (statistics.cursosCompletados /
                                statistics.totalCursos) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="col-md-4">
              <div className="card border-1">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Informações do Utilizador</h5>
                  <div className="info-list">
                    <div className="info-item d-flex align-items-center mb-3">
                      <Users size={16} className="me-2 text-muted" />
                      <div>
                        <small className="text-muted d-block">
                          Nome de utilizador
                        </small>
                        <span>@{user.USERNAME}</span>
                      </div>
                    </div>

                    <div className="info-item d-flex align-items-center mb-3">
                      <Calendar size={16} className="me-2 text-muted" />
                      <div>
                        <small className="text-muted d-block">
                          Membro desde
                        </small>
                        <span>{formatDate(user.DATA_CRIACAO)}</span>
                      </div>
                    </div>

                    {user.ULTIMO_LOGIN && (
                      <div className="info-item d-flex align-items-center mb-3">
                        <Clock size={16} className="me-2 text-muted" />
                        <div>
                          <small className="text-muted d-block">
                            Última atividade
                          </small>
                          <span>{formatDate(user.ULTIMO_LOGIN)}</span>
                        </div>
                      </div>
                    )}

                    {/* Perfil do utilizador */}
                    {user.PERFILs && user.PERFILs.length > 0 && (
                      <div className="info-item">
                        <small className="text-muted d-block mb-2">
                          Perfil
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                          {user.PERFILs.map((perfil) => (
                            <span
                              key={perfil.ID_PERFIL}
                              className="badge bg-secondary"
                            >
                              {perfil.PERFIL}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UserPage;
