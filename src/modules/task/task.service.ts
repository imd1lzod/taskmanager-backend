import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: { title: string; description: string; priority: 'High' | 'Medium' | 'Low'; status?: 'Todo' | 'InProgress' | 'Done'; image?: string; categoryId?: number | null; date?: Date; startDate?: Date; endDate?: Date; allDay?: boolean }) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status ?? 'Todo',
        image: data.image,
        categoryId: data.categoryId ?? null,
        userId,
        date: data.date ?? undefined,
        startDate: data.startDate ?? undefined,
        endDate: data.endDate ?? undefined,
        allDay: data.allDay ?? false,
      },
    });
  }

  async findAllForUser(params: {
    userId: number
    search?: string
    status?: 'Todo' | 'InProgress' | 'Done'
    priority?: 'High' | 'Medium' | 'Low'
    categoryId?: number
    from?: Date
    to?: Date
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { userId, search, status, priority, categoryId, from, to } = params
    const page = params.page && params.page > 0 ? params.page : undefined
    const limit = params.limit && params.limit > 0 ? params.limit : undefined
    const sortBy = params.sortBy
    const sortOrder = params.sortOrder ?? 'desc'
    const where: any = { userId }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (typeof categoryId === 'number') where.categoryId = categoryId
    if (from || to) where.date = { gte: from, lte: to }

    const findArgs: any = { where, include: { category: true } }
    if (sortBy) findArgs.orderBy = { [sortBy]: sortOrder }
    if (page && limit) {
      findArgs.skip = (page - 1) * limit
      findArgs.take = limit
    }

    if (page && limit) {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.task.findMany(findArgs),
        this.prisma.task.count({ where }),
      ])
      return {
        items,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      }
    } else {
      const items = await this.prisma.task.findMany(findArgs)
      return { items, meta: undefined }
    }
  }

  async findOne(userId: number, id: number) {
    const task = await this.prisma.task.findFirst({ where: { id, userId }, include: { category: true } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: number, id: number, data: Partial<{ title: string; description: string; priority: 'High' | 'Medium' | 'Low'; status: 'Todo' | 'InProgress' | 'Done'; image?: string; categoryId?: number | null; date?: Date; startDate?: Date; endDate?: Date; allDay?: boolean }>) {
    await this.findOne(userId, id);
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.task.delete({ where: { id } });
  }
}


