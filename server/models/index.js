const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");
const Utilizador = require("./user.model.js");
const Area = require("./area.model.js");
const AvaliacaoFinalAssincrona = require("./avaliacaofinalassincrona.model.js");
const AvaliacaoFinalSincrona = require("./avaliacaofinalsincrona.model.js");
const AvaliacaoSincrona = require("./avaliacaosincrona.model.js");
const AvaliaConteudoResposta = require("./avaliaconteudoresposta.model.js");
const Categoria = require("./categoria.model.js");
const ConteudoAssincrono = require("./conteudoassincrono.model.js");
const ConteudoSincrono = require("./conteudosincrono.model.js");
const Curso = require("./curso.model.js");
const CursoAssincrono = require("./cursoassincrono.model.js");
const CursoSincrono = require("./cursosincrono.model.js");
const EstadoCursoSincrono = require("./estadocursosincrono.model.js");
const EstadoOcorrenciaAssincrona = require("./estadoocorrenciaassincrona.model.js");
const FrequenciaAssincrono = require("./frequenciaassincrono.model.js");
const FrequenciaSincrono = require("./frequenciasincrono.model.js");
const InscricaoAssincrono = require("./inscricaoassincrono.model.js");
const InscricaoSincrono = require("./inscricaosincrono.model.js");
const LoginSocialMedia = require("./loginsocialmedia.model.js");
const Notificacao = require("./notificacao.model.js");
const OcorrenciaAssincrona = require("./ocorrenciaassincrona.model.js");
const PedidoTopico = require("./pedidotopico.model.js");
const Perfil = require("./perfil.model.js");
const QuizzAssincrono = require("./quizzassincrono.model.js");
const Resposta = require("./resposta.model.js");
const Topico = require("./topico.model.js");
const TrabalhoCursoSincrono = require("./trabalhocursosincrono.model.js");
const UtilizadorTemPerfil = require("./utilizadortemperfil.model.js");
const UtilizadorTemPreferencias = require("./utilizadortempreferencias.model.js");
const Objetivos = require("./objetivos.model.js");
const Habilidades = require("./habilidades.model.js");
const Modulos = require("./modulos.model.js");
const ProgressoModulo = require("./moduloProgresso.model.js");
const Notas = require("./notas.model.js");

// Define associations

// Utilizador associations
Utilizador.hasMany(LoginSocialMedia, { foreignKey: "ID_UTILIZADOR" });
LoginSocialMedia.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

Utilizador.hasMany(Notificacao, { foreignKey: "ID_UTILIZADOR" });
Notificacao.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

Utilizador.belongsToMany(Perfil, {
  through: UtilizadorTemPerfil,
  foreignKey: "ID_UTILIZADOR",
  otherKey: "ID_PERFIL",
});
Perfil.belongsToMany(Utilizador, {
  through: UtilizadorTemPerfil,
  foreignKey: "ID_PERFIL",
  otherKey: "ID_UTILIZADOR",
});

Utilizador.belongsToMany(Area, {
  through: UtilizadorTemPreferencias,
  foreignKey: "ID_UTILIZADOR",
  otherKey: "ID_AREA",
});
Area.belongsToMany(Utilizador, {
  through: UtilizadorTemPreferencias,
  foreignKey: "ID_AREA",
  otherKey: "ID_UTILIZADOR",
});

Utilizador.hasMany(Notas, { foreignKey: "ID_UTILIZADOR" });
Notas.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

Modulos.hasMany(Notas, { foreignKey: "ID_MODULO" });
Notas.belongsTo(Modulos, { foreignKey: "ID_MODULO" });

// Category and Area associations
Categoria.hasMany(Area, { foreignKey: "ID_CATEGORIA__PK___" });
Area.belongsTo(Categoria, {
  foreignKey: "ID_CATEGORIA__PK___",
  as: "Categoria",
});

// Curso associations
Area.hasMany(Curso, { foreignKey: "ID_AREA" });
Curso.belongsTo(Area, { foreignKey: "ID_AREA" });

Curso.hasOne(CursoAssincrono, { foreignKey: "ID_CURSO" });
CursoAssincrono.belongsTo(Curso, { foreignKey: "ID_CURSO" });

Curso.hasOne(CursoSincrono, { foreignKey: "ID_CURSO" });
CursoSincrono.belongsTo(Curso, { foreignKey: "ID_CURSO" });

Curso.hasMany(Objetivos, { foreignKey: "ID_CURSO", as: "OBJETIVOS" });
Objetivos.belongsTo(Curso, { foreignKey: "ID_CURSO", as: "CURSO" });

Curso.hasMany(Habilidades, { foreignKey: "ID_CURSO", as: "HABILIDADES" });
Habilidades.belongsTo(Curso, { foreignKey: "ID_CURSO", as: "CURSO" });

Curso.hasMany(Modulos, { foreignKey: "ID_CURSO", as: "MODULOS" });
Modulos.belongsTo(Curso, { foreignKey: "ID_CURSO", as: "CURSO" });

// CursoSincrono associations
Utilizador.hasMany(CursoSincrono, { foreignKey: "ID_UTILIZADOR" });
CursoSincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });
CursoSincrono.hasMany(InscricaoSincrono, { foreignKey: "ID_CURSO_SINCRONO" });
InscricaoSincrono.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO_SINCRONO" });

InscricaoSincrono.hasMany(CursoSincrono, {
  foreignKey: "ID_INSCRICAO_SINCRONO",
});
CursoSincrono.belongsTo(InscricaoSincrono, {
  foreignKey: "ID_INSCRICAO_SINCRONO",
});

EstadoCursoSincrono.hasMany(CursoSincrono, {
  foreignKey: "ID_ESTADO_OCORRENCIA_ASSINCRONA2",
});
CursoSincrono.belongsTo(EstadoCursoSincrono, {
  foreignKey: "ID_ESTADO_OCORRENCIA_ASSINCRONA2",
});

// OcorrenciaAssincrona associations
EstadoOcorrenciaAssincrona.hasMany(OcorrenciaAssincrona, {
  foreignKey: "ID_ESTADO_OCORRENCIA_ASSINCRONA",
});
OcorrenciaAssincrona.belongsTo(EstadoOcorrenciaAssincrona, {
  foreignKey: "ID_ESTADO_OCORRENCIA_ASSINCRONA",
});

CursoAssincrono.hasMany(InscricaoAssincrono, {
  foreignKey: "ID_CURSO_ASSINCRONO",
});
InscricaoAssincrono.belongsTo(CursoAssincrono, {
  foreignKey: "ID_CURSO_ASSINCRONO",
});

Utilizador.hasMany(InscricaoAssincrono, {
  foreignKey: "ID_UTILIZADOR",
});
InscricaoAssincrono.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
});

// Topico and Resposta associations
Topico.hasMany(Resposta, { foreignKey: "ID_TOPICO" });
Resposta.belongsTo(Topico, { foreignKey: "ID_TOPICO" });

Utilizador.hasMany(Resposta, { foreignKey: "ID_UTILIZADOR" });
Resposta.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

// Self-referencing association for replies
Resposta.hasMany(Resposta, { foreignKey: "RES_ID_RESPOSTA", as: "Respostas" });
Resposta.belongsTo(Resposta, {
  foreignKey: "RES_ID_RESPOSTA",
  as: "RespostaPai",
});

// PedidoTopico associations
Utilizador.hasMany(PedidoTopico, {
  foreignKey: "ID_UTILIZADOR",
  as: "PedidoTopicoSolicitante",
});
PedidoTopico.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
  as: "Utilizador_Solicitante",
});

Utilizador.hasMany(PedidoTopico, {
  foreignKey: "UTI_ID_UTILIZADOR",
  as: "PedidoTopicoAuthorizingUser",
});
PedidoTopico.belongsTo(Utilizador, {
  foreignKey: "UTI_ID_UTILIZADOR",
  as: "Utilizador_AuthorizingUser",
});

Topico.hasMany(PedidoTopico, { foreignKey: "ID_TOPICO" });
PedidoTopico.belongsTo(Topico, { foreignKey: "ID_TOPICO" });

Area.hasMany(PedidoTopico, { foreignKey: "ID_AREA" });
PedidoTopico.belongsTo(Area, { foreignKey: "ID_AREA" });

// AvaliaConteudoResposta associations (for upvotes/ratings)
Utilizador.belongsToMany(Resposta, {
  through: AvaliaConteudoResposta,
  foreignKey: "ID_UTILIZADOR",
  otherKey: "ID_RESPOSTA",
});
Resposta.belongsToMany(Utilizador, {
  through: AvaliaConteudoResposta,
  foreignKey: "ID_RESPOSTA",
  otherKey: "ID_UTILIZADOR",
});

// InscricaoSincrono associations
Utilizador.hasMany(InscricaoSincrono, { foreignKey: "ID_UTILIZADOR" });
InscricaoSincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

// InscricaoAssincrono associations
Utilizador.hasMany(InscricaoAssincrono, { foreignKey: "ID_UTILIZADOR" });
InscricaoAssincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

// FrequenciaSincrono associations
Utilizador.hasMany(FrequenciaSincrono, { foreignKey: "ID_UTILIZADOR" });
FrequenciaSincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

CursoSincrono.hasMany(FrequenciaSincrono, { foreignKey: "ID_CURSO" });
FrequenciaSincrono.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO" });

// FrequenciaAssincrono associations
OcorrenciaAssincrona.hasMany(FrequenciaAssincrono, {
  foreignKey: "ID_OCORRENCIA",
});
FrequenciaAssincrono.belongsTo(OcorrenciaAssincrona, {
  foreignKey: "ID_OCORRENCIA",
});

Utilizador.hasMany(FrequenciaAssincrono, { foreignKey: "ID_UTILIZADOR" });
FrequenciaAssincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

// ConteudoSincrono associations
Utilizador.hasMany(ConteudoSincrono, { foreignKey: "ID_UTILIZADOR" });
ConteudoSincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

CursoSincrono.hasMany(ConteudoSincrono, { foreignKey: "ID_CURSO" });
ConteudoSincrono.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO" });

Utilizador.hasMany(ProgressoModulo, { foreignKey: "ID_UTILIZADOR" });
ProgressoModulo.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

Curso.hasMany(ProgressoModulo, { foreignKey: "ID_CURSO" });
ProgressoModulo.belongsTo(Curso, { foreignKey: "ID_CURSO" });

Modulos.hasMany(ProgressoModulo, { foreignKey: "ID_MODULO" });
ProgressoModulo.belongsTo(Modulos, { foreignKey: "ID_MODULO" });

// ConteudoAssincrono associations
Modulos.hasMany(ConteudoAssincrono, {
  foreignKey: "ID_MODULO",
});

ConteudoAssincrono.belongsTo(Modulos, {
  foreignKey: "ID_MODULO",
});

// AvaliacaoSincrona associations
CursoSincrono.hasMany(AvaliacaoSincrona, { foreignKey: "ID_CURSO" });
AvaliacaoSincrona.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO" });

AvaliacaoFinalSincrona.hasMany(AvaliacaoSincrona, {
  foreignKey: "ID_AVALIACAO_FINAL_SINCRONA",
});
AvaliacaoSincrona.belongsTo(AvaliacaoFinalSincrona, {
  foreignKey: "ID_AVALIACAO_FINAL_SINCRONA",
});

// AvaliacaoFinalSincrona associations
Utilizador.hasMany(AvaliacaoFinalSincrona, {
  foreignKey: "UTI_ID_UTILIZADOR",
  as: "Avaliacao_FinalSincrona",
});
AvaliacaoFinalSincrona.belongsTo(Utilizador, {
  foreignKey: "UTI_ID_UTILIZADOR",
  as: "Formador",
});

Utilizador.hasMany(AvaliacaoFinalSincrona, {
  foreignKey: "UTI_ID_UTILIZADOR2",
  as: "Avaliacao_Formando",
});
AvaliacaoFinalSincrona.belongsTo(Utilizador, {
  foreignKey: "UTI_ID_UTILIZADOR2",
  as: "Formando",
});

// QuizzAssincrono associations
Utilizador.hasMany(QuizzAssincrono, {
  foreignKey: "ID_UTILIZADOR",
  as: "Quizzes_Formando",
});
QuizzAssincrono.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
  as: "Formando",
});

Utilizador.hasMany(QuizzAssincrono, {
  foreignKey: "UTI_ID_UTILIZADOR",
  as: "Quizzes_Formador",
});
QuizzAssincrono.belongsTo(Utilizador, {
  foreignKey: "UTI_ID_UTILIZADOR",
  as: "Formador",
});

Utilizador.hasMany(QuizzAssincrono, {
  foreignKey: "UTI_ID_UTILIZADOR2",
  as: "Quizzes_Criados",
});
QuizzAssincrono.belongsTo(Utilizador, {
  foreignKey: "UTI_ID_UTILIZADOR2",
  as: "Criador",
});

OcorrenciaAssincrona.hasMany(QuizzAssincrono, { foreignKey: "ID_OCORRENCIA" });
QuizzAssincrono.belongsTo(OcorrenciaAssincrona, {
  foreignKey: "ID_OCORRENCIA",
});

// AvaliacaoFinalAssincrona associations
QuizzAssincrono.hasMany(AvaliacaoFinalAssincrona, {
  foreignKey: "ID_QUIZZ_ASSINCRONO",
});
AvaliacaoFinalAssincrona.belongsTo(QuizzAssincrono, {
  foreignKey: "ID_QUIZZ_ASSINCRONO",
});

// TrabalhoCursoSincrono associations
Utilizador.hasMany(TrabalhoCursoSincrono, { foreignKey: "ID_UTILIZADOR" });
TrabalhoCursoSincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

CursoSincrono.hasMany(TrabalhoCursoSincrono, { foreignKey: "ID_CURSO" });
TrabalhoCursoSincrono.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO" });

// Export all models with their associations
module.exports = {
  sequelize,
  Sequelize,
  Utilizador,
  Area,
  AvaliacaoFinalAssincrona,
  AvaliacaoFinalSincrona,
  AvaliacaoSincrona,
  AvaliaConteudoResposta,
  Categoria,
  ConteudoAssincrono,
  ConteudoSincrono,
  Curso,
  CursoAssincrono,
  CursoSincrono,
  EstadoCursoSincrono,
  EstadoOcorrenciaAssincrona,
  FrequenciaAssincrono,
  FrequenciaSincrono,
  InscricaoAssincrono,
  InscricaoSincrono,
  LoginSocialMedia,
  Notificacao,
  OcorrenciaAssincrona,
  PedidoTopico,
  Perfil,
  QuizzAssincrono,
  Resposta,
  Topico,
  TrabalhoCursoSincrono,
  UtilizadorTemPerfil,
  UtilizadorTemPreferencias,
  Objetivos,
  Habilidades,
  Modulos,
  ProgressoModulo,
};
