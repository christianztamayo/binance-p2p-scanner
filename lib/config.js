const Conf = require('conf');
const {PAYMENT, ASSET, TRADE_TYPE} = require('./constants');

const schema = {
  paymentType: {
    type: 'string',
    default: PAYMENT.TRANSFERWISE,
  },
  assetType: {
    type: 'string',
    default: ASSET.USDT,
  },
  tradeType: {
    type: 'string',
    default: TRADE_TYPE.BUY,
  },
};

module.exports = (config) => new Conf({schema, ...config});
