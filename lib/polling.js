const request = require('request');
const notifier = require('node-notifier');
const ora = require('ora');
const {
  PAYMENT,
  TRADE_TYPE,
  P2P_ENDPOINT,
  BLACKLISTED_USERS,
} = require('./constants');

const TIMEOUT_SECONDS = 15;

const spinner = ora();

module.exports = (paymentType, assetType, tradeType) => {
  const options = {
    url: P2P_ENDPOINT,
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      page: 1,
      rows: 10,
      payTypeList: [paymentType],
      asset: assetType,
      tradeType,
      fiat: 'USD',
    }),
  };

  let prevPrice;
  let counter = 1;
  const isBuying = tradeType === TRADE_TYPE.BUY;

  const fetch = () => {
    const refetch = () => setTimeout(fetch, TIMEOUT_SECONDS * 1000);

    request(options, (_, r) => {
      if (!r) {
        refetch();
        return;
      }

      let json = r.toJSON();
      try {
        json = JSON.parse(json.body);
      } catch (error) {
        spinner.clear();
        console.error(error.message);
      }

      if (!json.data || !json.data[0]) {
        refetch();
        return;
      }

      let key = 0;
      // eslint-disable-next-line no-constant-condition
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

      const newPrice = Number(json.data[key].advDetail.price);
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
      const buyCondition = isBuying && prevPrice > newPrice && newPrice < 1.01;
      const sellCondition =
        !isBuying && prevPrice < newPrice && newPrice < 1.09;

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