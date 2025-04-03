const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();
const path = require("path");
const usersFilePath = path.join(__dirname, "../database/users.json");
let users = require(usersFilePath);
const linkedin_url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&state=foobar&scope=openid%20profile%20email`;
const supabase = require("../controllers/supabase.js"); // Supabase client

// "/auth"
router.get("/", (_, res) => {
  res.json("Auth");
});

/*router.get("/linkedin", (_, res) => {
  res.redirect(linkedin_url);
});

router.get("/linkedin/callback", async (req, res) => {
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
});*/

router.get("/linkedin", async (req, res) => {
  const { data, erro } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: {
      redirect_to: process.env.REDIRECT_URL,
    },
  });

  if (data.url) {
    res.redirect(data.url);
  }
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  const next = req.query.next ?? "/";
  if (code) {
    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(context.req.headers.cookie ?? "");
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              context.res.appendHeader(
                "Set-Cookie",
                serializeCookieHeader(name, value, options)
              )
            );
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }
  console.log("Success!");
  res.redirect(303, `/${next.slice(1)}`);
});

module.exports = router;
