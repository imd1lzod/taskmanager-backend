import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/helpers/mail.service';

@Module({
  controllers: [InvitationController],
  providers: [InvitationService, PrismaService, JwtService, MailService],
})
export class InvitationModule {}


