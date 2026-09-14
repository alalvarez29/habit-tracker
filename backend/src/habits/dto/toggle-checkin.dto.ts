import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ToggleCheckInDto {
  @ApiProperty({ example: '2026-09-14', description: 'Fecha calendario en formato YYYY-MM-DD, en la zona horaria del cliente' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe tener formato YYYY-MM-DD' })
  date!: string;
}
