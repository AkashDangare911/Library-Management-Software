import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "LIBRARY_DB",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const connectDB = async () => {
    try {
        // We get a connection just to verify the credentials and network work
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release(); // Release it back to the pool
    } catch (err) {
        console.error("Database connection failed", err);
        process.exit(1); // Exit if the database is unreachable
    }
}

export default pool;