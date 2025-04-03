const pool = require("./database.js");

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Ligação bem-sucedida:", res.rows[0]);
  } catch (err) {
    console.error("Erro na ligação:", err);
  }
}

testConnection();
