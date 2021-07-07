const request = require('request');
const {Select} = require('enquirer');
const notifier = require('node-notifier');
const ora = require('ora');
const {
  PAYMENT,
  ASSET,
  TRADE_TYPE,
  P2P_ENDPOINT,
  BLACKLISTED_USERS,
} = require('./constants');

const TIMEOUT_SECONDS = 15;

const spinner = ora();

const promptPayment = new Select({
  message: 'Select payment type',
  choices: Object.values(PAYMENT),
  initial: PAYMENT.TRANSFERWISE,
});

const promptAsset = new Select({
  message: 'Select asset type',
  choices: Object.values(ASSET),
  initial: ASSET.USDT,
});

const promptTradeType = new Select({
  message: 'Select trade type',
  choices: Object.values(TRADE_TYPE),
  initial: TRADE_TYPE.BUY,
});

const init = (paymentType, assetType, tradeType) => {
  const options = {
    url: P2P_ENDPOINT,
    method: 'POST',
    headers: {
      'user-agent': 'Chrome/88.0.4324.150',
      'content-type': 'application/json',
    },
    body: `{"page":1,"rows":10,"payTypeList":["${paymentType}"],"asset":"${assetType}","tradeType":"${tradeType}","fiat":"USD"}`,
  };

  let prevPrice;
  let counter = 1;
  const isBuying = tradeType === TRADE_TYPE.BUY;

  const fetch = () => {
    const refetch = () => setTimeout(fetch, TIMEOUT_SECONDS * 1000);

    request(options, (_, r) => {
      if (!r) {
        return refetch();
      }

      let json = r.toJSON();
      try {
        json = JSON.parse(json.body);
      } catch (error) {
        spinner.clear();
        console.error(error.message);
      }

      if (!json.data || !json.data[0]) {
        return refetch();
      }

      let key = 0;
      while (true) {
        const merchant = json.data[key].merchant.nickName;
        const isBlacklisted = BLACKLISTED_USERS.includes(
          merchant.trim().toLowerCase()
        );

        const description = json.data[key].advDetail.remark;
        const hasBadRemark =
          // Sellers using TW may sometimes ask for a direct bank transfer to Colombia which is very risky
          // We should only support TW to TW transfers
          paymentType === PAYMENT.TRANSFERWISE &&
          description &&
          (/(colombia|cuenta)/gi.test(description) ||
            description.includes('COP'));

        if (isBlacklisted || hasBadRemark) {
          key += 1;
        } else {
          break;
        }
      }

      let newPrice = Number(json.data[key].advDetail.price);
      if (newPrice !== prevPrice) {
        const now = new Date().toLocaleTimeString();
        spinner.clear();
        console.log(
          now,
          '•',
          paymentType,
          '•',
          newPrice,
          '•',
          json.data[key].merchant.nickName
        );
      }
      spinner.start(`Fetching ${paymentType} (${assetType}) #${counter}`);
      counter++;

      // Notify if new price is low
      const buyCondition = isBuying && prevPrice > newPrice && 1.01 > newPrice;
      const sellCondition =
        !isBuying && prevPrice < newPrice && 1.09 < newPrice;

      if (prevPrice && (buyCondition || sellCondition)) {
        notifier.notify({
          title: `${paymentType}: New ${isBuying ? 'Low' : 'High'}`,
          message: newPrice,
          sound: 'Glass',
        });
      }

      prevPrice = newPrice;
      refetch();
    });
  };

  fetch();
};

/**
 * Start prompt
 */
promptPayment.run().then((paymentType) => {
  promptAsset.run().then((assetType) => {
    promptTradeType.run().then((tradeType) => {
      init(paymentType, assetType, tradeType);
    });
  });
});
