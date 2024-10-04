const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
    })
  );

  /* Add a new route for the login page
  app.use('/login', createProxyMiddleware({
    target: 'http://localhost:5000/login',
    changeOrigin: true,
  }));*/
};

