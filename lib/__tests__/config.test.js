const Conf = require('conf');
const config = require('../config');

describe('Config', () => {
  it('should return a Conf instance', () => {
    expect(config()).toBeInstanceOf(Conf);
  });
});
