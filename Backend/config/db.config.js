const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  socketPath: process.env.DB_SOCKET_PATH
});

async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

async function withTransaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await callback(connection);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


const testConnection = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL database connected successfully");

    connection.release();
  } catch (error) {
    console.error("MySQL database connection failed:");
    console.error(error.message);
  }
};

module.exports = {
  query,
  withTransaction,
  testConnection,
};
