export function parseTimeBlockString(time: string): { start: string; end: string }[] {
  return time
    .split(" e ")
    .map(block => {
      const [start, end] = block.split(" - ");
      return { start, end };
    });
}

function toMinutes(time: string): number {
  if (!time) throw new Error("toMinutes recebeu um valor inválido: " + time);
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function hasConflict(
  scheduleA: { date: string; time: string },
  scheduleB: { date: string; time: string }
): boolean {
  if (scheduleA.date !== scheduleB.date) return false;

  const blocksA = parseTimeBlockString(scheduleA.time);
  const blocksB = parseTimeBlockString(scheduleB.time);

  for (const a of blocksA) {
    const aStart = toMinutes(a.start);
    const aEnd = toMinutes(a.end);

    for (const b of blocksB) {
      const bStart = toMinutes(b.start);
      const bEnd = toMinutes(b.end);

      if (aStart < bEnd && bStart < aEnd) {
        return true; // Conflito detectado
      }
    }
  }

  return false;
}


export function parseTimeSlot(day: string, time: string) {
  return { date: day, time };
}
