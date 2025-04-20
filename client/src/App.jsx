import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Inicio from "./inicio";
import AuthPage from "./authpage";
import LinkedIn_Page from "./linkedinPage.jsx";
import SelectRolePage from "./selectRolePage.jsx";
import useAuthStore from "./store/authStore.js";
import Loader from "./components/loader.jsx";
import WelcomePage from "./welcomepage.jsx";
import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles/app.css";
import ResetPage from "./resetpage.jsx";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authCheckAttempted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!authCheckAttempted.current) {
      authCheckAttempted.current = true;
      const verifyAuth = async () => {
        try {
          await checkAuth();
          console.log("Auth check successful:", isAuthenticated, user);
        } catch (error) {
          console.error("Auth check failed:", error);
        } finally {
          setIsLoading(false);
        }
      };

      verifyAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user?.isVerified) {
    console.log("Not verified, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const initialCheck = async () => {
      try {
        await checkAuth();
      } catch (error) {
        //console.log("Initial auth check failed:", error);
      } finally {
        setAppLoading(false);
      }
    };
    initialCheck();
  }, []);

  if (appLoading) {
    return <Loader />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Inicio />}></Route>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/resetpassword" element={<ResetPage />}></Route>
        <Route path="/" element={<WelcomePage />}></Route>
        <Route
          path="/linkedin"
          element={
            <ProtectedRoute>
              <LinkedIn_Page />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/role"
          element={
            <ProtectedRoute>
              <SelectRolePage />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
