import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { calculateStreaks } from './streak.util';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultToday(): string {
  return toDateOnly(new Date());
}

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateHabitDto) {
    const habit = await this.prisma.habit.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color ?? 'emerald',
        userId,
      },
    });
    return this.toSummary(habit, [], defaultToday());
  }

  async findAll(userId: string, today = defaultToday()) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      include: { checkIns: { orderBy: { date: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    return habits.map((habit) => this.toSummary(habit, habit.checkIns.map((c) => toDateOnly(c.date)), today));
  }

  async findOne(userId: string, id: string, today = defaultToday()) {
    const habit = await this.findOwnedHabit(userId, id);
    const checkIns = await this.prisma.checkIn.findMany({
      where: { habitId: id },
      orderBy: { date: 'asc' },
    });
    const dates = checkIns.map((c) => toDateOnly(c.date));
    return { ...this.toSummary(habit, dates, today), checkIns: dates };
  }

  async update(userId: string, id: string, dto: UpdateHabitDto) {
    await this.findOwnedHabit(userId, id);
    const habit = await this.prisma.habit.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
      },
    });
    const checkIns = await this.prisma.checkIn.findMany({ where: { habitId: id } });
    return this.toSummary(habit, checkIns.map((c) => toDateOnly(c.date)), defaultToday());
  }

  async remove(userId: string, id: string) {
    await this.findOwnedHabit(userId, id);
    await this.prisma.habit.delete({ where: { id } });
    return { success: true };
  }

  async toggleCheckIn(userId: string, habitId: string, date: string) {
    await this.findOwnedHabit(userId, habitId);

    const existing = await this.prisma.checkIn.findUnique({
      where: { habitId_date: { habitId, date: new Date(`${date}T00:00:00.000Z`) } },
    });

    if (existing) {
      await this.prisma.checkIn.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.checkIn.create({
        data: { habitId, date: new Date(`${date}T00:00:00.000Z`) },
      });
    }

    return this.findOne(userId, habitId, date);
  }

  private async findOwnedHabit(userId: string, id: string) {
    const habit = await this.prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) {
      throw new NotFoundException('Hábito no encontrado');
    }
    return habit;
  }

  private toSummary(
    habit: { id: string; name: string; description: string | null; color: string; createdAt: Date; updatedAt: Date; userId: string },
    checkInDates: string[],
    today: string,
  ) {
    const { currentStreak, longestStreak } = calculateStreaks(checkInDates, today);
    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      color: habit.color,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      userId: habit.userId,
      currentStreak,
      longestStreak,
      completedToday: checkInDates.includes(today),
      recentCheckIns: checkInDates.filter((d) => d >= shiftBack(today, 83)),
    };
  }
}

function shiftBack(dateStr: string, days: number): string {
  const timestamp = Date.parse(`${dateStr}T00:00:00.000Z`) - days * 24 * 60 * 60 * 1000;
  return new Date(timestamp).toISOString().slice(0, 10);
}
