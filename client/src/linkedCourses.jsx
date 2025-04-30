import React from "react";
import Sidebar from "./components/sidebar.jsx";
import NavbarDashboard from "./components/navbarDashboard.jsx";
import { useState, useEffect } from "react";
import axios from "axios";

const LinkedCourses = () => {
  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  useEffect(() => {}, []);

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container-fluid h-100 d-flex justify-content-center align-items-center p-4">
        <div className="card text-center" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Cursos atribuidos</h5>
            <p className="card-text">Sem cursos atribuidos</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkedCourses;
