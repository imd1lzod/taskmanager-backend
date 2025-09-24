import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { TaskModule } from './modules/task/task.module';
import { InvitationModule } from './modules/invitation/invitation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    CategoryModule,
    TaskModule,
    InvitationModule
  ],
  controllers: [
  ],
  providers: [PrismaService],
})
export class AppModule {}
