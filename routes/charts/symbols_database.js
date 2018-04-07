/*
	This file is a node.js module intended for use in different UDF datafeeds.
*/
//	This list should contain all the symbosl available through your datafeed.
//	The current version is extremely incomplete (as it's just a sample): Yahoo has much more of them.

var symbols = require('./coinList.json');

function searchResultFromDatabaseItem(item) {
	return {
		symbol: item.name,
		full_name: item.name,
		description: item.description,
		exchange: item.exchange,
		type: item.type
	};
}


exports.search = function (searchText, type, exchange, maxRecords) {
	var MAX_SEARCH_RESULTS = !!maxRecords ? maxRecords : 50;
	var results = [];
	var queryIsEmpty = !searchText || searchText.length == 0;
	searchText = searchText.toUpperCase();

	for (var i = 0; i < symbols.length; ++i) {
		var item = symbols[i];
		if (type && type.length > 0 && item.type != type) {
			continue;
		}
		if (exchange && exchange.length > 0 && item.exchange != exchange) {
			continue;
		}
		if (queryIsEmpty || item.name.indexOf(searchText) >= 0) {
			results.push(searchResultFromDatabaseItem(item));
		}
		if (results.length >= MAX_SEARCH_RESULTS) {
			break;
		}
	}
	return results;
}


exports.symbolInfo = function (symbolName) {

	var data = symbolName.split(':');
	var exchange = (data.length > 1 ? data[0] : "").toUpperCase();
	var symbol = (data.length > 1 ? data[1] : symbolName).toUpperCase();

	for (var i = 0; i < symbols.length; ++i) {
		var item = symbols[i];

		if (item.name.toUpperCase() == symbol && (exchange.length == 0 || exchange == item.exchange.toUpperCase())) {
			return item;
		}
	}

	return null;
}
