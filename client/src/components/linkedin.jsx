import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/linkedin.css";
import ButtonWithLoader from "./butao_loader.jsx";
import ErrorMessage from "./error_message.jsx";

function LinkedIn_associate() {
  const [searchParams] = useSearchParams();
  const [isLoading, setisLoading] = useState(false);
  const [url, seturl] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    const email = searchParams.get("email");
    console.log(email);
    e.preventDefault();
    setisLoading(true);
    setError(null);
    let body = { url: url };
    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/linkedin/associate?email=${email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    } catch (error) {
      console.log(error);
      setError(error.response.data.error);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="linkedin-form-container">
      <div className="linkedin-border">
        <h2>Associe o seu LinkedIn à sua conta</h2>
        <p>Introduza a url do seu perfil do LinkedIn</p>
        <form className="linkedin-form" onSubmit={handleSubmit}>
          <input
            className="linkedin-input"
            type="text"
            required
            placeholder="URL do perfil do LinkedIn"
            onChange={(e) => seturl(e.target.value)}
            value={url}
          />
          {error && <ErrorMessage message={error} />}
          <button className="linkedin-associate-button" type="submit">
            {isLoading ? (
              <ButtonWithLoader isLoading={isLoading} />
            ) : (
              "Associar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LinkedIn_associate;
