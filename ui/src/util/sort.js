export function sortByDate(data, sortKey) { // deprecated
  return data.sort(function(a, b) {
    if (a[sortKey] < b[sortKey]) {
      return -1;
    }

    if (a[sortKey] > b[sortKey]) {
      return 1;
    }

    return 0;
  });
}