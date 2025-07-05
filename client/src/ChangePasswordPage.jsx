import React from "react";
import Slides from "./components/Slides.jsx";
import ChangeInitialPassword from "./components/ChangeInitialPassword.jsx";
import "./styles/resetpassword.css";

function ChangePasswordPage() {
  return (
    <div className="change-password-page-container">
      <Slides />
      <ChangeInitialPassword />
    </div>
  );
}

export default ChangePasswordPage;
