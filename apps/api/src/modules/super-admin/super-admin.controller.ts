import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';
import { SuperAdminService } from './super-admin.service';
import { UpdateCompanyPlanDto, ToggleCompanyActiveDto } from './dto';

@ApiTags('Super Admin')
@ApiBearerAuth()
@Controller('sa')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('companies')
  @RequirePermissions(Permission.SA_COMPANIES)
  @ApiOperation({ summary: 'List all companies' })
  async listCompanies(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.superAdminService.listCompanies(+page, +limit, search);
  }

  @Get('companies/:id')
  @RequirePermissions(Permission.SA_COMPANIES)
  @ApiOperation({ summary: 'Get company details' })
  async getCompany(@Param('id') id: string) {
    return this.superAdminService.getCompany(id);
  }

  @Patch('companies/:id/plan')
  @RequirePermissions(Permission.SA_COMPANIES)
  @ApiOperation({ summary: 'Update company plan' })
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyPlanDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.superAdminService.updateCompanyPlan(id, dto.plan, userId);
  }

  @Patch('companies/:id/active')
  @RequirePermissions(Permission.SA_COMPANIES)
  @ApiOperation({ summary: 'Toggle company active status' })
  async toggleActive(
    @Param('id') id: string,
    @Body() dto: ToggleCompanyActiveDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.superAdminService.toggleCompanyActive(id, dto.isActive, userId);
  }

  @Get('audit')
  @RequirePermissions(Permission.SA_AUDIT)
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.superAdminService.getAuditLogs(+page, +limit);
  }
}
