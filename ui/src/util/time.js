export function secondsToString(seconds, skipMultiply, showSeconds) {
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

export function checkTimestamp(dateToCheck) {
  const currentEpochTime = new Date(Date.now()) / 1000;
  const secondsElapsed = Number(currentEpochTime) - Number(dateToCheck / 1000);

  return Math.floor(secondsElapsed);
}

export function secondsElapsedToString(timestamp) { // in seconds
  const secondsElapsed = checkTimestamp(timestamp);
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp - (hours * 3600)) / 60);
  const seconds = timestamp - (hours * 3600) - (minutes * 60);
  const returnTimeVal = (hours > 0 ? `${hours} hour(s) ` : '') +
                        (minutes > 0 ? `${minutes} minute(s) ` : '') +
                        (seconds > 0 ? `${seconds} second(s) ` : '');

  return returnTimeVal;
}