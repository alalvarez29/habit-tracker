import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const HABIT_COLORS = ['emerald', 'sky', 'amber', 'rose', 'violet', 'slate'] as const;
export type HabitColor = (typeof HABIT_COLORS)[number];

export class CreateHabitDto {
  @ApiProperty({ example: 'Leer 20 minutos' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'Antes de dormir, sin pantallas', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiProperty({ enum: HABIT_COLORS, required: false, default: 'emerald' })
  @IsOptional()
  @IsIn(HABIT_COLORS)
  color?: HabitColor;
}
