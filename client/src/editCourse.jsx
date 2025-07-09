import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ButtonWithLoader from "./components/butao_loader";
import SuccessMessage from "./components/sucess_message";
import ErrorMessage from "./components/error_message";
import { XCircle, Pen } from "lucide-react";
import QuizManager from "./components/QuizManager";
import useAuthStore from "./store/authStore";

function EditCourse() {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGestor = user?.perfil === 3;
  const isFormador = user?.perfil === 2;
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
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [enrollmentDeadline, setEnrollmentDeadline] = useState("");
  const [courseModules, setCourseModules] = useState([""]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentModuleData, setCurrentModuleData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const moduleContentInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [category, setCategory] = useState([]);
  const [Formador, setFormador] = useState([]);
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
      zIndex: 1050,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      width: "100%",
      maxWidth: "600px",
      maxHeight: "95vh",
      overflowY: "auto",
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

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;

    if (name === "difficulty") {
      setCourseDifficulty(value);
    } else if (name === "courseType") {
      setSelectedRadio(value);
      setCourseType(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedArea("");
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

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(`${URL}/api/user/teachers`);
        if (response.status === 200) {
          setFormador(response.data);
        }
      } catch (error) {
        console.error("Erro a ir buscar formadores:", error);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${URL}/api/cursos/${courseId}`);

        setCourseData(response.data);
        setCourseName(response.data.NOME || "");
        setCourseDescription(response.data.DESCRICAO_OBJETIVOS__ || "");
        setCourseDifficulty(response.data.DIFICULDADE_CURSO__ || "");

        if (response.data.IMAGEM) {
          setImagePreview(response.data.IMAGEM);
        }

        if (response.data.CURSO_SINCRONO?.DATA_LIMITE_INSCRICAO_S) {
          const enrollmentDeadlineISO =
            response.data.CURSO_SINCRONO.DATA_LIMITE_INSCRICAO_S;
          if (enrollmentDeadlineISO) {
            setEnrollmentDeadline(enrollmentDeadlineISO.split("T")[0]);
          }
        }

        const isSynchronous = response.data.CURSO_SINCRONO != null;
        setCourseType(isSynchronous ? "Síncrono" : "Assíncrono");
        setSelectedRadio(isSynchronous ? "Síncrono" : "Assíncrono");

        if (response.data.ID_TOPICO) {
          setSelectedTopic(response.data.ID_TOPICO.toString());
        }

        if (response.data.CURSO_SINCRONO) {
          setSelectedTeacher(response.data.CURSO_SINCRONO.ID_UTILIZADOR);
        }

        if (response.data.CURSO_SINCRONO?.VAGAS) {
          setAvailableSeats(response.data.CURSO_SINCRONO.VAGAS);
        }

        if (response.data.CURSO_SINCRONO) {
          const startDateISO = response.data.CURSO_SINCRONO.DATA_INICIO;
          const endDateISO = response.data.CURSO_SINCRONO.DATA_FIM;

          if (startDateISO) {
            setStartDate(startDateISO.split("T")[0]);
          }

          if (endDateISO) {
            setEndDate(endDateISO.split("T")[0]);
          }
        }

        if (response.data.CURSO_ASSINCRONO) {
          const startDateISO = response.data.CURSO_ASSINCRONO.DATA_INICIO;
          const endDateISO = response.data.CURSO_ASSINCRONO.DATA_FIM;

          if (startDateISO) {
            setStartDate(startDateISO.split("T")[0]);
          }

          if (endDateISO) {
            setEndDate(endDateISO.split("T")[0]);
          }
        }

        if (response.data.OBJETIVOS && response.data.OBJETIVOS.length > 0) {
          const extractedObjectives = response.data.OBJETIVOS.map((obj) =>
            obj.DESCRICAO?.trim()
          ).filter(Boolean);
          setCourseObjectives(["", ...extractedObjectives]);
        } else {
          setCourseObjectives([""]);
        }

        if (response.data.HABILIDADES && response.data.HABILIDADES.length > 0) {
          const extractedAbilities = response.data.HABILIDADES.map((hab) =>
            hab.DESCRICAO?.trim()
          ).filter(Boolean);
          setCourseHabilities(["", ...extractedAbilities]);
        } else {
          setCourseHabilities([""]);
        }

        if (response.data.MODULOS && response.data.MODULOS.length > 0) {
          const modulesList = [
            "",
            ...response.data.MODULOS.map((modulo) => ({
              name: modulo.NOME,
              data: {
                name: modulo.NOME,
                description: modulo.DESCRICAO || "",
                videoFile: null,
                videoURL: modulo.VIDEO_URL || null,
                contentFile: [],
                existingContentUrls: modulo.FILE_URL_ARRAY || [],
                duration: modulo.TEMPO_ESTIMADO_MIN || 30,
                hasExistingContent: modulo.HAS_CONTENT || false,
              },
            })),
          ];
          setCourseModules(modulesList);
        } else {
          setCourseModules([""]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error ao buscar dados do curso:", error);
        setError("Erro ao buscar dados do curso. Tente novamente mais tarde.");
        setIsLoading(false);
      }
    };

    const getAreas = async () => {
      try {
        setIsLoadingAttributes(true);
        const response = await axios.get(`${URL}/api/categorias/com-areas`);
        if (response.status === 200) {
          setCategory(response.data);
        } else {
          setError("Erro ao procurar as  áreas. Tente novamente mais tarde.");
        }
        setIsLoadingAttributes(false);
      } catch (error) {
        console.error("Erro a buscar as áreas:", error);
        setError("Erro ao buscar áreas. Tente novamente mais tarde.");
        setIsLoadingAttributes(false);
      }
    };

    fetchCourseData();
    getAreas();
  }, [courseId]);

  useEffect(() => {
    if (category.length > 0 && courseData?.AREA?.Categoria) {
      const categoryIdFromAPI = Number(
        courseData.AREA.Categoria.ID_CATEGORIA__PK___
      );
      const areaIdFromAPI = Number(courseData.ID_AREA);

      setSelectedCategory(categoryIdFromAPI);
      setSelectedArea(areaIdFromAPI);
    }
  }, [category, courseData]);

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
      currentModuleData?.hasExistingContent ||
      (currentModuleData?.existingContentUrls &&
        currentModuleData.existingContentUrls.length > 0);

    const totalOptions = [
      hasVideoFile || hasExistingVideo,
      hasVideoURL,
      hasContentFiles || hasExistingContent,
    ].filter(Boolean).length;

    if (totalOptions === 0) {
      setError(
        "Por favor, adicione pelo menos uma das seguintes opções: link do YouTube ou arquivo de conteúdo."
      );
      return;
    }

    if (hasVideoFile && hasVideoURL) {
      setError("Escolha apenas uma opção: upload de vídeo OU link do YouTube.");
      return;
    }

    if (
      hasVideoURL &&
      !/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(moduleVideoURL)
    ) {
      setError("Por favor, insira uma URL válida do YouTube.");
      return;
    }

    if (!moduleDescription.trim()) {
      setError("A descrição do módulo é obrigatória.");
      return;
    }

    if (!moduleDuration || moduleDuration < 1 || moduleDuration > 300) {
      setError("A duração deve estar entre 1 e 300 minutos.");
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
    let existingContentUrls = [];

    if (hasContentFiles) {
      contentFile = Array.from(moduleContentInput.files);
    } else if (hasExistingContent) {
      existingContentUrls = currentModuleData.existingContentUrls || [];
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
        existingContentUrls: existingContentUrls,
        duration: moduleDuration,
        hasExistingContent: existingContentUrls.length > 0,
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
      }, 50);
    } else {
      handleClose();
      setCurrentModuleData(null);
    }
  };

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        if (selectedArea) {
          const response = await axios.get(
            `${URL}/api/topicos/by-area/${selectedArea}`
          );
          setTopics(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar os tópicos:", error);
      }
    };

    fetchTopics();
  }, [selectedArea]);

  useEffect(() => {
    if (courseData?.ID_TOPICO) {
      setSelectedTopic(courseData.ID_TOPICO.toString());
    }
  }, [courseData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj > endDateObj) {
      setError(
        "A data de início não pode ser posterior à data de fim do curso."
      );
      return;
    }

    const originalType = courseData.CURSO_SINCRONO ? "Síncrono" : "Assíncrono";
    const isTypeChanged = originalType !== selectedRadio;

    if (selectedRadio === "Síncrono" && (!selectedTeacher || !availableSeats)) {
      setError(
        "Para cursos síncronos, é obrigatório selecionar um formador e definir o número de vagas."
      );
      return;
    }

    if (selectedRadio === "Síncrono") {
      const startDateObj = new Date(startDate);
      const enrollmentDateObj = new Date(enrollmentDeadline);

      if (!enrollmentDeadline) {
        setError(
          "A data limite de inscrição é obrigatória para cursos síncronos."
        );
        return;
      }

      if (enrollmentDateObj >= startDateObj) {
        setError(
          "A data limite de inscrição deve ser anterior à data de início do curso."
        );
        return;
      }
    }

    if (
      courseObjectives.length <= 1 ||
      courseObjectives.every((obj) => obj.trim() === "")
    ) {
      setError("Adicione pelo menos um objetivo.");
      return;
    }

    if (
      courseHabilities.length <= 1 ||
      courseHabilities.every((ability) => ability.trim() === "")
    ) {
      setError("Adicione pelo menos uma habilidade.");
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
      formData.append("ID_TOPICO", selectedTopic);
      if (selectedRadio === "Síncrono") {
        formData.append("DATA_LIMITE_INSCRICAO", enrollmentDeadline);
      }

      const filteredObjectives = courseObjectives
        .slice(1)
        .filter((obj) => obj.trim() !== "");
      formData.append("OBJETIVOS", filteredObjectives.join(","));

      const filteredHabilities = courseHabilities
        .slice(1)
        .filter((ability) => ability.trim() !== "");
      formData.append("HABILIDADES", filteredHabilities.join(","));

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
          if (module.data.videoFile && module.data.videoFile instanceof File) {
            formData.append(`module_${index}_video`, module.data.videoFile);
          }

          if (module.data.contentFile && module.data.contentFile.length > 0) {
            module.data.contentFile.forEach((file, fileIndex) => {
              if (file instanceof File) {
                formData.append(
                  `module_${index}_content_${fileIndex}`,
                  file,
                  file.name
                );
              }
            });
          }
        }
      });

      if (selectedRadio === "Síncrono") {
        formData.append("ID_UTILIZADOR", selectedTeacher);
        formData.append("VAGAS", availableSeats);
        formData.append("COURSE_TYPE", "Síncrono");
      } else {
        formData.append("COURSE_TYPE", "Assíncrono");
      }

      if (courseImage) {
        formData.append("imagem", courseImage);
      }

      const endpoint = `${URL}/api/cursos/${courseId}/completo`;

      const response = await axios.put(endpoint, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setShowSuccess(true);
        if (isTypeChanged) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erro a atualizar curso:", error);
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
            <div className="container d-flex align-items-center justify-content-between">
              <div className="d-flex flex-column">
                <h3 className="text-start mb-0">Editar curso: {courseName}</h3>
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
                  disabled={isSubmitting || !isValid || isDeleting}
                >
                  {isSubmitting ? (
                    <ButtonWithLoader isLoading={isSubmitting} />
                  ) : (
                    "Atualizar curso"
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
                    {isLoadingAttributes || isLoading ? (
                      <div className="spinner-border">
                        <span className="visually-hidden">A carregar...</span>
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
                          {imagePreview && (
                            <div className="mb-3">
                              <img
                                src={imagePreview}
                                alt="Preview do curso"
                                className="img-fluid rounded"
                                style={{
                                  maxHeight: "200px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <small className="text-muted d-block mt-1">
                                {courseImage
                                  ? "Nova imagem selecionada"
                                  : "Imagem atual"}
                              </small>
                            </div>
                          )}
                          <input
                            type="file"
                            className="form-control mb-3"
                            id="courseImage"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageChange}
                          />
                          <small className="form-text text-muted">
                            Formatos suportados: PNG, JPEG, JPG. Deixe em branco
                            para manter a imagem atual.
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
                                  disabled={isFormador}
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
                                  disabled={isFormador}
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
                                  disabled={isFormador}
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
                                    disabled={true}
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
                                    disabled={true}
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
                                    disabled={isFormador}
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
                                    disabled={
                                      isFormador ||
                                      (enrollmentDeadline &&
                                        new Date(enrollmentDeadline) <
                                          new Date())
                                    }
                                  />
                                  {enrollmentDeadline &&
                                    new Date(enrollmentDeadline) <
                                      new Date() && (
                                      <small className="text-danger">
                                        Não é possível alterar o número de vagas
                                        após a data limite de inscrição.
                                      </small>
                                    )}
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
                                  disabled={isFormador}
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
                                  disabled={isFormador}
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
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">
                                Tópico do curso
                              </label>
                              <select
                                id="courseTopic"
                                className="form-select"
                                value={selectedTopic}
                                onChange={(e) =>
                                  setSelectedTopic(e.target.value)
                                }
                                required
                                disabled={isFormador}
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

                    <div className="modules-list mt-3">
                      {courseModules.slice(1).map((module, index) => {
                        const isString = typeof module === "string";
                        const moduleName = isString ? module : module.name;
                        const hasContent = !isString && module.data;

                        let contentTypes = [];
                        if (hasContent) {
                          if (module.data.videoURL) {
                            if (
                              module.data.videoURL.startsWith(
                                "https://www.youtube.com/watch?v="
                              )
                            ) {
                              contentTypes.push("Vídeo (YouTube)");
                            } else {
                              contentTypes.push("Vídeo (Uploaded)");
                            }
                          }

                          const newFiles = module.data.contentFile
                            ? module.data.contentFile.length
                            : 0;
                          const existingFiles = module.data.existingContentUrls
                            ? module.data.existingContentUrls.length
                            : 0;
                          const totalFiles = newFiles + existingFiles;

                          if (totalFiles > 0) {
                            contentTypes.push(`${totalFiles} arquivo(s)`);
                          }
                        }

                        return (
                          moduleName.trim() !== "" && (
                            <div
                              key={index}
                              className={`module-item d-flex align-items-center justify-content-between rounded px-3 py-2 mb-2 ${
                                hasContent && contentTypes.length > 0
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
                                {hasContent && contentTypes.length === 0 && (
                                  <small className="text-warning">
                                    Sem conteúdo
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
                                    setSelectedModule(moduleName);
                                    if (!isString && module.data) {
                                      setCurrentModuleData(module.data);
                                    } else {
                                      setCurrentModuleData(null);
                                    }
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
                          {selectedRadio === "Síncrono" && (
                            <div className="col-md-6">
                              <div className="mb-0">
                                <label className="form-label">
                                  Data limite de inscrição{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="date"
                                  className="form-control"
                                  id="enrollmentDeadline"
                                  value={enrollmentDeadline}
                                  onChange={(e) =>
                                    setEnrollmentDeadline(e.target.value)
                                  }
                                  required={selectedRadio === "Síncrono"}
                                />
                                <small className="form-text text-muted">
                                  Deve ser anterior à data de início do curso
                                </small>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <QuizManager
                  courseId={courseId}
                  courseType={selectedRadio}
                  userRole={isGestor}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

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
                <div className="alert alert-warning mb-3">
                  <strong>Regras de conteúdo:</strong>
                  <ul className="mb-0 mt-2">
                    <li>
                      Adicione pelo menos <strong>uma</strong> das opções abaixo
                    </li>
                    <li>
                      <strong>Vídeo:</strong> YouTube
                    </li>
                    <li>
                      <strong>Arquivos:</strong> Opcional, mas recomendado
                    </li>
                    <li>
                      <strong>Substituição:</strong> Novo conteúdo substitui o
                      anterior
                    </li>
                  </ul>
                </div>
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

                <div className="mb-3">
                  <label htmlFor="moduleVideoURL" className="form-label">
                    Link do YouTube:
                  </label>
                  <input
                    type="url"
                    className="form-control mb-2"
                    id="moduleVideoURL"
                    placeholder="https://www.youtube.com/watch?v=example"
                    defaultValue={
                      currentModuleData?.videoURL?.startsWith(
                        "https://www.youtube.com/watch?v="
                      )
                        ? currentModuleData.videoURL
                        : ""
                    }
                    onChange={(e) => {
                      const url = e.target.value;
                      if (url) {
                        document.getElementById("moduleVideo").value = "";

                        if (
                          currentModuleData?.videoFile ||
                          currentModuleData?.videoURL
                        ) {
                          const confirmReplace = window.confirm(
                            "Isto irá substituir o vídeo atual. Deseja continuar?"
                          );
                          if (!confirmReplace) {
                            e.target.value = "";
                            return;
                          }
                        }
                      }

                      if (
                        url &&
                        !/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url)
                      ) {
                        setError(
                          "Por favor, insira uma URL válida do YouTube."
                        );
                      } else {
                        setError(null);
                      }
                    }}
                  />

                  {currentModuleData?.videoURL?.startsWith(
                    "https://www.youtube.com/watch?v="
                  ) && (
                    <div className="current-file mb-2">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-danger me-2">Atual</span>
                        <small className="text-muted">
                          YouTube:{" "}
                          {currentModuleData.videoURL.substring(32, 43)}...
                        </small>
                      </div>
                      <small className="d-block text-warning mt-1">
                        Inserir nova URL irá substituir esta
                      </small>
                    </div>
                  )}

                  <small className="form-text text-muted">
                    Cole o link completo do YouTube
                  </small>
                </div>

                <div className="text-center my-3">
                  <span className="badge bg-secondary fs-6">E/OU</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="moduleContent" className="form-label">
                    Arquivos de conteúdo (opcional):
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
                        setError(validation.message);
                        e.target.value = "";
                        return;
                      }

                      if (
                        e.target.files.length > 0 &&
                        currentModuleData?.existingContentUrls &&
                        currentModuleData.existingContentUrls.length > 0
                      ) {
                        const confirmReplace = window.confirm(
                          `Isto irá substituir os ${currentModuleData.existingContentUrls.length} arquivos atuais. Deseja continuar?`
                        );
                        if (!confirmReplace) {
                          e.target.value = "";
                        }
                      }

                      setError(null);
                    }}
                  />

                  {currentModuleData?.existingContentUrls &&
                    currentModuleData.existingContentUrls.length > 0 && (
                      <div className="current-file mb-2">
                        <div className="d-flex align-items-center">
                          <span className="badge bg-success me-2">
                            {currentModuleData.existingContentUrls.length}{" "}
                            atuais
                          </span>
                          <small className="text-muted">
                            Arquivos existentes no módulo
                          </small>
                        </div>
                        <small className="d-block text-warning mt-1">
                          Selecionar novos arquivos irá substituir todos os
                          atuais
                        </small>
                        <div className="mt-1">
                          {currentModuleData.existingContentUrls
                            .slice(0, 3)
                            .map((url, index) => (
                              <small key={index} className="d-block text-muted">
                                • Arquivo {index + 1}
                              </small>
                            ))}
                          {currentModuleData.existingContentUrls.length > 3 && (
                            <small className="d-block text-muted">
                              ... e mais{" "}
                              {currentModuleData.existingContentUrls.length - 3}{" "}
                              arquivo(s)
                            </small>
                          )}
                        </div>
                      </div>
                    )}

                  <small className="form-text text-muted">
                    Formatos: PDF, DOCX, PPTX • Máximo: 50MB total • Máximo: 5
                    arquivos
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="moduleDuration" className="form-label">
                    Duração do módulo (minutos) *:
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
                    Entre 1 e 300 minutos (estimativa de tempo de estudo)
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
    </>
  );
}

export default EditCourse;
