import { describe, expect, it } from 'vitest';
import { isIosSafari } from '../lib/pwa/install';

const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const CHROME_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1';
const SAFARI_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

describe('isIosSafari', () => {
  it('detects Safari on iPhone', () => expect(isIosSafari(SAFARI_IPHONE, 5)).toBe(true));
  it('detects iPadOS posing as a Mac', () => expect(isIosSafari(SAFARI_MAC, 5)).toBe(true));
  it('ignores desktop Safari', () => expect(isIosSafari(SAFARI_MAC, 0)).toBe(false));
  it('ignores third-party iOS browsers, whose menu differs', () => expect(isIosSafari(CHROME_IPHONE, 5)).toBe(false));
});
