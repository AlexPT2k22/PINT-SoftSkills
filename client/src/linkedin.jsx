import Slides from "./components/Slides.jsx";
import LinkedIn_associate from "./components/linkedin.jsx";
import { useState, useEffect } from "react";
import "./styles/linkedin.css";

function LinkedIn_Page() {
  return (
    <div className="linkedin-container">
      <Slides />
      <LinkedIn_associate />
    </div>
  );
}

export default LinkedIn_Page;
