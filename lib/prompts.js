const axios = require('axios');
const {AutoComplete, Select} = require('enquirer');
const {DEFAULT_FIAT, ENDPOINT, ASSET, TRADE_TYPE} = require('./constants');

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

async function getPaymentTypes(fiat = DEFAULT_FIAT, defaultPaymentType) {
  try {
    const response = await axios.post(ENDPOINT.FILTER, {fiat});
    const {data} = response.data;
    return data.tradeMethods.reduce((acc, tm) => {
      const obj = {
        name: tm.tradeMethodName,
        value: tm.identifier,
      };
      if (tm.identifier === defaultPaymentType) {
        return [obj, ...acc];
      }
      return acc.concat(obj);
    }, []);
  } catch (error) {
    console.error('Failed to fetch full filter list', error);
    console.error(error);
    return null;
  }
}

const autoCompleteTip = () =>
  '(Scroll up and down to reveal more choices, or start typing for autocomplete)';

module.exports = async (config = {}) => {
  const fiatList = await getFiatList(config.fiat);
  const fiat = await new AutoComplete({
    message: 'Select fiat',
    limit: 10,
    initial: 0,
    choices: fiatList,
    footer: autoCompleteTip,
  }).run();

  const paymentTypeList = await getPaymentTypes(fiat, config.paymentType);
  const paymentType = await new AutoComplete({
    message: 'Select payment type',
    limit: 10,
    initial: 0,
    choices: paymentTypeList,
    footer: autoCompleteTip,
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
