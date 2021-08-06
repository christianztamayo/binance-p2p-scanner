const Conf = require('conf');
const {DEFAULT_FIAT, PAYMENT, ASSET, TRADE_TYPE} = require('./constants');

const schema = {
  fiat: {
    type: 'string',
    default: DEFAULT_FIAT,
  },
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

module.exports = (options) => {
  const config = new Conf({schema, ...options});

  return {
    get: () => config.get(),
    sync: ({fiat, paymentType, assetType, tradeType}) => {
      const appConfig = config.get();
      const diff = {
        ...(appConfig.fiat !== fiat && {fiat}),
        ...(appConfig.paymentType !== paymentType && {paymentType}),
        ...(appConfig.assetType !== assetType && {assetType}),
        ...(appConfig.tradeType !== tradeType && {tradeType}),
      };
      if (Object.keys(diff).length) {
        config.set(diff);
      }
    },
  };
};
