const Conf = require('conf');
const config = require('../config');

describe('Config', () => {
  it.skip('should return a Conf instance', () => {
    expect(config()).toBeInstanceOf(Conf);
  });
});
