import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import ButtonWithLoader from "./components/butao_loader";
import axios from "axios";
import SuccessMessage from "./components/sucess_message";

function CreateCourse() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [error, setError] = useState(null);
  const [courseDescription, setCourseDescription] = useState("");
  const [category, setCategory] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState(null);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleRadioChange = (e) => {
    setSelectedRadio(e.target.value);
  };

  useEffect(() => {
    const getAreas = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await axios.get(
          "http://localhost:4000/api/categorias/com-areas"
        ); // Adjust the endpoint as needed
        if (response.status === 200) {
          //console.log("Areas fetched successfully:", response.data);
          setCategory(response.data);
        } else {
          //console.error("Error fetching category:", response.statusText);
          setError("Erro ao buscar áreas. Tente novamente mais tarde.");
        }
      } catch (error) {
        //console.error("Error fetching category:", error);
        setError("Erro ao buscar áreas. Tente novamente mais tarde.");
      } finally {
        setIsLoadingAttributes(false);
      }
    };
    getAreas();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      NOME: courseName,
      DESCRICAO_OBJETIVOS__: courseDescription,
      DIFICULDADE_CURSO__: e.target.radioDefault.value,
      ID_AREA: e.target.courseArea.value,
      ID_CATEGORIA: e.target.courseCategory.value,
      IMAGEM: e.target.courseImage.files[0], // TODO: Handle image upload
    };
    setIsLoading(true);
    console.log("Curso criado:", data);
    // Simular uma chamada de API
    setShowSuccess(true);
    setIsLoading(false);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />

      <div className="container h-100 d-flex justify-content-center align-items-center p-4">
        {showSuccess && (
          <SuccessMessage
            message="Curso criado com sucesso!"
            onClose={() => setShowSuccess(false)}
          />
        )}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <h1 className="text-center">Criar curso</h1>
              <p className="text-center mb-4">
                Pode alterar toda a informação a qualquer momento
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
                    <label
                      htmlFor="courseDifficulty"
                      className="form-label me-3"
                    >
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
                      <label
                        className="form-check-label"
                        htmlFor="Dificuldade1"
                      >
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
                      <label
                        className="form-check-label"
                        htmlFor="Dificuldade2"
                      >
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
                      <label
                        className="form-check-label"
                        htmlFor="Dificuldade3"
                      >
                        Difícil
                      </label>
                    </div>
                    <div className="d-flex flex-row align-items-center mb-2" style={{height: "40px"}}>
                      <label
                        htmlFor="courseType"
                        className="form-label me-3 mb-0"
                      >
                        Tipo do Curso:
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="radioType"
                          id="Tipo1"
                          value={"Assíncrono"}
                          onChange={handleRadioChange}
                          checked={selectedRadio === "Assíncrono"}
                        />
                        <label className="form-check-label" htmlFor="Tipo1">
                          Assíncrono
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="radioType"
                          id="Tipo2"
                          value={"Síncrono"}
                          onChange={handleRadioChange}
                          checked={selectedRadio === "Síncrono"}
                        />
                        <label className="form-check-label" htmlFor="Tipo2">
                          Síncrono
                        </label>
                      </div>
                      {selectedRadio === "Síncrono" && (
                        <select
                          className="form-select ms-3"
                          id="courseTeacher"
                          required
                          defaultValue={0}
                          style={{ maxWidth: "250px" }}
                        >
                          <option value="0" disabled>
                            Selecione um formador
                          </option>
                          <option value="1">Professor 1</option>
                          <option value="2">Professor 2</option>
                          <option value="3">Professor 3</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <label htmlFor="courseCategory" className="form-label">
                    Categoria do Curso:
                  </label>
                  {isLoadingAttributes ? (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <select
                      className="form-select mb-3"
                      id="courseCategory"
                      required
                      defaultValue={0}
                    >
                      <option value="0" disabled>
                        Selecione uma categoria
                      </option>
                      {category.map((category) => (
                        <option
                          key={category.ID_CATEGORIA__PK___}
                          value={category.ID_CATEGORIA__PK___}
                        >
                          {category.NOME__}
                        </option>
                      ))}
                    </select>
                  )}
                  <label htmlFor="courseArea" className="form-label">
                    Área do Curso:
                  </label>
                  {isLoadingAttributes ? (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <select
                      className="form-select mb-3"
                      id="courseArea"
                      required
                      defaultValue={0}
                    >
                      <option value="0" disabled>
                        Selecione uma área
                      </option>
                      {category.map((category) =>
                        category.AREAs.map((area) => (
                          <option key={area.ID_AREA} value={area.ID_AREA}>
                            {area.NOME}
                          </option>
                        ))
                      )}
                    </select>
                  )}
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
        </div>
      </div>
    </>
  );
}

export default CreateCourse;
