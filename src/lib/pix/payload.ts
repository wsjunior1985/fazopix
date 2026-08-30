import { calculateCRC16 } from './crc16';
import { buildTLV } from './tlv';
import { normalizeMerchantCity, normalizeMerchantName, normalizePixKey, normalizeTxid } from './normalizers';
import { PixKeyType, isValidCpf, isValidCnpj, isValidEmail, isValidPhone, isValidRandomKey } from './validators';

type BuildPixPayloadInput = {
  keyType: PixKeyType;
  key: string;
  merchantName: string;
  merchantCity: string;
  amount?: string;
  description?: string;
  txid?: string;
};

function buildMerchantAccountInformation(key: string, description?: string) {
  const parts = [
    buildTLV('00', 'br.gov.bcb.pix'),
    buildTLV('01', key)
  ];
  if (description?.trim()) parts.push(buildTLV('02', description.trim()));
  return buildTLV('26', parts.join(''));
}

export function buildPixPayload(input: BuildPixPayloadInput): string {
  const normalizedKey = normalizePixKey(input.keyType, input.key);
  const merchantName = normalizeMerchantName(input.merchantName);
  const merchantCity = normalizeMerchantCity(input.merchantCity);
  const txid = normalizeTxid(input.txid || '***') || '***';

  const payloadParts = [
    buildTLV('00', '01'),
    buildMerchantAccountInformation(normalizedKey, input.description),
    buildTLV('52', '0000'),
    buildTLV('53', '986')
  ];

  if (input.amount) {
    payloadParts.push(buildTLV('54', input.amount));
  }

  payloadParts.push(
    buildTLV('58', 'BR'),
    buildTLV('59', merchantName),
    buildTLV('60', merchantCity),
    buildTLV('62', buildTLV('05', txid))
  );

  const withoutCrc = `${payloadParts.join('')}6304`;
  return `${withoutCrc}${calculateCRC16(withoutCrc)}`;
}

export function validatePixKey(type: PixKeyType, value: string): boolean {
  const normalized = normalizePixKey(type, value);
  switch (type) {
    case 'cpf':
      return isValidCpf(normalized);
    case 'cnpj':
      return isValidCnpj(normalized);
    case 'phone':
      return isValidPhone(normalized);
    case 'email':
      return isValidEmail(normalized);
    case 'random':
      return isValidRandomKey(normalized);
  }
}
