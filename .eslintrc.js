module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    browser: false,
    es6: true,
    node: true,
    es2021: true,
  },
  rules: {
    'no-console': 0,
    'no-plusplus': 0,
  },
};
