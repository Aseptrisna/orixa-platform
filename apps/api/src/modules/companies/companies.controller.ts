import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.COMPANY_READ)
  @ApiOperation({ summary: 'Get current company info' })
  async getMe(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.findById(companyId);
  }

  @Patch('me')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.COMPANY_WRITE)
  @ApiOperation({ summary: 'Update company info' })
  async update(
    @Body() dto: UpdateCompanyDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') actorUserId: string,
  ) {
    return this.companiesService.update(companyId, dto, actorUserId);
  }
}
