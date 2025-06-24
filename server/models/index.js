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
const QuizAssincrono = require("./quizzassincrono.model.js");
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
const Certificado = require("./certificado.model.js");
const AulaSincrona = require("./aulaSincrona.model.js");
const PresencaAula = require("./presenca.model.js");
const SubmissaoAvaliacao = require("./submissaoAvaliacao.model.js");
const RespostaQuizAssincrono = require("./respostaquizassincrono.model.js");
const Anuncio = require("./anuncio.model.js");
const ForumTopico = require("./forumTopico.model.js");
const ForumPost = require("./forumPost.model.js");
const ForumAvaliacao = require("./forumAvaliacao.model.js");
const ForumDenuncia = require("./forumDenuncia.model.js");
const ForumSolicitacao = require("./forumSolicitacao.model.js");
const Review = require("./review.model.js");

CursoSincrono.hasMany(AulaSincrona, { foreignKey: "ID_CURSO" });
AulaSincrona.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO" });

Modulos.hasMany(AulaSincrona, { foreignKey: "ID_MODULO" });
AulaSincrona.belongsTo(Modulos, { foreignKey: "ID_MODULO" });

AulaSincrona.hasMany(PresencaAula, { foreignKey: "ID_AULA" });
PresencaAula.belongsTo(AulaSincrona, { foreignKey: "ID_AULA" });

Utilizador.hasMany(PresencaAula, { foreignKey: "ID_UTILIZADOR" });
PresencaAula.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });
// Utilizador associations
Utilizador.hasMany(LoginSocialMedia, { foreignKey: "ID_UTILIZADOR" });
LoginSocialMedia.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

Utilizador.hasMany(Certificado, { foreignKey: "ID_UTILIZADOR" });
Certificado.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

Notificacao.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
});

Notificacao.belongsTo(Curso, {
  foreignKey: "ID_CURSO",
});

Utilizador.hasMany(Notificacao, {
  foreignKey: "ID_UTILIZADOR",
});

Curso.hasMany(Notificacao, {
  foreignKey: "ID_CURSO",
});

Review.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
  as: "UTILIZADOR",
});

Review.belongsTo(Curso, {
  foreignKey: "ID_CURSO",
  as: "CURSO",
});

Curso.hasMany(Review, {
  foreignKey: "ID_CURSO",
  as: "REVIEWS",
});

Utilizador.hasMany(Review, {
  foreignKey: "ID_UTILIZADOR",
  as: "REVIEWS",
});

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

// curso e certificado associations
Curso.hasMany(Certificado, { foreignKey: "ID_CURSO" });
Certificado.belongsTo(Curso, { foreignKey: "ID_CURSO" });

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

SubmissaoAvaliacao.belongsTo(AvaliacaoSincrona, {
  foreignKey: "ID_AVALIACAO_SINCRONA",
});
AvaliacaoSincrona.hasMany(SubmissaoAvaliacao, {
  foreignKey: "ID_AVALIACAO_SINCRONA",
});

SubmissaoAvaliacao.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });
Utilizador.hasMany(SubmissaoAvaliacao, { foreignKey: "ID_UTILIZADOR" });

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
Curso.hasOne(QuizAssincrono, {
  foreignKey: "ID_CURSO",
  as: "QUIZ_ASSINCRONO",
});
QuizAssincrono.belongsTo(Curso, {
  foreignKey: "ID_CURSO",
});

Utilizador.hasMany(QuizAssincrono, {
  foreignKey: "CRIADO_POR",
  as: "QUIZZES_CRIADOS",
});
QuizAssincrono.belongsTo(Utilizador, {
  foreignKey: "CRIADO_POR",
  as: "CRIADOR",
});

// Associations para Respostas
QuizAssincrono.hasMany(RespostaQuizAssincrono, {
  foreignKey: "ID_QUIZ",
  as: "RESPOSTAS",
});
RespostaQuizAssincrono.belongsTo(QuizAssincrono, {
  foreignKey: "ID_QUIZ",
});

Utilizador.hasMany(RespostaQuizAssincrono, {
  foreignKey: "ID_UTILIZADOR",
  as: "RESPOSTAS_QUIZ",
});
RespostaQuizAssincrono.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
  as: "UTILIZADOR",
});

// TrabalhoCursoSincrono associations
Utilizador.hasMany(TrabalhoCursoSincrono, { foreignKey: "ID_UTILIZADOR" });
TrabalhoCursoSincrono.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

CursoSincrono.hasMany(TrabalhoCursoSincrono, { foreignKey: "ID_CURSO" });
TrabalhoCursoSincrono.belongsTo(CursoSincrono, { foreignKey: "ID_CURSO" });

Area.hasMany(Topico, { foreignKey: "ID_AREA" });
Topico.belongsTo(Area, { foreignKey: "ID_AREA" });

Curso.belongsTo(Topico, {
  foreignKey: "ID_TOPICO",
  as: "Topico",
});
Topico.hasMany(Curso, {
  foreignKey: "ID_TOPICO",
  as: "Cursos",
});

// Anuncio associations
Curso.hasMany(Anuncio, { foreignKey: "ID_CURSO" });
Anuncio.belongsTo(Curso, { foreignKey: "ID_CURSO" });

Utilizador.hasMany(Anuncio, { foreignKey: "ID_UTILIZADOR" });
Anuncio.belongsTo(Utilizador, { foreignKey: "ID_UTILIZADOR" });

// ForumTopico relações
Categoria.hasMany(ForumTopico, {
  foreignKey: "ID_CATEGORIA",
  onDelete: "CASCADE",
  as: "TopicosCategoria",
});
ForumTopico.belongsTo(Categoria, {
  foreignKey: "ID_CATEGORIA",
  as: "Categoria",
});

Area.hasMany(ForumTopico, {
  foreignKey: "ID_AREA",
  onDelete: "CASCADE",
});
ForumTopico.belongsTo(Area, {
  foreignKey: "ID_AREA",
});

Topico.hasMany(ForumTopico, {
  foreignKey: "ID_TOPICO",
  onDelete: "CASCADE",
});
ForumTopico.belongsTo(Topico, {
  foreignKey: "ID_TOPICO",
});

Utilizador.hasMany(ForumTopico, {
  foreignKey: "ID_CRIADOR",
  as: "TopicosForumCriados",
});
ForumTopico.belongsTo(Utilizador, {
  foreignKey: "ID_CRIADOR",
  as: "Criador",
});

// ForumPost relações
ForumTopico.hasMany(ForumPost, {
  foreignKey: "ID_FORUM_TOPICO",
  onDelete: "CASCADE",
});
ForumPost.belongsTo(ForumTopico, {
  foreignKey: "ID_FORUM_TOPICO",
});

Utilizador.hasMany(ForumPost, {
  foreignKey: "ID_UTILIZADOR",
});
ForumPost.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
});

// ForumAvaliacao relações
ForumPost.hasMany(ForumAvaliacao, {
  foreignKey: "ID_FORUM_POST",
  onDelete: "CASCADE",
});
ForumAvaliacao.belongsTo(ForumPost, {
  foreignKey: "ID_FORUM_POST",
});

Utilizador.hasMany(ForumAvaliacao, {
  foreignKey: "ID_UTILIZADOR",
});
ForumAvaliacao.belongsTo(Utilizador, {
  foreignKey: "ID_UTILIZADOR",
});

// ForumDenuncia relações
ForumPost.hasMany(ForumDenuncia, {
  foreignKey: "ID_FORUM_POST",
  onDelete: "CASCADE",
});
ForumDenuncia.belongsTo(ForumPost, {
  foreignKey: "ID_FORUM_POST",
});

Utilizador.hasMany(ForumDenuncia, {
  foreignKey: "ID_DENUNCIANTE",
  as: "DenunciasForum",
});
ForumDenuncia.belongsTo(Utilizador, {
  foreignKey: "ID_DENUNCIANTE",
  as: "Denunciante",
});

// ForumSolicitacao relações
Utilizador.hasMany(ForumSolicitacao, {
  foreignKey: "ID_SOLICITANTE",
  as: "SolicitacoesForum",
});
ForumSolicitacao.belongsTo(Utilizador, {
  foreignKey: "ID_SOLICITANTE",
  as: "Solicitante",
});

Utilizador.hasMany(ForumSolicitacao, {
  foreignKey: "ID_GESTOR_RESPOSTA",
  as: "RespostasGestorForum",
});
ForumSolicitacao.belongsTo(Utilizador, {
  foreignKey: "ID_GESTOR_RESPOSTA",
  as: "GestorResposta",
});

Categoria.hasMany(ForumSolicitacao, {
  foreignKey: "ID_CATEGORIA",
  as: "SolicitacoesCategoria",
});
ForumSolicitacao.belongsTo(Categoria, {
  foreignKey: "ID_CATEGORIA",
  as: "Categoria",
});

Area.hasMany(ForumSolicitacao, {
  foreignKey: "ID_AREA",
});
ForumSolicitacao.belongsTo(Area, {
  foreignKey: "ID_AREA",
});

Topico.hasMany(ForumSolicitacao, {
  foreignKey: "ID_TOPICO",
});
ForumSolicitacao.belongsTo(Topico, {
  foreignKey: "ID_TOPICO",
});

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
  QuizAssincrono,
  RespostaQuizAssincrono,
  Resposta,
  Topico,
  TrabalhoCursoSincrono,
  UtilizadorTemPerfil,
  UtilizadorTemPreferencias,
  Objetivos,
  Habilidades,
  Modulos,
  ProgressoModulo,
  Notas,
  Certificado,
  AulaSincrona,
  PresencaAula,
  SubmissaoAvaliacao,
  Anuncio,
  ForumTopico,
  ForumPost,
  ForumAvaliacao,
  ForumDenuncia,
  ForumSolicitacao,
  Review,
};
