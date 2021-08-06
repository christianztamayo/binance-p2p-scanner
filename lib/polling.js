const axios = require('axios');
const notifier = require('node-notifier');
const ora = require('ora');
const {
  PAYMENT,
  TRADE_TYPE,
  ENDPOINT,
  BLACKLISTED_USERS,
} = require('./constants');

const TIMEOUT_SECONDS = 15;

const spinner = ora();

module.exports = ({fiat, paymentType, assetType, tradeType}) => {
  const body = {
    page: 1,
    rows: 10,
    payTypeList: [paymentType],
    asset: assetType,
    tradeType,
    fiat,
  };

  let prevPrice;
  let counter = 1;
  const isBuying = tradeType === TRADE_TYPE.BUY;

  const fetch = async () => {
    const refetch = () => setTimeout(fetch, TIMEOUT_SECONDS * 1000);

    const response = await axios.post(ENDPOINT.SEARCH, body);
    try {
      const json = response.data;

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
    } catch (error) {
      console.error(error.message);
    }
    refetch();
  };

  fetch();
};
