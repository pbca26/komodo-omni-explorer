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

#### GET /api/explorer/overview

params: none required

## UI shortcuts

#### http://ip:port/?search=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P

params: txid or pub address

will trigger GET /api/explorer/search?term=RNdqHx26GWy9bk8MtmH1UiXjQcXE4RKK2P on page load and render results