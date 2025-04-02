import React from "react";

const Divider = ({
  width = "100%",
  height = "2px",
  color = "#DFE4EA",
  margin = "10px 0",
  text = "OU",
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width,
        margin,
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
