const generateJWTandsetCookie = require("../utils/generateJWT");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { Op } = require("sequelize");
require("dotenv").config();
const linkedin_url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&scope=openid%20profile%20email`;
const sendVerificationEmail = require("../mail/emails.js");

const register = async (req, res) => {
  const { username, password, email } = req.body;

  /*const user = {
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    LinkedIN: "",
    Type: "user",
  };*/

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Todos os campos devem estar preenchidos" });
  }

  try {
    const userExist = await User.findOne({
      where: { [Op.or]: [{ email: email }, { username: username }] },
    });
    //console.log(userExist);
    if (userExist) {
      if (userExist.dataValues.email === email) {
        return res.status(400).json({ error: "Email já em uso!" });
      } else if (userExist.dataValues.username === username) {
        return res.status(400).json({ error: "Username já em uso!" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10); // hash da password
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // gerar um token de verificação radom
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expira em 24 horas
    const user = await User.create({
      username: username,
      password: hashedPassword,
      email: email,
      linkedIn: null,
      verificationToken,
      verificationExpires,
    });

    await user.save();
    generateJWTandsetCookie(res, user.id); // gerar o token
    await sendVerificationEmail(user.username, user.email, verificationToken); // enviar o email de verificação

    res.status(201).json({
      message: `User ${user.username} registado com sucesso!`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: undefined,
        linkedIn: user.linkedIn,
        type: user.type,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao registar" });
  }
};

const login = async (req, res) => {
  const { Email, Password } = req.body;
  // verificar os campos obrigatorios
  if (!Email || !Password) {
    return res
      .status(401)
      .json({ error: "O campo Email e password são obrigatórios!" });
  }
  // verificar se o user existe
  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [
      Email,
    ]);
    const user = userExist.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }

    const passwordMatch = await bcrypt.compare(
      Password,
      userExist.rows[0].password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }

    const token = generateJWTandsetCookie(res, user.id); // gerar o token
    //console.log("User autenticado com sucesso! Com token:", token);
    res.json(token);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar!" });
  }
};

const linkedIN_url = (_, res) => {
  res.redirect(linkedin_url);
};

const linkedINLogin = async (req, res) => {
  const { code } = req.query;
  //console.log("Code:", code);

  if (!code) {
    return res.status(400).json({ error: "Código não encontrado!" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URL,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    //console.log("Access Token:", accessToken);

    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const userProfile = profileResponse.data;
    const LinkedinUsername = userProfile.name;
    const email = userProfile.email;
    //console.log("Username:", username);
    //console.log("Email:", email);

    //res.redirect(`http://localhost:8080/dashboard?username=${username}`);

    // verificar se o user existe
    const userExist = users.find(
      (u) => u.Email === email && u.Username === LinkedinUsername
    );
    if (userExist) {
      console.log(`Sucesso`);
      return res.redirect(
        `http://localhost:8080/dashboard?username=${LinkedinUsername}`
      );
    } else {
      return res.status(401).json({ error: "User não existe" });
      // TODO: adicionar o user a db
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar com o LinkedIn!" });
  }
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      where: {
        verificationToken: code,
        verificationExpires: {
          [Op.gt]: new Date(), // verifica se o token ainda é válido
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Token inválido ou expirado!" });
    }

    user.isVerified = true; // marcar o user como verificado
    user.verificationToken = null; // remover o token de verificação
    user.verificationExpires = null; // remover a data de expiração do token
    await user.save(); // guardar as alterações

    res.status(200).json({ message: "Email verificado com sucesso!" });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao verificar o email!" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout realizado com sucesso!" });
};

module.exports = {
  register,
  login,
  linkedIN_url,
  linkedINLogin,
  verifyEmail,
  logout,
};
