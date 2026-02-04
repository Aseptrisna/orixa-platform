import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { CreateOutletDto, UpdateOutletDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Outlets')
@ApiBearerAuth()
@Controller('outlets')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.OUTLET_WRITE)
  @ApiOperation({ summary: 'Create a new outlet' })
  async create(
    @Body() dto: CreateOutletDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.outletsService.create(dto, companyId, actorUserId);
  }

  @Get()
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.OUTLET_READ)
  @ApiOperation({ summary: 'List all outlets' })
  async findAll(@CurrentUser('companyId') companyId: string) {
    return this.outletsService.findAll(companyId);
  }

  @Get(':id')
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.OUTLET_READ)
  @ApiOperation({ summary: 'Get outlet by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.outletsService.findById(id, companyId);
  }

  @Patch(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.OUTLET_WRITE)
  @ApiOperation({ summary: 'Update outlet' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOutletDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.outletsService.update(id, dto, companyId, actorUserId);
  }

  @Delete(':id')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.OUTLET_WRITE)
  @ApiOperation({ summary: 'Delete outlet' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.outletsService.delete(id, companyId, actorUserId);
  }
}
