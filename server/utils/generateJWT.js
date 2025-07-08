const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateJWT(res, user) {
  const token = jwt.sign(
    { ID_UTILIZADOR: user.ID_UTILIZADOR },
    process.env.JWT_SECRET,
    {
      expiresIn: "4h",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 3600000 * 4, // 4 horas
  });

  return token;
}

module.exports = generateJWT;
