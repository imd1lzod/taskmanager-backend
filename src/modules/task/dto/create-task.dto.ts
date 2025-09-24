import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string

  @ApiProperty({ enum: ['High', 'Medium', 'Low'] })
  @IsEnum(['High', 'Medium', 'Low'])
  priority!: 'High' | 'Medium' | 'Low'

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


