import React from "react";

const Divider = ({
  width = "100%",
  height = "2px",
  color = "#DFE4EA",
  marginTop = "1.1rem",
  marginBottom = ".8rem",
  text,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width,
        marginTop,
        marginBottom,
      }}
    >
      <div style={{ flex: 1, height, backgroundColor: color }} />
      <span
        style={{
          padding: "0 10px",
          color: "#333",
          whiteSpace: "nowrap",
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {text}
      </span>
      <div style={{ flex: 1, height, backgroundColor: color }} />
    </div>
  );
};

export default Divider;
