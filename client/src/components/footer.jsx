import React from "react";

function Footer() {
  return (
    <>
      <footer className="mt-5 pt-5 pb-4">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">SoftSkills by SOFTINSA</h5>
              <p className="text-muted">
                Plataforma de aprendizagem online para desenvolvimento de
                competências transversais.
              </p>
              <div className="d-flex gap-3 mt-3">
                <a
                  href="https://www.facebook.com/Softinsa"
                  className="text-decoration-none text-secondary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/softinsa/"
                  className="text-decoration-none text-secondary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/softinsa/"
                  className="text-decoration-none text-secondary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0"></div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">Recursos</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a
                    href="/find-courses"
                    className="text-decoration-none text-secondary"
                  >
                    Cursos
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/verify-certificate"
                    className="text-decoration-none text-secondary"
                  >
                    Verificar certificado
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="https://drive.google.com/file/d/1abjARD5ipcz5ETMNe1Ba-sQxUGBVv_vR/view?usp=sharing"
                    className="text-decoration-none text-secondary"
                  >
                    Download da app
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">Empresa</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a
                    href="https://www.softinsa.pt/pt/softinsa/"
                    className="text-decoration-none text-secondary"
                  >
                    Sobre nós
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="https://www.softinsa.pt/pt/contactos/"
                    className="text-decoration-none text-secondary"
                  >
                    Contacto
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="https://www.softinsa.pt/pt/carreiras/"
                    className="text-decoration-none text-secondary"
                  >
                    Carreiras
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="row mt-4 pt-3 border-top">
            <div className="col-md-6 text-center text-md-start">
              <p className="text-muted small mb-0">
                © 2025 SoftSkills. Todos os direitos reservados.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <a
                href="https://www.softinsa.pt/pt/condicoes-de-utilizacao/"
                className="text-decoration-none text-secondary small me-3"
              >
                Termos de Serviço
              </a>
              <a
                href="https://www.softinsa.pt/pt/politica-de-privacidade/"
                className="text-decoration-none text-secondary small"
              >
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
