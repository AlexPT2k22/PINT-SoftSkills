import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import ButtonWithLoader from "./components/butao_loader";
import axios from "axios";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";

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
    setIsValid(true);
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
    // validar a data
    const startDate = new Date(e.target.startDate.value);
    const endDate = new Date(e.target.endDate.value);
    if (startDate >= endDate) {
      setError("A data de início deve ser anterior à data de fim.");
      return;
    }
    const ID_FORMADOR =
      selectedRadio === "Síncrono" ? e.target.courseTeacher.value : null;
    const data = {
      NOME: courseName,
      DESCRICAO_OBJETIVOS__: courseDescription,
      DIFICULDADE_CURSO__: e.target.difficulty.value,
      TIPO_CURSO__: selectedRadio,
      ID_FORMADOR: ID_FORMADOR,
      ID_TIPO_CURSO: selectedRadio === "Assíncrono" ? 1 : 2,
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

      <div className="container-fluid h-100 d-flex justify-content-center align-items-center p-4">
        {showSuccess && (
          <SuccessMessage
            message="Curso criado com sucesso!"
            onClose={() => setShowSuccess(false)}
          />
        )}
        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        {/*
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
                      "Criar curso"
                    )}
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
                      "Criar e editar curso"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        */}

        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Informação do curso</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        Titulo do curso
                      </label>
                      <input
                        id="courseName"
                        value={courseName}
                        onChange={(e) => {
                          setCourseName(e.target.value);
                          setIsValid(e.target.value.length > 0);
                        }}
                        type="text"
                        className="form-control"
                        placeholder="Ex. Curso de Programação"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        Descrição do curso
                      </label>
                      <textarea
                        id="courseDescription"
                        value={courseDescription}
                        onChange={(e) => {
                          setCourseDescription(e.target.value);
                          setIsValid(e.target.value.length > 0);
                        }}
                        className="form-control"
                        placeholder="Ex. Aprenda a programar do zero com este curso de programação."
                        required
                      />
                    </div>

                    <div className="mb-3">
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
                      <small className="form-text text-muted">
                        Formatos suportados: PNG, JPEG, JPG.
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Detalhes do curso</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label">
                          Dificuldade do curso
                        </label>
                        <div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="difficulty"
                              id="difficulty1"
                              value={"Iniciante"}
                              required
                              onChange={handleRadioChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="difficulty1"
                            >
                              Iniciante
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="difficulty"
                              id="difficulty2"
                              value={"Intermédio"}
                              onChange={handleRadioChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="difficulty2"
                            >
                              Intermédio
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="difficulty"
                              id="difficulty3"
                              value={"Difícil"}
                              onChange={handleRadioChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="difficulty3"
                            >
                              Difícil
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Tipo de curso</label>
                          <div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="courseType"
                                id="courseType1"
                                value={"Assíncrono"}
                                onChange={handleRadioChange}
                                checked={selectedRadio === "Assíncrono"}
                                required
                              />
                              <label
                                className="form-check-label"
                                htmlFor="courseType1"
                              >
                                Assíncrono
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="courseType"
                                id="courseType2"
                                value={"Síncrono"}
                                onChange={handleRadioChange}
                                checked={selectedRadio === "Síncrono"}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="courseType2"
                              >
                                Síncrono
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedRadio === "Síncrono" && (
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Formador</label>
                            <select
                              className="form-select"
                              id="courseTeacher"
                              required
                            >
                              <option value="" disabled selected>
                                Selecione um formador
                              </option>
                              <option value="1">Professor 1</option>
                              <option value="2">Professor 2</option>
                              <option value="3">Professor 3</option>
                            </select>
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Categoria do curso
                          </label>
                          {isLoadingAttributes ? (
                            <p aria-hidden="true">
                              <span class="placeholder col-6"></span>
                            </p>
                          ) : (
                            <select
                              className="form-select"
                              id="courseCategory"
                              required
                            >
                              <option value="" disabled selected>
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
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Área do curso</label>
                          {isLoadingAttributes ? (
                            <p aria-hidden="true">
                              <span class="placeholder col-6"></span>
                            </p>
                          ) : (
                            <select
                              className="form-select"
                              id="courseArea"
                              required
                            >
                              <option value="" disabled selected>
                                Selecione uma área
                              </option>
                              {category.map((category) =>
                                category.AREAs.map((area) => (
                                  <option
                                    key={area.ID_AREA}
                                    value={area.ID_AREA}
                                  >
                                    {area.NOME}
                                  </option>
                                ))
                              )}
                            </select>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="seats">
                            Lugares disponiveis:
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="seats"
                            placeholder="Ex. 20"
                            min={1}
                            max={100}
                            required
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value < 1 || value > 100) {
                                setIsValid(false);
                              } else {
                                setIsValid(true);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Datas do curso</h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Data de início</label>
                        <input
                          type="date"
                          className="form-control"
                          id="startDate"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Data de fim</label>
                        <input
                          type="date"
                          className="form-control"
                          id="endDate"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate("/dashboard")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <ButtonWithLoader isLoading={isLoading} />
                ) : (
                  "Criar curso"
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
