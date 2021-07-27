const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
//const datafeed = require('./routes/charts/datafeed');
const rateLimit = require('express-rate-limit');

let api = require('./routes/api');
let app = express();

app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 10,
  max: 10
});
app.use(limiter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.json({ limit: '5mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true,
})); // support encoded bodies

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.use(compression({
  level: 9,
  threshold: 0,
}));

// explorer, dex
app.use('/api', api);
app.use('/public', express.static(path.join(__dirname, 'public')));

if (config.modules.wallet) {
  // web wallet
  app.use('/wallet', express.static(path.join(__dirname, 'wallet')));
  app.use('/wallet.zip', express.static(path.join(__dirname, 'wallet.zip')));
}

if (config.modules.ticker) {
  // ticker
  app.get('/ticker', (req, res) => {
    res.sendFile(path.join(__dirname + '/ticker/index.html'));
  });
  app.use('/ticker', express.static(path.join(__dirname, 'ticker')));
}

if (config.modules.faucetMini) {
  // faucet
  app.get('/faucet', (req, res) => {
    res.sendFile(path.join(__dirname + '/faucet/index.html'));
  });
  app.use('/faucet', express.static(path.join(__dirname, 'faucet')));
}

let server;

if (config.https) {
  const options = {
    key: fs.readFileSync('certs/priv.pem'),
    cert: fs.readFileSync('certs/cert.pem'),
  };
  server = require('https')
            .createServer(options, app)
            .listen(config.port, config.isDev ? 'localhost' : config.ip);
} else {
  server = require('http')
            .createServer(app)
            .listen(config.port, config.isDev ? 'localhost' : config.ip);
}

console.log(`Komodo Atomic Explorer Server is running at ${config.isDev ? 'localhost' : config.ip}:${config.port}`);

api.start();