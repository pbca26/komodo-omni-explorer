const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');
let shepherd = require('./routes/shepherd');
let app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.json({ limit: '1mb' })); // support json encoded bodies
app.use(bodyParser.urlencoded({
  limit: '1mb',
  extended: true,
})); // support encoded bodies

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.use('/api', shepherd);
app.use('/public', express.static(path.join(__dirname, 'public')));

const server = require('http')
                .createServer(app)
                .listen(config.port, config.ip);

console.log(`Komodo Atomic Explorer Server is running at ${config.ip}:${config.port}`);

shepherd.getOverview(true);
shepherd.getSummary(true);
shepherd.getRates();
shepherd.getMMCoins();
shepherd.updateStats();