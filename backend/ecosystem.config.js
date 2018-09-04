module.exports = {
  apps : [{
    name      : 'API',
    script    : 'npm',
    args      : 'run prod',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
