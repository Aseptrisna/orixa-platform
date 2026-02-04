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
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Tables')
@ApiBearerAuth()
@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.TABLE_WRITE)
  @ApiOperation({ summary: 'Create a new table' })
  async create(
    @Body() dto: CreateTableDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.tablesService.create(dto, companyId, actorUserId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.TABLE_READ)
  @ApiOperation({ summary: 'List tables by outlet' })
  async findAll(
    @Query('outletId') outletId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.tablesService.findByOutlet(outletId, companyId);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.TABLE_WRITE)
  @ApiOperation({ summary: 'Update table' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.tablesService.update(id, dto, companyId, actorUserId);
  }

  @Post(':id/regenerate-qr')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.TABLE_WRITE)
  @ApiOperation({ summary: 'Regenerate QR token' })
  async regenerateQr(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.tablesService.regenerateQrToken(id, companyId, actorUserId);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.TABLE_WRITE)
  @ApiOperation({ summary: 'Delete table' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.tablesService.delete(id, companyId, actorUserId);
  }
}
