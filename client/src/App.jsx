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
import { useEffect, useState } from "react";

//rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isCheckingAuth && !isAuthChecked) {
      const checkAuth = async () => {
        try {
          await useAuthStore.getState().checkAuth();
          setIsAuthChecked(true);
        } catch (error) {
          console.error("Error checking auth:", error);
          setIsAuthChecked(true);
        }
      };

      checkAuth();
    }
  }, [isAuthenticated, isCheckingAuth, isAuthChecked]);

  if (isCheckingAuth || (!isAuthenticated && !isAuthChecked)) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth } = useAuthStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await useAuthStore.getState().checkAuth();
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthStatus();
  }, []);

  if (isCheckingAuth) {
    return <Loader />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Inicio />}></Route>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/" element={<Navigate to={"/login"} />}></Route>
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
