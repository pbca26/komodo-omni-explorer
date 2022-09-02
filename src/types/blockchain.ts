import { ICoins } from './coins';

export type IInsightExplorerList = Partial<{
  [key in ICoins]: {
    explorer: string,
    api: string[]
    enabled: boolean,
  }
}>;