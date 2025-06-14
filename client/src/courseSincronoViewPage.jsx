import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import NavbarDashboard from "./components/navbarDashboard";
import AvaliacoesSincronas from "./components/avaliacoesSincronas";
import AulasSincronas from "./components/aulasSincronas";
import axios from "axios";
import useAuthStore from "./store/authStore";
import Sidebar from "./components/sidebar";
import AnunciosView from "./components/anunciosSincronos";

const SynchronousCourseView = () => {
  const [activeTab, setActiveTab] = useState("aulas");
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const [isTeacher, setIsTeacher] = useState(false);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore.getState();
  const tab = searchParams.get("tab");

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

        const teacherResponse = await axios.get(
          `http://localhost:4000/api/cursos/verify-teacher/${courseId}`,
          {
            withCredentials: true,
          }
        );

        console.log("Resposta do servidor:", teacherResponse.data);

        if (teacherResponse.data.success && teacherResponse.data.isTeacher) {
          setIsTeacher(true);
          console.log("Utilizador é formador do curso");
        } else {
          setIsTeacher(false);
          console.log("Utilizador NÃO é formador do curso");
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar formador:", error);
        setLoading(false);
      }
    };

    if (tab) {
      setActiveTab(tab);
    }

    verificarFormador();
  }, [courseId]);

  return (
    <>
      <div className="container-fluid p-0">
        <NavbarDashboard />
        <Sidebar onToggle={handleSidebarToggle} />
        <div className={`container mt-4 p-4 `}>
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">A carregar...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="course-header mb-4">
                <h2 className="mb-3">{curso?.NOME || "Curso Síncrono"}</h2>
                <ul className="nav nav-tabs">
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
                        activeTab === "avaliacoes" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("avaliacoes")}
                    >
                      Avaliações
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${
                        activeTab === "anuncios" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("anuncios")}
                    >
                      Anúncios
                    </button>
                  </li>
                </ul>
              </div>

              <div className="course-content mt-4">
                {activeTab === "aulas" && (
                  <AulasSincronas cursoId={courseId} isTeacher={isTeacher} />
                )}

                {activeTab === "avaliacoes" && (
                  <AvaliacoesSincronas
                    cursoId={courseId}
                    isTeacher={isTeacher}
                  />
                )}

                {activeTab === "anuncios" && (
                  <AnunciosView cursoId={courseId} isTeacher={true} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SynchronousCourseView;
