import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OnModuleInit } from '@nestjs/common';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
  ],
})

export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log(`Initialization...`);
  }
}