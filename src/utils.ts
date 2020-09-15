export function pad2(i: number) {
  return (i + 1) & ~0x01;
}
export function pad4(i: number) {
  return ((i + 4) & ~0x03);
}