const User = require("../models/user.model");

const register = async (req, res) => {
  const { Username, Password, Email } = req.body;

  /*const user = {
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    LinkedIN: "",
    Type: "user",
  };*/

  if (!Username || !Password || !Email) {
    return res
      .status(400)
      .json({ error: "Todos os campos devem estar preenchidos" });
  }

  try {
    const userExist = await User.findOne({
      where: { email: Email },
    });
    //console.log(userExist.rows.length);
    if (userExist) {
      return res.status(400).json({ error: "Email já em uso!" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10); // hash da password
    const verificationToken = Math.floor(100000 + Math.random() * 900000); // gerar um token de verificação radom
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // expira em 24 horas
    const user = await User.create({
      username: Username,
      password: hashedPassword,
      email: Email,
      linkedIn: null,
      verificationToken,
      verificationExpires,
    });

    await user.save();

    console.log("User registado com sucesso! User:");
    res.status(201).json({ message: "User registado com sucesso!" });
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
