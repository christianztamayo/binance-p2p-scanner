const axios = require('axios');
const {AutoComplete, Select} = require('enquirer');
const {
  DEFAULT_FIAT,
  ENDPOINT,
  PAYMENT,
  ASSET,
  TRADE_TYPE,
} = require('./constants');

async function getFiatList(defaultFiat = DEFAULT_FIAT) {
  try {
    const response = await axios.post(ENDPOINT.FIAT_LIST);
    const {data} = response.data;
    return data.reduce(
      (acc, c) => {
        if (c.currencyCode !== defaultFiat) {
          return acc.concat(c.currencyCode);
        }
        return acc;
      },
      [defaultFiat]
    );
  } catch (error) {
    console.error('Failed to fetch full fiat list', error);
    console.error(error);
    return null;
  }
}

module.exports = async (config = {}) => {
  let fiat;
  const fiatList = await getFiatList(config.fiat);
  if (fiatList) {
    fiat = await new AutoComplete({
      message: 'Select fiat (start typing for autocomplete)',
      limit: 10,
      initial: 0,
      choices: fiatList,
    }).run();
  }

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
    fiat,
    paymentType,
    assetType,
    tradeType,
  };
};
