// display rounding
export const formatValue = (formatValue) => {
  const _valueToStr = formatValue.toString();

  if (_valueToStr.indexOf('.') === -1) {
    return formatValue;
  } else {
    if (_valueToStr) {
      const _decimal = _valueToStr.substr(_valueToStr.indexOf('.') + 1, _valueToStr.length);
      let newVal = _valueToStr.substr(0, _valueToStr.indexOf('.') + 1);

      for (let i = 0; i < _decimal.length; i++) {
        if (_decimal[i] === '0') {
          newVal = newVal + _decimal[i];
        } else {
          newVal = newVal + _decimal[i];
          break;
        }
      }

      return newVal;
    }
  }
}

export const sortByDate = (data, sortKey) => { // deprecated
  return data.sort((a, b) => {
    if (a[sortKey] < b[sortKey]) {
      return -1;
    }

    if (a[sortKey] > b[sortKey]) {
      return 1;
    }

    return 0;
  });
}

// https://react-table.js.org/#/custom-sorting
export const tableSorting = (a, b) => { // ugly workaround, override default sort
  if (Date.parse(a)) { // convert date to timestamp
    a = Date.parse(a);
  }
  if (Date.parse(b)) {
    b = Date.parse(b);
  }
  // force null and undefined to the bottom
  a = (a === null || a === undefined) ? -Infinity : a;
  b = (b === null || b === undefined) ? -Infinity : b;
  // force any string values to lowercase
  a = typeof a === 'string' ? a.toLowerCase() : a;
  b = typeof b === 'string' ? b.toLowerCase() : b;
  // Return either 1 or -1 to indicate a sort priority
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
  return 0;
}

export const secondsToString = (seconds, skipMultiply, showSeconds) => {
  const a = new Date(seconds * (skipMultiply ? 1 : 1000));
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours() < 10 ? `0${a.getHours()}` : a.getHours();
  const min = a.getMinutes() < 10 ? `0${a.getMinutes()}` : a.getMinutes();
  const sec = a.getSeconds();
  const time = `${date} ${month} ${year} ${hour}:${min}${(showSeconds ? ':' + sec : '')}`;

  return time;
}

export const checkTimestamp = (dateToCheck) => {
  const currentEpochTime = new Date(Date.now()) / 1000;
  const secondsElapsed = Number(currentEpochTime) - Number(dateToCheck / 1000);

  return Math.floor(secondsElapsed);
}

export const secondsElapsedToString = (timestamp) => { // in seconds
  const secondsElapsed = checkTimestamp(timestamp);
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp - (hours * 3600)) / 60);
  const seconds = timestamp - (hours * 3600) - (minutes * 60);
  const returnTimeVal = (hours > 0 ? `${hours} hour(s) ` : '') +
                        (minutes > 0 ? `${minutes} minute(s) ` : '') +
                        (seconds > 0 ? `${seconds} second(s) ` : '');

  return returnTimeVal;
}

export const getQueryVariable = (variable) => {
  const query = window.location.search.substring(1);
  const vars = query.split('&');

  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');

    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}