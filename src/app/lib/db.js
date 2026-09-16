import mysql from 'mysql2/promise';


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export async function executeQuery({ query, values }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database Error:', error);
    throw Error(error.message);
  }
}

export default pool;