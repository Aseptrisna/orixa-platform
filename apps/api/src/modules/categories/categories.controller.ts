import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.categoriesService.create(dto, companyId, actorUserId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.MENU_READ)
  @ApiOperation({ summary: 'List categories by outlet' })
  async findAll(
    @Query('outletId') outletId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.categoriesService.findByOutlet(outletId, companyId);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.categoriesService.update(id, dto, companyId, actorUserId);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Delete category' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.categoriesService.delete(id, companyId, actorUserId);
  }
}
