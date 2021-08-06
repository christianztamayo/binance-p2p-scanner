const C2C_API_ENDPOINT = 'https://c2c.binance.com/gateway-api/v2';
const P2P_API_ENDPOINT = 'https://p2p.binance.com/bapi/c2c/v1';

module.exports = {
  DEFAULT_FIAT: 'USD',
  PAYMENT: {
    TRANSFERWISE: 'Transferwise',
    PAYPAL: 'Paypal',
  },
  ASSET: {
    USDT: 'USDT',
    BUSD: 'BUSD',
  },
  TRADE_TYPE: {
    BUY: 'BUY',
    SELL: 'SELL',
  },
  ENDPOINT: {
    FIAT_LIST: `${P2P_API_ENDPOINT}/public/c2c/trade-rule/fiat-list`,
    SEARCH: `${C2C_API_ENDPOINT}/public/c2c/adv/search`,
  },
  BLACKLISTED_USERS: [
    'ADA',
    'dineroenlineayoutube',
    'equipomiguel',
    'criptoexchange',
    'MS Investments',
    'MV INVESTMENTS',
    'GLOBALCAMBIOS',
    'chanel777',
    'CR7cripto',
    'Fifacripto',
    'coiners',
    'Dala-excha',
    'Ferang',
    'anma',
    'Rapido y seguro',
    'Tu mejor opción',
    'easp',
    'valenciajdavid',
    'E5498',
    'JeffMacharty',
    'tops',
    'JuanRe-BTC',
    'sag93',
    'Business Colombia',
  ].map((s) => s.toLowerCase()),
};
