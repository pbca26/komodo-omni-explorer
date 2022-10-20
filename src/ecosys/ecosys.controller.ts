import { Controller, Get, Param, UseInterceptors, Query } from '@nestjs/common';
import { SyncOverviewService } from './sync.overview.service';
import { SyncSummaryService } from './sync.summary.service';
import { SearchService } from './search.service';
import { KMDRewardsService } from './kmd.rewards.service';
import { MiscService } from './misc.service';
import { CoinSupplyService } from './coin.supply.service';
import { SyncPricesService } from './sync.prices.service';
import { TCoinSupply, ITransformedTransaction, ICoins } from '../types';
import { ConnectorsService } from '../blockchain/connectors.service';
import { FaucetService } from './faucet.service';
import { TrollboxService } from './trollbox.service';
import config from '../config';
import {
  ConnectorInterseptor,
  AddressInterseptor,
  GoogleCaptchaInterseptor,
  FiatTickerInterseptor,
  CoinTickerInterseptor
} from './interseptors';

@Controller('ecosys')
export class EcosysController {
  constructor(
    private readonly connectorsService: ConnectorsService,
    private readonly syncOverviewService: SyncOverviewService,
    private readonly syncSummaryService: SyncSummaryService,
    private readonly coinSupplyService: CoinSupplyService,
    private readonly searchService: SearchService,
    private readonly kmdRewardsService: KMDRewardsService,
    private readonly miscService: MiscService,
    private readonly syncPricesService: SyncPricesService,
    private readonly faucetService: FaucetService,
    private readonly trollboxService: TrollboxService,
  ) {
    connectorsService.init(config.coins);
    faucetService.init();
    trollboxService.init();
    syncPricesService.init();
    syncOverviewService.init(config.coins);
    syncSummaryService.init(config.coins);
  }

  @Get('overview')
  getOverview() {
    return this.syncOverviewService.overview;
  }

  @Get('summary')
  getSummary() {
    return this.syncSummaryService.summary;
  }

  @Get('supply')
  getSupply(): TCoinSupply {
    return this.coinSupplyService.getSupplyData();
  }

  @Get('supply/:coin')
  getCoinSupply(@Param('coin') coin: ICoins): TCoinSupply {
    return this.coinSupplyService.getSupplyData(coin);
  }

  @Get('search/balance/:address')
  @UseInterceptors(AddressInterseptor)
  getAddressBalance(@Param('address') address: string) {
    return this.searchService.getAddressBalance(config.coins, address);
  }

  @Get('search/balance/:coin/:address')
  @UseInterceptors(ConnectorInterseptor, AddressInterseptor)
  getCoinAddressBalance(@Param('coin') coin: ICoins, @Param('address') address: string) {
    return this.searchService.getAddressBalance([coin], address);
  }

  @Get('search/transactions/:address')
  @UseInterceptors(AddressInterseptor)
  getAddressTransactions(@Param('address') address: string) {
    return this.searchService.getAddressTransactions(config.coins, address);
  }

  @Get('search/transactions/:coin/:address')
  @UseInterceptors(ConnectorInterseptor, AddressInterseptor)
  getCoinAddressTransactions(@Param('coin') coin: ICoins, @Param('address') address: string) {
    return this.searchService.getAddressTransactions([coin], address);
  }

  @Get('search/transaction/:txid')
  getTransactionById(@Param('txid') txid: string) {
    return this.searchService.getTransactionById(config.coins, txid);
  }

  @Get('search/transaction/:coin/:txid')
  @UseInterceptors(ConnectorInterseptor)
  getCoinTransactionById(@Param('coin') coin: ICoins, @Param('txid') txid: string) {
    return this.searchService.getTransactionById([coin], txid);
  }

  @Get('/kmd/rewards/:address')
  @UseInterceptors(AddressInterseptor)
  getAddressKMDRewards(@Param('address') address: string) {
    return this.kmdRewardsService.getAddressKMDRewards(address);
  }

  @Get('/kmd/rewards/:address/utxo')
  @UseInterceptors(AddressInterseptor)
  getAddressKMDRewardsWithUtxos(@Param('address') address: string) {
    return this.kmdRewardsService.getAddressKMDRewards(address, true);
  }

  @Get('/unspent/:coin/:address')
  @UseInterceptors(ConnectorInterseptor, AddressInterseptor)
  getAddressUtxos(@Param('coin') coin: ICoins, @Param('address') address: string) {
    return this.miscService.getUtxos(coin, address);
  }

  @Get('/broadcast/:coin/:rawtx')
  @UseInterceptors(ConnectorInterseptor)
  broadcastTransaction(@Param('coin') coin: ICoins, @Param('rawtx') rawtx: string) {
    return this.miscService.broadcastTransaction(coin, rawtx);
  }

  @Get('/timenow')
  timeNow() {
    return this.miscService.timeNow();
  }

  @Get('/btc/fees')
  getBtcFees() {
    return this.miscService.btcFees();
  }

  @Get('/btc/fees/all')
  getBtcFeesAll() {
    return this.miscService.btcFees(true);
  }

  @Get('/eth/fees')
  getEthFees() {
    return this.miscService.ethFees();
  }

  @Get('/eth/fees/all')
  getEthFeesAll() {
    return this.miscService.ethFees(true);
  }

  @UseInterceptors(CoinTickerInterseptor)
  @Get('/prices/:coin')
  getCoinPricesUSD(@Param('coin') coin: string) {
    return this.syncPricesService.getCoinPrice(coin, 'USD');
  }

  @UseInterceptors(CoinTickerInterseptor, FiatTickerInterseptor)
  @Get('/prices/:coin/:fiat')
  getCoinPrices(@Param('coin') coin: string, @Param('fiat') fiat: string) {
    return this.syncPricesService.getCoinPrice(coin, fiat.indexOf(',') > -1 ? fiat.split(',') : fiat);
  }

  @Get('/decodetx/:rawtx')
  getDecodedTransaction(@Param('rawtx') rawtx: string): Promise<ITransformedTransaction> {
    return this.miscService.decodeTransaction(rawtx);
  }

  @Get('/faucet/:coin/split')
  @UseInterceptors(ConnectorInterseptor)
  makeFaucetSplit(@Param('coin') coin: ICoins) {
    return this.faucetService.makeFaucetSplits(coin);
  }

  @Get('/faucet/send/:coin/:address')
  @UseInterceptors(ConnectorInterseptor, AddressInterseptor/*, GoogleCaptchaInterseptor*/)
  makeFaucetSend(@Param('coin') coin: ICoins, @Param('address') address: string) {
    return this.faucetService.makeFaucetSend(coin, address);
  }

  @Get('/trollbox/send')
  //@UseInterceptors(ConnectorInterseptor, AddressInterseptor)
  makeTrollboxSend(@Query('title') title: string, @Query('message') message: string) {
    return this.trollboxService.makeTrollboxSend(message, title);
  }

  @Get('/trollbox/messages')
  getTrollboxMessages() {
    return this.trollboxService.messages[config.trollbox.coin];
  }
}