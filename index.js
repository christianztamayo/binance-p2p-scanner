const prompts = require('./lib/prompts');
const polling = require('./lib/polling');

// Start prompt
prompts().then((response) => {
  const {paymentType, assetType, tradeType} = response;
  // Start polling
  return polling(paymentType, assetType, tradeType);
});
