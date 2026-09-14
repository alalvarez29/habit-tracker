import { NotFoundException } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HabitsService', () => {
  let service: HabitsService;
  let prisma: {
    habit: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    checkIn: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      habit: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      checkIn: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new HabitsService(prisma as unknown as PrismaService);
  });

  it('lanza NotFoundException al operar sobre un hábito de otro usuario', async () => {
    prisma.habit.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-2', 'habit-1')).rejects.toThrow(NotFoundException);
    expect(prisma.habit.delete).not.toHaveBeenCalled();
  });

  it('crea un check-in nuevo si el día no estaba marcado', async () => {
    prisma.habit.findFirst.mockResolvedValue({ id: 'habit-1', userId: 'user-1' });
    prisma.checkIn.findUnique.mockResolvedValue(null);
    prisma.checkIn.findMany.mockResolvedValue([]);
    prisma.habit.findFirst.mockResolvedValue({
      id: 'habit-1',
      userId: 'user-1',
      name: 'Leer',
      description: null,
      color: 'emerald',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.toggleCheckIn('user-1', 'habit-1', '2026-09-14');

    expect(prisma.checkIn.create).toHaveBeenCalledWith({
      data: { habitId: 'habit-1', date: new Date('2026-09-14T00:00:00.000Z') },
    });
    expect(prisma.checkIn.delete).not.toHaveBeenCalled();
  });

  it('borra el check-in existente si el día ya estaba marcado (toggle off)', async () => {
    prisma.habit.findFirst.mockResolvedValue({
      id: 'habit-1',
      userId: 'user-1',
      name: 'Leer',
      description: null,
      color: 'emerald',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.checkIn.findUnique.mockResolvedValue({ id: 'checkin-1' });
    prisma.checkIn.findMany.mockResolvedValue([]);

    await service.toggleCheckIn('user-1', 'habit-1', '2026-09-14');

    expect(prisma.checkIn.delete).toHaveBeenCalledWith({ where: { id: 'checkin-1' } });
    expect(prisma.checkIn.create).not.toHaveBeenCalled();
  });
});
