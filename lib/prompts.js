const colors = require('ansi-colors');
const axios = require('axios');
const {AutoComplete, Select} = require('enquirer');
const {DEFAULT_FIAT, ENDPOINT, TRADE_TYPE} = require('./constants');

async function getFiatList(defaultFiat = DEFAULT_FIAT) {
  try {
    const response = await axios.post(ENDPOINT.FIAT_LIST);
    const {data} = response.data;
    return data
      .sort((a, b) => a.currencyCode.localeCompare(b.currencyCode))
      .reduce(
        (acc, fiat) => {
          if (fiat.currencyCode === defaultFiat) {
            return acc;
          }
          return acc.concat(fiat.currencyCode);
        },
        [defaultFiat]
      );
  } catch (error) {
    console.error('Failed to fetch full fiat list', error);
    console.error(error);
    return null;
  }
}

async function getAssetTypes(fiat = DEFAULT_FIAT, tradeType = TRADE_TYPE.BUY) {
  try {
    const response = await axios.post(ENDPOINT.CONFIG, {fiat});
    const {data} = response.data;
    const {tradeSides} = data.areas.find(({area}) => area === 'P2P');
    const {assets} = tradeSides.find(({side}) => side === tradeType);
    return assets.map(({asset}) => asset);
  } catch (error) {
    console.error('Failed to fetch full filter list', error);
    console.error(error);
    return null;
  }
}

async function getPaymentTypes(fiat = DEFAULT_FIAT, defaultPaymentType) {
  try {
    const response = await axios.post(ENDPOINT.FILTER, {fiat});
    const {data} = response.data;
    return data.tradeMethods
      .sort((a, b) => a.tradeMethodName.localeCompare(b.tradeMethodName))
      .reduce((acc, tm) => {
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

const autoCompleteTip =
  '(Scroll up and down to reveal more choices, or start typing for autocomplete)';

const autocompleteLimit = Math.max(process.stdout.rows - 20, 10);

module.exports = async (config = {}) => {
  const fiatList = await getFiatList(config.fiat);
  const fiat = await new AutoComplete({
    choices: fiatList,
    footer: colors.dim(autoCompleteTip),
    limit: autocompleteLimit,
    message: 'Select fiat',
  }).run();

  const tradeType = await new Select({
    message: 'Select trade type',
    choices: Object.values(TRADE_TYPE),
    initial: config.tradeType,
  }).run();

  const assetTypes = await getAssetTypes(fiat, tradeType);
  const assetType = await new Select({
    message: 'Select asset type',
    choices: assetTypes,
    initial: config.assetType,
  }).run();

  const paymentTypeList = await getPaymentTypes(fiat, config.paymentType);
  const paymentType = await new AutoComplete({
    choices: paymentTypeList,
    footer: colors.dim(autoCompleteTip),
    limit: autocompleteLimit,
    message: 'Select payment type',
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
