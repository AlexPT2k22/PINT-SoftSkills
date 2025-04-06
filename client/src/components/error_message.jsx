import React from "react";

const ErrorMessage = ({ message }) => {
  if (!message) return null; // Se não houver mensagem, não renderiza nada
  console.log("Erro: " + message); // Loga a mensagem de erro no console
  return (
    <div
      style={{
        color: "red",
        fontSize: "14px",
        marginTop: "0.4rem",
        fontFamily: "'Roboto', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
