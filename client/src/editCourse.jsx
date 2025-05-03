import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ButtonWithLoader from "./components/butao_loader";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";
import { XCircle } from "lucide-react";

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
  const [courseObjectives, setCourseObjectives] = useState([""]);
  const [courseHabilities, setCourseHabilities] = useState([""]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Atualizar o campo de habilidades e objetivos
  const atualizarCampo = (setState, state, index, value) => {
    const copia = [...state];
    copia[index] = value;
    setState(copia);
  };

  // Remover o campo de habilidades e objetivos
  const removerCampo = (setState, state, index) => {
    const copia = [...state];
    copia.splice(index, 1);
    setState(copia);
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

        // Set dates
        if (response.data.CURSO_ASSINCRONO) {
          // Format dates properly from ISO string to YYYY-MM-DD for input type="date"
          const startDateISO = response.data.CURSO_ASSINCRONO.DATA_INICIO;
          const endDateISO = response.data.CURSO_ASSINCRONO.DATA_FIM;

          if (startDateISO) {
            setStartDate(startDateISO.split("T")[0]);
          }

          if (endDateISO) {
            setEndDate(endDateISO.split("T")[0]);
          }
        }

        // set course objectives and habilities
        if (response.data.OBJETIVOS && response.data.OBJETIVOS.length > 0) {
          // First extract the objectives array
          const extractedObjectives = response.data.OBJETIVOS.map((obj) =>
            obj.DESCRICAO?.trim()
          ).filter(Boolean);

          // Set state once with an empty string at position 0 for the input field
          setCourseObjectives(["", ...extractedObjectives]);
        } else {
          setCourseObjectives([""]);
        }

        if (response.data.HABILIDADES && response.data.HABILIDADES.length > 0) {
          // First extract the abilities array
          const extractedAbilities = response.data.HABILIDADES.map((hab) =>
            hab.DESCRICAO?.trim()
          ).filter(Boolean);

          // Set state once with an empty string at position 0 for the input field
          setCourseHabilities(["", ...extractedAbilities]);
        } else {
          setCourseHabilities([""]);
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
      const areaIdFromAPI = Number(courseData.ID_AREA); // Changed from courseData.ID_AREA to courseData.AREA.ID_AREA

      // Convert to strings for form values which require strings
      setSelectedCategory(categoryIdFromAPI);
      setSelectedArea(areaIdFromAPI);

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

  const handleDelete = async (e) => {
    e.preventDefault();
    const URL = `http://localhost:4000/api/cursos/${courseId}`;
    setIsDeleting(true);
    try {
      const response = await axios.delete(URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000); // Redirect after 2 seconds
      }
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const originalType = courseData.CURSO_SINCRONO ? "Síncrono" : "Assíncrono";
    const isTypeChanged = originalType !== selectedRadio;

    const URL = isTypeChanged
      ? `http://localhost:4000/api/cursos/convert/${courseId}`
      : selectedRadio === "Síncrono"
      ? `http://localhost:4000/api/cursos/sincrono/${courseId}`
      : `http://localhost:4000/api/cursos/assincrono/${courseId}`;

    if (
      courseObjectives.length <= 1 ||
      courseObjectives.every((obj) => obj.trim() === "")
    ) {
      setError("Adicione pelo menos um objetivo.");
      setIsLoading(false);
      return;
    }

    if (
      courseHabilities.length <= 1 ||
      courseHabilities.every((ability) => ability.trim() === "")
    ) {
      setError("Adicione pelo menos uma habilidade.");
      setIsLoading(false);
      return;
    }

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("NOME", courseName);
      formData.append("DESCRICAO_OBJETIVOS__", courseDescription);
      formData.append("DIFICULDADE_CURSO__", courseDifficulty);
      formData.append("ID_AREA", selectedArea);
      formData.append("DATA_INICIO", startDate);
      formData.append("DATA_FIM", endDate);
      formData.append("ID_CATEGORIA", selectedCategory);
      formData.append("imagem", e.target.courseImage.files[0]);
      // Add objectives (filtering out the first empty input and empty strings)
      const filteredObjectives = courseObjectives
        .slice(1)
        .filter((obj) => obj.trim() !== "");
      formData.append("OBJETIVOS", filteredObjectives);

      // Add abilities (filtering out the first empty input and empty strings)
      const filteredHabilities = courseHabilities
        .slice(1)
        .filter((ability) => ability.trim() !== "");
      formData.append("HABILIDADES", filteredHabilities);

      // Add synchronous course specific data
      if (selectedRadio === "Síncrono") {
        formData.append("ID_UTILIZADOR", selectedTeacher);
        formData.append("VAGAS", availableSeats);
      }
      // Add image if selected
      if (courseImage) {
        formData.append("imagem", courseImage);
      }

      console.log("Form data:", formData);
      // Update the course
      const response = await axios.put(URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error updating course:", error.response.data.message);
      setError(
        error.response?.data?.message ||
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
                    {isLoadingAttributes || isLoading ? (
                      <div className="spinner-border">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
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
                          <label
                            htmlFor="courseDescription"
                            className="form-label"
                          >
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
                            rows={4}
                          />
                        </div>

                        <div>
                          <label htmlFor="courseImage" className="form-label">
                            Imagem do Curso:
                          </label>
                          <input
                            type="file"
                            className="form-control mb-3"
                            id="courseImage"
                            accept="image/png, image/jpeg, image/jpg"
                          />
                          <small className="form-text text-muted">
                            Formatos suportados: PNG, JPEG, JPG.
                          </small>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Detalhes do curso</h5>
                  </div>
                  <div className="card-body">
                    {isLoadingAttributes || isLoading ? (
                      <div className="spinner-border">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
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
                              <label className="form-label">
                                Tipo de curso
                              </label>
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
                            <>
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
                              <label className="form-label">
                                Área do curso
                              </label>
                              {isLoadingAttributes ? (
                                <p aria-hidden="true">
                                  <span className="placeholder-glow col-6"></span>
                                </p>
                              ) : (
                                <select
                                  className="form-select"
                                  id="courseArea"
                                  value={selectedArea}
                                  onChange={(e) =>
                                    setSelectedArea(e.target.value)
                                  }
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
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Objetivos</h5>
                  </div>
                  <div className="card-body">
                    <div>
                      <label className="form-label" htmlFor="courseObjectives">
                        Objetivos que o formando irá alcançar
                      </label>
                      <div className="d-flex flex-row gap-2">
                        <input
                          type="text"
                          className="form-control"
                          id="courseObjectives"
                          placeholder="Ex. Aprender a programar em JavaScript"
                          value={courseObjectives[0] || ""}
                          onChange={(e) =>
                            atualizarCampo(
                              setCourseObjectives,
                              courseObjectives,
                              0,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            if (courseObjectives[0].trim() !== "") {
                              const newObjectives = [...courseObjectives];
                              newObjectives.push(courseObjectives[0]); // Add current value to array
                              newObjectives[0] = ""; // Clear input
                              setCourseObjectives(newObjectives);
                            }
                          }}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                    <div className="objectives-list mt-3">
                      {courseObjectives.slice(1).map(
                        (objetivo, index) =>
                          objetivo.trim() !== "" && (
                            <div
                              key={index}
                              className="objective-item d-inline-flex align-items-center bg-light rounded-pill px-3 py-2 me-2 mb-2"
                            >
                              <span>{objetivo}</span>
                              <button
                                type="button"
                                className="btn btn-sm text-danger ms-2 p-0 border-0"
                                onClick={() =>
                                  removerCampo(
                                    setCourseObjectives,
                                    courseObjectives,
                                    index + 1
                                  )
                                }
                                aria-label="Remover objetivo"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )
                      )}
                    </div>
                    {courseObjectives.length <= 1 && (
                      <div className="text-muted small mt-2">
                        Nenhum objetivo adicionado ainda. Adicione até 6
                        objetivos para o curso.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Habilidades</h5>
                  </div>
                  <div className="card-body">
                    <div>
                      <label className="form-label" htmlFor="courseHabilities">
                        Habilidades que o formando irá desenvolver
                      </label>
                      <div className="d-flex flex-row gap-2">
                        <input
                          type="text"
                          className="form-control"
                          id="courseHabilities"
                          placeholder="Ex. React"
                          value={courseHabilities[0] || ""}
                          onChange={(e) =>
                            atualizarCampo(
                              setCourseHabilities,
                              courseHabilities,
                              0,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            if (courseHabilities[0].trim() !== "") {
                              const newHabilities = [...courseHabilities];
                              newHabilities.push(courseHabilities[0]); // Add current value to array
                              newHabilities[0] = ""; // Clear input
                              setCourseHabilities(newHabilities);
                            }
                          }}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div className="Habilities-list mt-3">
                      {courseHabilities.slice(1).map(
                        (ability, index) =>
                          ability.trim() !== "" && (
                            <div
                              key={index}
                              className="ability-item d-inline-flex align-items-center bg-light rounded-pill px-3 py-2 me-2 mb-2"
                              style={{ backgroundColor: "#f8f9fa" }}
                            >
                              <span>{ability}</span>
                              <button
                                type="button"
                                className="btn btn-sm text-danger ms-2 p-0 border-0"
                                onClick={() =>
                                  removerCampo(
                                    setCourseHabilities,
                                    courseHabilities,
                                    index + 1
                                  )
                                }
                                aria-label="Remover habilidade"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )
                      )}
                    </div>
                    {courseHabilities.length <= 1 && (
                      <div className="text-muted small mt-2">
                        Nenhuma habilidade adicionada ainda. Adicione até 9
                        habilidades para o curso.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Datas do curso</h5>
                  </div>
                  <div className="card-body">
                    {isLoadingAttributes || isLoading ? (
                      <div className="spinner-border">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="row g-4">
                          <div className="col-md-6">
                            <div>
                              <label className="form-label">
                                Data de início
                              </label>
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
                            <div>
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
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Módulos e Conteúdo</h5>
                  </div>
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <h6 className="mb-0">
                      Carregue aqui para editar os módulos e conteúdo dos mesmos
                    </h6>
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
                type="button"
                className="btn btn-danger me-2"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ButtonWithLoader isLoading={isDeleting} />
                ) : (
                  "Apagar curso"
                )}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !isValid || isDeleting}
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
