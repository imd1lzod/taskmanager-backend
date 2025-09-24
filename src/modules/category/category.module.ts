import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/guards/check-auth-guard';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService, JwtService, AuthGuard],
})
export class CategoryModule {}


