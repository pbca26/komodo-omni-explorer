import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectorsService } from './blockchain/connectors.service'
import { EcosysController } from './ecosys/ecosys.controller';
import { OnModuleInit } from '@nestjs/common';
import { SyncOverviewService } from './ecosys/sync.overview.service';
import { SyncSummaryService } from './ecosys/sync.summary.service';
import { CoinSupplyService } from './ecosys/coin.supply.service';
import { SearchService } from './ecosys/search.service';
import { KMDRewardsService } from './ecosys/kmd.rewards.service';
import { MiscService } from './ecosys/misc.service';
import { SyncPricesService } from './ecosys/sync.prices.service';
import { FaucetService } from './ecosys/faucet.service';
import { TrollboxService } from './ecosys/trollbox.service';
import BlockchainCore from './blockchain/core';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketManagerService } from './websocket.manager';
import { SharedService } from './ecosys/shared.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from './event.emitter.config';

@Module({
  controllers: [AppController, EcosysController],
  providers: [
    AppService,
    ConnectorsService,
    SyncOverviewService,
    SyncSummaryService,
    CoinSupplyService,
    SearchService,
    KMDRewardsService,
    MiscService,
    SyncPricesService,
    BlockchainCore,
    FaucetService,
    TrollboxService,
    WebsocketManagerService,
    WebsocketGateway,
    SharedService,
  ],
  imports: [
    EventEmitterModule.forRoot(eventEmitterConfig),
  ],
})

export class AppModule implements OnModuleInit {
  /*constructor(private connectorsModule: ConnectorsModule) {
    this.connectorsModule = new ConnectorsModule(['KMD', 'VRSC']);
  }*/

  onModuleInit() {
    console.log(`Initialization...`);
    //this.connectorsModule. (['KMD', 'VRSC']);
  }
}