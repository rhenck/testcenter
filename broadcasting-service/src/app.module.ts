import { HttpModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TestSessionController } from './test-session/test-session.controller';
import { MonitorController } from './monitor/monitor.controller';
import { WebsocketGateway } from './common/websocket.gateway';
import { TestSessionService } from './test-session/test-session.service';
import { ErrorHandler } from './common/error-handler';
import { VersionController } from './version/version.controller';
import { CommandController } from './command/command.controller';
import { TesteeController } from './testee/testee.controller';
import { TesteeService } from './testee/testee.service';
import { SystemController } from './system/system.controller';

@Module({
  controllers: [
    TestSessionController,
    MonitorController,
    VersionController,
    CommandController,
    TesteeController,
    SystemController
  ],
  providers: [
    WebsocketGateway,
    TestSessionService,
    TesteeService,
    {
      provide: APP_FILTER,
      useClass: ErrorHandler
    }
  ],
  imports: [
    HttpModule
  ]
})
export class AppModule {}
