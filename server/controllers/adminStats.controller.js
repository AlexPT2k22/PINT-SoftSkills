const {
  Utilizador,
  UtilizadorTemPerfil,
  Perfil,
  Curso,
  CursoSincrono,
  CursoAssincrono,
  InscricaoSincrono,
  InscricaoAssincrono,
  ForumPost,
  ForumTopico,
  ForumSolicitacao,
  QuizAssincrono,
  RespostaQuizAssincrono,
  AvaliacaoSincrona,
  SubmissaoAvaliacao,
  AvaliacaoFinalSincrona,
  ProgressoModulo,
  Modulos,
  Area,
  Categoria,
  Topico,
  AulaSincrona,
  PresencaAula,
} = require("../models/index.js");
const { Op } = require("sequelize");
const { sequelize } = require("../database/database.js");

const getGeneralStats = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const isAdmin = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores.",
      });
    }

    const [
      totalUtilizadores,
      utilizadorFormandos,
      utilizadorFormadores,
      utilizadorGestores,
      utilizadoresAtivos30Dias,
      utilizadoresNovos30Dias,
      totalCursos,
      cursosSincronos,
      cursosAssincronos,
      cursosAtivos,
      totalInscricoesSincronas,
      totalInscricoesAssincronas,
      inscricoes30Dias,
      totalTopicosForumAtivos,
      totalPostsForum,
      postsForumUltimos30Dias,
      solicitacoesForumPendentes,
      totalQuizzes,
      totalRespostasQuizzes,
      totalAvaliacoesSincronas,
      totalSubmissoes,
      totalModulosCompletos,
      totalAulasSincronas,
      aulasProximos7Dias,
    ] = await Promise.all([
      Utilizador.count(),
      UtilizadorTemPerfil.count({ where: { ID_PERFIL: 1 } }),
      UtilizadorTemPerfil.count({ where: { ID_PERFIL: 2 } }),
      UtilizadorTemPerfil.count({ where: { ID_PERFIL: 3 } }),
      Utilizador.count({
        where: {
          ULTIMO_LOGIN: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      Utilizador.count({
        where: {
          DATA_CRIACAO: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      Curso.count(),
      CursoSincrono.count(),
      CursoAssincrono.count(),
      Curso.count({
        include: [
          {
            model: CursoSincrono,
            where: { ESTADO: { [Op.in]: ["Ativo", "Em curso"] } },
            required: false,
          },
          {
            model: CursoAssincrono,
            where: { ESTADO: { [Op.in]: ["Ativo", "Em curso"] } },
            required: false,
          },
        ],
        where: {
          [Op.or]: [
            { "$CURSO_SINCRONO.ESTADO$": { [Op.in]: ["Ativo", "Em curso"] } },
            { "$CURSO_ASSINCRONO.ESTADO$": { [Op.in]: ["Ativo", "Em curso"] } },
          ],
        },
      }),

      InscricaoSincrono.count(),
      InscricaoAssincrono.count(),
      Promise.all([
        InscricaoSincrono.count({
          where: {
            DATA_INSCRICAO: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        InscricaoAssincrono.count({
          where: {
            DATA_INSCRICAO: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]).then(([sinc, assinc]) => sinc + assinc),

      ForumTopico.count({ where: { ESTADO: "Ativo" } }),
      ForumPost.count({ where: { ESTADO: { [Op.in]: ["Ativo", "Editado"] } } }),
      ForumPost.count({
        where: {
          ESTADO: { [Op.in]: ["Ativo", "Editado"] },
          DATA_CRIACAO: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      ForumSolicitacao.count({ where: { ESTADO: "Pendente" } }),
      QuizAssincrono.count({ where: { ATIVO: true } }),
      RespostaQuizAssincrono.count(),
      AvaliacaoSincrona.count(),
      SubmissaoAvaliacao.count(),
      ProgressoModulo.count({ where: { COMPLETO: true } }),
      AulaSincrona.count(),
      AulaSincrona.count({
        where: {
          DATA_AULA: {
            [Op.between]: [
              new Date(),
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ],
          },
        },
      }),
    ]);

    const taxaCrescimentoUtilizadores =
      totalUtilizadores > 0
        ? ((utilizadoresNovos30Dias / totalUtilizadores) * 100).toFixed(2)
        : 0;

    const taxaUtilizadoresAtivos =
      totalUtilizadores > 0
        ? ((utilizadoresAtivos30Dias / totalUtilizadores) * 100).toFixed(2)
        : 0;

    const totalInscricoes =
      totalInscricoesSincronas + totalInscricoesAssincronas;
    const mediaInscricoesPorCurso =
      totalCursos > 0 ? (totalInscricoes / totalCursos).toFixed(1) : 0;

    const stats = {
      utilizadores: {
        total: totalUtilizadores,
        formandos: utilizadorFormandos,
        formadores: utilizadorFormadores,
        gestores: utilizadorGestores,
        ativos30Dias: utilizadoresAtivos30Dias,
        novos30Dias: utilizadoresNovos30Dias,
        taxaCrescimento: parseFloat(taxaCrescimentoUtilizadores),
        taxaAtivos: parseFloat(taxaUtilizadoresAtivos),
      },
      cursos: {
        total: totalCursos,
        sincronos: cursosSincronos,
        assincronos: cursosAssincronos,
        ativos: cursosAtivos,
        percentualAtivos:
          totalCursos > 0 ? ((cursosAtivos / totalCursos) * 100).toFixed(1) : 0,
      },
      inscricoes: {
        total: totalInscricoes,
        sincronas: totalInscricoesSincronas,
        assincronas: totalInscricoesAssincronas,
        ultimos30Dias: inscricoes30Dias,
        mediaPorCurso: parseFloat(mediaInscricoesPorCurso),
      },
      forum: {
        topicosAtivos: totalTopicosForumAtivos,
        totalPosts: totalPostsForum,
        postsUltimos30Dias: postsForumUltimos30Dias,
        solicitacoesPendentes: solicitacoesForumPendentes,
      },
      avaliacoes: {
        quizzesAtivos: totalQuizzes,
        respostasQuizzes: totalRespostasQuizzes,
        avaliacoesSincronas: totalAvaliacoesSincronas,
        submissoes: totalSubmissoes,
        modulosCompletos: totalModulosCompletos,
      },
      aulas: {
        total: totalAulasSincronas,
        proximos7Dias: aulasProximos7Dias,
      },
      resumo: {
        engajamento: {
          forumAtividade:
            postsForumUltimos30Dias > 50
              ? "Alta"
              : postsForumUltimos30Dias > 20
                ? "Média"
                : "Baixa",
          utilizacaoPlataforma:
            taxaUtilizadoresAtivos > 50
              ? "Alta"
              : taxaUtilizadoresAtivos > 20
                ? "Média"
                : "Baixa",
          crescimento: taxaCrescimentoUtilizadores > 5 ? "Alto" : "Estável",
        },
      },
    };

    res.status(200).json({
      success: true,
      stats,
      dataAtualizacao: new Date(),
    });
  } catch (error) {
    console.error("Erro ao procurar estatísticas gerais:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const getCursosStats = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const isAdmin = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores.",
      });
    }

    const estatisticasPorCategoria = await sequelize.query(
      `
      SELECT 
        c."ID_CATEGORIA__PK___",
        c."NOME__",
        COUNT(DISTINCT cur."ID_CURSO") as "totalCursos",
        COUNT(DISTINCT cs."ID_CURSO") as "cursosSincronos", 
        COUNT(DISTINCT ca."ID_CURSO_ASSINCRONO") as "cursosAssincronos",
        COALESCE(
          (SELECT COUNT(*) FROM "INSCRICAO_SINCRONO" ins
           INNER JOIN "CURSO_SINCRONO" cs2 ON ins."ID_CURSO_SINCRONO" = cs2."ID_CURSO"
           INNER JOIN "CURSO" cur2 ON cs2."ID_CURSO" = cur2."ID_CURSO"
           INNER JOIN "AREA" a2 ON cur2."ID_AREA" = a2."ID_AREA"
           WHERE a2."ID_CATEGORIA__PK___" = c."ID_CATEGORIA__PK___"), 0
        ) +
        COALESCE(
          (SELECT COUNT(*) FROM "INSCRICAO_ASSINCRONO" inas
           INNER JOIN "CURSO_ASSINCRONO" ca2 ON inas."ID_CURSO_ASSINCRONO" = ca2."ID_CURSO_ASSINCRONO"
           INNER JOIN "CURSO" cur3 ON ca2."ID_CURSO" = cur3."ID_CURSO"
           INNER JOIN "AREA" a3 ON cur3."ID_AREA" = a3."ID_AREA"
           WHERE a3."ID_CATEGORIA__PK___" = c."ID_CATEGORIA__PK___"), 0
        ) as "totalInscricoes"
      FROM "CATEGORIA" c
      LEFT JOIN "AREA" a ON c."ID_CATEGORIA__PK___" = a."ID_CATEGORIA__PK___"
      LEFT JOIN "CURSO" cur ON a."ID_AREA" = cur."ID_AREA"
      LEFT JOIN "CURSO_SINCRONO" cs ON cur."ID_CURSO" = cs."ID_CURSO"
      LEFT JOIN "CURSO_ASSINCRONO" ca ON cur."ID_CURSO" = ca."ID_CURSO"
      GROUP BY c."ID_CATEGORIA__PK___", c."NOME__"
      ORDER BY "totalCursos" DESC
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const cursosMaisPopulares = await sequelize.query(
      `
      SELECT 
        c."ID_CURSO",
        c."NOME",
        a."NOME" as "AREA_NOME",
        cat."NOME__" as "CATEGORIA_NOME",
        COALESCE(
          (SELECT COUNT(*) FROM "INSCRICAO_SINCRONO" ins
           INNER JOIN "CURSO_SINCRONO" cs ON ins."ID_CURSO_SINCRONO" = cs."ID_CURSO"
           WHERE cs."ID_CURSO" = c."ID_CURSO"), 0
        ) +
        COALESCE(
          (SELECT COUNT(*) FROM "INSCRICAO_ASSINCRONO" inas
           INNER JOIN "CURSO_ASSINCRONO" ca ON inas."ID_CURSO_ASSINCRONO" = ca."ID_CURSO_ASSINCRONO"
           WHERE ca."ID_CURSO" = c."ID_CURSO"), 0
        ) as "totalInscricoes"
      FROM "CURSO" c
      INNER JOIN "AREA" a ON c."ID_AREA" = a."ID_AREA"
      INNER JOIN "CATEGORIA" cat ON a."ID_CATEGORIA__PK___" = cat."ID_CATEGORIA__PK___"
      ORDER BY "totalInscricoes" DESC
      LIMIT 10
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const cursosFormatados = cursosMaisPopulares.map((curso) => ({
      ID_CURSO: curso.ID_CURSO,
      NOME: curso.NOME,
      Area: {
        NOME: curso.AREA_NOME,
        Categoria: {
          NOME__: curso.CATEGORIA_NOME,
        },
      },
      totalInscricoes: parseInt(curso.totalInscricoes) || 0,
    }));

    res.status(200).json({
      success: true,
      estatisticasPorCategoria,
      cursosMaisPopulares: cursosFormatados,
    });
  } catch (error) {
    console.error("Erro ao procurar estatísticas de cursos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const getPercursoFormativo = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const {
      page = 1,
      limit = 20,
      nome = "",
      dataInicio = "",
      dataFim = "",
      perfil = "",
    } = req.query;

    const isAdmin = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores.",
      });
    }

    const offset = (page - 1) * limit;

    const whereConditions = {};

    if (nome) {
      whereConditions[Op.or] = [
        { NOME: { [Op.iLike]: `%${nome}%` } },
        { USERNAME: { [Op.iLike]: `%${nome}%` } },
        { EMAIL: { [Op.iLike]: `%${nome}%` } },
      ];
    }

    if (dataInicio) {
      whereConditions.DATA_CRIACAO = {
        [Op.gte]: new Date(dataInicio),
      };
    }

    if (dataFim) {
      whereConditions.DATA_CRIACAO = {
        ...whereConditions.DATA_CRIACAO,
        [Op.lte]: new Date(dataFim),
      };
    }

    const includeConditions = [
      {
        model: Perfil,
        attributes: ["ID_PERFIL", "PERFIL"],
        through: { attributes: [] },
        required: !!perfil,
        where: perfil ? { ID_PERFIL: perfil } : undefined,
      },
    ];

    const { count, rows: utilizadores } = await Utilizador.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      attributes: [
        "ID_UTILIZADOR",
        "USERNAME",
        "NOME",
        "EMAIL",
        "DATA_CRIACAO",
        "ULTIMO_LOGIN",
        "XP",
      ],
      order: [["DATA_CRIACAO", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    const percursosFormativos = await Promise.all(
      utilizadores.map(async (utilizador) => {
        const userId = utilizador.ID_UTILIZADOR;

        const [
          inscricoesSincronas,
          inscricoesAssincronas,
          progressoModulos,
          respostasQuizzes,
          presencas,
          submissoesAvaliacoes,
          avaliacoesFinais,
        ] = await Promise.all([
          InscricaoSincrono.count({ where: { ID_UTILIZADOR: userId } }),
          InscricaoAssincrono.count({ where: { ID_UTILIZADOR: userId } }),
          ProgressoModulo.findAll({
            where: { ID_UTILIZADOR: userId },
            attributes: ["COMPLETO", "DATA_COMPLETO"],
          }),
          RespostaQuizAssincrono.findAll({
            where: { ID_UTILIZADOR: userId },
            attributes: ["NOTA", "DATA_SUBMISSAO"],
          }),
          PresencaAula.count({
            where: {
              ID_UTILIZADOR: userId,
              PRESENTE: true,
            },
          }),
          SubmissaoAvaliacao.findAll({
            where: { ID_UTILIZADOR: userId },
            attributes: ["NOTA", "DATA_SUBMISSAO", "DATA_AVALIACAO"],
            include: [
              {
                model: AvaliacaoSincrona,
                attributes: ["TITULO", "ID_CURSO"],
              },
            ],
          }),
          AvaliacaoFinalSincrona.findAll({
            where: {
              UTI_ID_UTILIZADOR2: userId,
              NOTA_FINAL: { [Op.ne]: null },
            },
            attributes: ["NOTA_FINAL", "DATA_AVALIACAO"],
          }),
        ]);

        const totalCursos = inscricoesSincronas + inscricoesAssincronas;
        const modulosCompletos = progressoModulos.filter(
          (p) => p.COMPLETO
        ).length;
        const quizzesRespondidos = respostasQuizzes.length;
        const avaliacoesSubmitidas = submissoesAvaliacoes.length;
        const avaliacoesAvaliadas = submissoesAvaliacoes.filter(
          (s) => s.NOTA !== null
        ).length;

        let notaMediaGeral = 0;
        let totalAvaliacoes = 0;
        let somaNotas = 0;

        if (respostasQuizzes.length > 0) {
          respostasQuizzes.forEach((quiz) => {
            if (quiz.NOTA !== null) {
              somaNotas += (quiz.NOTA * 20) / 100;
              totalAvaliacoes++;
            }
          });
        }

        if (avaliacoesFinais.length > 0) {
          avaliacoesFinais.forEach((avaliacaoFinal) => {
            if (avaliacaoFinal.NOTA_FINAL !== null) {
              somaNotas += avaliacaoFinal.NOTA_FINAL;
              totalAvaliacoes++;
            }
          });
        }

        if (totalAvaliacoes > 0) {
          notaMediaGeral = (somaNotas / totalAvaliacoes).toFixed(1);
        }

        let notaMediaQuizzes = 0;
        if (respostasQuizzes.length > 0) {
          const somaQuizzes = respostasQuizzes.reduce(
            (sum, r) => sum + (r.NOTA || 0),
            0
          );
          notaMediaQuizzes = (somaQuizzes / respostasQuizzes.length).toFixed(1);
        }

        let notaMediaAvaliacoes = 0;
        if (avaliacoesAvaliadas > 0) {
          const somaAvaliacoes = submissoesAvaliacoes
            .filter((s) => s.NOTA !== null)
            .reduce((sum, s) => sum + s.NOTA, 0);
          notaMediaAvaliacoes = (somaAvaliacoes / avaliacoesAvaliadas).toFixed(
            1
          );
        }

        let notaMediaAvaliacoesFinais = 0;
        if (avaliacoesFinais.length > 0) {
          const somaAvaliacoesFinais = avaliacoesFinais.reduce(
            (sum, a) => sum + (a.NOTA_FINAL || 0),
            0
          );
          notaMediaAvaliacoesFinais = (
            somaAvaliacoesFinais / avaliacoesFinais.length
          ).toFixed(1);
        }

        return {
          utilizador: utilizador.toJSON(),
          estatisticas: {
            totalCursos,
            cursosSincronos: inscricoesSincronas,
            cursosAssincronos: inscricoesAssincronas,
            modulosCompletos,
            totalModulos: progressoModulos.length,
            quizzesRespondidos,
            avaliacoesSubmitidas,
            avaliacoesAvaliadas,
            avaliacoesFinaisTotal: avaliacoesFinais.length,
            notaMediaGeral: parseFloat(notaMediaGeral),
            notaMediaQuizzes: parseFloat(notaMediaQuizzes),
            notaMediaAvaliacoes: parseFloat(notaMediaAvaliacoes),
            notaMediaAvaliacoesFinais: parseFloat(notaMediaAvaliacoesFinais),
            presencas,
            progressoGeral:
              progressoModulos.length > 0
                ? ((modulosCompletos / progressoModulos.length) * 100).toFixed(
                    1
                  )
                : 0,
            xp: utilizador.XP || 0,
            avaliacoesDetalhes: submissoesAvaliacoes.map((submissao) => ({
              titulo: submissao.AVALIACAO_SINCRONA?.TITULO || "N/A",
              cursoId: submissao.AVALIACAO_SINCRONA?.ID_CURSO || null,
              nota: submissao.NOTA,
              dataSubmissao: submissao.DATA_SUBMISSAO,
              dataAvaliacao: submissao.DATA_AVALIACAO,
              avaliada: submissao.NOTA !== null,
            })),
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      percursos: percursosFormativos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasMore: offset + utilizadores.length < count,
      },
    });
  } catch (error) {
    console.error("Erro ao procurar percurso formativo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const getDashboardCharts = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const isAdmin = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores.",
      });
    }

    const inscricoesPorMes = await sequelize.query(
      `
      SELECT 
        TO_CHAR(data_inscricao, 'YYYY-MM') as mes,
        COUNT(*) as total
      FROM (
        SELECT "DATA_INSCRICAO" as data_inscricao FROM "INSCRICAO_SINCRONO"
        WHERE "DATA_INSCRICAO" >= NOW() - INTERVAL '12 months'
        UNION ALL
        SELECT "DATA_INSCRICAO" as data_inscricao FROM "INSCRICAO_ASSINCRONO"
        WHERE "DATA_INSCRICAO" >= NOW() - INTERVAL '12 months'
      ) as todas_inscricoes
      GROUP BY TO_CHAR(data_inscricao, 'YYYY-MM')
      ORDER BY mes ASC
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const utilizadoresPorPerfil = await sequelize.query(
      `
      SELECT 
        p."PERFIL" as perfil,
        COUNT(utp."ID_UTILIZADOR") as total
      FROM "PERFIL" p
      LEFT JOIN "UTILIZADOR_TEM_PERFIL" utp ON p."ID_PERFIL" = utp."ID_PERFIL"
      GROUP BY p."ID_PERFIL", p."PERFIL"
      ORDER BY total DESC
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const atividadeForumPorMes = await sequelize.query(
      `
      SELECT 
        TO_CHAR("DATA_CRIACAO", 'YYYY-MM') as mes,
        COUNT(*) as posts
      FROM "FORUM_POST"
      WHERE "DATA_CRIACAO" >= NOW() - INTERVAL '12 months'
        AND "ESTADO" IN ('Ativo', 'Editado')
      GROUP BY TO_CHAR("DATA_CRIACAO", 'YYYY-MM')
      ORDER BY mes ASC
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json({
      success: true,
      charts: {
        inscricoesPorMes,
        utilizadoresPorPerfil,
        atividadeForumPorMes,
      },
    });
  } catch (error) {
    console.error("Erro ao procurar dados dos gráficos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  getGeneralStats,
  getPercursoFormativo,
  getCursosStats,
  getDashboardCharts,
};
