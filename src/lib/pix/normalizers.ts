export function normalizePixKey(type: string, value: string): string {
  const trimmed = value.trim();
  if (type === 'cpf' || type === 'cnpj') return trimmed.replace(/\D/g, '');
  if (type === 'phone') {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.startsWith('55')) return `+${digits}`;
    if (digits.length === 11 || digits.length === 10) return `+55${digits}`;
    return trimmed.startsWith('+') ? trimmed.replace(/[^\d+]/g, '') : `+55${digits}`;
  }
  if (type === 'email') return trimmed.toLowerCase();
  return trimmed;
}

export function normalizeMerchantName(value: string): string {
  return value.trim().slice(0, 25);
}

export function normalizeMerchantCity(value: string): string {
  return value.trim().toUpperCase().slice(0, 15);
}

export function normalizeTxid(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
}

export function normalizeAmount(value: string): string {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  if (!cleaned) return '';
  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return '';
  return parsed.toFixed(2);
}

export function formatMoney(value: string): string {
  const normalized = normalizeAmount(value);
  if (!normalized) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(normalized));
}
