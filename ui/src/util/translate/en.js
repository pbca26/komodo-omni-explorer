const LANG_EN = {
  INDEX: {
    CHECK_MULTIPLE_KMD_ADDRS: 'Check multiple KMD addresses balance here',
    YOU_MAY_ENTER_A_TXID: 'You may enter a transaction hash or an address.',
    ENTER_A_VALID_KMD_ADDR: 'Enter a valid KMD address',
    COINS: 'Coins',
    KMD_PRICE: 'KMD Price',
    UPDATE: 'Update',
    NEXT_PAGE: 'Next page',
    PREVIOUS_PAGE: 'Previous page',
    LOADING: 'Loading',
    SEARCH: 'Search',
    FILTER: 'Filter',
  },
  INTEREST: {
    AMOUNT: 'Amount',
    REWARDS: 'Rewards',
    CONFS: 'Confirmations',
    BALANCE: 'Balance',
    TOTAL: 'Total',
    LOCKTIME_IS_NOT_SET: 'Locktime field is not set!',
    REQ_TO_ACCRUE_REWARDS_P1: 'Requirements to accrue rewards',
    REQ_TO_ACCRUE_REWARDS_P2: 'spend transaction was made at least 1 hour ago, locktime field is set and UTXO amount is greater than 10 KMD',
    UTXO_LIST: 'UTXO list',
    CHECK_UTXO: 'Check UTXO',
  },
  INTEREST_CALC: {
    WEEK: 'Week',
    ONE_YEAR: '1 year',
    DAY_SM: 'day',
    DAY: 'Day',
    PERIOD: 'Period',
    AMOUNT: 'Amount',
    REWARDS: 'Rewards (accumulative)',
    TOTAL: 'Total (accumulative)',
    TOTAL_USD: 'Total, USD (accumulative)',
    APR_RATE: 'APR rate',
    EXPENSES_NOT_INCL: 'Expenses not included in calculation',
    IN_TX_FEES: 'in transaction fees',
    HOURS_SM: 'hour(s)',
    GAP_PERIOD: 'gap period when no rewards are accrued',
    YOUR_ACTUAL_AMOUNT: 'Your actual amounts will be less than what is presented in the table.',
    Q1: 'What will happen to my KMD rewards after 1 month period is passed.',
    A1: 'It will stop accruing and remain fixed until it is claimed.',
    CHANGES_TO_REWARDS: 'Changes to KMD rewards past block height',
    CHANGES_TO_REWARDS_DESC1: 'new KMD coins are rewarded to users when they make transactions',
    CHANGES_TO_REWARDS_DESC2_1: 'total rate is',
    CHANGES_TO_REWARDS_DESC2_2: '~5.1% per year',
    CHANGES_TO_REWARDS_DESC2_3: 'if done monthly or more often',
    CHANGES_TO_REWARDS_DESC3: 'you stop getting rewards if you haven\'t used Komodo network for one month (coins haven\'t moved in one month)',
    CHANGES_TO_REWARDS_DESC4: 'new changes don\'t affect rewards accrued under old rules',
    READ_FULL_ANN: 'Read full announcement',
    MODAL_REWARDS_CONSENSUS: 'Komodo’s 5% Reward Consensus Shifts from Annual to Monthly',
    MODAL_BY_DAVION: 'By: Davion Ziere',
    MODAL_MAY7: 'May 7, 2018 (GLOBAL)',
    MODAL_BREAKING_NEWS: 'Breaking news from jl777, lead developer at Komodo: "As users know, the more transactions there are on a blockchain, the more difficult it is to conduct timing analysis. Over the past year, we have measured the need for even more active movement in order to better support the KMD privacy mechanism. To implement this, the annual time limit on the growing of 5% will be changed to monthly cap of 5%/12 (0.417%). The good news is that compounding will get you rewards of 5.1% over a year. Your contribution to the privacy ecosystem will now be more closely linked to your reward. As this is a consensus rules change, it will need to activate at a future height and all existing utxos will still operate under the old rules, so this will only affect new utxo created after the activation height of 1 million."',
    MODAL_WHAT_THIS_MEANS: 'What This Means',
    MODAL_ALL_KMD_HOLDERS: 'All KMD holders need to begin actively collecting your KMD reward on a monthly basis to maximize your rewards for contributing to the activity of the KMD ecosystem. By collecting this reward monthly, users are actively contributing to the increase in privacy for everyone connected to the entire KMD protocol. As jl777 stated, there is a small bonus granted to those who collect the 0.417% reward every month in a year, resulting in a 5.1% annual reward. It is important to note that in order to gain the ability to be compounding this reward at all, users must still hold 10 or more KMD in their wallet.',
    MODAL_IN_SHORT: 'In short KMD holders (who hold 10 KMD or more in their Agama wallet) have the opportunity to actively participate in supporting Komodo\'s ecosystem, enhancing KMD\'s privacy feature and earn a reward for doing so.',
    MODAL_IN_SUMMARY: 'In summary, these are the highlights of our updated consensus-wide KMD change:',
    MODAL_THESE_CHANGES: 'These changes begin after the activation height of 1 million utxos, estimated to be 3 to 4 months from today (today is May 10th, 2018)',
    MODAL_BOOSTING_KMD_EARNING: 'Boosting KMD earning potential from 5% to 5.1% annually',
    MODAL_INCREASING_KMD_ECOSYS_ACTIVITY: 'Increasing KMD Ecosystem Activity through incentivizing monthly Reward Collection',
    MODAL_ENHANCE_PRIVACY: 'Enhanced Privacy for the entirety of the KMD ecosystem',
    SHOW_ME_REWARDS_BREAKDOWN: 'Show me rewards breakdown by',
    I_WANT_TO_CLAIM_REWARDS: 'I want to claim rewards',
    YEAR: 'Year',
    MONTHS: 'Months',
    WEEKS: 'Weeks',
    DAYS: 'Days',
    YEARLY: 'Yearly',
    MONTHLY: 'Monthly',
    WEEKLY: 'Weekly',
    DAILY: 'Daily',
    AMOUNT_SM: 'amount',
    RATE_SM: 'rate',
    AUTO_UPDATE: 'Auto update',
    RESET: 'Reset',
  },
  BALANCE_CHECK: {
    ADDRESS: 'Addess',
    AMOUNT: 'Amount',
    ALL_BALANCES_EMPTY: 'All balances are empty',
    ENTER_KMD_ADDRESS: 'Enter KMD pub addresses each address on a new line.',
  },
  BOOKS: {
    COIN: 'Coin',
    PRICE: 'Price',
    AVG_VOL: 'Avg. volume',
    AGE: 'Age',
    ASKS: 'Asks',
    BIDS: 'Bids',
  },
  COINS: {
    TOTAL_SUPPORTED_COINS: 'Total supported BarterDex coins',
    HOW_TO_GET_LISTED: 'How to get your coin listed on BarterDex',
    SPV_MODE: 'Light (SPV) mode exchange capability',
  },
  FAUCET: {
    ENTER_ADDRESS: 'Enter a @template@ address',
    IS_SENT_TO: 'is sent to',
    OPEN_IN_EXPLORER: 'Open in explorer',
    PROCESSING: 'Processing',
  },
  NAVIGATION: {
    KMD_REWARDS: 'KMD rewards',
    CHECK_REWARDS: 'Check rewards',
    REWARDS_CALC: 'Rewards Calc',
    EXPLORERS: 'Explorers',
    LIST: 'List',
    STATUS: 'Status',
    PRICES: 'Prices',
    BOOKS: 'Books',
    CHARTS: 'Charts',
    COINS: 'Coins',
    TRADES: 'Trades',
    FAUCET: 'Faucet',
    MISC: 'Extras',
    WEB_WALLET: 'Web wallet',
    TROLLBOX: 'Trollbox',
    AC_PARAMS: 'AC Params',
    TRANSACTION_DECODER: 'Tx Decoder',
  },
  OVERVIEW: {
    COIN: 'Coin',
    BLOCK: 'Block',
    TIME: 'Time',
    TOTAL: 'Total',
    LATEST_TXS: 'Latest Transactions',
    MINED: 'Mined',
  },
  PRICES: {
    PRICES: 'Prices',
    PAIR: 'Pair',
    PRICE_AVG: 'Price (avg)',
    PRICE_LOW: 'Price (low)',
    PRICE_HIGH: 'Price (high)',
    PRICE_USD: 'Price (low), USD',
  },
  SEARCH: {
    BALANCE_CONF: 'Balance confirmed',
    BALANCE_UNCONF: 'Balance unconfirmed',
    LATEST_TXS_FOR: 'Latest Transactions for',
    FOUND_TX: 'Found @template@ transaction',
    NO_TX: 'There are no transactions found for',
    ERR_SEARCHING: 'Error: search found no results for',
    SEARCHING: 'Searching',
    INVALID_PUB: '@template@ is not a valid address',
  },
  STATS: {
    PAIR: 'Pair',
    SRC_AMOUNT: 'Src. Amount',
    DEST_AMOUNT: 'Dest. Amount',
    PRICE: 'Price',
    PRICE_INV: 'Price (Inv.)',
    TIME: 'Time',
    DEST_ADDR: 'Dest. addr',
    DEST_TXID: 'Dest. fee',
    DEST_FEE_TXID: 'Dest. txid',
    TRADES_FEED: 'Trades Feed',
    DETAILED_VIEW: 'Detailed view',
  },
  SUMMARY: {
    COIN: 'Coin',
    BLOCK_COUNT: 'Block count',
    DIFFICULTY: 'Difficulty',
    SUPPLY: 'Supply',
    CONN: 'Connections',
    LINK: 'Link',
  },
  TROLLBOX: {
    TROLLBOX: 'Trollbox (KV)',
    SAY_SOMETHING: 'Say something',
    YOUR_NAME_OPTIONAL: 'Your name (optional)',
    SUCCESS: 'Success! Your post will show up soon.',
    SEND: 'Send',
    TOO_LONG: 'too long',
    CHAR_LEFT: 'char left',
    CHARS_LEFT: 'chars left',
  },
  AC_PARAMS: {
    PARAMS: 'Params',
    VERUS_INFO: 'Requires a separate daemon that\'s a fork of komodo',
    WINDOWS: 'Windows',
  },
  TRANSACTION_DECODER: {
    PROVIDE_RAW_TX: 'Provide raw transaction here',
    DECODE_TX: 'Decode transaction',
    DECODE_TX_ERROR: 'Unable to decode @template@ transaction',
    DECODED_TX: 'Decoded transaction',
    NETWORK: 'Network',
  },
};

export default LANG_EN;