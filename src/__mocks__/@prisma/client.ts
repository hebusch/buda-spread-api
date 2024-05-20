const mockPrismaClient = {
  alert: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

export const PrismaClient = jest.fn(() => mockPrismaClient);
export default mockPrismaClient;
