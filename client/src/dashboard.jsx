import React from "react";
import Sidebar from "./components/sidebar";
import NavbarDashboard from "./components/navbarDashboard";
import useAuthStore from "./store/authStore";

function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const handleSidebarToggle = (newCollapsedState) => {
    setCollapsed(newCollapsedState);
  };
  return (
    <>
      <NavbarDashboard />
      <Sidebar onToggle={handleSidebarToggle} />
      <div className="container h-100 d-flex justify-content-center align-items-center p-4">
        <h1>Bem vindo, {user.username}</h1>
      </div>
    </>
  );
}

export default Dashboard;
