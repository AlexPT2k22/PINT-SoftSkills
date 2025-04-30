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
  const [Formador, setFormador] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [message, setMessage] = useState(null);

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
        );
        if (response.status === 200) {
          //console.log("Areas fetched successfully:", response.data);
          setCategory(response.data);
        } else {
          //console.error("Error fetching category:", response.statusText);
          setError(true);
          setMessage("Erro ao buscar áreas. Tente novamente mais tarde.");
        }
      } catch (error) {
        //console.error("Error fetching category:", error);
        setError(true);
        setMessage("Erro ao buscar áreas. ERRO: " + error.response.data.message);
      } finally {
        setIsLoadingAttributes(false);
      }
    };
    const getFormadores = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await axios.get(
          "http://localhost:4000/api/user/teachers"
        );
        if (response.status === 200) {
          //console.log("Formadores fetched successfully:", response.data);
          setFormador(response.data);
        } else {
          //console.error("Error fetching formadores:", response.statusText);
          setError(true);
          setMessage("Erro ao buscar formadores. Tente novamente mais tarde.");
        }
      } catch (error) {
        //console.error("Error fetching formadores:", error);
        setError(true);
        setMessage("Erro ao buscar formadores. ERRO: " + error.response.data.message);
      } finally {
        setIsLoadingAttributes(false);
      }
    };

    getFormadores();
    getAreas();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedArea(""); // Limpa a área quando a categoria é alterada
  };

  const selectedCategoryData = category.find(
    (cat) => cat.ID_CATEGORIA__PK___ === parseInt(selectedCategory)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const startDate = new Date(e.target.startDate.value);
    const endDate = new Date(e.target.endDate.value);
    if (startDate >= endDate) {
      setError(true);
      setMessage("A data de início deve ser anterior à data de fim.");
      setIsLoading(false);
      return;
    }

    const ID_FORMADOR =
      selectedRadio === "Síncrono" ? e.target.courseTeacher.value : null;
    const vagas = selectedRadio === "Síncrono" ? e.target.seats.value : null;
    const formData = new FormData();
    formData.append("NOME", courseName);
    formData.append("DESCRICAO_OBJETIVOS__", courseDescription);
    formData.append("DIFICULDADE_CURSO__", e.target.difficulty.value);
    formData.append("ID_FORMADOR", ID_FORMADOR);
    formData.append("ID_AREA", e.target.courseArea.value);
    formData.append("ID_CATEGORIA", e.target.courseCategory.value);
    formData.append("imagem", e.target.courseImage.files[0]);
    formData.append("DATA_INICIO", e.target.startDate.value);
    formData.append("DATA_FIM", e.target.endDate.value);
    formData.append("VAGAS", vagas);

    const URL =
      ID_FORMADOR === null
        ? "http://localhost:4000/api/cursos/create-assincrono"
        : "http://localhost:4000/api/cursos/create-sincrono";

    try {
      const response = await axios.post(URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
        setShowSuccess(true);
        setCourseName("");
        setCourseDescription("");
        setSelectedRadio(null);
        setIsValid(false);
        e.target.reset(); // Limpar os campos do formulário
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setError(true);
      setMessage("Erro ao criar curso. ERRO: " + error.response.data.message);
    } finally {
      setIsLoading(false);
    }
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
          <ErrorMessage message={message} onClose={() => setError(null)} />
        )}

        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-4" style={{ height: "405px" }}>
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
                        required
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
                        required
                        accept="image/png, image/jpeg, image/jpg"
                      />
                      <small className="form-text text-muted">
                        Formatos suportados: PNG, JPEG, JPG. Tamanho
                        recomendado: 530x300px.
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4" style={{ height: "405px" }}>
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
                        <>
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
                                {Formador.map((formador) => (
                                  <option
                                    key={formador.ID_UTILIZADOR}
                                    value={formador.ID_UTILIZADOR}
                                  >
                                    {formador.USERNAME}
                                  </option>
                                ))}
                              </select>
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
                        </>
                      )}

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Categoria do curso
                          </label>
                          {isLoadingAttributes ? (
                            <p aria-hidden="true">
                              <span className="placeholder-glow col-6"></span>
                            </p>
                          ) : (
                            <select
                              className="form-select"
                              id="courseCategory"
                              required
                              onChange={(e) => {
                                handleCategoryChange(e);
                              }}
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
                              <span className="placeholder-glow col-6"></span>
                            </p>
                          ) : (
                            <select
                              className="form-select"
                              id="courseArea"
                              value={selectedArea}
                              onChange={(e) => {
                                setSelectedArea(e.target.value);
                              }}
                              required
                            >
                              <option value="" disabled selected>
                                Selecione uma área
                              </option>
                              {selectedCategoryData?.AREAs?.map((area) => (
                                <option key={area.ID_AREA} value={area.ID_AREA}>
                                  {area.NOME}
                                </option>
                              )) || []}
                            </select>
                          )}
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
