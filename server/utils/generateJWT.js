const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateJWT(user) {
  const accesstoken = jwt.sign(
    { id: user.id, isVerified: user.isVerified },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15min",
    }
  );

  const refreshtoken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accesstoken, refreshtoken };
}

module.exports = generateJWT;
