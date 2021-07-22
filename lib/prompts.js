const {Select} = require('enquirer');
const {PAYMENT, ASSET, TRADE_TYPE} = require('./constants');

module.exports = async () => {
  const promptPayment = new Select({
    message: 'Select payment type',
    choices: Object.values(PAYMENT),
    initial: PAYMENT.TRANSFERWISE,
  });

  const promptAsset = new Select({
    message: 'Select asset type',
    choices: Object.values(ASSET),
    initial: ASSET.USDT,
  });

  const promptTradeType = new Select({
    message: 'Select trade type',
    choices: Object.values(TRADE_TYPE),
    initial: TRADE_TYPE.BUY,
  });

  const paymentType = await promptPayment.run();
  const assetType = await promptAsset.run();
  const tradeType = await promptTradeType.run();

  return {
    paymentType,
    assetType,
    tradeType,
  };
};
