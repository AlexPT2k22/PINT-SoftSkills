import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  User,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Star,
  Mail,
  Linkedin,
  Users,
  Trophy,
  Clock,
  ExternalLink,
} from "lucide-react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import "./styles/userPage.css";

function UserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile data
        const userResponse = await axios.get(
          `http://localhost:4000/api/user/${userId}`
        );
        setUser(userResponse.data);
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
                    <h1 className="h3 mb-2 fw-bold">
                      {user.NOME || user.USERNAME}
                    </h1>
                    <p className="text-muted mb-0">@{user.USERNAME}</p>
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
                      {user.EMAIL && (
                        <a
                          href={`mailto:${user.EMAIL}`}
                          className="btn btn-outline-secondary btn-sm"
                        >
                          <Mail size={16} className="me-1" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="profile-tabs card border-1">
            <div className="card-body p-4">
              {/* About Tab */}
              <div className="about-section">
                <div className="row">
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-3">Biografia</h5>
                    {user.bio ? (
                      <p className="text-muted">{user.bio}</p>
                    ) : (
                      <p className="text-muted fst-italic">
                        Este utilizador ainda não adicionou uma biografia.
                      </p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <h5 className="fw-bold mb-3">Informações</h5>
                    <div className="info-list">
                      <div className="info-item d-flex align-items-center mb-2">
                        <Users size={16} className="me-2 text-muted" />
                        <span className="text-muted">@{user.USERNAME}</span>
                      </div>
                      <div className="info-item d-flex align-items-center mb-2">
                        <Calendar size={16} className="me-2 text-muted" />
                        <span className="text-muted">
                          Ativo desde {formatDate(user.DATA_CRIACAO)}
                        </span>
                      </div>
                      {user.ULTIMO_LOGIN && (
                        <div className="info-item d-flex align-items-center mb-2">
                          <Clock size={16} className="me-2 text-muted" />
                          <span className="text-muted">
                            Última atividade: {formatDate(user.ULTIMO_LOGIN)}
                          </span>
                        </div>
                      )}
                    </div>
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
