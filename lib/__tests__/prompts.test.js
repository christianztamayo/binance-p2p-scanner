const {Select} = require('enquirer');
const {PAYMENT, ASSET, TRADE_TYPE} = require('../constants');
const prompts = require('../prompts');

jest.mock('enquirer/lib/prompts/select');

const PROMPT_COUNT = 3;

describe('Prompts', () => {
  beforeEach(() => {
    // Mock the Select prompt
    Select.mockImplementationOnce(() => ({
      run: () => new Promise((resolve) => resolve('Paypal')),
    }))
      .mockImplementationOnce(() => ({
        run: () => new Promise((resolve) => resolve('USDT')),
      }))
      .mockImplementationOnce(() => ({
        run: () => new Promise((resolve) => resolve('SELL')),
      }));

    // Clear all instances and calls to constructor and all methods:
    Select.mockClear();
  });

  it('should call the Select class constructor multiple times', async () => {
    await prompts();
    expect(Select).toHaveBeenCalledTimes(PROMPT_COUNT);
  });

  it('should return user input in an object', async () => {
    expect(Select).not.toHaveBeenCalled();
    await expect(prompts()).resolves.toMatchObject({
      paymentType: PAYMENT.PAYPAL,
      assetType: ASSET.USDT,
      tradeType: TRADE_TYPE.SELL,
    });
    expect(Select).toHaveBeenCalledTimes(PROMPT_COUNT);
  });
});
