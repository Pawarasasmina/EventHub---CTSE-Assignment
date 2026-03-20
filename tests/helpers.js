const assert = require('node:assert/strict');
const Module = require('node:module');

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  }
});

const loadWithMocks = (modulePath, mockMap) => {
  const originalLoad = Module._load;
  const resolvedModulePath = require.resolve(modulePath);
  const previousModule = require.cache[resolvedModulePath];
  delete require.cache[resolvedModulePath];

  Module._load = function patchedLoad(request, parent, isMain) {
    if (mockMap.has(request)) {
      return mockMap.get(request);
    }

    const resolved = Module._resolveFilename(request, parent, isMain);
    if (mockMap.has(resolved)) {
      return mockMap.get(resolved);
    }
    return originalLoad.apply(this, arguments);
  };

  try {
    return require(modulePath);
  } finally {
    Module._load = originalLoad;
    if (previousModule) {
      require.cache[resolvedModulePath] = previousModule;
    } else {
      delete require.cache[resolvedModulePath];
    }
  }
};

module.exports = {
  assert,
  createRes,
  loadWithMocks
};
