import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Protected } from '../../decorators/protected.decorator';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/check-roles-guard';
import { AuthGuard } from '../../guards/check-auth-guard';
import { UserRoles } from '../../enums/roles.enum';

class CreateCategoryDto {
  name!: string;
  description!: string;
  priority!: 'High' | 'Medium' | 'Low';
}

class UpdateCategoryDto {
  name?: string;
  description?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

@ApiTags('categories')
@Controller('categories')
@UseGuards(AuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, enum: ['High', 'Medium', 'Low'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('search') search?: string,
    @Query('priority') priority?: 'High' | 'Medium' | 'Low',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.categoryService.findAll({
      search,
      priority,
      page: page ? Number(page) : undefined,
      limit: limit ? Math.min(Number(limit), 100) : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    });
  }

  @Get(':id')
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(Number(id));
  }

  @Patch(':id')
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.USER])
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(Number(id), dto);
  }

  @Delete(':id')
  @Protected(true)
  @Roles([UserRoles.ADMIN])
  remove(@Param('id') id: string) {
    return this.categoryService.remove(Number(id));
  }
}


