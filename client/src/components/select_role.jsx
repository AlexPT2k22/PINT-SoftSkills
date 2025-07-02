import ButtonWithLoader from "./butao_loader.jsx";
import "../styles/select_role.css";
import useAuthStore from "../store/authStore.js";
import { PiStudent } from "react-icons/pi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SelectRole() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userType = useAuthStore((state) => state.userType);
  const username = user.nome;

  return (
    <div className="role-container p-4 w-50 align-items-center justify-content-center d-flex flex-column">
      <div className="role-form-container d-flex flex-column align-items-center justify-content-center">
        <h1 className="text-start mb-4 fade-in">
          Bem vindo, {username}
          <br></br>seleciona como queres entrar
        </h1>
        <div className="buttons-container d-flex w-100 gap-4">
          <button
            className="btn btn-primary w-50 py-3 shadow-sm btn-hover button-select"
            type="button"
            onClick={() => {
              navigate("/");
            }}
          >
            <PiStudent className="icon me-1" />
            Formando
          </button>
          <button
            className="btn btn-primary w-50 py-3 shadow-sm btn-hover button-select"
            type="button"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            <LiaChalkboardTeacherSolid className="icon me-1" />
            Formador
          </button>
          {userType === 3 && (
            <button
              className="btn btn-primary w-50 py-3 shadow-sm btn-hover button-select"
              type="button"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              <ShieldAlert className="icon me-1" />
              Gestor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectRole;
