import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';

const MONGODB_URI =
  'mongodb://mongoadmin:secret@localhost:27888/cats?retryWrites=true&w=majority&authSource=admin';

@Module({
  imports: [MongooseModule.forRoot(MONGODB_URI), CatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
