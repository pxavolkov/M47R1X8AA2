const dotenv = require('dotenv');
dotenv.config();

const moduleAlias = require('module-alias')
moduleAlias.addAlias('@shared', __dirname + '/dist/shared/src');

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
  entities: [__dirname + '/dist/backend/src/**/*.entity{.ts,.js}'],
  logging: toBoolean(process.env.DB_LOG)
}