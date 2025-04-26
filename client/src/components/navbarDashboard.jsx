import React from "react";

function NavbarDashboard() {
  return (
    <>
      <nav className="navbar sticky-top navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand text ms-2" href="/">
            <div className="d-flex align-items-center">
              <img src="/images/Logo.svg" alt="Logo" className="logo" />
            </div>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavbarDashboard;
