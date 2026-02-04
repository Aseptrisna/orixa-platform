import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { CreatePublicOrderDto, CreatePublicPaymentDto } from './dto';
import { Public } from '../../common/decorators';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('resolve/:qrToken')
  @ApiOperation({ summary: 'Resolve QR token to company/outlet/table' })
  async resolveQrToken(@Param('qrToken') qrToken: string) {
    return this.publicService.resolveQrToken(qrToken);
  }

  @Public()
  @Get('menu')
  @ApiOperation({ summary: 'Get menu for an outlet' })
  async getMenu(@Query('outletId') outletId: string) {
    return this.publicService.getMenu(outletId);
  }

  @Public()
  @Post('orders')
  @ApiOperation({ summary: 'Create a guest order' })
  async createOrder(@Body() dto: CreatePublicOrderDto) {
    return this.publicService.createOrder(dto);
  }

  @Public()
  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrder(@Param('orderId') orderId: string) {
    return this.publicService.getOrder(orderId);
  }

  @Public()
  @Get('orders/by-code/:orderCode')
  @ApiOperation({ summary: 'Get order by code (for guest tracking)' })
  async getOrderByCode(@Param('orderCode') orderCode: string) {
    return this.publicService.getOrderByCode(orderCode);
  }

  @Public()
  @Post('payments')
  @ApiOperation({ summary: 'Create a payment (PENDING status)' })
  async createPayment(@Body() dto: CreatePublicPaymentDto) {
    return this.publicService.createPayment(dto);
  }
}
