const config = require('./lib/config');
const prompts = require('./lib/prompts');
const polling = require('./lib/polling');
const splash = require('./lib/splash');

async function main() {
  // Show splash
  console.clear();
  console.log(splash);
  try {
    // Start prompt
    const appConfig = config();
    const response = await prompts(appConfig.get());
    appConfig.sync(response);

    // Start polling
    polling(response);
  } catch (error) {
    console.error(error);
  }
}

main();
