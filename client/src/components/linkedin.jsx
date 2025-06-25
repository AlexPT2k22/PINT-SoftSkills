import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ButtonWithLoader from "./butao_loader.jsx";
import ErrorMessage from "./error_message.jsx";
import Loader from "./loader.jsx";

function LinkedIn_associate() {
  const redirectURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
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
        `${redirectURL}/api/auth/linkedin/associate?email=${email}`,
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
    <div className="container d-flex justify-content-center align-items-center flex-column w-50">
      {loader && <Loader />}
      <h2 className="text-center mb-2">Associe o seu LinkedIn à sua conta</h2>
      <p className="text-center text-muted mb-4">
        Introduza a url do seu perfil do LinkedIn
      </p>
      <form
        className="linkedin-form w-50 d-flex flex-column align-items-center"
        onSubmit={handleSubmit}
      >
        <input
          className="form-control text-start mb-3 linkedin-input"
          type="url"
          required
          placeholder="URL do perfil do LinkedIn"
          onChange={(e) => seturl(e.target.value)}
          value={url}
        />
        {error && <ErrorMessage message={error} marginTop={"0px"} />}
        <button
          className="btn btn-primary linkedin-associate-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <ButtonWithLoader isLoading={isLoading} /> : "Associar"}
        </button>
      </form>
    </div>
  );
}

export default LinkedIn_associate;
