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
import { AddonsService } from './addons.service';
import { CreateAddonDto, UpdateAddonDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Addons')
@ApiBearerAuth()
@Controller('addons')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Create a new addon' })
  async create(
    @Body() dto: CreateAddonDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.addonsService.create(dto, companyId, actorUserId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.MENU_READ)
  @ApiOperation({ summary: 'List addons by outlet' })
  async findAll(
    @Query('outletId') outletId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.addonsService.findByOutlet(outletId, companyId);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Update addon' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAddonDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.addonsService.update(id, dto, companyId, actorUserId);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.MENU_WRITE)
  @ApiOperation({ summary: 'Delete addon' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.addonsService.delete(id, companyId, actorUserId);
  }
}
