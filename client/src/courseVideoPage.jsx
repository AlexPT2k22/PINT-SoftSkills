import React, { use } from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import "./styles/CourseSidebar.css";
import VideoPlayer from "./components/videoplayer";

function CourseVideoPage() {
  const { courseId, moduleId } = useParams();
  const [videoID, setVideoID] = useState("");
  const [courseData, setCourseData] = useState(null);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/cursos/${courseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch course data");
        }
        const data = await response.json();
        console.log(data);
        const modulo = data.MODULOS[moduleId - 1]; // Ajuste para o índice correto

        if (modulo?.VIDEO_URL) {
          const baseURL =
            "https://res.cloudinary.com/dk2ifkqqc/video/upload/v1746399099/";
          const publicId = modulo.VIDEO_URL.replace(baseURL, "").replace(
            /\.[^/.]+$/,
            ""
          );
          setVideoID(publicId);
          console.log("publicId:", publicId);
        } else {
          console.warn("Módulo não encontrado ou VIDEO_URL inexistente");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCourseData();
  }, [courseId, moduleId]);

  const courseContent = [
    {
      id: 1,
      title: "Secção 1: título",
      totalVideos: 4,
      totalDuration: "Y",
      videos: [
        { id: 1, title: "Título do vídeo", duration: 2, completed: true },
        { id: 2, title: "Título do vídeo", duration: 2, completed: false },
        { id: 3, title: "Título do vídeo", duration: 2, completed: false },
        { id: 4, title: "Título do vídeo", duration: 2, completed: false },
      ],
    },
    {
      id: 2,
      title: "Secção 2: título",
      totalVideos: 3,
      totalDuration: "Y",
      videos: [
        { id: 1, title: "Título do vídeo", duration: 2, completed: false },
        { id: 2, title: "Título do vídeo", duration: 2, completed: false },
        { id: 3, title: "Título do vídeo", duration: 2, completed: false },
      ],
    },
  ];

  return (
    <>
      <NavbarDashboard />
      <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center p-4">
        <div className="container-fluid border d-flex justify-content-between p-0 flex-row">
          <div className="container border d-flex m-2 p-0 flex-column">
            {videoID && (
              <div className="video-player border m-2">
                <VideoPlayer publicId={videoID} />
              </div>
            )}
            <div className="video-description m-2 border">
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
                <h3 className="ps-2 fw-normal">Titulo do curso</h3>
              </div>
              <div className="d-flex flex-row">
                <div className="d-flex flex-column align-items-center justify-content-center ps-2">
                  <h5 className="fw-normal">4.3</h5>
                </div>
              </div>
            </div>
          </div>
          <div
            className="container course-sidebar border m-2 p-0"
            style={{ width: "28rem" }}
          ></div>
        </div>
      </div>
    </>
  );
}

export default CourseVideoPage;
