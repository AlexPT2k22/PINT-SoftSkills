import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import NavbarDashboard from "./components/navbarDashboard";
import "./styles/CourseSidebar.css";
import Loader from "./components/loader";
import axios from "axios";
import "./styles/CourseVideoPage.css";
import { Check, Info } from "lucide-react";
import NotesPanel from "./components/NotesPanel";
import VideoPlayer from "./components/video_player";

function CourseVideoPage() {
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
  const videoRef = useRef(null);

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

  // Handle pause/play for notes
  const handlePauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleResumeVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const markModuleAsCompleted = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/api/progress/courses/${courseId}/modules/${moduleId}/complete`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Immediately mark as completed in the UI
        setModuleCompleted(true);

        // Update the progress map with the new completed module
        setModuleProgress((prev) => ({
          ...prev,
          [moduleId]: true,
        }));

        fetchCourseProgress();

        console.log(
          `Module ${moduleId} completed! Course progress: ${response.data.progress}%`
        );
      }
    } catch (error) {
      console.error("Failed to mark module as completed:", error);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const navigateToModule = (moduleId) => {
    navigate(`/dashboard/courses/${courseId}/modules/${moduleId}`);
  };

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  const fetchCourseProgress = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/progress/courses/${courseId}/progress`,
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
      console.error("Failed to fetch course progress:", error);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/cursos/${courseId}`,
          {
            withCredentials: true,
          }
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch course data");
        }
        const data = await response.data;
        const currentModule = data.MODULOS.find(
          (modulo) => modulo.ID_MODULO.toString() === moduleId
        );

        if (currentModule) {
          const resourceId = extractCloudinaryResourceId(
            currentModule.VIDEO_URL
          );
          if (resourceId) {
            setVideoID(resourceId);
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
          `http://localhost:4000/api/progress/courses/${courseId}/modules/progress`,
          { withCredentials: true }
        );

        if (response.data.success) {
          //console.log("Module progress data:", response.data);
          // Convert the array response to a module ID mapped object
          const progressMap = {};
          response.data.modulos.forEach((modulo) => {
            progressMap[modulo.id] = modulo.completo;
          });

          setModuleProgress(progressMap);

          // Check if current module is completed
          const currentModuleProgress = response.data.modulos.find(
            (m) => m.id.toString() === moduleId
          );

          if (currentModuleProgress?.completo) {
            setModuleCompleted(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      }
    };

    setModuleCompleted(false);

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

        <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center p-4">
          <div className="container-fluid d-flex justify-content-between p-0 flex-row">
            <div className="container d-flex p-0 flex-column">
              {videoID && (
                <div
                  className="video-player"
                  style={{ width: "100%", height: "610px" }}
                >
                  <VideoPlayer
                    id={"video-player"}
                    publicId={videoID}
                    onTimeUpdate={handleTimeUpdate}
                    onPause={handlePauseVideo}
                    onPlay={handleResumeVideo}
                  />
                </div>
              )}

              <div className="video-description mt-4">
                <div className="container d-flex flex-column p-0">
                  <div className="container justify-content-start d-flex align-items-center">
                    <ul className="list-group list-group-horizontal">
                      <a
                        className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                          index === 0 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(0)}
                      >
                        Info
                      </a>
                      <a
                        className={`list-group-item list-group-item-action horizontal-list-item pb-0 course-tab ${
                          index === 1 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(1)}
                      >
                        Material
                      </a>
                      <a
                        className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                          index === 2 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(2)}
                      >
                        Notas
                      </a>
                      <a
                        className={`list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ${
                          index === 3 ? "active" : ""
                        }`}
                        onClick={() => handleIndexChange(3)}
                      >
                        Anúncios
                      </a>
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
                    <>
                      <div className="d-flex flex-column">
                        <div className="container d-flex flex-column p-0 mt-2">
                          <h3 className="ps-2 fw-normal">
                            {courseData.MODULOS &&
                              courseData.MODULOS.find(
                                (m) => m.ID_MODULO.toString() === moduleId
                              )?.NOME}
                          </h3>
                        </div>

                        <div className="mt-0">
                          <p className="ps-2 mb-2">
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
                        <div className="d-flex flex-row gap-3">
                          <div className="d-flex flex-column align-items-center ps-2">
                            <div className="w-100">
                              <h5 className="fw-normal mb-0">4.3</h5>
                            </div>
                            <h6 className="fw-normal text-muted">X reviews</h6>
                          </div>

                          <div className="d-flex flex-column align-items-center ">
                            <div className="w-100">
                              <h5 className="fw-normal mb-0">Y</h5>
                            </div>
                            <h6 className="fw-normal text-muted">Alunos</h6>
                          </div>

                          <div className="d-flex flex-column align-items-center ">
                            <div className="w-100">
                              <h5 className="fw-normal mb-0">
                                {formattedDuration}
                              </h5>
                            </div>
                            <h6 className="fw-normal text-muted">
                              Duração total
                            </h6>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {index === 1 && (
                    <>
                      <div className="d-flex flex-column">
                        <div className="container d-flex flex-column p-0 mt-2">
                          <h3 className="ps-2 fw-normal">Material do curso</h3>
                        </div>
                        <div className="d-flex flex-row">
                          <div className="materials-container p-2 w-100">
                            {courseData.MODULOS &&
                              (() => {
                                const currentModule = courseData.MODULOS.find(
                                  (m) => m.ID_MODULO.toString() === moduleId
                                );

                                if (!currentModule?.FILE_URL) {
                                  return (
                                    <div className="alert alert-info mt-3">
                                      <Info size={16} className="me-1" />
                                      Não há material disponível para este
                                      módulo.
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
                                        className="list-group-item d-flex align-items-center border-1 p-3"
                                      >
                                        <div className="material-info flex-grow-1">
                                          <h6 className="mb-0">
                                            {getFileName(material)}
                                          </h6>
                                        </div>
                                        <a
                                          href={material}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="btn btn-outline-primary btn-sm"
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
                    </>
                  )}

                  {index === 2 && (
                    <NotesPanel
                      moduleId={moduleId}
                      currentTime={currentTime}
                      onPauseVideo={handlePauseVideo}
                      onResumeVideo={handleResumeVideo}
                      playerRef={cloudinaryPlayerRef}
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              className="container course-sidebar border p-0"
              style={{ width: "28rem" }}
            >
              <div className="lesson-header">
                <h5 className="lesson-title mb-1">{courseData.NOME}</h5>
                <span className="lesson-count">
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
                      <div className="module-title">{modulo.NOME}</div>
                      <div className="module-duration">
                        {modulo.TEMPO_ESTIMADO_MIN} minutos
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseVideoPage;
