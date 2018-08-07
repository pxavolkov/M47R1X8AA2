module.exports = {
  apps : [{
    name      : 'API',
    script    : 'dist/backend/src/main.js',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
