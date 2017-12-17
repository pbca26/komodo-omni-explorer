# Komodo-omni-explorer

Omni explorer

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

## API
#### GET /api/explorer/search?term=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: txid or pub address

#### GET /api/kmd/interest?address=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: pub address

#### GET /api/explorer/overview

params: none required

#### GET /api/explorer/summary

params: none required

#### GET /api/mm/prices

params: none required

#### GET /api/mm/orderbook

params: none required

## UI shortcuts

#### http://ip:port/?search=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: txid or pub address

will trigger GET /api/explorer/search?term=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P on page load and render results

#### http://ip:port/?interest=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: pub address

will trigger GET /api/kmd/interest?address=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P on page load and render results

#### http://ip:port/?prices

#### http://ip:port/?books