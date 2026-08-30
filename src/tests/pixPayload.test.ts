import { describe, expect, it } from 'vitest';
import { buildPixPayload } from '../lib/pix/payload';
import { calculateCRC16 } from '../lib/pix/crc16';
import { buildTLV } from '../lib/pix/tlv';
import { normalizeAmount, normalizePixKey } from '../lib/pix/normalizers';

describe('Pix payload', () => {
  it('matches the official sample payload and CRC', () => {
    const payload = buildPixPayload({
      keyType: 'random',
      key: '123e4567-e12b-12d1-a456-426655440000',
      merchantName: 'Fulano de Tal',
      merchantCity: 'BRASILIA'
    });
    expect(payload).toBe('00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D');
  });

  it('normalizes keys and values', () => {
    expect(normalizePixKey('cpf', '123.456.789-00')).toBe('12345678900');
    expect(normalizePixKey('phone', '(61) 99999-9999')).toBe('+5561999999999');
    expect(normalizeAmount('R$ 123,45')).toBe('123.45');
  });

  it('builds TLV', () => {
    expect(buildTLV('58', 'BR')).toBe('5802BR');
  });

  it('calculates CRC16', () => {
    expect(calculateCRC16('00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304')).toBe('1D3D');
  });
});
