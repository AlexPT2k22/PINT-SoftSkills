const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  //console.log("Auth Header:", authHeader);
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token em falta" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
