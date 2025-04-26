import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import ButtonWithLoader from "./components/butao_loader";

function CreateCourse() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [error, setError] = useState(null);
  const [courseDescription, setCourseDescription] = useState("");

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      NOME: courseName,
      DESCRICAO_OBJETIVOS__: courseDescription,
      DIFICULDADE_CURSO__: e.target.radioDefault.value,
      ID_AREA: 1, // TODO: Get the area ID from the selected area
      IMAGEM: e.target.courseImage.files[0], // TODO: Handle image upload
    };
    setIsLoading(true);
    console.log("Curso criado:", data);
    // Simular uma chamada de API
    setIsLoading(false);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container h-100 d-flex justify-content-center align-items-center p-4">
        <div className="">
          <h1>Nome do Curso</h1>
          <p className="mb-4">
            Preencha o nome do curso que deseja criar. Pode alterar a qualquer
            momento
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 d-flex flex-column">
              <label htmlFor="courseName" className="form-label">
                Nome do Curso:
              </label>
              <input
                type="text"
                className="form-control mb-3"
                id="courseName"
                placeholder="Ex. Curso de Programação"
                value={courseName}
                onChange={(e) => {
                  setCourseName(e.target.value);
                  setIsValid(e.target.value.length > 0);
                }}
                required
              />
              <label htmlFor="courseDescription" className="form-label">
                Descrição do Curso:
              </label>
              <textarea
                className="form-control mb-3"
                id="courseDescription"
                placeholder="Ex. Aprenda a programar do zero com este curso de programação."
                rows="3"
                required
                value={courseDescription}
                onChange={(e) => {
                  setCourseDescription(e.target.value);
                  setIsValid(e.target.value.length > 0);
                }}
              ></textarea>
              <label htmlFor="courseImage" className="form-label">
                Imagem do Curso:
              </label>
              <input
                type="file"
                className="form-control mb-3"
                id="courseImage"
                accept="image/png, image/jpeg, image/jpg" // TODO: Add a file upload handler
                required
              />
              <div>
                <label htmlFor="courseDifficulty" className="form-label me-3">
                  Dificuldade do Curso:
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="radioDefault"
                    id="Dificuldade1"
                    value={"Iniciante"}
                  />
                  <label className="form-check-label" htmlFor="Dificuldade1">
                    Iniciante
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="radioDefault"
                    id="Dificuldade2"
                    value={"Intermédio"}
                  />
                  <label className="form-check-label" htmlFor="Dificuldade2">
                    Intermédio
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="radioDefault"
                    id="Dificuldade3"
                    value={"Difícil"}
                  />
                  <label className="form-check-label" htmlFor="Dificuldade3">
                    Difícil
                  </label>
                </div>
              </div>
              <label htmlFor="courseImage" className="form-label">
                Área do Curso:
              </label>
              <select className="form-select mb-3" id="courseArea" required>
                <option value="" disabled selected>
                  Selecione a área do curso
                </option>
                <option value="1">Programação</option>
                <option value="2">Design</option>
                <option value="3">Marketing</option>
              </select>
            </div>
            <div className="d-flex flex-row align-items-center gap-4">
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "200px" }}
                onClick={() => navigate("/dashboard")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="btn btn-primary"
                style={{ width: "200px" }}
              >
                {isLoading ? (
                  <ButtonWithLoader isLoading={isLoading} />
                ) : (
                  "Criar Curso"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateCourse;
