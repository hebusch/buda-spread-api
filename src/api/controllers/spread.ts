import { StatusCodes } from 'http-status-codes';
import { Controller, Get, Path, Route } from 'tsoa';

import { ResponseStatus, ServiceResponse } from '../../common/models/serviceResponse';
import { getBudaMarkets, getBudaOrderBook } from '../../common/utils/budaApi';

@Route('spread')
export class SpreadController extends Controller {
  @Get('/')
  public async getAllSpreads(): Promise<ServiceResponse<any>> {
    try {
      const budaMarkets = await getBudaMarkets();
      const markets = budaMarkets.markets;
      const spreads = [];
      for (let i = 0; i < markets.length; i++) {
        const budaOrderBook = await getBudaOrderBook(markets[i].name);
        const orderBook = budaOrderBook.order_book;
        const lowestAsk = orderBook.asks[0];
        const highestBid = orderBook.bids[0];
        if (!lowestAsk || !highestBid) {
          markets.splice(i, 1);
          i--;
          continue;
        }
        const spread = lowestAsk[0] - highestBid[0];
        spreads.push({
          id: markets[i].id,
          name: markets[i].name,
          spread,
        });
      }
      return new ServiceResponse(ResponseStatus.Success, 'Spreads Found', { spreads }, StatusCodes.OK);
    } catch (error) {
      console.log(`Error fetching spreads: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error fetching spreads',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/{market}')
  public async getSpread(@Path() market: string): Promise<ServiceResponse<any>> {
    try {
      if (!market || market == '') {
        return new ServiceResponse(ResponseStatus.Failed, 'Market not found', null, StatusCodes.NOT_FOUND);
      }
      const budaMarkets = await getBudaMarkets();
      const marketData = budaMarkets.markets.find((m: any) => m.name === market.toLowerCase());
      if (!marketData) {
        return new ServiceResponse(ResponseStatus.Failed, 'Market not found', null, StatusCodes.NOT_FOUND);
      }
      const budaOrderBook = await getBudaOrderBook(market);
      const orderBook = budaOrderBook.order_book;
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
      const response = {
        id: marketData.id,
        name: marketData.name,
        spread,
      };
      return new ServiceResponse(ResponseStatus.Success, 'Spread Found', { spread: response }, StatusCodes.OK);
    } catch (error) {
      console.log(`Error fetching spread: ${(error as Error).message}`);
      return new ServiceResponse(
        ResponseStatus.Failed,
        'Error fetching spread',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
