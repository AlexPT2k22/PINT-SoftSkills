const {
  Utilizador,
  Curso,
  CursoSincrono,
  CursoAssincrono,
  InscricaoSincrono,
  InscricaoAssincrono,
  ProgressoModulo,
  AulaSincrona,
  PresencaAula,
  Certificado,
  RespostaQuizAssincrono,
  QuizAssincrono,
  SubmissaoAvaliacao,
  AvaliacaoSincrona,
  AvaliacaoFinalSincrona,
  Modulos,
  Area,
  Categoria,
  Objetivos,
  Habilidades,
  Topico,
} = require("../models/index.js");
const { Op } = require("sequelize");

// Obter o percurso formativo completo do formando atual
const getMeuPercursoFormativo = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    // Obter dados básicos do utilizador
    const utilizador = await Utilizador.findByPk(userId, {
      attributes: [
        "ID_UTILIZADOR",
        "NOME",
        "USERNAME",
        "EMAIL",
        "XP",
        "DATA_CRIACAO",
      ],
    });

    if (!utilizador) {
      return res.status(404).json({
        success: false,
        message: "Utilizador não encontrado",
      });
    }

    // 1. Cursos síncronos em que o formando está inscrito
    const inscricoesSincronas = await InscricaoSincrono.findAll({
      where: { ID_UTILIZADOR: userId },
      include: [
        {
          model: CursoSincrono,
          include: [
            {
              model: Curso,
              include: [
                {
                  model: Area,
                  include: [
                    {
                      model: Categoria,
                      as: "Categoria",
                    },
                  ],
                },
                { model: Topico, as: "Topico" },
                {
                  model: Objetivos,
                  as: "OBJETIVOS",
                  attributes: ["DESCRICAO"],
                },
                {
                  model: Habilidades,
                  as: "HABILIDADES",
                  attributes: ["DESCRICAO"],
                },
              ],
            },
            {
              model: Utilizador, // Formador
              attributes: ["NOME", "USERNAME"],
            },
          ],
        },
      ],
      order: [["DATA_INSCRICAO", "DESC"]],
    });

    // 2. Cursos assíncronos em que o formando está inscrito
    const inscricoesAssincronas = await InscricaoAssincrono.findAll({
      where: { ID_UTILIZADOR: userId },
      include: [
        {
          model: CursoAssincrono,
          include: [
            {
              model: Curso,
              include: [
                {
                  model: Area,
                  include: [
                    {
                      model: Categoria,
                      as: "Categoria",
                    },
                  ],
                },
                { model: Topico, as: "Topico" },
                {
                  model: Objetivos,
                  as: "OBJETIVOS",
                  attributes: ["DESCRICAO"],
                },
                {
                  model: Habilidades,
                  as: "HABILIDADES",
                  attributes: ["DESCRICAO"],
                },
              ],
            },
          ],
        },
      ],
      order: [["DATA_INSCRICAO", "DESC"]],
    });

    // 3. Processar cursos síncronos com dados detalhados
    const cursosSincronos = await Promise.all(
      inscricoesSincronas.map(async (inscricao) => {
        const curso = inscricao.CURSO_SINCRONO.CURSO;
        const cursoId = curso.ID_CURSO;
        const cursoSincrono = inscricao.CURSO_SINCRONO;

        // Obter módulos e calcular duração total
        const modulos = await Modulos.findAll({
          where: { ID_CURSO: cursoId },
          attributes: ["ID_MODULO", "NOME", "TEMPO_ESTIMADO_MIN", "DESCRICAO"],
        });

        const duracaoTotal = modulos.reduce(
          (total, modulo) => total + (modulo.TEMPO_ESTIMADO_MIN || 0),
          0
        );

        // Progressos nos módulos
        const progressos = await ProgressoModulo.findAll({
          where: {
            ID_UTILIZADOR: userId,
            ID_CURSO: cursoId,
          },
        });

        const modulosCompletos = progressos.filter((p) => p.COMPLETO).length;
        const totalModulos = modulos.length;
        const percentualConcluido =
          totalModulos > 0
            ? Math.round((modulosCompletos / totalModulos) * 100)
            : 0;

        // Informações de aulas e presenças
        const aulas = await AulaSincrona.findAll({
          where: { ID_CURSO: cursoId },
          include: [
            {
              model: PresencaAula,
              where: { ID_UTILIZADOR: userId },
              required: false,
            },
          ],
          order: [["DATA_AULA", "ASC"]],
        });

        const presencas = aulas.filter((aula) =>
          aula.PRESENCA_AULAs?.some((p) => p.PRESENTE)
        ).length;

        // Calcular horas de presença
        let horasPresenca = 0;
        aulas.forEach((aula) => {
          const presente = aula.PRESENCA_AULAs?.some((p) => p.PRESENTE);
          if (presente && aula.HORA_INICIO && aula.HORA_FIM) {
            // Converter HORA_INICIO e HORA_FIM para minutos
            const [horaInicio, minutoInicio] =
              aula.HORA_INICIO.split(":").map(Number);
            const [horaFim, minutoFim] = aula.HORA_FIM.split(":").map(Number);

            const minutosInicio = horaInicio * 60 + minutoInicio;
            const minutosFim = horaFim * 60 + minutoFim;

            // Calcular duração da aula em horas
            const duracaoMinutos = minutosFim - minutosInicio;
            const duracaoHoras = duracaoMinutos / 60;

            horasPresenca += duracaoHoras;
          }
        });

        // Arredondar para 1 casa decimal
        horasPresenca = parseFloat(horasPresenca.toFixed(1));

        const percentualPresenca =
          aulas.length > 0 ? Math.round((presencas / aulas.length) * 100) : 0;

        // Informações de avaliações
        const avaliacoesSincronas = await AvaliacaoSincrona.findAll({
          where: { ID_CURSO: cursoId },
          include: [
            {
              model: SubmissaoAvaliacao,
              where: { ID_UTILIZADOR: userId },
              required: false,
            },
          ],
        });

        let notaMedia = 0;
        let submissoesAvaliadas = 0;
        let avaliacoesCompletas = 0;

        avaliacoesSincronas.forEach((avaliacao) => {
          const submissoes = avaliacao.SUBMISSAO_AVALIACAOs || [];
          if (submissoes.length > 0) {
            avaliacoesCompletas++;
            submissoes.forEach((submissao) => {
              if (submissao.NOTA !== null) {
                notaMedia += submissao.NOTA;
                submissoesAvaliadas++;
              }
            });
          }
        });

        if (submissoesAvaliadas > 0) {
          notaMedia = notaMedia / submissoesAvaliadas;
        }

        // Buscar avaliação final (nota final do formador)
        const avaliacaoFinal = await AvaliacaoFinalSincrona.findOne({
          where: {
            UTI_ID_UTILIZADOR: cursoSincrono.ID_UTILIZADOR, // Formador
            UTI_ID_UTILIZADOR2: userId, // Aluno
          },
        });

        const notaFinal = avaliacaoFinal ? avaliacaoFinal.NOTA_FINAL : 0;

        // Verificar se possui certificado
        const certificado = await Certificado.findOne({
          where: { ID_UTILIZADOR: userId, ID_CURSO: cursoId },
        });

        // Determinar elegibilidade para certificado
        const podeReceberCertificado = () => {
          // Deve ter completado 100% dos módulos
          if (percentualConcluido < 100) return false;

          // Para cursos síncronos: deve ter completado todas as avaliações
          if (avaliacoesCompletas < avaliacoesSincronas.length) return false;

          if (notaMedia < 47.5) return false;

          return true;
        };

        // Determinar estado do curso
        const hoje = new Date();
        const dataInicio = new Date(cursoSincrono.DATA_INICIO);
        const dataFim = new Date(cursoSincrono.DATA_FIM);

        let estado;
        if (hoje < dataInicio) {
          estado = "Não iniciado";
        } else if (hoje > dataFim) {
          estado = "Concluído";
        } else {
          estado = "Em andamento";
        }

        return {
          id: cursoId,
          tipo: "Síncrono",
          nome: curso.NOME,
          descricao: curso.DESCRICAO_OBJETIVOS__,
          categoria: curso.AREA?.Categoria?.NOME__ || "N/A",
          area: curso.AREA?.NOME || "N/A",
          topico: curso.Topico?.TITULO || "N/A",
          imagem: curso.IMAGEM,
          objetivos: curso.OBJETIVOS?.map((obj) => obj.DESCRICAO) || [],
          habilidades: curso.HABILIDADES?.map((hab) => hab.DESCRICAO) || [],
          formador:
            cursoSincrono.UTILIZADOR?.NOME ||
            cursoSincrono.UTILIZADOR?.USERNAME ||
            "N/A",
          dataInicio: cursoSincrono.DATA_INICIO,
          dataFim: cursoSincrono.DATA_FIM,
          dataInscricao: inscricao.DATA_INSCRICAO,
          estado: inscricao.ESTADO || estado,
          duracaoTotal: duracaoTotal,
          horasPresenca,
          totalAulas: aulas.length,
          aulasPresentes: presencas,
          percentualPresenca,
          notaMedia: parseFloat(notaMedia.toFixed(1)),
          notaFinal: parseFloat(notaFinal.toFixed(1)),
          avaliacoesCompletas,
          totalAvaliacoes: avaliacoesSincronas.length,
          modulosCompletos,
          totalModulos,
          percentualConcluido,
          hasCertificado: !!certificado,
          certificadoCodigo: certificado?.CODIGO_VERIFICACAO || null,
          vagas: cursoSincrono.VAGAS,
          elegiveParaCertificado: podeReceberCertificado(),
          // Detalhes específicos das aulas
          aulasDetalhes: aulas.map((aula) => ({
            id: aula.ID_AULA,
            data: aula.DATA_AULA,
            horaInicio: aula.HORA_INICIO,
            horaFim: aula.HORA_FIM,
            presente: aula.PRESENCA_AULAs?.some((p) => p.PRESENTE) || false,
          })),
        };
      })
    );

    // 4. Processar cursos assíncronos com dados detalhados
    const cursosAssincronos = await Promise.all(
      inscricoesAssincronas.map(async (inscricao) => {
        const curso = inscricao.CURSO_ASSINCRONO.CURSO;
        const cursoId = curso.ID_CURSO;
        const cursoAssincrono = inscricao.CURSO_ASSINCRONO;

        // Obter módulos e calcular duração total
        const modulos = await Modulos.findAll({
          where: { ID_CURSO: cursoId },
          attributes: ["ID_MODULO", "NOME", "TEMPO_ESTIMADO_MIN", "DESCRICAO"],
        });

        const duracaoTotal = modulos.reduce(
          (total, modulo) => total + (modulo.TEMPO_ESTIMADO_MIN || 0),
          0
        );

        // Progressos nos módulos
        const progressos = await ProgressoModulo.findAll({
          where: {
            ID_UTILIZADOR: userId,
            ID_CURSO: cursoId,
          },
        });

        const modulosCompletos = progressos.filter((p) => p.COMPLETO).length;
        const totalModulos = modulos.length;
        const percentualConcluido =
          totalModulos > 0
            ? Math.round((modulosCompletos / totalModulos) * 100)
            : 0;

        // Informações de quizzes
        const quizzes = await QuizAssincrono.findAll({
          where: { ID_CURSO: cursoId },
          include: [
            {
              model: RespostaQuizAssincrono,
              as: "RESPOSTAS",
              where: { ID_UTILIZADOR: userId },
              required: false,
            },
          ],
        });

        let notaMedia = 0;
        let quizzesRespondidos = 0;

        quizzes.forEach((quiz) => {
          const respostas = quiz.RESPOSTAS || [];
          if (respostas.length > 0) {
            quizzesRespondidos++;
            respostas.forEach((resposta) => {
              if (resposta.NOTA !== null) {
                notaMedia += resposta.NOTA;
              }
            });
          }
        });

        if (quizzesRespondidos > 0) {
          notaMedia = notaMedia / quizzesRespondidos;
        }

        // Verificar se possui certificado
        const certificado = await Certificado.findOne({
          where: { ID_UTILIZADOR: userId, ID_CURSO: cursoId },
        });

        // Determinar estado baseado no progresso
        let estado;
        if (percentualConcluido === 0) {
          estado = "Não iniciado";
        } else if (percentualConcluido === 100) {
          estado = "Concluído";
        } else {
          estado = "Em andamento";
        }

        // Determinar elegibilidade para certificado
        const podeReceberCertificado = () => {
          // Deve ter completado 100% dos módulos
          if (percentualConcluido < 100) return false;

          // Para cursos assíncronos: deve ter respondido todos os quizzes
          if (quizzesRespondidos < quizzes.length) return false;

          if (notaMedia < 47.5) return false;

          return true;
        };

        return {
          id: cursoId,
          tipo: "Assíncrono",
          nome: curso.NOME,
          descricao: curso.DESCRICAO_OBJETIVOS__,
          categoria: curso.AREA?.Categoria?.NOME__ || "N/A",
          area: curso.AREA?.NOME || "N/A",
          topico: curso.Topico?.TITULO || "N/A",
          imagem: curso.IMAGEM,
          objetivos: curso.OBJETIVOS?.map((obj) => obj.DESCRICAO) || [],
          habilidades: curso.HABILIDADES?.map((hab) => hab.DESCRICAO) || [],
          dataInicio: cursoAssincrono.DATA_INICIO,
          dataFim: cursoAssincrono.DATA_FIM,
          dataInscricao: inscricao.DATA_INSCRICAO,
          estado: inscricao.ESTADO || estado,
          duracaoTotal: duracaoTotal,
          notaMedia: parseFloat(notaMedia.toFixed(1)),
          quizzesRespondidos,
          totalQuizzes: quizzes.length,
          modulosCompletos,
          totalModulos,
          percentualConcluido,
          hasCertificado: !!certificado,
          certificadoCodigo: certificado?.CODIGO_VERIFICACAO || null,
          elegiveParaCertificado: podeReceberCertificado(),
          // Detalhes específicos dos módulos
          modulosDetalhes: modulos.map((modulo, index) => {
            const progresso = progressos.find(
              (p) => p.ID_MODULO === modulo.ID_MODULO
            );
            return {
              id: modulo.ID_MODULO,
              nome: modulo.NOME,
              descricao: modulo.DESCRICAO,
              duracaoMin: modulo.TEMPO_ESTIMADO_MIN,
              completo: progresso?.COMPLETO || false,
              dataCompleto: progresso?.DATA_COMPLETO || null,
            };
          }),
        };
      })
    );

    // 5. Estatísticas gerais
    const totalCursos = cursosSincronos.length + cursosAssincronos.length;
    const cursosCompletos = [...cursosSincronos, ...cursosAssincronos].filter(
      (curso) => curso.percentualConcluido === 100
    ).length;
    const cursosEmAndamento = [...cursosSincronos, ...cursosAssincronos].filter(
      (curso) =>
        curso.percentualConcluido > 0 && curso.percentualConcluido < 100
    ).length;
    const totalHorasEstudo = [...cursosSincronos, ...cursosAssincronos].reduce(
      (total, curso) => total + curso.duracaoTotal,
      0
    );
    const totalCertificados = [...cursosSincronos, ...cursosAssincronos].filter(
      (curso) => curso.hasCertificado
    ).length;

    // Calcular horas de presença total (só cursos síncronos)
    const totalHorasPresenca = cursosSincronos.reduce(
      (total, curso) => total + (curso.horasPresenca || 0),
      0
    );

    // Calcular nota média geral
    const cursosComNota = [...cursosSincronos, ...cursosAssincronos].filter(
      (curso) => curso.notaMedia > 0
    );
    const notaMediaGeral =
      cursosComNota.length > 0
        ? cursosComNota.reduce((sum, curso) => sum + curso.notaMedia, 0) /
          cursosComNota.length
        : 0;

    // 6. Preparar resposta
    const resultado = {
      success: true,
      utilizador: {
        id: utilizador.ID_UTILIZADOR,
        nome: utilizador.NOME,
        username: utilizador.USERNAME,
        email: utilizador.EMAIL,
        xp: utilizador.XP,
        dataCriacao: utilizador.DATA_CRIACAO,
      },
      estatisticas: {
        totalCursos,
        cursosCompletos,
        cursosEmAndamento,
        cursosNaoIniciados: totalCursos - cursosCompletos - cursosEmAndamento,
        totalHorasEstudo,
        totalHorasPresenca,
        totalCertificados,
        notaMediaGeral: parseFloat(notaMediaGeral.toFixed(1)),
        percentualConclusao:
          totalCursos > 0
            ? Math.round((cursosCompletos / totalCursos) * 100)
            : 0,
        // Estatísticas por tipo
        estatisticasPorTipo: {
          sincronos: {
            total: cursosSincronos.length,
            completos: cursosSincronos.filter(
              (c) => c.percentualConcluido === 100
            ).length,
            emAndamento: cursosSincronos.filter(
              (c) => c.percentualConcluido > 0 && c.percentualConcluido < 100
            ).length,
            horasPresenca: totalHorasPresenca,
          },
          assincronos: {
            total: cursosAssincronos.length,
            completos: cursosAssincronos.filter(
              (c) => c.percentualConcluido === 100
            ).length,
            emAndamento: cursosAssincronos.filter(
              (c) => c.percentualConcluido > 0 && c.percentualConcluido < 100
            ).length,
            quizzesRespondidos: cursosAssincronos.reduce(
              (sum, c) => sum + c.quizzesRespondidos,
              0
            ),
          },
        },
      },
      cursos: {
        sincronos: cursosSincronos,
        assincronos: cursosAssincronos,
      },
    };

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar percurso formativo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter percurso formativo",
    });
  }
};

// Obter detalhes específicos de um curso do percurso
const getDetalhesCursoPercurso = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { cursoId } = req.params;

    // Verificar se o utilizador está inscrito no curso
    const [inscricaoSincrona, inscricaoAssincrona] = await Promise.all([
      InscricaoSincrono.findOne({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: CursoSincrono,
            where: { ID_CURSO: cursoId },
            required: true,
          },
        ],
      }),
      InscricaoAssincrono.findOne({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: CursoAssincrono,
            where: { ID_CURSO: cursoId },
            required: true,
          },
        ],
      }),
    ]);

    if (!inscricaoSincrona && !inscricaoAssincrona) {
      return res.status(403).json({
        success: false,
        message: "Utilizador não está inscrito neste curso",
      });
    }

    const curso = await Curso.findByPk(cursoId, {
      include: [
        {
          model: Area,
          include: [
            {
              model: Categoria,
              as: "Categoria",
            },
          ],
        },
        { model: Topico, as: "Topico" },
        {
          model: Objetivos,
          as: "OBJETIVOS",
          attributes: ["DESCRICAO"],
        },
        {
          model: Habilidades,
          as: "HABILIDADES",
          attributes: ["DESCRICAO"],
        },
        {
          model: Modulos,
          as: "MODULOS",
          attributes: ["ID_MODULO", "NOME", "DESCRICAO", "TEMPO_ESTIMADO_MIN"],
        },
      ],
    });

    console.log(curso);

    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso não encontrado",
      });
    }

    // Buscar progresso detalhado
    const progressos = await ProgressoModulo.findAll({
      where: { ID_UTILIZADOR: userId, ID_CURSO: cursoId },
    });

    // Buscar certificado
    const certificado = await Certificado.findOne({
      where: { ID_UTILIZADOR: userId, ID_CURSO: cursoId },
    });

    let detalhesEspecificos = {};

    if (inscricaoSincrona) {
      // Detalhes específicos para curso síncrono
      const aulas = await AulaSincrona.findAll({
        where: { ID_CURSO: cursoId },
        include: [
          {
            model: PresencaAula,
            where: { ID_UTILIZADOR: userId },
            required: false,
          },
        ],
        order: [["DATA_AULA", "ASC"]],
      });

      const avaliacoes = await AvaliacaoSincrona.findAll({
        where: { ID_CURSO: cursoId },
        include: [
          {
            model: SubmissaoAvaliacao,
            where: { ID_UTILIZADOR: userId },
            required: false,
          },
        ],
      });

      detalhesEspecificos = {
        tipo: "Síncrono",
        aulas: aulas.map((aula) => ({
          id: aula.ID_AULA,
          data: aula.DATA_AULA,
          horaInicio: aula.HORA_INICIO,
          horaFim: aula.HORA_FIM,
          presente: aula.PRESENCA_AULAs?.some((p) => p.PRESENTE) || false,
          horaEntrada: aula.PRESENCA_AULAs?.[0]?.HORA_ENTRADA || null,
        })),
        avaliacoes: avaliacoes.map((avaliacao) => ({
          id: avaliacao.ID_AVALIACAO_SINCRONA,
          titulo: avaliacao.TITULO,
          descricao: avaliacao.DESCRICAO,
          dataLimite: avaliacao.DATA_LIMITE_REALIZACAO,
          submissao: avaliacao.SUBMISSAO_AVALIACAOs?.[0] || null,
        })),
      };
    } else {
      // Detalhes específicos para curso assíncrono
      const quizzes = await QuizAssincrono.findAll({
        where: { ID_CURSO: cursoId },
        include: [
          {
            model: RespostaQuizAssincrono,
            as: "RESPOSTAS",
            where: { ID_UTILIZADOR: userId },
            required: false,
          },
        ],
      });

      detalhesEspecificos = {
        tipo: "Assíncrono",
        quizzes: quizzes.map((quiz) => ({
          id: quiz.ID_QUIZ,
          titulo: quiz.TITULO,
          descricao: quiz.DESCRICAO,
          tentativasPermitidas: quiz.TENTATIVAS_PERMITIDAS || 1,
          respostas: quiz.RESPOSTAS || [],
        })),
      };
    }

    const resultado = {
      success: true,
      curso: {
        id: curso.ID_CURSO,
        nome: curso.NOME,
        descricao: curso.DESCRICAO_OBJETIVOS__,
        imagem: curso.IMAGEM,
        categoria: curso.AREA?.Categoria?.NOME__ || "N/A",
        area: curso.AREA?.NOME || "N/A",
        topico: curso.Topico?.TITULO || "N/A",
        objetivos: curso.OBJETIVOS?.map((obj) => obj.DESCRICAO) || [],
        habilidades: curso.HABILIDADES?.map((hab) => hab.DESCRICAO) || [],
      },
      progresso: {
        modulos:
          curso.MODULOS?.map((modulo) => {
            const progresso = progressos.find(
              (p) => p.ID_MODULO === modulo.ID_MODULO
            );
            return {
              id: modulo.ID_MODULO,
              nome: modulo.NOME,
              descricao: modulo.DESCRICAO,
              duracaoMin: modulo.TEMPO_ESTIMADO_MIN,
              completo: progresso?.COMPLETO || false,
              dataCompleto: progresso?.DATA_COMPLETO || null,
            };
          }) || [],
        percentualConcluido:
          curso.MODULOS?.length > 0
            ? Math.round(
                (progressos.filter((p) => p.COMPLETO).length /
                  curso.MODULOS.length) *
                  100
              )
            : 0,
      },
      certificado: certificado
        ? {
            codigo: certificado.CODIGO_VERIFICACAO,
            dataEmissao: certificado.DATA_EMISSAO,
          }
        : null,
      ...detalhesEspecificos,
    };

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar detalhes do curso:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter detalhes do curso",
    });
  }
};

module.exports = {
  getMeuPercursoFormativo,
  getDetalhesCursoPercurso,
};
