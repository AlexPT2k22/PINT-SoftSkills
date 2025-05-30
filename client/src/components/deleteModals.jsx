import React from "react";

const ConfirmDeleteCategoriaModal = ({
  categoria,
  areas,
  topicos,
  show,
  onClose,
  onConfirm,
  loading,
}) => {
  const areasAssociadas = areas.filter(
    (area) => area.ID_CATEGORIA === categoria?.ID_CATEGORIA__PK__
  );
  const topicosAssociados = topicos.filter((topico) =>
    areasAssociadas.some((area) => area.ID_AREA === topico.ID_AREA)
  );

  if (!categoria) return null;

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header  text-white">
            <h5 className="modal-title">
              Confirmar Exclusão da Categoria
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <strong>Atenção!</strong> Esta ação não pode ser desfeita.
            </div>

            <h6>Categoria a ser excluída:</h6>
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{categoria.NOME__}</h6>
                <p className="card-text text-muted">{categoria.DESCRICAO__}</p>
              </div>
            </div>

            {areasAssociadas.length > 0 && (
              <>
                <h6 className="text-danger">
                  Áreas que serão excluídas ({areasAssociadas.length}):
                </h6>
                <div
                  className="list-group mb-3"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {areasAssociadas.map((area) => (
                    <div key={area.ID_AREA} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{area.NOME}</h6>
                        <small>ID: {area.ID_AREA}</small>
                      </div>
                      <p className="mb-1 text-muted">{area.DESCRICAO}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {topicosAssociados.length > 0 && (
              <>
                <h6 className="text-danger">
                  Tópicos que serão excluídos ({topicosAssociados.length}):
                </h6>
                <div
                  className="list-group mb-3"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {topicosAssociados.map((topico) => (
                    <div key={topico.ID_TOPICO} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{topico.TITULO}</h6>
                        <small>ID: {topico.ID_TOPICO}</small>
                      </div>
                      <p className="mb-1 text-muted">{topico.DESCRICAO}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="text-muted">
              Digite <strong>"CONFIRMAR"</strong> para prosseguir com a
              exclusão:
            </p>
            <input
              type="text"
              className="form-control"
              placeholder="Digite CONFIRMAR"
              id="confirmDeleteCategoria"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={loading}
              onClick={() => {
                const input = document.getElementById("confirmDeleteCategoria");
                if (input.value === "CONFIRMAR") {
                  onConfirm();
                } else {
                  alert('Digite "CONFIRMAR" para prosseguir');
                }
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Excluindo...
                </>
              ) : (
                "Excluir Categoria"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmação para área
const ConfirmDeleteAreaModal = ({
  area,
  topicos,
  show,
  onClose,
  onConfirm,
  loading,
}) => {
  const topicosAssociados = topicos.filter(
    (topico) => topico.ID_AREA === area?.ID_AREA
  );

  if (!area) return null;

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header  text-white">
            <h5 className="modal-title">
              Confirmar Exclusão da Área
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <strong>Atenção!</strong> Esta ação não pode ser desfeita.
            </div>

            <h6>Área a ser excluída:</h6>
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{area.NOME}</h6>
                <p className="card-text text-muted">{area.DESCRICAO}</p>
              </div>
            </div>

            {topicosAssociados.length > 0 && (
              <>
                <h6 className="text-danger">
                  Tópicos que serão excluídos ({topicosAssociados.length}):
                </h6>
                <div
                  className="list-group mb-3"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {topicosAssociados.map((topico) => (
                    <div key={topico.ID_TOPICO} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-1">{topico.TITULO}</h6>
                        <small>ID: {topico.ID_TOPICO}</small>
                      </div>
                      <p className="mb-1 text-muted">{topico.DESCRICAO}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="text-muted">
              Digite <strong>"CONFIRMAR"</strong> para prosseguir com a
              exclusão:
            </p>
            <input
              type="text"
              className="form-control"
              placeholder="Digite CONFIRMAR"
              id="confirmDeleteArea"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={loading}
              onClick={() => {
                const input = document.getElementById("confirmDeleteArea");
                if (input.value === "CONFIRMAR") {
                  onConfirm();
                } else {
                  alert('Digite "CONFIRMAR" para prosseguir');
                }
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Excluindo...
                </>
              ) : (
                "Excluir Área"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmação para tópico
const ConfirmDeleteTopicoModal = ({
  topico,
  show,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!topico) return null;

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
      tabIndex="-1"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header  text-white">
            <h5 className="modal-title">
              Confirmar Exclusão do Tópico
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <strong>Atenção!</strong> Esta ação não pode ser desfeita.
            </div>

            <h6>Tópico a ser excluído:</h6>
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">{topico.TITULO}</h6>
                <p className="card-text text-muted">{topico.DESCRICAO}</p>
              </div>
            </div>

            <p className="text-muted">
              Digite <strong>"CONFIRMAR"</strong> para prosseguir com a
              exclusão:
            </p>
            <input
              type="text"
              className="form-control"
              placeholder="Digite CONFIRMAR"
              id="confirmDeleteTopico"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={loading}
              onClick={() => {
                const input = document.getElementById("confirmDeleteTopico");
                if (input.value === "CONFIRMAR") {
                  onConfirm();
                } else {
                  alert('Digite "CONFIRMAR" para prosseguir');
                }
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Excluindo...
                </>
              ) : (
                "Excluir Tópico"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export {
  ConfirmDeleteCategoriaModal,
  ConfirmDeleteAreaModal,
  ConfirmDeleteTopicoModal,
};
