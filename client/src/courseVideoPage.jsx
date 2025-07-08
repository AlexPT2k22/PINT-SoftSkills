import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import NavbarDashboard from "./components/navbarDashboard";
import "./styles/CourseSidebar.css";
import Loader from "./components/loader";
import axios from "axios";
import "./styles/CourseVideoPage.css";
import { Check, Info, SquareArrowOutUpRight, LockKeyhole } from "lucide-react";
import NotesPanel from "./components/NotesPanel";
import VideoPlayer from "./components/video_player";
import AnunciosPanel from "./components/AnunciosPanel";
import "./styles/AnunciosPanel.css";

function CourseVideoPage() {
  const URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { courseId, moduleId } = useParams();
  const [videoID, setVideoID] = useState("");
  const [courseData, setCourseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0); // 0 - info, 1 - material, 2 - notas, 3 - anuncios
  const [moduleProgress, setModuleProgress] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoIframeRef = useRef(null);
  const cloudinaryPlayerRef = useRef(null);
  const [videoType, setVideoType] = useState("cloudinary");
  const [quiz, setQuiz] = useState(false);

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
    //console.log("Current time updated:", time);
  };

  useEffect(() => {
    if (!videoID) return;

    // Create script for Cloudinary Player SDK
    const script = document.createElement("script");
    script.src = "https://player.cloudinary.com/1.3.0/cld-video-player.min.js";
    script.async = true;

    script.onload = () => {
      window.addEventListener("message", (event) => {
        if (event.origin.includes("cloudinary.com")) {
          try {
            const data = JSON.parse(event.data);

            // Handle time updates
            if (data.event === "timeupdate" && data.player) {
              setCurrentTime(Math.floor(data.player.currentTime));
            }

            // Store player reference on ready
            if (data.event === "ready") {
              cloudinaryPlayerRef.current = {
                iframe: videoIframeRef.current,
                sendMessage: (action) => {
                  videoIframeRef.current.contentWindow.postMessage(
                    JSON.stringify(action),
                    "https://player.cloudinary.com"
                  );
                },
              };
            }
          } catch (e) {
            console.error("Error processing player message:", e);
          }
        }
      });
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [videoID]);

  const handlePauseVideo = () => {
    if (cloudinaryPlayerRef.current) {
      cloudinaryPlayerRef.current.sendMessage({
        method: "pause",
      });
    }
  };

  const handleResumeVideo = () => {
    if (cloudinaryPlayerRef.current) {
      cloudinaryPlayerRef.current.sendMessage({
        method: "play",
      });
    }
  };

  const markModuleAsCompleted = async () => {
    try {
      const response = await axios.post(
        `${URL}/api/user/complete-module`,
        {
          cursoId: parseInt(courseId),
          moduloId: parseInt(moduleId),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setModuleCompleted(true);

        setModuleProgress((prev) => ({
          ...prev,
          [moduleId]: true,
        }));

        fetchCourseProgress();

        //console.log(`Module ${moduleId} completed! XP gained: ${response.data.xpGanho}`);
      }
    } catch (error) {
      console.error("Nao foi possivel marcar o modulo como completo:", error);
    }
  };

  const navigateToModule = (moduleId) => {
    navigate(`/dashboard/courses/${courseId}/modules/${moduleId}`);
  };

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  const fetchCourseProgress = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/progress/courses/${courseId}/progress`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCourseProgress({
          percentualProgresso: response.data.percentualProgresso,
          modulosCompletos: response.data.modulosCompletos,
          totalModulos: response.data.totalModulos,
        });
      }
    } catch (error) {
      console.error("Nao foi possviel encontrar progresso:", error);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${URL}/api/cursos/${courseId}`, {
          withCredentials: true,
        });

        if (response.status !== 200) {
          throw new Error("Erro");
        }

        const data = response.data;
        const currentModule = data.MODULOS.find(
          (modulo) => modulo.ID_MODULO.toString() === moduleId
        );

        if (currentModule && currentModule.VIDEO_URL) {
          if (currentModule.VIDEO_URL.includes("youtube.com")) {
            const youtubeVideoId = extractYouTubeVideoId(
              currentModule.VIDEO_URL
            );
            if (youtubeVideoId) {
              setVideoID(youtubeVideoId);
              setVideoType("youtube");
            }
          } else {
            const resourceId = extractCloudinaryResourceId(
              currentModule.VIDEO_URL
            );
            if (resourceId) {
              setVideoID(resourceId);
              setVideoType("cloudinary");
            }
          }
        }

        setCourseData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkModuleProgress = async () => {
      try {
        const response = await axios.get(
          `${URL}/api/progress/courses/${courseId}/modules/progress`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const progressMap = {};
          response.data.modulos.forEach((modulo) => {
            progressMap[modulo.id] = modulo.completo;
          });

          setModuleProgress(progressMap);

          const currentModuleProgress = response.data.modulos.find(
            (m) => m.id.toString() === moduleId
          );

          if (currentModuleProgress?.completo) {
            setModuleCompleted(true);
          }
        }
      } catch (error) {
        console.error("Falhou a ir buscar o progresso:", error);
      }
    };

    const getQuizScore = async () => {
      try {
        const response = await axios.get(`${URL}/api/quiz/curso/${courseId}`, {
          withCredentials: true,
        });

        if (!response.data.quiz) {
          console.log("Nenhum quiz encontrado para este curso");
          setQuiz(false);
          return;
        }

        try {
          const getQuizResult = await axios.get(
            `${URL}/api/quiz/${response.data.quiz.ID_QUIZ}/resultado`,
            { withCredentials: true }
          );

          if (getQuizResult.data && getQuizResult.data.hasResponse === true) {
            setQuiz(true); // Quiz completo
          } else {
            setQuiz(false); // Quiz pendente
          }
        } catch (resultError) {
          //console.log("Utilizador ainda não respondeu ao quiz");
          setQuiz(false);
        }
      } catch (error) {
        console.error("Erro ao obter informações do quiz:", error);
        setQuiz(false);
      }
    };

    setModuleCompleted(false);

    getQuizScore();
    fetchCourseProgress();
    checkModuleProgress();
    fetchCourseData();
  }, [courseId, moduleId]);

  const getFileName = (fileUrl) => {
    if (!fileUrl) return null;
    const urlParts = fileUrl.split("-$");
    if (urlParts.length > 1) {
      return urlParts[1].split(".")[0];
    }
    return null;
  };

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const totalDuration = courseData.MODULOS?.reduce((acc, modulo) => {
    const duration = parseInt(modulo.TEMPO_ESTIMADO_MIN, 10);
    return acc + (isNaN(duration) ? 0 : duration);
  }, 0);

  const extractCloudinaryResourceId = (url) => {
    if (!url) return null;

    const regex = /\/v\d+\/(.+)\.(?:\w+)$/;
    const match = url.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  };

  const formattedDuration = totalDuration
    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
    : "N/A";

  return (
    <>
      {isLoading && <Loader />}
      <div className="course-page-container">
        <NavbarDashboard />

        <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center p-2 p-md-4">
          <div className="container-fluid d-flex flex-column flex-lg-row justify-content-between p-0">
            <div className="container d-flex p-0 flex-column order-1 order-lg-1 mb-3 mb-lg-0">
              {videoID && (
                <div
                  className="video-player"
                  style={{
                    width: "100%",
                  }}
                >
                  {videoType === "youtube" ? (
                    <iframe
                      width="100%"
                      height={window.innerWidth <= 768
                        ? "350px"
                        : window.innerWidth <= 1024
                        ? "400px"
                        : window.innerHeight <= 900
                        ? "550px"
                        : "100%"}
                      src={`https://www.youtube.com/embed/${videoID}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <VideoPlayer
                      id={"video-player"}
                      publicId={videoID}
                      onTimeUpdate={handleTimeUpdate}
                      onPause={handlePauseVideo}
                      onPlay={handleResumeVideo}
                    />
                  )}
                </div>
              )}

              <div className="video-description mt-3 mt-md-4">
                <div className="container d-flex flex-column p-0">
                  <div className="container justify-content-start d-flex align-items-center p-0">
                    <ul className="list-group list-group-horizontal nav-tabs-responsive">
                      <a
                        className={`menu  horizontal-list-item pb-0 rounded-0 text-decoration-none course-tab ${
                          index === 0 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(0)}
                      >
                        Info
                      </a>
                      <a
                        className={`menu  horizontal-list-item pb-0 text-decoration-none course-tab ${
                          index === 1 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(1)}
                      >
                        Material
                      </a>
                      <a
                        className={`menu  text-decoration-none horizontal-list-item pb-0 rounded-0 course-tab ${
                          index === 2 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(2)}
                      >
                        Notas
                      </a>
                      {courseData?.CURSO_SINCRONO && (
                        <a
                          className={`menu  text-decoration-none horizontal-list-item pb-0 rounded-0 course-tab ${
                            index === 3 ? "active" : ""
                          }`}
                          onClick={() => handleIndexChange(3)}
                        >
                          Anúncios
                        </a>
                      )}
                    </ul>
                  </div>
                  <div className="container d-flex align-items-center p-0">
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: "#DFE4EA",
                        marginTop: "-2px",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="d-flex flex-column mt-2">
                  {index === 0 && (
                    <div className="d-flex flex-column">
                      <div className="container d-flex flex-column p-0 mt-2">
                        <h3 className="ps-2 fw-normal module-title-responsive">
                          {courseData.MODULOS &&
                            courseData.MODULOS.find(
                              (m) => m.ID_MODULO.toString() === moduleId
                            )?.NOME}
                        </h3>
                      </div>
                      <div className="mt-0">
                        <p className="ps-2 mb-2 module-description-responsive">
                          {courseData.MODULOS &&
                            courseData.MODULOS.find(
                              (m) => m.ID_MODULO.toString() === moduleId
                            )?.DESCRICAO}
                        </p>
                      </div>
                      <div className="container d-flex align-items-center p-0">
                        <div
                          className="mb-2"
                          style={{
                            flex: 1,
                            height: "1px",
                            backgroundColor: "#DFE4EA",
                            marginTop: "-2px",
                          }}
                        ></div>
                      </div>
                      <div className="d-flex flex-row gap-3 ms-2">
                        <div className="d-flex flex-column align-items-center">
                          <div className="w-100">
                            <h5 className="fw-normal mb-0 duration-text-responsive">
                              {formattedDuration}
                            </h5>
                          </div>
                          <h6 className="fw-normal text-muted duration-label-responsive">
                            Duração total
                          </h6>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="d-flex flex-column">
                      <div className="container d-flex flex-column p-0 mt-2">
                        <h3 className="ps-2 fw-normal module-title-responsive">
                          Material do curso
                        </h3>
                      </div>
                      <div className="d-flex flex-row">
                        <div className="materials-container p-2 w-100">
                          {courseData.MODULOS &&
                            (() => {
                              const currentModule = courseData.MODULOS.find(
                                (m) => m.ID_MODULO.toString() === moduleId
                              );

                              if (
                                !currentModule?.FILE_URL ||
                                currentModule.FILE_URL.length === 0 ||
                                currentModule.FILE_URL_ARRAY.length === 0
                              ) {
                                return (
                                  <div className="alert alert-info mt-3">
                                    <Info size={16} className="me-1" />
                                    Não há material disponível para este módulo.
                                  </div>
                                );
                              }

                              const fileUrls = Array.isArray(
                                currentModule.FILE_URL
                              )
                                ? currentModule.FILE_URL
                                : [currentModule.FILE_URL];

                              return (
                                <ul className="list-group">
                                  {fileUrls.map((material, idx) => (
                                    <li
                                      key={idx}
                                      className="list-group-item d-flex flex-column flex-sm-row align-items-start align-items-sm-center border-1 p-3"
                                    >
                                      <div className="material-info flex-grow-1 mb-2 mb-sm-0 w-100">
                                        <h6 className="mb-0 material-filename-responsive">
                                          {getFileName(material)}
                                        </h6>
                                      </div>
                                      <a
                                        href={material}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-outline-primary btn-sm w-sm-auto"
                                      >
                                        Download
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              );
                            })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="d-flex flex-column">
                      <div className="container d-flex flex-column p-0 mt-2">
                        <h3 className="ps-2 fw-normal module-title-responsive">
                          Notas
                        </h3>
                      </div>
                      <NotesPanel
                        moduleId={moduleId}
                        currentTime={currentTime}
                        onPauseVideo={handlePauseVideo}
                        onResumeVideo={handleResumeVideo}
                        playerRef={cloudinaryPlayerRef}
                      />
                    </div>
                  )}

                  {index === 3 && courseData?.CURSO_SINCRONO && (
                    <AnunciosPanel
                      courseId={courseId}
                      courseData={courseData}
                    />
                  )}
                </div>
              </div>
            </div>

            <div
              className="container course-sidebar border p-0 order-2 order-lg-2"
              style={{
                width: window.innerWidth <= 1024 ? "100%" : "28rem",
                maxHeight:
                  window.innerWidth <= 768
                    ? "400px"
                    : window.innerWidth <= 1024
                    ? "500px"
                    : window.innerHeight <= 900
                    ? "450px"
                    : "610px",
              }}
            >
              <div className="lesson-header">
                <h5 className="lesson-title mb-1 sidebar-title-responsive">
                  {courseData.NOME}
                </h5>
                <span className="lesson-count sidebar-count-responsive">
                  {courseProgress?.modulosCompletos || 0} de{" "}
                  {courseProgress?.totalModulos || 0} módulos completos (
                  {courseProgress?.percentualProgresso || 0}%)
                </span>
                <div className="progress mt-2" style={{ height: "4px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${courseProgress?.percentualProgresso || 0}%`,
                      backgroundColor: "#39639c",
                    }}
                    aria-valuenow={courseProgress?.percentualProgresso || 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>

              <ul className="module-list">
                {courseData.MODULOS?.map((modulo) => (
                  <li
                    key={modulo.ID_MODULO}
                    className={`module-item ${
                      moduleId === modulo.ID_MODULO.toString() ? "active" : ""
                    }`}
                    onClick={() => navigateToModule(modulo.ID_MODULO)}
                  >
                    <div
                      className={`module-status ${
                        moduleProgress[modulo.ID_MODULO] ? "completed" : ""
                      }`}
                      onClick={markModuleAsCompleted}
                    >
                      {moduleProgress[modulo.ID_MODULO] && (
                        <Check size={14} color="#fff" />
                      )}
                    </div>
                    <div className="module-content">
                      <div className="module-title module-title-sidebar-responsive">
                        {modulo.NOME}
                      </div>
                      <div className="module-duration module-duration-responsive">
                        {modulo.TEMPO_ESTIMADO_MIN} minutos
                      </div>
                    </div>
                  </li>
                ))}
                {courseData.HAS_QUIZ && (
                  <li
                    className={`module-item ${
                      moduleId === "quiz" ? "active" : ""
                    } ${
                      (courseProgress?.percentualProgresso || 0) < 100
                        ? "disabled"
                        : ""
                    }`}
                    onClick={() => {
                      if ((courseProgress?.percentualProgresso || 0) >= 100) {
                        navigate(`/dashboard/courses/${courseId}/quiz`);
                      }
                    }}
                  >
                    <div
                      className={`module-status ${
                        quiz === true ? "completed" : ""
                      }`}
                    >
                      {(courseProgress?.percentualProgresso || 0) < 100 ? (
                        <LockKeyhole size={14} color="#6c757d" />
                      ) : quiz === true ? (
                        <Check size={14} color="#fff" />
                      ) : (
                        <Info size={14} color="#007bff" />
                      )}
                    </div>
                    <div className="module-content">
                      <div className="module-title module-title-sidebar-responsive">
                        Quiz do curso <SquareArrowOutUpRight size={14} />
                      </div>
                      <div className="module-duration module-duration-responsive">
                        {(courseProgress?.percentualProgresso || 0) < 100
                          ? "Complete todos os módulos primeiro"
                          : quiz === true
                          ? "Quiz completo"
                          : "Teste final pendente"}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseVideoPage;
