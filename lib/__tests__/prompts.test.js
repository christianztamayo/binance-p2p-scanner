const {AutoComplete, Select} = require('enquirer');
const {TRADE_TYPE, DEFAULT_FIAT} = require('../constants');
const prompts = require('../prompts');

jest.mock('enquirer/lib/prompts/select');
jest.mock('enquirer/lib/prompts/autocomplete');

function mockPrompts({fnFiat, fnTradeType, fnAssetType, fnPaymentType} = {}) {
  AutoComplete.mockImplementationOnce(() => ({
    run: fnFiat || (() => DEFAULT_FIAT),
  }))
    .mockImplementationOnce(() => ({
      run: fnAssetType || (() => 'USDT'),
    }))
    .mockImplementationOnce(() => ({
      run: fnPaymentType || (() => 'Paypal'),
    }));

  Select.mockImplementationOnce(() => ({
    run: fnTradeType || (() => TRADE_TYPE.SELL),
  }));
}

describe('Prompts', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    AutoComplete.mockClear();
    Select.mockClear();
  });

  it('should call the Select class constructor multiple times', async () => {
    expect(AutoComplete).not.toHaveBeenCalled();
    expect(Select).not.toHaveBeenCalled();
    mockPrompts();
    await prompts();
    expect(Select).toHaveBeenCalledTimes(1);
    expect(AutoComplete).toHaveBeenCalledTimes(3);
  });

  it('should return user input in an object', async () => {
    expect(AutoComplete).not.toHaveBeenCalled();
    expect(Select).not.toHaveBeenCalled();
    mockPrompts();
    await expect(prompts()).resolves.toMatchObject({
      fiat: DEFAULT_FIAT,
      paymentType: 'Paypal',
      assetType: 'USDT',
      tradeType: TRADE_TYPE.SELL,
    });
    expect(Select).toHaveBeenCalledTimes(1);
    expect(AutoComplete).toHaveBeenCalledTimes(3);
  });

  it('should throw with incomplete input', async () => {
    // First/Any prompt to resolve with no value
    mockPrompts({fnFiat: () => null});
    await expect(prompts()).rejects.toThrow('Incomplete input');
    expect(Select).toHaveBeenCalledTimes(1);
    expect(AutoComplete).toHaveBeenCalledTimes(3);
  });

  it('enquirer prompt error should throw', async () => {
    mockPrompts({
      fnFiat: () => new Promise((resolve) => resolve('JPY')),
      fnTradeType: () =>
        new Promise((_, reject) => reject(new Error('test error'))),
    });
    await expect(prompts()).rejects.toThrow('test error');
    // First AutoComplete prompt (fiat) resolves, and second one (tradeType) rejects
    // assetType and paymentType, both AutoComplete, should be skipped
    expect(AutoComplete).toHaveBeenCalledTimes(1);
    expect(Select).toHaveBeenCalledTimes(1);
  });
});
