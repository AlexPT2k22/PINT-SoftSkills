import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ButtonWithLoader from "./components/butao_loader";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";

function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State variables
  const [collapsed, setCollapsed] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseDifficulty, setCourseDifficulty] = useState("");
  const [courseType, setCourseType] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [courseImage, setCourseImage] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Data fetched from API
  const [category, setCategory] = useState([]);
  const [Formador, setFormador] = useState([]);

  // Handler for sidebar toggle
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  // Handler for radio button changes
  const handleRadioChange = (e) => {
    const { name, value } = e.target;

    if (name === "difficulty") {
      setCourseDifficulty(value);
    } else if (name === "courseType") {
      setSelectedRadio(value);
      setCourseType(value);
    }
  };

  // Handler for category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    // Reset area selection when category changes
    setSelectedArea("");
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCourseImage(e.target.files[0]);
    }
  };

  // Fetch teachers for synchronous courses
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/user/teachers"
        );
        if (response.status === 200) {
          setFormador(response.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchTeachers();
  }, []);

  // Main useEffect to fetch course data and areas
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/cursos/${courseId}`
        );

        // Store the complete response
        setCourseData(response.data);

        // Populate individual form fields
        setCourseName(response.data.NOME || "");
        setCourseDescription(response.data.DESCRICAO_OBJETIVOS__ || "");
        setCourseDifficulty(response.data.DIFICULDADE_CURSO__ || "");

        // Set course type
        const isSynchronous = response.data.CURSO_SINCRONO != null;
        setCourseType(isSynchronous ? "Síncrono" : "Assíncrono");
        setSelectedRadio(isSynchronous ? "Síncrono" : "Assíncrono");

        // Set teacher if available - note we need to get ID separately
        if (response.data.CURSO_SINCRONO) {
          // Since your API response doesn't include ID_UTILIZADOR in the UTILIZADOR object
          // Use the ID_UTILIZADOR from CURSO_SINCRONO instead
          setSelectedTeacher(response.data.CURSO_SINCRONO.ID_UTILIZADOR);
        }

        // Set available seats
        if (response.data.CURSO_SINCRONO?.INSCRICAO_SINCRONO) {
          setAvailableSeats(
            response.data.CURSO_SINCRONO.INSCRICAO_SINCRONO.LIMITE_VAGAS_INT__
          );
        }

        // Set dates
        if (response.data.CURSO_SINCRONO) {
          // Format dates properly from ISO string to YYYY-MM-DD for input type="date"
          const startDateISO = response.data.CURSO_SINCRONO.DATA_INICIO;
          const endDateISO = response.data.CURSO_SINCRONO.DATA_FIM;

          if (startDateISO) {
            setStartDate(startDateISO.split("T")[0]);
          }

          if (endDateISO) {
            setEndDate(endDateISO.split("T")[0]);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Erro ao buscar dados do curso. Tente novamente mais tarde.");
        setIsLoading(false);
      }
    };

    const getAreas = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await axios.get(
          "http://localhost:4000/api/categorias/com-areas"
        );
        if (response.status === 200) {
          setCategory(response.data);
        } else {
          setError("Erro ao buscar áreas. Tente novamente mais tarde.");
        }
        setIsLoadingAttributes(false);
      } catch (error) {
        console.error("Error fetching areas:", error);
        setError("Erro ao buscar áreas. Tente novamente mais tarde.");
        setIsLoadingAttributes(false);
      }
    };

    fetchCourseData();
    getAreas();
  }, [courseId]);

  // Segundo useEffect para definir a categoria e área selecionadas
  useEffect(() => {
    if (category.length > 0 && courseData?.AREA?.Categoria) {
      // Convert to numbers for consistent comparison
      const categoryIdFromAPI = Number(
        courseData.AREA.Categoria.ID_CATEGORIA__PK___
      );
      const areaIdFromAPI = Number(courseData.AREA.ID_AREA); // Changed from courseData.ID_AREA to courseData.AREA.ID_AREA

      // Convert to strings for form values which require strings
      setSelectedCategory(categoryIdFromAPI.toString());
      setSelectedArea(areaIdFromAPI.toString());

      console.log(
        "Set category to:",
        categoryIdFromAPI,
        "and area to:",
        areaIdFromAPI,
        "Categories available:",
        category.map((c) => c.ID_CATEGORIA__PK___)
      );
    }
  }, [category, courseData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("NOME", courseName);
      formData.append("DESCRICAO_OBJETIVOS__", courseDescription);
      formData.append("DIFICULDADE_CURSO__", courseDifficulty);
      formData.append("ID_AREA_FK", selectedArea);

      // Add synchronous course specific data
      if (selectedRadio === "Síncrono") {
        formData.append("isSynchronous", true);
        formData.append("LIMITE_VAGAS_INT__", availableSeats);
        formData.append("DATA_INICIO", startDate);
        formData.append("DATA_FIM", endDate);
        formData.append("ID_UTILIZADOR_FK", selectedTeacher);
      } else {
        formData.append("isSynchronous", false);
      }

      // Add image if selected
      if (courseImage) {
        formData.append("image", courseImage);
      }

      // Update the course
      const response = await axios.put(
        `http://localhost:4000/api/cursos/${courseId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      setError(
        error.response?.data?.error ||
          "Erro ao atualizar o curso. Tente novamente mais tarde."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container-fluid h-100 d-flex justify-content-center align-items-center p-4">
        {showSuccess && (
          <SuccessMessage
            message="Curso atualizado com sucesso!"
            onClose={() => setShowSuccess(false)}
          />
        )}
        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

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
                      <label htmlFor="courseName" className="form-label">
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
                        placeholder="Título do curso"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="courseDescription" className="form-label">
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
                        placeholder="Descrição do curso"
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
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg"
                      />
                      <small className="form-text text-muted">
                        Formatos suportados: PNG, JPEG, JPG.
                      </small>
                      {courseData?.IMAGEM && (
                        <div className="mt-2">
                          <p>Imagem atual:</p>
                          <img
                            src={courseData.IMAGEM}
                            alt="Imagem atual do curso"
                            className="img-thumbnail"
                            style={{ maxWidth: "200px" }}
                          />
                        </div>
                      )}
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
                              value="Iniciante"
                              checked={courseDifficulty === "Iniciante"}
                              onChange={handleRadioChange}
                              required
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
                              value="Intermédio"
                              checked={courseDifficulty === "Intermédio"}
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
                              value="Difícil"
                              checked={courseDifficulty === "Difícil"}
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
                                value="Assíncrono"
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
                                value="Síncrono"
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
                              value={selectedTeacher}
                              onChange={(e) =>
                                setSelectedTeacher(e.target.value)
                              }
                              required={selectedRadio === "Síncrono"}
                            >
                              <option value="" disabled>
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
                      )}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Categoria do curso
                          </label>
                          {isLoadingAttributes ? (
                            <p aria-hidden="true">
                              <span className="placeholder col-6"></span>
                            </p>
                          ) : (
                            <select
                              className="form-select"
                              id="courseCategory"
                              value={selectedCategory}
                              onChange={handleCategoryChange}
                              required
                            >
                              <option value="" disabled>
                                Selecione uma categoria
                              </option>
                              {category.map((cat) => (
                                <option
                                  key={cat.ID_CATEGORIA__PK___}
                                  value={cat.ID_CATEGORIA__PK___}
                                >
                                  {cat.NOME__}
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
                              <span className="placeholder col-6"></span>
                            </p>
                          ) : (
                            <select
                              className="form-select"
                              id="courseArea"
                              value={selectedArea}
                              onChange={(e) => setSelectedArea(e.target.value)}
                              required
                            >
                              <option value="" disabled>
                                Selecione uma área
                              </option>
                              {category
                                .find(
                                  (cat) =>
                                    Number(cat.ID_CATEGORIA__PK___) ===
                                    Number(selectedCategory)
                                )
                                ?.AREAs?.map((area) => (
                                  <option
                                    key={area.ID_AREA}
                                    value={area.ID_AREA}
                                  >
                                    {area.NOME}
                                  </option>
                                )) || []}
                            </select>
                          )}
                        </div>
                      </div>
                      {selectedRadio === "Síncrono" && (
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label" htmlFor="seats">
                              Lugares disponíveis:
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="seats"
                              placeholder="Ex. 20"
                              min={1}
                              max={100}
                              value={availableSeats}
                              onChange={(e) => {
                                const value = e.target.value;
                                setAvailableSeats(value);
                                setIsValid(value >= 1 && value <= 100);
                              }}
                              required={selectedRadio === "Síncrono"}
                            />
                          </div>
                        </div>
                      )}
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
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required={selectedRadio === "Síncrono"}
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
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required={selectedRadio === "Síncrono"}
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
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <ButtonWithLoader isLoading={isSubmitting} />
                ) : (
                  "Atualizar curso"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditCourse;
