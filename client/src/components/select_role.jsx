import { useEffect, useState } from "react";
import Divider from "./Divider.jsx";
import ButtonWithLoader from "./butao_loader.jsx";
import "../styles/select_role.css";

function SelectRole() {
  const [isLoading, setisLoading] = useState(false);

  return (
    <div className="role-container p-4">
        <h2>SELECT ROLE</h2>
    </div>
  );
}

export default SelectRole;