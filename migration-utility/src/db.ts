import mysql from 'mysql2/promise';
import mssql from 'mssql';

export default {
  async connectMySQL(): Promise<mysql.Connection> {
    return mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });
  },
  async connectMSSQL(): Promise<mssql.ConnectionPool> {
    const pool = new mssql.ConnectionPool({
      user: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      server: process.env.MSSQL_HOST!,
      database: process.env.MSSQL_DATABASE!,
      options: {
        encrypt: false,
      }
    })
    await pool.connect();
    return pool;
  }
}