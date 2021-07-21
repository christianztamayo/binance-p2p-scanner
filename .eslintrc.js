module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  rules: {
    'no-console': 0,
    'no-plusplus': 0,
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.[jt]s?(x)'],
      extends: ['plugin:jest/recommended'],
    },
  ],
};
