export type PixKeyType = 'cpf' | 'cnpj' | 'phone' | 'email' | 'random';

export function isValidCpf(value: string): boolean {
  return /^\d{11}$/.test(value);
}

export function isValidCnpj(value: string): boolean {
  return /^\d{14}$/.test(value);
}

export function isValidPhone(value: string): boolean {
  return /^\+\d{12,13}$/.test(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidRandomKey(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
}
