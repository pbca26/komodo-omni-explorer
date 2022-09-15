import { ISearchTransaction } from 'src/types';

export const sortByDate = (data: any[], sortKey: string) => {
  return data.sort((b, a) => {
    if (a[sortKey] < b[sortKey]) {
      return -1;
    }

    if (a[sortKey] > b[sortKey]) {
      return 1;
    }

    return 0;
  });
}

export const sortTransactions = (transactions: ISearchTransaction[]) => {
  return transactions.sort((b, a) => {
    if (a.height < b.height) {
      return -1;
    }

    if (a.height > b.height) {
      return 1;
    }

    return 0;
  });
}