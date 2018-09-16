const dotenv = require('dotenv');
const register = require('tsconfig-paths/register');
const tsConfig = require('../tsconfig.json');
const fs = require('fs');
dotenv.config();

const production = process.env.NODE_ENV === 'production';

const baseUrl = fs.resolve(__dirname, '..', tsConfig.compilerOptions.baseUrl);
register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths
});

function toBoolean(str) {
  return str === 'true' || str === '1';
}

module.exports = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: toBoolean(process.env.DB_SYNC),
  entities: [production ? `${__dirname}/dist/backend/src/**/*.entity{.ts,.js}` : `${__dirname}/src/**/*.entity{.ts,.js}`],
  logging: toBoolean(process.env.DB_LOG)
}