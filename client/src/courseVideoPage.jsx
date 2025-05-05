import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import NavbarDashboard from "./components/navbarDashboard";
import "./styles/CourseSidebar.css";
import VideoPlayer from "./components/videoplayer";
import Loader from "./components/loader";
import axios from "axios";

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

  const totalDuration = courseData.MODULOS?.reduce((acc, modulo) => {
    const duration = parseInt(modulo.TEMPO_ESTIMADO_MIN, 10);
    return acc + (isNaN(duration) ? 0 : duration);
  }, 0);

  const extractCloudinaryResourceId = (url) => {
    if (!url) return null;

    // Pattern to match: after version number (v1234567890/) and before file extension
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
                <VideoPlayer publicId={videoID} />
              </div>
            )}
            <div className="video-description m-2">
              <div className="container d-flex flex-column p-0">
                <div className="container justify-content-start d-flex align-items-center">
                  <ul className="list-group list-group-horizontal">
                    <a className="list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab active">
                      Info
                    </a>
                    <a className="list-group-item list-group-item-action horizontal-list-item pb-0 course-tab ">
                      Material
                    </a>
                    <a className="list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ">
                      Notas
                    </a>
                    <a className="list-group-item list-group-item-action horizontal-list-item pb-0 rounded-0 course-tab ">
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
              <div className="container d-flex flex-column p-0 mt-2">
                <h3 className="ps-2 fw-normal">{courseData.NOME}</h3>
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
                    <h5 className="fw-normal mb-0">{formattedDuration}</h5>
                  </div>
                  <h6 className="fw-normal text-muted">Duração total</h6>
                </div>
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
