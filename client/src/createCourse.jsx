import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import ButtonWithLoader from "./components/butao_loader";
import axios from "axios";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";
import { XCircle, Pen } from "lucide-react";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";

function CreateCourse() {
  const navigate = useNavigate();
  const modalRef = useRef(null);
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
  const [selectedType, setSelectedType] = useState(null);
  const [Formador, setFormador] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [message, setMessage] = useState(null);
  const [courseObjectives, setCourseObjectives] = useState([""]);
  const [courseHabilities, setCourseHabilities] = useState([""]);
  const [courseModules, setCourseModules] = useState([""]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentModuleData, setCurrentModuleData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const moduleContentInputRef = useRef(null);

  // Add this to your component or create a new CSS file and import it

  const modalStyles = {
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      width: "100%",
      maxWidth: "500px",
      maxHeight: "95vh",
      overflowY: "auto",
      animation: "modalFadeIn 0.3s ease",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      borderBottom: "1px solid #dee2e6",
    },
    modalTitle: {
      fontSize: "1.25rem",
      margin: 0,
      fontWeight: 500,
    },
    closeButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "1.5rem",
      padding: "0",
      color: "#6c757d",
      transition: "color 0.2s",
    },
    modalBody: {
      padding: "20px",
    },
    modalFooter: {
      borderTop: "1px solid #dee2e6",
      paddingTop: "20px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
    },
  };

  const handleShow = () => {
    setShowModal(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
  };
  const handleClose = () => {
    setShowModal(false);
    setSelectedModule(null);
    setCurrentModuleData(null);
    document.body.style.overflow = "";
  };

  const atualizarCampo = (setState, state, index, value) => {
    const copia = [...state];
    copia[index] = value;
    setState(copia);
  };

  const removerCampo = (setState, state, index) => {
    const copia = [...state];
    copia.splice(index, 1);
    setState(copia);
  };

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleRadioChange = (e) => {
    setSelectedRadio(e.target.value);
    setIsValid(true);
  };

  const handleRadioChangeType = (e) => {
    setSelectedType(e.target.value);
    setIsValid(true);
  };

  // Add this useEffect to load existing data when a module is selected
  useEffect(() => {
    if (selectedModule) {
      // Find the module in the courseModules array
      const moduleIndex = courseModules.findIndex((module, i) => {
        if (i > 0) {
          const moduleName = typeof module === "string" ? module : module.name;
          return moduleName === selectedModule;
        }
        return false;
      });

      if (moduleIndex !== -1) {
        const module = courseModules[moduleIndex];
        // Check if this module has existing data
        if (typeof module !== "string" && module.data) {
          // Store the module data for form population
          setCurrentModuleData(module.data);
        } else {
          // Reset the current module data if this is a new module
          setCurrentModuleData(null);
        }
      }
    } else {
      setCurrentModuleData(null);
    }
  }, [selectedModule, courseModules]);

  // Add this function to your component
  // Update this function in your code
  const handleModuleContentSubmit = (e) => {
    e.preventDefault();

    // Get form values
    const moduleDescription = e.target.moduleDescription.value;
    const moduleVideoInput = e.target.moduleVideo;
    const moduleContentInput = e.target.moduleContent;
    const moduleDuration = e.target.moduleDuration.value;

    // Use the new uploaded files or keep existing ones if no new files selected
    const moduleVideo =
      moduleVideoInput.files.length > 0
        ? moduleVideoInput.files[0]
        : currentModuleData?.videoFile;

    const moduleContent =
      moduleContentInput.files.length > 0
        ? moduleContentInput.files[0]
        : currentModuleData?.contentFile;

    let contentFile = [];

    if (
      moduleContentInput.files.length === 0 &&
      currentModuleData?.contentFile
    ) {
      contentFile = currentModuleData.contentFile;
    } else {
      contentFile = Array.from(moduleContentInput.files);
    }

    // Store current module name before resetting state
    const currentModule = selectedModule;

    // Find the index of the selected module
    const moduleIndex = courseModules.findIndex((module, i) => {
      if (i > 0) {
        const moduleName = typeof module === "string" ? module : module.name;
        return moduleName === currentModule;
      }
      return false;
    });

    if (moduleIndex !== -1) {
      // Create a moduleContent object
      const moduleData = {
        name: currentModule,
        description: moduleDescription,
        videoFile: moduleVideo,
        contentFile: contentFile,
        duration: moduleDuration,
      };

      // Create new array with updated module
      const updatedModules = [...courseModules];
      updatedModules[moduleIndex] = {
        name: currentModule,
        data: moduleData,
      };

      // Close modal first, then update state
      handleClose();

      // Use setTimeout to ensure modal close logic completes before state update
      setTimeout(() => {
        setCourseModules(updatedModules);
        setCurrentModuleData(null); // Reset current module data
      }, 50);
    } else {
      handleClose();
      setCurrentModuleData(null);
    }
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
        setMessage(
          "Erro ao buscar áreas. ERRO: " + error.response.data.message
        );
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
        setMessage(
          "Erro ao buscar formadores. ERRO: " + error.response.data.message
        );
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

  const validateFiles = (files, maxTotalSizeMB = 50) => {
    const totalSizeBytes = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );
    const totalSizeMB = totalSizeBytes / (1024 * 1024);

    if (totalSizeMB > maxTotalSizeMB) {
      return {
        valid: false,
        message: `O tamanho total dos arquivos (${totalSizeMB.toFixed(
          1
        )} MB) excede o limite de ${maxTotalSizeMB} MB.`,
      };
    }

    return { valid: true };
  };

  const selectedCategoryData = category.find(
    (cat) => cat.ID_CATEGORIA__PK___ === parseInt(selectedCategory)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      courseObjectives.length <= 1 ||
      courseObjectives.every((obj) => obj.trim() === "")
    ) {
      setError(true);
      setMessage("Adicione pelo menos um objetivo para o curso.");
      setIsLoading(false);
      return;
    }

    if (
      courseHabilities.length <= 1 ||
      courseHabilities.every((ability) => ability.trim() === "")
    ) {
      setError(true);
      setMessage("Adicione pelo menos uma habilidade para o curso.");
      setIsLoading(false);
      return;
    }

    const startDate = new Date(e.target.startDate.value);
    const endDate = new Date(e.target.endDate.value);
    if (startDate >= endDate) {
      setError(true);
      setMessage("A data de início deve ser anterior à data de fim.");
      setIsLoading(false);
      return;
    }

    const ID_FORMADOR =
      selectedType === "Síncrono" ? e.target.courseTeacher.value : null;
    const vagas = selectedType === "Síncrono" ? e.target.seats.value : null;
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

    const modulesToSend = courseModules
      .slice(1)
      .filter(
        (module) =>
          module &&
          (typeof module === "string"
            ? module.trim() !== ""
            : module.name.trim() !== "")
      )
      .map((module) => {
        // Handle both string-only modules and modules with data
        if (typeof module === "string") {
          return { NOME: module };
        } else {
          return {
            NOME: module.name,
            DESCRICAO: module.data.description,
            DURACAO: module.data.duration,
            VIDEO: module.data.videoFile ? true : false,
            CONTEUDO: module.data.contentFile
              ? module.data.contentFile.length
              : 0,
          };
        }
      });

    formData.append("MODULOS", JSON.stringify(modulesToSend));
    courseModules.slice(1).forEach((module, index) => {
      if (module && typeof module !== "string" && module.data) {
        if (module.data.videoFile) {
          formData.append(`module_${index}_video`, module.data.videoFile);
        }
        if (module.data.contentFile && module.data.contentFile.length > 0) {
          module.data.contentFile.forEach((file, fileIndex) => {
            formData.append(
              `module_${index}_content_${fileIndex}`,
              file,
              file.name
            );
          });
        }
      }
    });

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
        e.target.reset();
        setCourseObjectives([""]);
        setCourseHabilities([""]);
        setCourseModules([""]);
        setSelectedCategory(null);
        setSelectedArea(null);
        setSelectedType(null);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setError(true);
      setMessage("Erro ao criar curso. ERRO: " + error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNovoModulo = () => {
    const novoModulo = courseModules[0].trim();

    // Verifica se o módulo já existe (seja string ou objeto)
    const jaExiste = courseModules.some(
      (m, i) =>
        i > 0 &&
        (typeof m === "string" ? m === novoModulo : m.name === novoModulo)
    );

    if (novoModulo !== "" && !jaExiste) {
      const newModules = [...courseModules];
      newModules.push(novoModulo);
      newModules[0] = "";
      setCourseModules(newModules);
    }
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />

      {/* Custom CSS Modal */}
      {showModal && (
        <div
          style={modalStyles.modalOverlay}
          onClick={(e) => {
            // Close modal when clicking outside
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            style={modalStyles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalStyles.modalHeader}>
              <h3 style={modalStyles.modalTitle}>
                Editar Módulo: {selectedModule}
              </h3>
              <button
                style={modalStyles.closeButton}
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={modalStyles.modalBody}>
              <form
                className="content-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleModuleContentSubmit(e);
                }}
              >
                <div className="mb-3">
                  <label htmlFor="moduleDescription" className="form-label">
                    Descrição do módulo
                  </label>
                  <textarea
                    id="moduleDescription"
                    className="form-control"
                    placeholder="Ex. Aprenda a programar do zero com este curso de programação."
                    required
                    defaultValue={currentModuleData?.description || ""}
                    rows={3}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="moduleVideo" className="form-label">
                    Vídeo do módulo:
                  </label>
                  <input
                    type="file"
                    className="form-control mb-2"
                    id="moduleVideo"
                    required={!currentModuleData?.videoFile}
                    accept="video/mp4, video/mkv, video/avi"
                  />
                  {currentModuleData?.videoFile && (
                    <div className="current-file">
                      <span
                        className="badge bg-info text-dark"
                        style={{ fontSize: "14px" }}
                      >
                        Arquivo atual:{" "}
                        {currentModuleData.videoFile.name || "video.mp4"}
                      </span>
                      <small className="d-block text-muted mt-1">
                        Selecione um novo arquivo para substituir o atual
                      </small>
                    </div>
                  )}
                  <small className="form-text text-muted">
                    Formatos suportados: MP4, MKV, AVI. Tamanho máximo: 500MB.
                  </small>
                </div>
                <div className="mb-3">
                  <label htmlFor="moduleContent" className="form-label">
                    Conteúdo do módulo:
                  </label>
                  <input
                    type="file"
                    ref={moduleContentInputRef}
                    className="form-control mb-2"
                    id="moduleContent"
                    required={!currentModuleData?.contentFile?.length}
                    accept=".pdf, .docx, .pptx"
                    multiple
                    onChange={(e) => {
                      const validation = validateFiles(e.target.files);
                      if (!validation.valid) {
                        setError(true);
                        setMessage(validation.message);
                        e.target.value = ""; // Clear the input
                      }
                    }}
                  />

                  {currentModuleData?.contentFile &&
                    currentModuleData?.contentFile?.length > 0 && (
                      <div className="current-file">
                        <span
                          className="badge bg-info text-dark"
                          style={{ fontSize: "14px" }}
                        >
                          {currentModuleData.contentFile.length} arquivos
                          selecionados
                        </span>
                        <small className="d-block text-muted mt-1">
                          Selecione novos arquivos para substituir os atuais
                        </small>
                      </div>
                    )}

                  <small className="form-text text-muted">
                    Formatos suportados: PDF, DOCX, PPTX. Tamanho máximo: 50MB.
                    Máximo 5 arquivos
                  </small>
                </div>
                <div className="mb-3">
                  <label htmlFor="moduleDuration" className="form-label">
                    Duração do módulo (em minutos):
                  </label>
                  <input
                    type="number"
                    id="moduleDuration"
                    className="form-control mb-3"
                    required
                    min={1}
                    max={300}
                    defaultValue={currentModuleData?.duration || ""}
                  />
                  <small className="form-text text-muted">
                    Duração máxima: 300 minutos.
                  </small>
                </div>
                <div style={modalStyles.modalFooter}>
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={handleClose}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid h-100 d-flex flex-column align-items-center p-3">
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
            <div className="container d-flex align-items-center justify-content-between">
              <div className="d-flex flex-column">
                <h3 className="text-start mb-0">Criar curso</h3>
                <p className="mb-3">Complete todos os campos</p>
              </div>
              <div className="d-flex justify-content-end">
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
            </div>
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
                              checked={selectedRadio === "Iniciante"}
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
                              checked={selectedRadio === "Intermédio"}
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
                              checked={selectedRadio === "Difícil"}
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
                                onChange={handleRadioChangeType}
                                checked={selectedType === "Assíncrono"}
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
                                onChange={handleRadioChangeType}
                                checked={selectedType === "Síncrono"}
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
                      {selectedType === "Síncrono" && (
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
                    <h5 className="card-title mb-0">Módulos e Conteúdo</h5>
                  </div>
                  <div className="card-body">
                    <div>
                      <label className="form-label" htmlFor="courseModules">
                        Crie módulos e adicione conteúdo aos mesmos
                      </label>
                      <div className="d-flex flex-row gap-2">
                        <input
                          type="text"
                          className="form-control"
                          id="courseModules"
                          placeholder="Ex. Introdução ao React"
                          value={courseModules[0] || ""}
                          onChange={(e) =>
                            atualizarCampo(
                              setCourseModules,
                              courseModules,
                              0,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleNovoModulo}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div className="Modules-list mt-3">
                      {courseModules.slice(1).map((module, index) => {
                        // Handle both string and object modules
                        const isString = typeof module === "string";
                        const moduleName = isString ? module : module.name;
                        const hasContent = !isString && module.data;

                        return (
                          moduleName.trim() !== "" && (
                            <div
                              key={index}
                              className={`module-item d-flex align-items-center justify-content-between rounded-pill px-3 py-2 me-2 mb-2 ${
                                hasContent ? "bg-success-subtle" : "bg-light"
                              }`}
                              style={{
                                backgroundColor: hasContent
                                  ? "#e0f7e9"
                                  : "#f8f9fa",
                              }}
                            >
                              <span>{moduleName}</span>
                              <div className="d-inline-flex">
                                <button
                                  type="button"
                                  className="btn btn-sm text-primary ms-2 p-0 border-0"
                                  onClick={() => {
                                    const moduleName =
                                      typeof module === "string"
                                        ? module
                                        : module.name;
                                    setSelectedModule(moduleName);
                                    handleShow();
                                  }}
                                >
                                  <Pen size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger ms-2 p-0 border-0"
                                  onClick={() =>
                                    removerCampo(
                                      setCourseModules,
                                      courseModules,
                                      index + 1
                                    )
                                  }
                                  aria-label="Remover Módulo"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </div>
                          )
                        );
                      })}
                    </div>
                    {courseModules.length <= 1 && (
                      <div className="text-muted small mt-2">
                        Nenhum módulo adicionado ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4" style={{ maxHeight: "182px" }}>
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Datas do curso</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="mb-2">
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
                        <div className="mb-2">
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
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateCourse;
