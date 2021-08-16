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
      .reduce((acc, fiat) => {
        return fiat.currencyCode === defaultFiat
          ? [defaultFiat, ...acc]
          : [...acc, fiat.currencyCode];
      }, []);
  } catch (error) {
    console.error('Failed to fetch full fiat list');
    console.error(error);
    return null;
  }
}

async function getAssetTypes(
  fiat = DEFAULT_FIAT,
  tradeType = TRADE_TYPE.BUY,
  defaultAssetType
) {
  try {
    const response = await axios.post(ENDPOINT.CONFIG, {fiat});
    const {data} = response.data;
    const {tradeSides} = data.areas.find(({area}) => area === 'P2P');
    const {assets} = tradeSides.find(({side}) => side === tradeType);
    return assets.reduce((acc, {asset}) => {
      return asset === defaultAssetType ? [asset, ...acc] : [...acc, asset];
    }, []);
  } catch (error) {
    console.error('Failed to fetch full asset list');
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
        const paymentType = {
          name: tm.tradeMethodName,
          value: tm.identifier,
        };
        return tm.identifier === defaultPaymentType
          ? [paymentType, ...acc]
          : [...acc, paymentType];
      }, []);
  } catch (error) {
    console.error('Failed to fetch full payment list');
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
    message: 'Select Fiat',
  }).run();

  const tradeType = await new Select({
    message: 'Select Trade Type',
    choices: Object.values(TRADE_TYPE),
    initial: config.tradeType,
  }).run();

  const assetTypes = await getAssetTypes(fiat, tradeType, config.assetType);
  const assetType = await new AutoComplete({
    choices: assetTypes,
    footer: colors.dim(autoCompleteTip),
    limit: autocompleteLimit,
    message: 'Select Asset Type',
  }).run();

  const paymentTypeList = await getPaymentTypes(fiat, config.paymentType);
  const paymentType = await new AutoComplete({
    choices: paymentTypeList,
    footer: colors.dim(autoCompleteTip),
    limit: autocompleteLimit,
    message: 'Select Payment Type',
  }).run();

  if (!fiat || !tradeType || !assetType || !paymentType) {
    throw new Error('Incomplete input received');
  }

  return {
    fiat,
    paymentType,
    assetType,
    tradeType,
  };
};
