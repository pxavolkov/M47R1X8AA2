var path = require('path');

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {'^/api' : ''}
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        shared: path.resolve(__dirname, '../shared/src/')
      }
    }
  }
}