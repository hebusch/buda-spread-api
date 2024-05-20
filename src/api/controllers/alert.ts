import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { Body, Controller, Delete, Get, Path, Post, Put, Route } from 'tsoa';

import { ResponseStatus, ServiceResponse } from '../../common/models/serviceResponse';
import { getBudaMarkets, getBudaOrderBook } from '../../common/utils/budaApi';
import { Alert, AlertManyResponse, AlertRequest, AlertResponse } from '../models/alerts';

const prisma = new PrismaClient();

@Route('alerts')
export class AlertController extends Controller {
  @Post('/')
  public async createAlert(@Body() request: AlertRequest): Promise<ServiceResponse<Alert | null>> {
    try {
      const { market, spread } = request;
      if (!market || !spread) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Market name or spread not given',
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const marketExists = await prisma.alert.findFirst({ where: { marketName: market } });
      if (marketExists) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Alert already exists for this market, update with PUT request on /alerts/:market',
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const budaMarkets = await getBudaMarkets();
      const marketData = budaMarkets.markets.find((m: any) => m.name === market.toLowerCase());
      if (!marketData) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Market does not exists on Buda API',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const alert = await prisma.alert.create({ data: { marketName: market, spread } });
      if (!alert) {
        return new ServiceResponse(ResponseStatus.Failed, 'Error Creating Alert', null, StatusCodes.BAD_REQUEST);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Alert Created', alert, StatusCodes.CREATED);
    } catch (error) {
      console.log(`Error creating spread alert: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error creating spread alert',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('/')
  public async updateAlert(@Body() request: AlertRequest): Promise<ServiceResponse<Alert | null>> {
    try {
      const { market, spread } = request;
      if (!market || !spread) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Market name or spread not given',
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const alertExists = await prisma.alert.findUnique({ where: { marketName: market } });
      if (!alertExists) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Alert does not exists for this market, create with POST request on /alerts',
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const alert = await prisma.alert.update({
        where: { id: alertExists.id },
        data: { spread },
      });
      if (!alert) {
        return new ServiceResponse(ResponseStatus.Failed, 'Error Updating Alert', null, StatusCodes.BAD_REQUEST);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Alert Updated', alert, StatusCodes.OK);
    } catch (error) {
      console.log(`Error updating spread alert: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error updating spread alert',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('/')
  public async deleteAlert(@Body() market: string): Promise<ServiceResponse<Alert | null>> {
    try {
      if (!market) {
        return new ServiceResponse(ResponseStatus.Failed, 'Market name not given', null, StatusCodes.BAD_REQUEST);
      }
      const alert = await prisma.alert.delete({ where: { marketName: market } });
      if (!alert) {
        return new ServiceResponse(ResponseStatus.Failed, 'Error Deleting Alert', null, StatusCodes.BAD_REQUEST);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Alert Deleted', alert, StatusCodes.OK);
    } catch (error) {
      console.log(`Error deleting spread alert: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error deleting spread alert',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/')
  public async getAllAlerts(): Promise<ServiceResponse<AlertManyResponse | null>> {
    try {
      const alerts = await prisma.alert.findMany();
      if (!alerts) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Alerts Found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Alerts Found', { alerts }, StatusCodes.OK);
    } catch (error) {
      console.log(`Error finding spread alerts: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'No Spread Alerts Found',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/:market')
  public async getAlert(@Path() market: string): Promise<ServiceResponse<AlertResponse | null>> {
    try {
      if (!market || market == '') {
        return new ServiceResponse(ResponseStatus.Failed, 'Market not found', null, StatusCodes.NOT_FOUND);
      }
      const alert = await prisma.alert.findFirst({ where: { marketName: market } });
      if (!alert) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Alert Found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'Alert Found', { alert }, StatusCodes.OK);
    } catch (error) {
      console.log(`Error finding spread alert: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'No Spread Alert Found',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/:market/check')
  public async checkAlert(@Path() market: string): Promise<ServiceResponse<any>> {
    try {
      if (!market || market == '') {
        return new ServiceResponse(ResponseStatus.Failed, 'Market not found', null, StatusCodes.NOT_FOUND);
      }
      const alert = await prisma.alert.findFirst({ where: { marketName: market } });
      if (!alert) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Alert Found', null, StatusCodes.NOT_FOUND);
      }
      const budaMarkets = await getBudaMarkets();
      const marketData = budaMarkets.markets.find((m: any) => m.name === market.toLowerCase());
      if (!marketData) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Market does not exists on Buda API',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const budaOrderBookResponse = await getBudaOrderBook(market);
      const orderBook = budaOrderBookResponse.order_book;
      const lowestAsk = orderBook.asks[0];
      const highestBid = orderBook.bids[0];
      if (!lowestAsk || !highestBid) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'There are no asks or bids in the order book.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      const spread = lowestAsk[0] - highestBid[0];
      if (spread <= alert.spread) {
        return new ServiceResponse(
          ResponseStatus.Success,
          'Alert Triggered. Actual Spread is Lower than Alert.',
          { alert, market: marketData, spread },
          StatusCodes.OK
        );
      }
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Alert Not Triggered. Actual Spread is Higher than Alert.',
        { alert, market: marketData, spread },
        StatusCodes.OK
      );
    } catch (error) {
      console.log(`Error checking spread alert: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error checking spread alert',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
