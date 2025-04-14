import { useEffect, useState } from "react";
import Divider from "./Divider.jsx";
import ButtonWithLoader from "./butao_loader.jsx";
import "../styles/select_role.css";
import useAuthStore from "../store/authStore.js";
import { PiStudent } from "react-icons/pi";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";

function SelectRole() {
  //const [isLoading, setisLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const username = user.username;

  return (
    <div className="role-container p-4 w-50 align-items-center justify-content-center d-flex flex-column">
      <div className="role-form-container d-flex flex-column align-items-center justify-content-center">
        <h1 className="text-start mb-4 fade-in">
          Bem vindo, {username}
          <br></br>seleciona como queres entrar
        </h1>
        <div className="buttons-container d-flex w-100 gap-4">
          <button className="btn btn-primary btn-lg w-50 py-3 shadow-sm btn-hover" type="button">
            <PiStudent className="icon me-1" />
            Formando
          </button>
          <button className="btn btn-primary btn-lg w-50 py-3 shadow-sm btn-hover" type="button">
            <LiaChalkboardTeacherSolid className="icon me-1" />
            Formador
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectRole;
