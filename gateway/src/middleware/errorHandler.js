module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(502).json({
    success: false,
    message: err.message || 'Gateway proxy error'
  });
};
