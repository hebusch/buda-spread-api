const BUDA_API = 'https://www.buda.com/api/v2/markets';

export const getBudaMarkets = async () => {
  try {
    const fetchMarkets = await fetch(`${BUDA_API}`);
    const marketData = await fetchMarkets.json();
    return marketData;
  } catch (error) {
    console.log(`Error fetching markets: ${(error as Error).message}`);
    return null;
  }
};

export const getBudaOrderBook = async (market: string) => {
  try {
    const fetchOrderBook = await fetch(`${BUDA_API}/${market}/order_book`);
    const orderBookData = await fetchOrderBook.json();
    return orderBookData;
  } catch (error) {
    console.log(`Error fetching order book: ${(error as Error).message}`);
    return null;
  }
};
