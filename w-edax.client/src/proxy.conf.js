const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api/**',
        createProxyMiddleware({
            target: 'https://w2edax-server-latest.onrender.com',
            changeOrigin: true,
            pathRewrite: {
                '^/api': '/api', // Adjust this path based on your API
            },
        })
    );
};
