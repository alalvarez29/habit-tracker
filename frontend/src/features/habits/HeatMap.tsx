import { shiftDate } from '../../lib/date';
import type { HabitColor } from '../../types/habit';
import { HABIT_COLOR_STYLES } from './colors';

interface HeatMapProps {
  checkInDates: string[];
  color: HabitColor;
  today: string;
  weeks?: number;
}

function weekdayIndex(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function HeatMap({ checkInDates, color, today, weeks = 12 }: HeatMapProps) {
  const checkedSet = new Set(checkInDates);
  const totalDays = weeks * 7;
  const firstDay = shiftDate(today, -(totalDays - 1));
  const leadingPad = weekdayIndex(firstDay);

  const days: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    days.push(shiftDate(firstDay, i));
  }

  const style = HABIT_COLOR_STYLES[color];

  return (
    <div
      className="grid grid-flow-col gap-[3px]"
      style={{ gridTemplateRows: 'repeat(7, 10px)' }}
      role="img"
      aria-label={`Historial de los últimos ${weeks * 7} días`}
    >
      {Array.from({ length: leadingPad }).map((_, i) => (
        <div key={`pad-${i}`} className="h-[10px] w-[10px]" />
      ))}
      {days.map((day) => {
        const done = checkedSet.has(day);
        return (
          <div
            key={day}
            title={day}
            className={`h-[10px] w-[10px] rounded-[2px] ${done ? style.dot : 'bg-slate-200'}`}
          />
        );
      })}
    </div>
  );
}
