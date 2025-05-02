import React from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import "./styles/CourseSidebar.css";

function CourseVideoPage() {
  const { courseId, moduleId, contentId } = useParams();

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

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
            <div
              className="video-player border m-2"
              style={{ height: "100px" }}
            ></div>
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
