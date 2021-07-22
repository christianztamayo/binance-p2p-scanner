const {PAYMENT, ASSET, TRADE_TYPE} = require('../constants');
const prompts = require('../prompts');

jest.mock('enquirer/lib/prompts/select', () => {
  return jest
    .fn()
    .mockImplementationOnce(() => ({
      run: () => new Promise((resolve) => resolve('Paypal')),
    }))
    .mockImplementationOnce(() => ({
      run: () => new Promise((resolve) => resolve('USDT')),
    }))
    .mockImplementationOnce(() => ({
      run: () => new Promise((resolve) => resolve('BUY')),
    }));
});

describe('Prompts', () => {
  it('should return user input in an object', () => {
    return expect(prompts()).resolves.toMatchObject({
      paymentType: PAYMENT.PAYPAL,
      assetType: ASSET.USDT,
      tradeType: TRADE_TYPE.BUY,
    });
  });
});
