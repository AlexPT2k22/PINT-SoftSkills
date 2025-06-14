const VERIFICATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png"/>
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Bem vindo! A seguir encontra-se os seus dados de acesso:
                        </td>
                      </tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                            Username: <strong>{user_name}</strong><br>
                            Nome: <strong>{nome}</strong><br>
                            Email: <strong>{email}</strong><br>
                            Password: <strong>{password}</strong>
                          </td>
                      <tr>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Para comecar, verifique o seu email com o código abaixo:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <a style="width: 100%; background:rgb(255, 255, 255); text-decoration: none; display: inline-block; padding: 10px 0; color: #39639C; font-size: 25px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">{verification_token}</a>
                        </td>
                      </tr>
                        <td style="padding: 0 0 24px 0; display: flex; justify-content: center; allign-itens: center;">
                            <a class="button" href="{auth_url}" title="Verificar conta" style=" background: #39639C; text-decoration: none; display: inline-block; padding: 10px 15px; color: #ffffff; font-size: 18px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">Verificar conta</a>
                          </td>
                          </a>
                        </td>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Cumprimentos, <br><strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">SOFTINSA<br/>Portugal</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

const RESEND_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png"/>
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Bem vindo, {user_name}!
                        </td>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Para comecar, verifique o seu email com o código abaixo:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <a style="width: 100%; background:rgb(255, 255, 255); text-decoration: none; display: inline-block; padding: 10px 0; color: #39639C; font-size: 25px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">{verification_token}</a>
                        </td>
                      </tr>
                          </a>
                        </td>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Cumprimentos, <br><strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">SOFTINSA<br/>Portugal</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

const RESET_PASSWORD_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png"/>
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Redefinição de password
                        </td>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 25px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá,<br><br>

Recebemos um pedido para repôr a sua password na nossa plataforma.
Se foi você que fez este pedido, clique no botão abaixo para criar uma nova palavra-passe:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0; display: flex; justify-content: center; allign-itens: center;">
                          <a class="button" href="{reset_url}" title="Reset Password" style=" background: #39639C; text-decoration: none; display: inline-block; padding: 10px 15px; color: #ffffff; font-size: 18px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">Redefinir password</a>
                        </td>
                      </tr>
                          </a>
                        </td>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Cumprimentos, <br><strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">SOFTINSA<br/>Portugal</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

const PASSWORD_CHANGE_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title></title>
  <!--[if !mso]><!-- -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
  <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (max-width:595px) {
      .container {
        width: 100% !important;
      }
      .button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png"/>
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Password alterada com sucesso
                        </td>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 25px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá {user_name},<br><br>

Informamos que a palavra-passe da sua conta foi alterada com sucesso.
Se foi você que fez esta alteração, não precisa de fazer mais nada.
                        </td>
                      </tr>
                      <td style="padding: 0 0 25px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Não reconhece esta alteração?<br><br>

Nesse caso, recomendamos que <strong>redefina imediatamente a sua palavra-passe</strong> e entre em contacto com o nosso suporte.
                        </td>
                      <tr>
                        <tr>
                        <td style="padding: 0 0 24px 0; display: flex; justify-content: center; allign-itens: center;">
                          <a class="button" href="{reset_url}" title="Reset Password" style=" background: #39639C; text-decoration: none; display: inline-block; padding: 10px 15px; color: #ffffff; font-size: 18px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">Redefinir password</a>
                        </td>
                      </tr>
                      </tr>
                      <tr>
                      </tr>
                      <tr>
                      <tr>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Cumprimentos, <br><strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]-->
                  <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">SOFTINSA<br/>Portugal</span>
                  </div>
                  <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

const TEACHER_WELCOME_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    /* Estilos existentes... */
  </style>
</head>
<body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td style="padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png"/>
                </td>
              </tr>
              <tr>
                <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Bem-vindo!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          É com grande satisfação que o/a convidamos a juntar-se à nossa equipa de formadores na plataforma SoftSkills@SOFTINSA.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Dados da sua conta:</strong><br>
                          Username: <strong>{user_name}</strong><br>
                          Nome: <strong>{nome}</strong><br>
                          Email: <strong>{email}</strong><br>
                          Password temporária: <strong>{password}</strong><br>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Como formador, poderá:</strong><br>
                          • Criar e gerir cursos síncronos<br>
                          • Adicionar módulos com vídeos e conteúdos<br>
                          • Agendar aulas e gerir presenças<br>
                          • Criar avaliações e corrigir trabalhos<br>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Código de verificação:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0;">
                          <a style="width: 100%; background:rgb(255, 255, 255); text-decoration: none; display: inline-block; padding: 10px 0; color: #39639C; font-size: 25px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;">{verification_token}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0; display: flex; justify-content: center; align-items: center;">
                          <a class="button" href="{auth_url}" title="Verificar conta e começar" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Verificar Email e Começar
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Bem-vindo à nossa equipa!<br>
                          <strong>Equipa SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

const COURSE_ENROLLMENT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Inscrição</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 2px; box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025); padding: 20px;">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Inscrição Confirmada!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          A sua inscrição no curso <strong>{curso_nome}</strong> foi confirmada com sucesso!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Detalhes do Curso:</strong><br>
                          Curso: <strong>{curso_nome}</strong><br>
                          {tipo_curso_info}
                          Data de início: <strong>{data_inicio}</strong><br>
                          Data de fim: <strong>{data_fim}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; text-align: center;">
                          <a class="button" href="{curso_url}" title="Ver Curso" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Detalhes do Curso
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          SoftSkills@SOFTINSA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

const COURSE_TEACHER_CHANGE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alteração de Formador</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 2px; box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025); padding: 20px;">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Alteração de Formador
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          Informamos que o formador do curso <strong>{curso_nome}</strong> foi alterado.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Detalhes da Alteração:</strong><br>
                          Curso: <strong>{curso_nome}</strong><br>
                          {formador_anterior_info}
                          Novo Formador: <strong>{novo_formador}</strong><br>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; text-align: center;">
                          <a class="button" href="{curso_url}" title="Ver Curso" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Detalhes do Curso
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Obrigado pela sua compreensão!<br>
                          <strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

// Template para alteração de datas
const COURSE_DATE_CHANGE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alteração de Datas</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 2px; box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025); padding: 20px;">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Alteração de Datas do Curso
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          Informamos que as datas do curso <strong>{curso_nome}</strong> foram alteradas.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Novas Datas:</strong><br>
                          Curso: <strong>{curso_nome}</strong><br>
                          {data_anterior_info}
                          <span style="color: #28a745;">Nova Data de Início: <strong>{nova_data_inicio}</strong></span><br>
                          <span style="color: #28a745;">Nova Data de Fim: <strong>{nova_data_fim}</strong></span><br>
                          {formador_info}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; text-align: center;">
                          <a class="button" href="{curso_url}" title="Ver Curso" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Detalhes do Curso
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Por favor, ajuste a sua agenda conforme as novas datas.<br>
                          <strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

// Template para alteração de link de aula
const COURSE_LINK_CHANGE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link de Aula Atualizado</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 2px; box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025); padding: 20px;">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Link de Aula Atualizado
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          O link para a aula <strong>{aula_titulo}</strong> do curso <strong>{curso_nome}</strong> foi atualizado.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Detalhes da Aula:</strong><br>
                          Curso: <strong>{curso_nome}</strong><br>
                          Aula: <strong>{aula_titulo}</strong><br>
                          Data: <strong>{data_aula}</strong><br>
                          Horário: <strong>{horario_aula}</strong><br>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; text-align: center;">
                          <a class="button" href="{link_aula}" title="Aceder à Aula" style="background: #28a745; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px; margin-bottom: 10px;">
                            Aceder à Aula
                          </a>
                          <br>
                          <a class="button" href="{curso_url}" title="Ver Curso" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Detalhes do Curso
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Guarde este novo link para aceder à aula!<br>
                          <strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

// Template para novo conteúdo adicionado
const COURSE_NEW_CONTENT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Conteúdo Disponível</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 2px; box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025); padding: 20px;">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          Novo Conteúdo Disponível!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          Novo conteúdo foi adicionado ao curso <strong>{curso_nome}</strong>!
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Novo Conteúdo:</strong><br>
                          Curso: <strong>{curso_nome}</strong><br>
                          {conteudo_info}
                          Data de Adição: <strong>{data_adicao}</strong><br>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; text-align: center;">
                          <a class="button" href="{curso_url}" title="Ver Novo Conteúdo" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Novo Conteúdo
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Não perca este novo material de aprendizagem!<br>
                          <strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

// Template genérico para outras notificações
const COURSE_GENERAL_NOTIFICATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificação do Curso</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 2px; box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025); padding: 20px;">
                  <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                          {notification_title}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          {notification_message}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          <strong>Detalhes:</strong><br>
                          Curso: <strong>{curso_nome}</strong><br>
                          {additional_info}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0; text-align: center;">
                          <a class="button" href="{curso_url}" title="Ver Curso" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Detalhes do Curso
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Obrigado pela sua atenção!<br>
                          <strong>SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

// Template genérico para anuncios no curso
const COURSE_NEW_ANNOUNCEMENT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Anúncio do Curso</title>
  <style>
    /* Estilos CSS inline do email */
  </style>
</head>
<body>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8fafc;">
    <tbody>
      <tr>
        <td align="center">
          <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto;">
            <tbody>
              <tr>
                <td style="padding: 25px 0; text-align: center;">
                  <img src="https://mailsend-email-assets.mailtrap.io/g45ed5kx2fq1ua3rru806ysabnab.png" width="150" alt="SoftSkills@SOFTINSA Logo" style="border: none;">
                </td>
              </tr>
              <tr>
                <td class="body" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e8e5ef; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 150, 0.025); padding: 30px;">
                  <table class="inner-body" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; margin: 0 auto; padding: 0;">
                    <tbody>
                      <tr>
                        <td style="text-align: center; padding-bottom: 20px;">
                          <span class="announcement-badge" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block;">
                            {notification_title}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px 0; font-size: 20px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em; text-align: center;">
                          {anuncio_titulo}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                          Olá <strong>{nome}</strong>,<br><br>
                          Um novo anúncio foi publicado no curso <strong>{curso_nome}</strong> pelo formador.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0;">
                          <div class="announcement-content" style="background-color: #f8f9fa; border-left: 4px solid #39639C; padding: 20px; margin: 16px 0; border-radius: 4px;">
                            <h3 style="margin: 0 0 12px 0; color: #39639C; font-size: 16px; font-weight: bold;">
                              {anuncio_titulo}
                            </h3>
                            <p style="margin: 0; color: #555; line-height: 1.6; white-space: pre-line;">
                              {anuncio_conteudo}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0;">
                          <div class="formador-info" style="background-color: #e3f2fd; border-radius: 6px; padding: 12px; margin: 16px 0; border-left: 3px solid #2196f3;">
                            <p style="margin: 0; font-size: 14px; color: #1976d2;">
                              <strong>Publicado por:</strong> {formador_nome}<br>
                              <strong>Data:</strong> {data_publicacao}<br>
                              <strong>Curso:</strong> {curso_nome}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 24px 0; text-align: center;">
                          <a class="button" href="{curso_url}" title="Ver Curso" style="background: #39639C; text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px; margin-right: 10px;">
                            Ver Curso
                          </a>
                          <a class="button" href="{anuncios_url}" title="Ver Todos os Anúncios" style="background:rgb(30, 190, 196); text-decoration: none; display: inline-block; padding: 12px 20px; color: #ffffff; font-size: 16px; line-height: 25px; text-align: center; font-weight: bold; border-radius: 7px;">
                            Ver Anúncios
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 0 0; font-size: 13px; line-height: 170%; font-weight: 400; color: #666; text-align: center; border-top: 1px solid #eee;">
                          <em>Mantenha-se atualizado com os anúncios do seu curso para não perder informações importantes!</em>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 0 0 0; font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em; text-align: center;">
                          Obrigado pela sua atenção!<br>
                          <strong>Equipa SoftSkills@SOFTINSA</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 48px; font-size: 0px;">
                  <div style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                    <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;">
                      SOFTINSA<br>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

module.exports = {
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE,
  PASSWORD_CHANGE_EMAIL_TEMPLATE,
  RESEND_EMAIL_TEMPLATE,
  TEACHER_WELCOME_EMAIL_TEMPLATE,
  COURSE_ENROLLMENT_EMAIL_TEMPLATE,
  COURSE_TEACHER_CHANGE_EMAIL_TEMPLATE,
  COURSE_DATE_CHANGE_EMAIL_TEMPLATE,
  COURSE_LINK_CHANGE_EMAIL_TEMPLATE,
  COURSE_NEW_CONTENT_EMAIL_TEMPLATE,
  COURSE_GENERAL_NOTIFICATION_EMAIL_TEMPLATE,
  COURSE_NEW_ANNOUNCEMENT_EMAIL_TEMPLATE,
};
