export function getTimeSlots(start: Date, end: Date, duration: number): Date[] {
  const slots: Date[] = [];
  let current = new Date(start);
  while (current < end) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + duration * 60000);
  }
  return slots;
}
