const express = require('express');
const	bodyParser = require('body-parser');
const config = require('./config');
let shepherd = require('./routes/shepherd');
let app = express();

app.use(function(req, res, next) {
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

app.get('/', function(req, res) {
	res.send('Iquidus Omni Explorer Server');
});

app.use('/api', shepherd);

const server = require('http')
                .createServer(app)
                .listen(config.port, config.ip);

console.log(`Iquidus Omni Explorer Server is running at ${config.ip}:${config.port}`);

shepherd.getOverview();