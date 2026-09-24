/**
 * Nhãn Unit suy ra từ unitId.
 *
 * ID của Unit A2 có dạng `a2-4-travel-problems`. Mọi nhãn hiển thị (eyebrow,
 * breadcrumb, nút quay lại) đều tính từ ID này để không hard-code Unit 1.
 */

const a2UnitPattern = /^([a-z]+\d)-(\d+)-/;
const plainUnitPattern = /^unit-(\d+)$/;

export function unitNumberFromId(unitId: string): number | undefined {
  const a2Match = a2UnitPattern.exec(unitId);
  if (a2Match) return Number(a2Match[2]);
  const plainMatch = plainUnitPattern.exec(unitId);
  if (plainMatch) return Number(plainMatch[1]);
  return undefined;
}

export function levelFromUnitId(unitId: string): string {
  const a2Match = a2UnitPattern.exec(unitId);
  return a2Match ? a2Match[1].toUpperCase() : "A1";
}

export function unitEyebrow(unitId: string): string {
  const number = unitNumberFromId(unitId);
  return number ? `${levelFromUnitId(unitId)} · UNIT ${number}` : levelFromUnitId(unitId);
}

export function unitPath(unitId: string): string {
  const number = unitNumberFromId(unitId);
  if (!number) return "/curriculum";
  return unitPathByNumber(levelFromUnitId(unitId).toLowerCase(), number);
}

export function unitPathByNumber(level: string, number: number): string {
  return `/curriculum/${level.toLowerCase()}/unit-${number}`;
}

export function unitBackLabel(unitId: string): string {
  const number = unitNumberFromId(unitId);
  return number ? `Về Unit ${number}` : "Về lộ trình";
}
