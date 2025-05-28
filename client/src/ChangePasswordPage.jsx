import React from "react";
import Slides from "./components/Slides.jsx";
import ChangeInitialPassword from "./components/ChangeInitialPassword.jsx";

function ChangePasswordPage() {
  return (
    <div
      className="change-password-page-container"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Slides />
      <ChangeInitialPassword />
    </div>
  );
}

export default ChangePasswordPage;