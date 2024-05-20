import { getBudaMarkets, getBudaOrderBook } from '../budaApi';

const BUDA_API = 'https://www.buda.com/api/v2/markets';

describe('budaApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getBudaMarkets - Success', async () => {
    const mockMarketData = {
      markets: [
        {
          id: 'BTC-CLP',
          name: 'btc-clp',
          base_currency: 'BTC',
          quote_currency: 'CLP',
          minimum_order_amount: ['0.001', 'BTC'],
          taker_fee: '0.8',
          maker_fee: '0.4',
          max_orders_per_minute: 100,
          maker_discount_percentage: '0.0',
          taker_discount_percentage: '0.0',
        },
        {
          id: 'BTC-COP',
          name: 'btc-cop',
          base_currency: 'BTC',
          quote_currency: 'COP',
          minimum_order_amount: ['0.001', 'BTC'],
          taker_fee: '0.8',
          maker_fee: '0.4',
          max_orders_per_minute: 100,
          maker_discount_percentage: '0.0',
          taker_discount_percentage: '0.0',
        },
      ],
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMarketData),
      })
    ) as jest.Mock;

    const data = await getBudaMarkets();
    expect(data).toEqual(mockMarketData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BUDA_API}`);
  });

  it('getBudaMarkets - Failure', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch'))) as jest.Mock;

    const data = await getBudaMarkets();
    expect(data).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BUDA_API}`);
  });

  it('getBudaOrderBook - Success', async () => {
    const mockOrderBookData = {
      order_book: {
        asks: [[10000, 1]],
        bids: [[9500, 1]],
      },
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockOrderBookData),
      })
    ) as jest.Mock;

    const data = await getBudaOrderBook('btc-clp');
    expect(data).toEqual(mockOrderBookData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BUDA_API}/btc-clp/order_book`);
  });

  it('getBudaOrderBook - Failure', async () => {
    const data = await getBudaOrderBook('non-existent-market');
    expect(data).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${BUDA_API}/non-existent-market/order_book`);
  });
});
