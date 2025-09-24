import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: ['High', 'Medium', 'Low'] })
  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'])
  priority?: 'High' | 'Medium' | 'Low'

  @ApiPropertyOptional({ enum: ['Todo', 'InProgress', 'Done'] })
  @IsOptional()
  @IsEnum(['Todo', 'InProgress', 'Done'])
  status?: 'Todo' | 'InProgress' | 'Done'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  categoryId?: number | null

  @ApiPropertyOptional({ description: 'ISO string' })
  @IsOptional()
  @IsDateString()
  date?: string

  @ApiPropertyOptional({ description: 'ISO string' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ description: 'ISO string' })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean
}


