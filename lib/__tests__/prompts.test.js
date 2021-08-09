const {Select} = require('enquirer');
const {TRADE_TYPE} = require('../constants');
const prompts = require('../prompts');

jest.mock('enquirer/lib/prompts/select');

const PROMPT_COUNT = 3;

function mockSelectPrompt(...args) {
  return Select.mockImplementationOnce(() => ({
    run: args[0] || (() => 'Paypal'),
  }))
    .mockImplementationOnce(() => ({
      run: args[1] || (() => 'USDT'),
    }))
    .mockImplementationOnce(() => ({
      run: args[2] || (() => 'SELL'),
    }));
}

describe('Prompts', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    Select.mockClear();
  });

  it('should call the Select class constructor multiple times', async () => {
    expect(Select).not.toHaveBeenCalled();
    mockSelectPrompt();
    await prompts();
    expect(Select).toHaveBeenCalledTimes(PROMPT_COUNT);
  });

  it('should return user input in an object', async () => {
    expect(Select).not.toHaveBeenCalled();
    mockSelectPrompt();
    await expect(prompts()).resolves.toMatchObject({
      paymentType: 'Paypal',
      assetType: 'USDT',
      tradeType: TRADE_TYPE.SELL,
    });
    expect(Select).toHaveBeenCalledTimes(PROMPT_COUNT);
  });

  it('should throw with incomplete input', async () => {
    // First/Any prompt to resolve with no value
    mockSelectPrompt(() => null);
    await expect(prompts()).rejects.toThrow('Incomplete input');
    expect(Select).toHaveBeenCalledTimes(PROMPT_COUNT);
  });

  it('enquirer prompt error should throw', async () => {
    mockSelectPrompt(
      () => new Promise((resolve) => resolve('TransferWise')),
      () => new Promise((_, reject) => reject(new Error('test error')))
    );
    await expect(prompts()).rejects.toThrow('test error');
    // First prompt resolves, and second one rejects - Select should be called twice
    expect(Select).toHaveBeenCalledTimes(2);
  });
});
