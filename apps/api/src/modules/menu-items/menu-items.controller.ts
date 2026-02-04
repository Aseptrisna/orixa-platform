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
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto, UpdateMenuItemDto, UpdateStockDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Menu Items')
@ApiBearerAuth()
@Controller('menu-items')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Create a new menu item' })
  async create(
    @Body() dto: CreateMenuItemDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.menuItemsService.create(dto, companyId, actorUserId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.MENU_READ)
  @ApiOperation({ summary: 'List menu items by outlet' })
  async findAll(
    @Query('outletId') outletId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.menuItemsService.findByOutlet(outletId, companyId);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Update menu item' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.menuItemsService.update(id, dto, companyId, actorUserId);
  }

  @Patch(':id/stock')
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Update menu item stock/availability' })
  async updateStock(
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.menuItemsService.updateStock(id, dto, companyId, actorUserId);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Delete menu item' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.menuItemsService.delete(id, companyId, actorUserId);
  }
}
