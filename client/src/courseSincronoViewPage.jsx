import React, { useState } from "react";
import { useParams } from "react-router-dom";
import NavbarDashboard from "./components/navbarDashboard";
import AvaliacoesSincronas from "./components/avaliacoesSincronas";

const SynchronousCourseView = () => {
  const [activeTab, setActiveTab] = useState("aulas");
  const { courseId } = useParams();

  return (
    <>
      <div className="container-fluid p-0">
        <NavbarDashboard />
        <div className="container mt-4">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
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
                <div className="aulas-content">
                  <h5>Próximas Aulas</h5>
                  {/* Lista de aulas agendadas */}
                </div>
              )}

              {activeTab === "trabalhos" && (
                <div className="trabalhos-content">
                  <h5>Trabalhos do Curso</h5>
                  {/* Lista de trabalhos */}
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
        </div>
      </div>
    </>
  );
};

export default SynchronousCourseView;
