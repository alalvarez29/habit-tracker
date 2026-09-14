import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; password: string; name?: string }) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }

    return this.prisma.user.create({ data });
  }
}
