import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Inicio from "./inicio";
import AuthPage from "./authpage";
import LinkedIn_Page from "./linkedinPage.jsx";
import SelectRolePage from "./selectRolePage.jsx";
import useAuthStore from "./store/authStore.js";
import Loader from "./components/loader.jsx";
import { useEffect } from "react";

//rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.isVerified) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

//redirecionar quem esta logado para a dashboard
const RedirecionaADashboard = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated && (!user || !user.isVerified)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  if (isCheckingAuth) {
    return <Loader />;
  }

  console.log("isAuthenticated", isAuthenticated);
  console.log("user", user);
  console.log("isCheckingAuth", isCheckingAuth);
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
