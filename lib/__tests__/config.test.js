const Conf = require('conf');
const config = require('../config');

jest.mock('Conf');

describe('Config', () => {
  beforeEach(() => {
    Conf.mockClear();
  });

  it('should instantiate Conf', () => {
    expect(Conf).not.toHaveBeenCalled();
    config();
    expect(Conf).toHaveBeenCalledTimes(1);
  });

  it('should return config using get()', () => {
    Conf.mockImplementationOnce(() => ({
      get: () => ({foo: 'bar'}),
    }));

    const appConfig = config();
    expect(appConfig.get()).toMatchObject({foo: 'bar'});
  });

  it('should diff config using sync()', () => {
    // Mock the set fn for call assertion
    const set = jest.fn();
    // Mocked config
    const savedConfig = {
      paymentType: 'foo',
      assetType: 'lorem',
      tradeType: 'john',
    };
    Conf.mockImplementationOnce(() => ({
      get: () => savedConfig,
      set,
    }));

    const appConfig = config();
    appConfig.sync(savedConfig);
    expect(set).not.toHaveBeenCalled();

    appConfig.sync({
      paymentType: 'bar',
      assetType: 'ipsum',
      tradeType: 'john', // unchanged config
    });
    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith({
      paymentType: 'bar',
      assetType: 'ipsum',
    });
  });
});
