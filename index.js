const prompts = require('./lib/prompts');
const polling = require('./lib/polling');
const splash = require('./lib/splash');

async function main() {
  // Show splash
  await splash();
  try {
    // Start prompt
    const {paymentType, assetType, tradeType} = await prompts();
    // Start polling
    polling(paymentType, assetType, tradeType);
  } catch (error) {
    console.error(error);
  }
}

main();
