const {Select} = require('enquirer');
const {PAYMENT, ASSET, TRADE_TYPE} = require('./constants');

module.exports = async (config = {}) => {
  const paymentType = await new Select({
    message: 'Select payment type',
    choices: Object.values(PAYMENT),
    initial: config.paymentType,
  }).run();

  const assetType = await new Select({
    message: 'Select asset type',
    choices: Object.values(ASSET),
    initial: config.assetType,
  }).run();

  const tradeType = await new Select({
    message: 'Select trade type',
    choices: Object.values(TRADE_TYPE),
    initial: config.tradeType,
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
