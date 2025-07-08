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

function CreateCourse() {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
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
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [enrollmentDeadline, setEnrollmentDeadline] = useState("");

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
    document.body.style.overflow = "hidden";
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

  useEffect(() => {
    if (selectedModule) {
      const moduleIndex = courseModules.findIndex((module, i) => {
        if (i > 0) {
          const moduleName = typeof module === "string" ? module : module.name;
          return moduleName === selectedModule;
        }
        return false;
      });

      if (moduleIndex !== -1) {
        const module = courseModules[moduleIndex];
        if (typeof module !== "string" && module.data) {
          setCurrentModuleData(module.data);
        } else {
          setCurrentModuleData(null);
        }
      }
    } else {
      setCurrentModuleData(null);
    }
  }, [selectedModule, courseModules]);


  const handleModuleContentSubmit = (e) => {
    e.preventDefault();

    const moduleDescription = e.target.moduleDescription.value;
    const moduleVideoInput = e.target.moduleVideo;
    const moduleVideoURL = e.target.moduleVideoURL.value;
    const moduleContentInput = e.target.moduleContent;
    const moduleDuration = e.target.moduleDuration.value;
    const hasVideoFile = moduleVideoInput.files.length > 0;
    const hasVideoURL = moduleVideoURL.trim() !== "";
    const hasContentFiles = moduleContentInput.files.length > 0;
    const hasExistingVideo =
      currentModuleData?.videoFile || currentModuleData?.videoURL;
    const hasExistingContent =
      currentModuleData?.contentFile &&
      currentModuleData.contentFile.length > 0;

    const totalOptions = [
      hasVideoFile || hasExistingVideo,
      hasVideoURL,
      hasContentFiles || hasExistingContent,
    ].filter(Boolean).length;

    if (totalOptions === 0) {
      setError(true);
      setMessage(
        "Por favor, adicione pelo menos uma das seguintes opções:\n- Upload de vídeo\n- Link do YouTube\n- Arquivo de conteúdo (PDF/DOCX/PPTX)"
      );
      return;
    }

    if (hasVideoFile && hasVideoURL) {
      setError(true);
      setMessage(
        "Escolha apenas uma opção: upload de vídeo OU link do YouTube."
      );
      return;
    }

    if (
      hasVideoURL &&
      !/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(moduleVideoURL)
    ) {
      setError(true);
      setMessage("Por favor, insira uma URL válida do YouTube.");
      return;
    }

    if (!moduleDescription.trim()) {
      setError(true);
      setMessage("A descrição do módulo é obrigatória.");
      return;
    }

    if (!moduleDuration || moduleDuration < 1 || moduleDuration > 300) {
      setError(true);
      setMessage("A duração deve estar entre 1 e 300 minutos.");
      return;
    }

    let videoSource = null;
    if (hasVideoFile) {
      videoSource = { type: "file", data: moduleVideoInput.files[0] };
    } else if (hasVideoURL) {
      videoSource = { type: "url", data: moduleVideoURL };
    } else if (currentModuleData?.videoFile) {
      videoSource = { type: "file", data: currentModuleData.videoFile };
    } else if (currentModuleData?.videoURL) {
      videoSource = { type: "url", data: currentModuleData.videoURL };
    }

    let contentFile = [];
    if (hasContentFiles) {
      contentFile = Array.from(moduleContentInput.files);
    } else if (hasExistingContent) {
      contentFile = currentModuleData.contentFile;
    }

    const currentModule = selectedModule;

    const moduleIndex = courseModules.findIndex((module, i) => {
      if (i > 0) {
        const moduleName = typeof module === "string" ? module : module.name;
        return moduleName === currentModule;
      }
      return false;
    });

    if (moduleIndex !== -1) {
      const moduleData = {
        name: currentModule,
        description: moduleDescription,
        videoFile: videoSource?.type === "file" ? videoSource.data : null,
        videoURL: videoSource?.type === "url" ? videoSource.data : null,
        contentFile: contentFile,
        duration: moduleDuration,
      };

      const updatedModules = [...courseModules];
      updatedModules[moduleIndex] = {
        name: currentModule,
        data: moduleData,
      };

      handleClose();

      setTimeout(() => {
        setCourseModules(updatedModules);
        setCurrentModuleData(null);
        setError(false);
        setMessage("");
      }, 50);
    } else {
      handleClose();
      setCurrentModuleData(null);
    }
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(
          `${URL}/api/topicos/by-area/${selectedArea}`
        );
        setTopics(response.data);
      } catch (error) {
        console.error("Erro nos tópicos:", error);
      }
    };

    if (selectedArea) {
      fetchTopics();
    }
  }, [selectedArea]);

  useEffect(() => {
    const getAreas = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await axios.get(
          `${URL}/api/categorias/com-areas`
        );
        if (response.status === 200) {
          setCategory(response.data);
        } else {
          setError(true);
          setMessage("Erro ao encontrar as áreas. Tente novamente mais tarde.");
        }
      } catch (error) {
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
          `${URL}/api/user/teachers`
        );
        if (response.status === 200) {
          setFormador(response.data);
        } else {
          setError(true);
          setMessage("Erro ao encontrar os formadores. Tente novamente mais tarde.");
        }
      } catch (error) {
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
    setSelectedArea("");
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

    if (selectedType === "Síncrono") {
      const enrollmentDate = new Date(e.target.enrollmentDeadline.value);

      if (!e.target.enrollmentDeadline.value) {
        setError(true);
        setMessage(
          "A data limite de inscrição é obrigatória para cursos síncronos."
        );
        setIsLoading(false);
        return;
      }

      if (enrollmentDate >= startDate) {
        setError(true);
        setMessage(
          "A data limite de inscrição deve ser anterior à data de início do curso."
        );
        setIsLoading(false);
        return;
      }
    }

    const ID_FORMADOR =
      selectedType === "Síncrono" ? e.target.courseTeacher?.value : null;
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
    formData.append("ID_TOPICO", e.target.courseTopic.value);
    if (selectedType === "Síncrono") {
      formData.append(
        "DATA_LIMITE_INSCRICAO",
        e.target.enrollmentDeadline.value
      );
    }

    const filteredObjectives = courseObjectives
      .slice(1)
      .filter((obj) => obj.trim() !== "");
    formData.append("OBJETIVOS", filteredObjectives);

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
        if (typeof module === "string") {
          return { NOME: module };
        } else {
          return {
            NOME: module.name,
            DESCRICAO: module.data.description,
            DURACAO: module.data.duration,
            VIDEO: module.data.videoFile ? true : false,
            VIDEO_URL: module.data.videoURL || null,
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

    const novaURL =
      ID_FORMADOR === null
        ? `${URL}/api/cursos/create-assincrono`
        : `${URL}/api/cursos/create-sincrono`;

    try {
      const response = await axios.post(novaURL, formData, {
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
        setEnrollmentDeadline("");
      }
    } catch (error) {
      console.error("Erro a criar curso:", error);
      setError(true);
      setMessage("Erro ao criar curso. ERRO: " + error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNovoModulo = () => {
    const novoModulo = courseModules[0].trim();
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

      {showModal && (
        <div
          style={modalStyles.modalOverlay}
          onClick={(e) => {
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
                Editar módulo: {selectedModule}
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
                    Descrição do módulo *
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

                <div className="alert alert-info mb-3">
                  <strong>Conteúdo do módulo:</strong>
                  <br />
                  Adicione pelo menos <strong>uma</strong> das opções abaixo:
                  <ul className="mb-0 mt-2">
                    <li>Upload de vídeo</li>
                    <li>Link do YouTube</li>
                    <li>Arquivos de conteúdo (PDF/DOCX/PPTX)</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <label htmlFor="moduleVideo" className="form-label">
                    Upload de vídeo (opcional):
                  </label>
                  <input
                    type="file"
                    className="form-control mb-2"
                    id="moduleVideo"
                    accept="video/mp4, video/mkv, video/avi"
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        document.getElementById("moduleVideoURL").value = "";
                      }
                    }}
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

                <div className="text-center my-2">
                  <span className="badge bg-secondary">OU</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="moduleVideoURL" className="form-label">
                    Link do YouTube (opcional):
                  </label>
                  <input
                    type="url"
                    className="form-control mb-2"
                    id="moduleVideoURL"
                    placeholder="https://www.youtube.com/watch?v=example"
                    defaultValue={currentModuleData?.videoURL || ""}
                    onChange={(e) => {
                      const url = e.target.value;
                      if (url) {
                        document.getElementById("moduleVideo").value = "";
                      }
                      if (
                        url &&
                        !/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url)
                      ) {
                        setError(true);
                        setMessage(
                          "Por favor, insira uma URL válida do YouTube."
                        );
                      } else {
                        setError(false);
                        setMessage("");
                      }
                    }}
                  />
                  <small className="form-text text-muted">
                    Coloque aqui o link completo do vídeo no YouTube
                  </small>
                </div>

                <div className="text-center my-2">
                  <span className="badge bg-secondary">E/OU</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="moduleContent" className="form-label">
                    Conteúdo do módulo (opcional):
                  </label>
                  <input
                    type="file"
                    ref={moduleContentInputRef}
                    className="form-control mb-2"
                    id="moduleContent"
                    accept=".pdf, .docx, .pptx"
                    multiple
                    onChange={(e) => {
                      const validation = validateFiles(e.target.files);
                      if (!validation.valid) {
                        setError(true);
                        setMessage(validation.message);
                        e.target.value = "";
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
                    Duração do módulo (em minutos) *:
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
                    Duração entre 1 e 300 minutos.
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
                    Guardar módulo
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
                        Imagem do curso:
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
                                <option value="0">Não atibuir formador</option>
                                {Formador.map((formador) => (
                                  <option
                                    key={formador.ID_UTILIZADOR}
                                    value={formador.ID_UTILIZADOR}
                                  >
                                    {formador?.NOME || formador?.USERNAME}
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Tópico do curso</label>
                          <select
                            id="courseTopic"
                            className="form-select"
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            required
                          >
                            <option value="">Selecione um tópico</option>
                            {topics.map((topic) => (
                              <option
                                key={topic.ID_TOPICO}
                                value={topic.ID_TOPICO}
                              >
                                {topic.TITULO}
                              </option>
                            ))}
                          </select>
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
                              newObjectives.push(courseObjectives[0]);
                              newObjectives[0] = "";
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
                              newHabilities.push(courseHabilities[0]);
                              newHabilities[0] = "";
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
                        const isString = typeof module === "string";
                        const moduleName = isString ? module : module.name;
                        const hasContent = !isString && module.data;
                        let contentTypes = [];
                        if (hasContent) {
                          if (module.data.videoFile) contentTypes.push("Vídeo");
                          if (module.data.videoURL)
                            contentTypes.push("YouTube");
                          if (
                            module.data.contentFile &&
                            module.data.contentFile.length > 0
                          ) {
                            contentTypes.push(
                              `${module.data.contentFile.length} arquivo(s)`
                            );
                          }
                        }

                        return (
                          moduleName.trim() !== "" && (
                            <div
                              key={index}
                              className={`module-item d-flex align-items-center justify-content-between rounded px-3 py-2 me-2 mb-2 ${
                                hasContent
                                  ? "bg-success-subtle border border-success"
                                  : "bg-light border"
                              }`}
                            >
                              <div className="d-flex flex-column">
                                <span className="fw-medium">{moduleName}</span>
                                {hasContent && contentTypes.length > 0 && (
                                  <small className="text-muted">
                                    {contentTypes.join(" • ")}
                                  </small>
                                )}
                                {!hasContent && (
                                  <small className="text-warning">
                                    Sem conteúdo
                                  </small>
                                )}
                              </div>
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
                                  title="Editar módulo"
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
                                  title="Remover módulo"
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

              <div className="col-md-6 mb-4">
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
                      {selectedType === "Síncrono" && (
                        <div className="col-md-6">
                          <div className="mb-0">
                            <label className="form-label">
                              Data limite de inscrição{" "}
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="enrollmentDeadline"
                              value={enrollmentDeadline}
                              onChange={(e) =>
                                setEnrollmentDeadline(e.target.value)
                              }
                              required={selectedType === "Síncrono"}
                            />
                            <small className="form-text text-muted">
                              Deve ser anterior à data de início do curso
                            </small>
                          </div>
                        </div>
                      )}
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
