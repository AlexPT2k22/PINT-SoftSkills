import Slides from "./components/Slides.jsx";
import SelectRole from "./components/select_role.jsx";
import "./styles/select_role.css"

function selectRolePage() {
  return (
    <div className="page-container">
      <Slides />
      <SelectRole />
    </div>
  );
}

export default selectRolePage;