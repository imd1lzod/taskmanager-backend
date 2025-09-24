import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description: string; priority: 'High' | 'Medium' | 'Low' }) {
    return this.prisma.category.create({ data });
  }

  async findAll(params: {
    search?: string
    priority?: 'High' | 'Medium' | 'Low'
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { search, priority } = params
    const page = params.page && params.page > 0 ? params.page : undefined
    const limit = params.limit && params.limit > 0 ? params.limit : undefined
    const sortBy = params.sortBy
    const sortOrder = params.sortOrder ?? 'desc'

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (priority) {
      where.priority = priority
    }

    // Build Prisma args conditionally
    const findArgs: any = { where }
    if (sortBy) findArgs.orderBy = { [sortBy]: sortOrder }
    if (page && limit) {
      findArgs.skip = (page - 1) * limit
      findArgs.take = limit
    }

    if (page && limit) {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.category.findMany(findArgs),
        this.prisma.category.count({ where }),
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
      const items = await this.prisma.category.findMany(findArgs)
      return { items, meta: undefined }
    }
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    return category;
  }

  async update(id: number, data: Partial<{ name: string; description: string; priority: 'High' | 'Medium' | 'Low' }>) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}


