import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavbarDashboard from "./components/navbarDashboard";
import AvaliacoesSincronas from "./components/avaliacoesSincronas";
import AulasSincronas from "./components/aulasSincronas";
import axios from "axios";
import useAuthStore from "./store/authStore";
import Sidebar from "./components/sidebar";

const SynchronousCourseView = () => {
  const [activeTab, setActiveTab] = useState("aulas");
  const { courseId } = useParams();
  const [isTeacher, setIsTeacher] = useState(false);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore.getState();
  const Teacher = user?.perfil === 2 || user?.perfil === 3;
  const userId = user?.id || null;
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  useEffect(() => {
    const verificarFormador = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/cursos/${courseId}`,
          {
            withCredentials: true,
          }
        );
        setCurso(response.data);

        if (Teacher) {
          setIsTeacher(true);
        } else {
          setIsTeacher(false);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar formador:", error);
        setLoading(false);
      }
    };

    verificarFormador();
  }, [courseId]);

  return (
    <>
      <div className="container-fluid p-0">
        <NavbarDashboard />
        <Sidebar onToggle={handleSidebarToggle} />
        <div className="container mt-4">
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">{curso?.NOME || "Curso Síncrono"}</h4>
                <ul className="nav nav-tabs card-header-tabs mt-2">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "aulas" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("aulas")}
                    >
                      Aulas
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "trabalhos" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("trabalhos")}
                    >
                      Trabalhos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "avaliacoes" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("avaliacoes")}
                    >
                      Avaliações
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                {activeTab === "aulas" && (
                  <AulasSincronas cursoId={courseId} isTeacher={isTeacher} />
                )}

                {activeTab === "trabalhos" && (
                  <div className="trabalhos-content">
                    <h5>Trabalhos do Curso</h5>
                    {/* Implementar componente de trabalhos */}
                  </div>
                )}

                {activeTab === "avaliacoes" && (
                  <div className="avaliacoes-content">
                    <h5>Avaliações do Curso</h5>
                    <AvaliacoesSincronas cursoId={courseId} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SynchronousCourseView;
