import React from "react";
import Slides from "./components/Slides.jsx";
import ResetPassword from "./components/resetPassword.jsx";

function ResetPage() {
  return (
    <div
      className="reset-page-container"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Slides />
      <ResetPassword />
    </div>
  );
}

export default ResetPage;
