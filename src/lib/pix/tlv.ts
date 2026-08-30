export function buildTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export function parseTLV(input: string): Array<{ id: string; length: number; value: string }> {
  const entries: Array<{ id: string; length: number; value: string }> = [];
  let index = 0;
  while (index < input.length) {
    const id = input.slice(index, index + 2);
    const length = Number(input.slice(index + 2, index + 4));
    const value = input.slice(index + 4, index + 4 + length);
    entries.push({ id, length, value });
    index += 4 + length;
  }
  return entries;
}
