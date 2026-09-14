import { calculateStreaks } from './streak.util';

describe('calculateStreaks', () => {
  it('retorna ceros si no hay check-ins', () => {
    expect(calculateStreaks([], '2026-09-14')).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('cuenta una racha activa de días consecutivos que termina hoy', () => {
    const result = calculateStreaks(
      ['2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14'],
      '2026-09-14',
    );
    expect(result).toEqual({ currentStreak: 5, longestStreak: 5 });
  });

  it('sigue considerando viva la racha si hoy aún no se marcó pero ayer sí', () => {
    const result = calculateStreaks(['2026-09-12', '2026-09-13'], '2026-09-14');
    expect(result.currentStreak).toBe(2);
  });

  it('rompe la racha activa si hay un hueco de más de un día', () => {
    const result = calculateStreaks(['2026-09-10', '2026-09-11'], '2026-09-14');
    expect(result.currentStreak).toBe(0);
  });

  it('calcula longestStreak sobre todo el historial aunque la racha activa sea más corta', () => {
    const result = calculateStreaks(
      ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-13', '2026-09-14'],
      '2026-09-14',
    );
    expect(result).toEqual({ currentStreak: 2, longestStreak: 4 });
  });

  it('ignora fechas duplicadas', () => {
    const result = calculateStreaks(['2026-09-14', '2026-09-14'], '2026-09-14');
    expect(result.currentStreak).toBe(1);
  });
});
