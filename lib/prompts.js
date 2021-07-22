const {Select} = require('enquirer');
const {PAYMENT, ASSET, TRADE_TYPE} = require('./constants');

module.exports = async () => {
  const paymentType = await new Select({
    message: 'Select payment type',
    choices: Object.values(PAYMENT),
    initial: PAYMENT.TRANSFERWISE,
  }).run();

  const assetType = await new Select({
    message: 'Select asset type',
    choices: Object.values(ASSET),
    initial: ASSET.USDT,
  }).run();

  const tradeType = await new Select({
    message: 'Select trade type',
    choices: Object.values(TRADE_TYPE),
    initial: TRADE_TYPE.BUY,
  }).run();

  if (!paymentType || !assetType || !tradeType) {
    throw new Error('Incomplete input received');
  }

  return {
    paymentType,
    assetType,
    tradeType,
  };
};
