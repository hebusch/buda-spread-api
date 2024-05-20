import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { app } from '../../../app';
import { AlertController } from '../../controllers/alert';

jest.mock('../../controllers/alert');

describe('Alert Router', () => {
  let mockCreateAlert: jest.Mock;
  let mockUpdateAlert: jest.Mock;
  let mockDeleteAlert: jest.Mock;
  let mockGetAllAlerts: jest.Mock;
  let mockGetAlert: jest.Mock;
  let mockCheckAlert: jest.Mock;

  beforeEach(() => {
    mockCreateAlert = jest.fn();
    mockUpdateAlert = jest.fn();
    mockDeleteAlert = jest.fn();
    mockGetAllAlerts = jest.fn();
    mockGetAlert = jest.fn();
    mockCheckAlert = jest.fn();

    (AlertController as jest.Mock).mockImplementation(() => {
      return {
        createAlert: mockCreateAlert,
        updateAlert: mockUpdateAlert,
        deleteAlert: mockDeleteAlert,
        getAllAlerts: mockGetAllAlerts,
        getAlert: mockGetAlert,
        checkAlert: mockCheckAlert,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /alerts - Success', async () => {
    const mockAlert = {
      id: '1',
      marketName: 'btc-clp',
      spread: 500,
      createdAt: String(new Date()),
      updatedAt: String(new Date()),
    };

    mockCreateAlert.mockResolvedValue({
      success: true,
      message: 'Alert Created',
      data: mockAlert,
      statusCode: StatusCodes.CREATED,
    });

    const response = await request(app).post('/alerts').send({ market: 'btc-clp', spread: 500 });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alert Created');
    expect(response.body.data).toEqual(mockAlert);
  });

  it('PUT /alerts - Success', async () => {
    const mockAlert = {
      id: '1',
      marketName: 'btc-clp',
      spread: 600,
      createdAt: String(new Date()),
      updatedAt: String(new Date()),
    };

    mockUpdateAlert.mockResolvedValue({
      success: true,
      message: 'Alert Updated',
      data: mockAlert,
      statusCode: StatusCodes.OK,
    });

    const response = await request(app).put('/alerts').send({ market: 'btc-clp', spread: 600 });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alert Updated');
    expect(response.body.data).toEqual(mockAlert);
  });

  it('DELETE /alerts - Success', async () => {
    const mockAlert = {
      id: '1',
      marketName: 'btc-clp',
      spread: 500,
      createdAt: String(new Date()),
      updatedAt: String(new Date()),
    };

    mockDeleteAlert.mockResolvedValue({
      success: true,
      message: 'Alert Deleted',
      data: mockAlert,
      statusCode: StatusCodes.OK,
    });

    const response = await request(app).delete('/alerts').send({ market: 'btc-clp' });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alert Deleted');
    expect(response.body.data).toEqual(mockAlert);
  });

  it('GET /alerts - Success', async () => {
    const mockAlerts = [
      { id: '1', marketName: 'btc-clp', spread: 500, createdAt: String(new Date()), updatedAt: String(new Date()) },
    ];

    mockGetAllAlerts.mockResolvedValue({
      success: true,
      message: 'Alerts Found',
      data: { alerts: mockAlerts },
      statusCode: StatusCodes.OK,
    });

    const response = await request(app).get('/alerts');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alerts Found');
    expect(response.body.data.alerts).toEqual(mockAlerts);
  });

  it('GET /alerts/:market - Success', async () => {
    const mockAlert = {
      id: '1',
      marketName: 'btc-clp',
      spread: 500,
      createdAt: String(new Date()),
      updatedAt: String(new Date()),
    };

    mockGetAlert.mockResolvedValue({
      success: true,
      message: 'Alert Found',
      data: { alert: mockAlert },
      statusCode: StatusCodes.OK,
    });

    const response = await request(app).get('/alerts/btc-clp');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alert Found');
    expect(response.body.data.alert).toEqual(mockAlert);
  });

  it('GET /alerts/:market - Not Found', async () => {
    mockGetAlert.mockResolvedValue({
      success: false,
      message: 'No Alert Found',
      data: null,
      statusCode: StatusCodes.NOT_FOUND,
    });

    const response = await request(app).get('/alerts/non-existent-market');

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No Alert Found');
    expect(response.body.data).toBeNull();
  });

  it('GET /alerts/:market/check - Triggered', async () => {
    mockCheckAlert.mockResolvedValue({
      success: true,
      message: 'Alert Triggered. Actual Spread is Higher than Alert.',
      data: null,
      statusCode: StatusCodes.OK,
    });

    const response = await request(app).get('/alerts/btc-clp/check');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alert Triggered. Actual Spread is Higher than Alert.');
    expect(response.body.data).toBeNull();
  });

  it('GET /alerts/:market/check - Not Triggered', async () => {
    mockCheckAlert.mockResolvedValue({
      success: true,
      message: 'Alert Not Triggered. Actual Spread is Lower than Alert.',
      data: null,
      statusCode: StatusCodes.OK,
    });

    const response = await request(app).get('/alerts/btc-clp/check');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Alert Not Triggered. Actual Spread is Lower than Alert.');
    expect(response.body.data).toBeNull();
  });
});
