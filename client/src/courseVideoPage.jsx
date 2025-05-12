import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import NavbarDashboard from "./components/navbarDashboard";
import "./styles/CourseSidebar.css";
import VideoPlayer from "./components/videoplayer";
import Loader from "./components/loader";
import axios from "axios";
import "./styles/CourseVideoPage.css";

function CourseVideoPage() {
  const { courseId, moduleId } = useParams();
  const [videoID, setVideoID] = useState("");
  const [courseData, setCourseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0); // 0 - info, 1 - material, 2 - notas, 3 - anuncios

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/cursos/${courseId}`
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch course data");
        }
        const data = await response.data;
        //console.log(data.MODULOS[moduleId - 1].VIDEO_URL);
        const videoUrl = data.MODULOS[moduleId - 1].VIDEO_URL;
        const resourceId = extractCloudinaryResourceId(videoUrl);
        if (resourceId) {
          setVideoID(resourceId);
        } else {
          console.error("Invalid video URL format:", videoUrl);
        }
        setCourseData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, moduleId]);

  const getModuleFiles = (moduleFileUrl) => {
    if (!moduleFileUrl) return [];

    try {
      // If it's a JSON string, parse it
      if (typeof moduleFileUrl === "string" && moduleFileUrl.startsWith("[")) {
        return JSON.parse(moduleFileUrl);
      }
      // If it's already an array, return it
      if (Array.isArray(moduleFileUrl)) {
        return moduleFileUrl;
      }
      // If it's a single URL string, convert to array
      return [moduleFileUrl];
    } catch (e) {
      console.error("Error parsing file URLs:", e);
      return [];
    }
  };

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
      <NavbarDashboard />
      <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center p-4">
        <div className="container-fluid d-flex justify-content-between p-0 flex-row">
          <div className="container d-flex p-0 flex-column">
            {videoID && (
              <div className="video-player m-2">
                <VideoPlayer publicId={videoID} width={1100} height={510} />
              </div>
            )}
            <div className="video-description m-2">
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
              <div className="d-flex flex-column">
                {index === 0 && (
                  <>
                    <div className="d-flex flex-column">
                      <div className="container d-flex flex-column p-0 mt-2">
                        <h3 className="ps-2 fw-normal">
                          {courseData.MODULOS &&
                            courseData.MODULOS[moduleId - 1]?.NOME}
                        </h3>
                      </div>
                      <div className="d-flex flex-row">
                        <div className="d-flex flex-column align-items-center ps-2">
                          <div className="w-100">
                            <h5 className="fw-normal mb-0">4.3</h5>
                          </div>
                          <h6 className="fw-normal text-muted">X reviews</h6>
                        </div>

                        <div className="d-flex flex-column align-items-center ps-2">
                          <div className="w-100">
                            <h5 className="fw-normal mb-0">Y</h5>
                          </div>
                          <h6 className="fw-normal text-muted">Alunos</h6>
                        </div>

                        <div className="d-flex flex-column align-items-center ps-2">
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
                          courseData.MODULOS[moduleId - 1]?.FILE_URL ? (
                            Array.isArray(
                              courseData.MODULOS[moduleId - 1].FILE_URL
                            ) ? (
                              // Handle array of files case
                              <ul className="list-group">
                                {courseData.MODULOS[moduleId - 1].FILE_URL.map(
                                  (material, idx) => (
                                    <li
                                      key={idx}
                                      className="list-group-item d-flex align-items-center border-1 p-3"
                                    >
                                      <div className="material-info flex-grow-1">
                                        <h6 className="mb-0">
                                          {getFileName(material)}
                                        </h6>
                                      </div>
                                      {getModuleFiles(material).map(
                                        (url, idx) => (
                                          <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                          >
                                            Download
                                          </a>
                                        )
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              // Handle single file URL string case
                              <ul className="list-group">
                                <li className="list-group-item d-flex align-items-center border-0 py-3">
                                  <div className="material-icon me-3">
                                    <i className="fas fa-file-alt text-primary fs-4"></i>
                                  </div>
                                  <div className="material-info flex-grow-1">
                                    <h6 className="mb-1">
                                      {getFileName(
                                        courseData.MODULOS[moduleId - 1]
                                          .FILE_URL
                                      )}
                                    </h6>
                                  </div>
                                  <a
                                    href={
                                      courseData.MODULOS[moduleId - 1].FILE_URL
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary btn-sm"
                                    download
                                  >
                                    <i className="fas fa-download me-1"></i>{" "}
                                    Download
                                  </a>
                                </li>
                              </ul>
                            )
                          ) : (
                            <div className="alert alert-info mt-3">
                              <i className="fas fa-info-circle me-2"></i>
                              Não há material disponível para este módulo.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className="container course-sidebar border p-0"
            style={{ width: "28rem" }}
          ></div>
        </div>
      </div>
    </>
  );
}

export default CourseVideoPage;
