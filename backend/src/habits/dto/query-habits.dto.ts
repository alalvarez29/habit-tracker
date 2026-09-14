import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class QueryHabitsDto {
  @ApiPropertyOptional({
    example: '2026-09-14',
    description: 'Fecha que el cliente considera "hoy" (YYYY-MM-DD). Si se omite, el servidor usa la fecha UTC actual.',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'today debe tener formato YYYY-MM-DD' })
  today?: string;
}
