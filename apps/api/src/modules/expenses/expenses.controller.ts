import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseQueryDto, ExpenseSummaryQueryDto } from './expenses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from '../../common/guards';
import { Roles, RequirePermissions } from '../../common/decorators';
import { Role, Permission } from '@orixa/shared';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post(':outletId')
  @ApiOperation({ summary: 'Create expense' })
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.EXPENSE_WRITE)
  async create(
    @Request() req: any,
    @Param('outletId') outletId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(
      req.user.companyId,
      outletId,
      req.user.sub,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with filters' })
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.EXPENSE_READ)
  @ApiQuery({ name: 'outletId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Request() req: any, @Query() query: ExpenseQueryDto) {
    return this.expensesService.findAll(req.user.companyId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get expense summary/stats' })
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.EXPENSE_READ)
  @ApiQuery({ name: 'outletId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'monthly', 'yearly'] })
  async getSummary(@Request() req: any, @Query() query: ExpenseSummaryQueryDto) {
    return this.expensesService.getSummary(req.user.companyId, query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export expenses data' })
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.EXPENSE_READ)
  @ApiQuery({ name: 'outletId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async exportExpenses(@Request() req: any, @Query() query: ExpenseQueryDto) {
    return this.expensesService.findAllForExport(req.user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.EXPENSE_READ)
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.expensesService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  @Roles(Role.COMPANY_ADMIN, Role.CASHIER)
  @RequirePermissions(Permission.EXPENSE_WRITE)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(req.user.companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  @Roles(Role.COMPANY_ADMIN)
  @RequirePermissions(Permission.EXPENSE_WRITE)
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.expensesService.remove(req.user.companyId, id);
    return { message: 'Expense deleted successfully' };
  }
}
