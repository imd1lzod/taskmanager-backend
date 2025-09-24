import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { Protected } from '../../decorators/protected.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/check-roles-guard';
import { AuthGuard } from '../../guards/check-auth-guard';
import { UserRoles } from '../../enums/roles.enum';
import { Request } from 'express';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'Todo' | 'InProgress' | 'Done';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  create(@Req() req: Request & { id?: string }, @Body() dto: CreateTaskDto) {
    const userId = Number(req.id);
    return this.taskService.create(userId, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      allDay: dto.allDay ?? false,
    });
  }

  @Get()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['Todo', 'InProgress', 'Done'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['High', 'Medium', 'Low'] })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Req() req: Request & { id?: string },
    @Query('search') search?: string,
    @Query('status') status?: Status,
    @Query('priority') priority?: Priority,
    @Query('categoryId') categoryId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const userId = Number(req.id);
    return this.taskService.findAllForUser({
      userId,
      search,
      status,
      priority,
      categoryId: categoryId ? Number(categoryId) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Math.min(Number(limit), 100) : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    });
  }

  @Get(':id')
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  findOne(@Req() req: Request & { id?: string }, @Param('id') id: string) {
    const userId = Number(req.id);
    return this.taskService.findOne(userId, Number(id));
  }

  @Patch(':id')
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  update(@Req() req: Request & { id?: string }, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const userId = Number(req.id);
    return this.taskService.update(userId, Number(id), {
      ...dto,
      date: dto.date ? new Date(dto.date) as any : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) as any : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) as any : undefined,
      allDay: dto.allDay,
    });
  }

  @Delete(':id')
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  remove(@Req() req: Request & { id?: string }, @Param('id') id: string) {
    const userId = Number(req.id);
    return this.taskService.remove(userId, Number(id));
  }
}


