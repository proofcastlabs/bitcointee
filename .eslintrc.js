module.exports = {
  env: {
    es2021: true,
    node: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  extends: ['eslint:recommended', 'google'],
  rules: {
    'semi': 0,
    'object-curly-spacing': ['error', 'always'],
    'max-len': ['error', { code: 120 }],
  },
};
