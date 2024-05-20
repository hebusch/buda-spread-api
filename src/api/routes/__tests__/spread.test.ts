import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { app } from '../../../app';
import { getBudaMarkets, getBudaOrderBook } from '../../../common/utils/budaApi';

jest.mock('../../../common/utils/budaApi', () => ({
  getBudaMarkets: jest.fn(),
  getBudaOrderBook: jest.fn(),
}));

const mockedGetBudaMarkets = getBudaMarkets as jest.Mock;
const mockedGetBudaOrderBook = getBudaOrderBook as jest.Mock;

describe('Spread Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /spread - Success', async () => {
    const mockBudaMarketsResponse = {
      markets: [
        { id: 'BTC-CLP', name: 'btc-clp' },
        { id: 'ETH-CLP', name: 'eth-clp' },
      ],
    };
    const mockOrderBookResponse = {
      order_book: {
        asks: [[10000, 1]],
        bids: [[9500, 1]],
      },
    };

    mockedGetBudaMarkets.mockResolvedValue(mockBudaMarketsResponse);
    mockedGetBudaOrderBook.mockResolvedValue(mockOrderBookResponse);

    const response = await request(app).get('/spread');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Spreads Found',
      data: {
        spreads: [
          { id: 'BTC-CLP', name: 'btc-clp', spread: 500 },
          { id: 'ETH-CLP', name: 'eth-clp', spread: 500 },
        ],
      },
    });
    expect(mockedGetBudaMarkets).toHaveBeenCalledTimes(1);
    expect(mockedGetBudaOrderBook).toHaveBeenCalledTimes(2); // Called for each market
  });

  it('GET /spread/:market - Success', async () => {
    const mockMarket = 'btc-clp';
    const mockBudaMarketsResponse = {
      markets: [{ id: 'BTC-CLP', name: 'btc-clp' }],
    };
    const mockOrderBookResponse = {
      order_book: {
        asks: [[10000, 1]],
        bids: [[9500, 1]],
      },
    };

    mockedGetBudaMarkets.mockResolvedValue(mockBudaMarketsResponse);
    mockedGetBudaOrderBook.mockResolvedValue(mockOrderBookResponse);

    const response = await request(app).get(`/spread/${mockMarket}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Spread Found',
      data: {
        spread: { id: 'BTC-CLP', name: 'btc-clp', spread: 500 },
      },
    });
    expect(mockedGetBudaMarkets).toHaveBeenCalledTimes(1);
    expect(mockedGetBudaOrderBook).toHaveBeenCalledWith(mockMarket);
  });

  it('GET /spread/:market - Market not found', async () => {
    const mockMarket = 'not-found';
    const mockBudaMarketsResponse = {
      markets: [],
    };

    mockedGetBudaMarkets.mockResolvedValue(mockBudaMarketsResponse);

    const response = await request(app).get(`/spread/${mockMarket}`);

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body).toEqual({
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Market not found',
      data: null,
    });
    expect(mockedGetBudaMarkets).toHaveBeenCalledTimes(1);
    expect(mockedGetBudaOrderBook).not.toHaveBeenCalled();
  });
});
