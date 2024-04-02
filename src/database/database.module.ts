import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://Ali:904d13ba@chattingapplication.ve0jgzl.mongodb.net',
    ),
  ],
})
export class DatabaseModule {}
