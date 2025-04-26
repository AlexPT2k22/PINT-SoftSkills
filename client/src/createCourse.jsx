import React from "react";
import { useState } from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";

function CreateCourse() {
  const [collapsed, setCollapsed] = useState(false);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };

  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container">
        
      </div>
    </>
  );
}

export default CreateCourse;
