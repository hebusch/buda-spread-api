import { StatusCodes } from 'http-status-codes';

import { getBudaMarkets, getBudaOrderBook } from '../../../common/utils/budaApi';
import { SpreadController } from '../spread';

jest.mock('../../../common/utils/budaApi');

describe('Spread Controller', () => {
  let controller: SpreadController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SpreadController();
  });

  it('getOne - Success', async () => {
    const mockMarket = 'btc-clp';
    const mockBudaMarketsResponse = {
      markets: [
        { id: 'BTC-CLP', name: 'btc-clp' },
        { id: 'ETH-CLP', name: 'eth-clp' },
      ],
    };
    const mockBudaOrderBookResponse = {
      order_book: {
        asks: [[10000, 1]],
        bids: [[9500, 1]],
      },
    };
    (getBudaMarkets as jest.Mock).mockResolvedValue(mockBudaMarketsResponse);
    (getBudaOrderBook as jest.Mock).mockResolvedValue(mockBudaOrderBookResponse);

    const response = await controller.getSpread(mockMarket);

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.message).toBe('Spread Found');
    expect(response.data).toEqual({
      spread: {
        id: 'BTC-CLP',
        name: 'btc-clp',
        spread: 500,
      },
    });
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).toHaveBeenCalledWith(mockMarket);
  });

  it('getOne - Market not found', async () => {
    const mockMarket = 'btc-clp';
    const mockBudaMarketsResponse = {
      markets: [{ id: 'ETH-CLP', name: 'eth-clp' }],
    };
    (getBudaMarkets as jest.Mock).mockResolvedValue(mockBudaMarketsResponse);

    const response = await controller.getSpread(mockMarket);

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(response.message).toBe('Market not found');
    expect(response.data).toBeNull();
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).not.toHaveBeenCalled();
  });

  it('getOne - No asks or bids', async () => {
    const mockMarket = 'btc-clp';
    const mockBudaMarketsResponse = {
      markets: [{ id: 'BTC-CLP', name: 'btc-clp' }],
    };
    const mockBudaOrderBookResponse = {
      order_book: {
        asks: [],
        bids: [],
      },
    };
    (getBudaMarkets as jest.Mock).mockResolvedValue(mockBudaMarketsResponse);
    (getBudaOrderBook as jest.Mock).mockResolvedValue(mockBudaOrderBookResponse);

    const response = await controller.getSpread(mockMarket);

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(response.message).toBe('There are no asks or bids in the order book.');
    expect(response.data).toBeNull();
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).toHaveBeenCalledWith(mockMarket);
  });

  it('getOne - Error', async () => {
    const mockMarket = 'btc-clp';
    (getBudaMarkets as jest.Mock).mockRejectedValue(new Error('Error fetching markets'));

    const response = await controller.getSpread(mockMarket);

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.message).toBe('Error fetching spread');
    expect(response.data).toBeNull();
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).not.toHaveBeenCalled();
  });

  it('getAllSpreads - Success', async () => {
    const mockBudaMarketsResponse = {
      markets: [
        { id: 'BTC-CLP', name: 'btc-clp' },
        { id: 'ETH-CLP', name: 'eth-clp' },
      ],
    };
    const mockBudaOrderBookResponse = {
      order_book: {
        asks: [[10000, 1]],
        bids: [[9500, 1]],
      },
    };
    (getBudaMarkets as jest.Mock).mockResolvedValue(mockBudaMarketsResponse);
    (getBudaOrderBook as jest.Mock).mockResolvedValue(mockBudaOrderBookResponse);

    const response = await controller.getAllSpreads();

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.message).toBe('Spreads Found');
    expect(response.data).toEqual({
      spreads: [
        {
          id: 'BTC-CLP',
          name: 'btc-clp',
          spread: 500,
        },
        {
          id: 'ETH-CLP',
          name: 'eth-clp',
          spread: 500,
        },
      ],
    });
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).toHaveBeenCalledTimes(2);
  });

  it('getAll - Error', async () => {
    (getBudaMarkets as jest.Mock).mockRejectedValue(new Error('Error fetching markets'));

    const response = await controller.getAllSpreads();

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.message).toBe('Error fetching spreads');
    expect(response.data).toBeNull();
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).not.toHaveBeenCalled();
  });

  it('getAll - No markets', async () => {
    const mockBudaMarketsResponse = {
      markets: [],
    };
    (getBudaMarkets as jest.Mock).mockResolvedValue(mockBudaMarketsResponse);

    const response = await controller.getAllSpreads();

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.message).toBe('Spreads Found');
    expect(response.data).toEqual({ spreads: [] });
    expect(getBudaMarkets).toHaveBeenCalledTimes(1);
    expect(getBudaOrderBook).not.toHaveBeenCalled();
  });
});
