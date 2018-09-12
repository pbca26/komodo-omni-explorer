# Komodo-omni-explorer

Atomic explorer

## Requirements

Node >= 7.x

## Setup

Configure your IP and port in config.js

Run npm install

## How to run

npm start

## How to build UI

```
cd ui
change ui/config to desired ip and port
npm run build
```

built ui version will be copied to /public folder

## URL navigation

#### KMD rewards
http://atomicexplorer.com/#/rewards
http://atomicexplorer.com/#/rewards/RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

#### KMD rewards calc
http://atomicexplorer.com/#/rewards-calc

#### Explorers list summary
http://atomicexplorer.com/#/summary

#### Balance
http://atomicexplorer.com/#/search

http://atomicexplorer.com/#/search/RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

#### BarterDEX charts
http://atomicexplorer.com/#/charts

http://atomicexplorer.com/#/charts/KMD-BTC

#### BarterDEX prices
http://atomicexplorer.com/#/prices

http://atomicexplorer.com/#/prices/KMD-BTC

#### BarterDEX orderbooks
http://atomicexplorer.com/#/books

http://atomicexplorer.com/#/books/KMD-BTC

#### BarterDEX trades feed
http://atomicexplorer.com/#/trades

#### BarterDEX coins list
http://atomicexplorer.com/#/coins

#### Faucet
http://atomicexplorer.com/#/faucet

#### Agama Web wallet
http://atomicexplorer.com/wallet (hosted)

http://atomicexplorer.com/wallet.zip (standalone)

#### Price ticker widget
http://atomicexplorer.com/ticker

How to use ticker https://github.com/pbca26/komodo-omni-explorer/wiki/Ticker-widget

## API
#### GET /api/explorer/search?term=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: txid or pub address

#### GET /api/kmd/rewards?address=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: pub address

#### GET /api/explorer/overview

params: none required

#### GET /api/explorer/summary

params: none required

#### GET /api/explorer/supply

params (optional): coin e.g. DEX

#### GET /api/mm/prices

params (optional): currency e.g. All or USD, coin e.g. BTC

#### GET /api/mm/orderbook

params: none required

#### GET /api/mm/trades

params: none required

#### GET /api/btc/fees

BTC fees, combined result from Electrum servers and bitcoinfees.earn.com

params: none required

#### GET /api/rates/kmd

Pricing from cryptocompare.com

params (optional): currency e.g. All or USD

#### GET /api/ticker
#### GET /api/ticker?coin=DEX

params (optional): coin
