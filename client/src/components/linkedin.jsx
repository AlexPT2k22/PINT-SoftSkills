import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/linkedin.css";
import ButtonWithLoader from "./butao_loader.jsx";
import ErrorMessage from "./error_message.jsx";
import Loader from "./loader.jsx";

function LinkedIn_associate() {
  const [searchParams] = useSearchParams();
  const [isLoading, setisLoading] = useState(false);
  const [url, seturl] = useState("");
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const isValidLinkedInUrl = (url) => {
    return url.startsWith("https://www.linkedin.com/in/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = searchParams.get("email");
    console.log(email);
    setisLoading(true);
    setError(null);
    setLoader(false);
    let body = { url: url };
    if (!isValidLinkedInUrl(url)) {
      setError("URL tem de ser 'https://www.linkedin.com/in/{resto-do-url}'");
      setisLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/linkedin/associate?email=${email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        console.log(error.error);
        setError(error.error);
      } else if (response.status === 200) {
        setLoader(true);
        await sleep(2000);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      setError("Erro inesperado com o servidor");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="linkedin-form-container">
      {loader && <Loader />}
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
          {error && <ErrorMessage message={error} marginTop={"0px"} />}
          <button
            className="linkedin-associate-button"
            type="submit"
            disabled={isLoading}
          >
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
