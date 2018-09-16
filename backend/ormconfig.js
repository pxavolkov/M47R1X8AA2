const dotenv = require('dotenv');
const tscPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');
const path = require('path');
dotenv.config();

const production = process.env.NODE_ENV === 'production';

const baseUrl = path.resolve(__dirname, 'dist/backend', tsConfig.compilerOptions.baseUrl);
tscPaths.register({
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
