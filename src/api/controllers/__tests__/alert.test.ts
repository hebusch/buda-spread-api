import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { getBudaMarkets, getBudaOrderBook } from '../../../common/utils/budaApi';
import { AlertController } from '../alert';

jest.mock('@prisma/client');
jest.mock('../../../common/utils/budaApi');

const mockPrismaClient = new PrismaClient();
const prisma = mockPrismaClient;

describe('Alert Controller', () => {
  let controller: AlertController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AlertController();
  });

  it('create - Success', async () => {
    const market = 'btc-clp';
    const spread = 500;
    const mockMarketData = {
      markets: [{ id: 'btc-clp', name: 'btc-clp' }],
    };
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 500, createdAt: new Date(), updatedAt: new Date() };

    (getBudaMarkets as jest.Mock).mockResolvedValue(mockMarketData);
    (prisma.alert.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.alert.create as jest.Mock).mockResolvedValue(mockAlert);

    const response = await controller.createAlert({ market, spread });

    expect(response.success).toBe(true);
    expect(response.message).toBe('Alert Created');
    expect(response.data).toEqual(mockAlert);
    expect(response.statusCode).toBe(StatusCodes.CREATED);
  });

  it('create - Market Already Exists', async () => {
    const market = 'btc-clp';
    const spread = 500;
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 500, createdAt: new Date(), updatedAt: new Date() };

    (prisma.alert.findFirst as jest.Mock).mockResolvedValue(mockAlert);

    const response = await controller.createAlert({ market, spread });

    expect(response.success).toBe(false);
    expect(response.message).toBe('Alert already exists for this market, update with PUT request on /alerts/:market');
    expect(response.data).toBeNull();
    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('update - Success', async () => {
    const market = 'btc-clp';
    const spread = 600;
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 500, createdAt: new Date(), updatedAt: new Date() };

    (prisma.alert.findUnique as jest.Mock).mockResolvedValue(mockAlert);
    (prisma.alert.update as jest.Mock).mockResolvedValue({ ...mockAlert, spread: spread });

    const response = await controller.updateAlert({ market, spread });

    expect(response.success).toBe(true);
    expect(response.message).toBe('Alert Updated');
    expect(response.data?.spread).toBe(spread);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('update - Alert Not Found', async () => {
    const market = 'btc-clp';
    const spread = 600;

    (prisma.alert.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await controller.updateAlert({ market, spread });

    expect(response.success).toBe(false);
    expect(response.message).toBe('Alert does not exists for this market, create with POST request on /alerts');
    expect(response.data).toBeNull();
    expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it('destroy - Success', async () => {
    const mockMarket = 'btc-clp';
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 500, createdAt: new Date(), updatedAt: new Date() };

    (prisma.alert.delete as jest.Mock).mockResolvedValue(mockAlert);

    const response = await controller.deleteAlert(mockMarket);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Alert Deleted');
    expect(response.data).toEqual(mockAlert);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('getAll - Success', async () => {
    const mockAlerts = [{ id: '1', marketName: 'btc-clp', spread: 500, createdAt: new Date(), updatedAt: new Date() }];

    (prisma.alert.findMany as jest.Mock).mockResolvedValue(mockAlerts);

    const response = await controller.getAllAlerts();

    expect(response.success).toBe(true);
    expect(response.message).toBe('Alerts Found');
    expect(response.data?.alerts).toEqual(mockAlerts);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('getOne - Success', async () => {
    const mockMarket = 'btc-clp';
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 500, createdAt: new Date(), updatedAt: new Date() };

    (prisma.alert.findFirst as jest.Mock).mockResolvedValue(mockAlert);

    const response = await controller.getAlert(mockMarket);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Alert Found');
    expect(response.data?.alert).toEqual(mockAlert);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('getOne - Alert Not Found', async () => {
    const mockMarket = 'btc-clp';

    (prisma.alert.findFirst as jest.Mock).mockResolvedValue(null);

    const response = await controller.getAlert(mockMarket);

    expect(response.success).toBe(false);
    expect(response.message).toBe('No Alert Found');
    expect(response.data).toBeNull();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('checkAlert - Alert Triggered', async () => {
    const mockMarket = 'btc-clp';
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 300, createdAt: new Date(), updatedAt: new Date() };

    (getBudaMarkets as jest.Mock).mockResolvedValue({ markets: [{ id: 'BTC-CLP', name: 'btc-clp' }] });
    (getBudaOrderBook as jest.Mock).mockResolvedValue({
      order_book: { asks: [[1000, 1]], bids: [[900, 1]] },
    });
    (prisma.alert.findFirst as jest.Mock).mockResolvedValue(mockAlert);

    const response = await controller.checkAlert(mockMarket);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Alert Triggered. Actual Spread is Lower than Alert.');
    expect(response.data).toEqual({
      alert: mockAlert,
      market: { id: 'BTC-CLP', name: 'btc-clp' },
      spread: 100,
    });
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('checkAlert - Alert Not Triggered', async () => {
    const mockMarket = 'btc-clp';
    const mockAlert = { id: '1', marketName: 'btc-clp', spread: 300, createdAt: new Date(), updatedAt: new Date() };

    (getBudaMarkets as jest.Mock).mockResolvedValue({ markets: [{ id: 'BTC-CLP', name: 'btc-clp' }] });
    (getBudaOrderBook as jest.Mock).mockResolvedValue({
      order_book: { asks: [[1000, 1]], bids: [[500, 1]] },
    });
    (prisma.alert.findFirst as jest.Mock).mockResolvedValue(mockAlert);

    const response = await controller.checkAlert(mockMarket);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Alert Not Triggered. Actual Spread is Higher than Alert.');
    expect(response.data).toEqual({
      alert: mockAlert,
      market: { id: 'BTC-CLP', name: 'btc-clp' },
      spread: 500,
    });
    expect(response.statusCode).toBe(StatusCodes.OK);
  });
});
