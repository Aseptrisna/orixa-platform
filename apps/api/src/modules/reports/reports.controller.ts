import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions, CurrentUser } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.REPORT_READ)
  @ApiOperation({ summary: 'Get daily report' })
  async getDailyReport(
    @Query('outletId') outletId: string,
    @Query('date') date: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    // Default to today if no date provided
    const reportDate = date || new Date().toISOString().split('T')[0];
    return this.reportsService.getDailyReport(outletId, companyId, reportDate);
  }

  @Get('range')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.REPORT_READ)
  @ApiOperation({ summary: 'Get range report' })
  async getRangeReport(
    @Query('outletId') outletId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.reportsService.getRangeReport(outletId, companyId, startDate, endDate);
  }

  @Get('financial')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.REPORT_READ)
  @ApiOperation({ summary: 'Get financial report (income vs expense)' })
  @ApiQuery({ name: 'outletId', required: false })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'monthly', 'yearly'] })
  async getFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('outletId') outletId: string,
    @Query('period') period: 'daily' | 'monthly' | 'yearly',
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.reportsService.getFinancialReport(
      companyId,
      startDate,
      endDate,
      outletId,
      period || 'daily',
    );
  }

  @Get('export')
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.REPORT_READ)
  @ApiOperation({ summary: 'Export report to Excel' })
  async exportReport(
    @Query('outletId') outletId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser('companyId') companyId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportToExcel(outletId, companyId, startDate, endDate);
    
    const filename = `report_${startDate}_to_${endDate}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
