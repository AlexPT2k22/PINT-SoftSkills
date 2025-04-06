import Slides from "./components/Slides.jsx";
import Auth from "./components/auth.jsx";
import "./styles/auth.css";

function AuthPage() {
  return (
    <div className="auth-container">
      <Slides />
      <Auth />
    </div>
  );
}

export default AuthPage;
