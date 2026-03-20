const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');

const buildProxy = (target, rewriteBase) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      proxyReq: fixRequestBody
    },
    pathRewrite: (path) => `${rewriteBase}${path}`,
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        message: 'Failed to reach downstream service',
        error: err.message
      });
    }
  });

module.exports = { buildProxy };
