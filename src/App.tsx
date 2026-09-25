import { type ReactNode, useEffect, useRef, useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  Image as ImageIcon,
  MoonStar,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Sun,
  Trash2,
  X
} from 'lucide-react';
import QRCode from 'qrcode';
import { buildPixPayload, validatePixKey } from './lib/pix/payload';
import { formatMoney, normalizeAmount } from './lib/pix/normalizers';
import { PixKeyType } from './lib/pix/validators';
import figtreeFontUrl from '@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2?url';

const schema = z.object({
  keyType: z.enum(['cpf', 'cnpj', 'phone', 'email', 'random']),
  key: z.string().min(1, 'Digite a chave Pix.'),
  merchantName: z.string().min(1, 'Digite o nome de quem recebe.').max(25, 'Use até 25 caracteres.'),
  merchantCity: z.string().min(1, 'Digite a cidade de quem recebe.').max(15, 'Use até 15 caracteres.'),
  amount: z.string().optional(),
  description: z.string().optional(),
  txid: z.string().optional(),
  remember: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

type PreviewPrefs = {
  logoScale: number;
  logoVisible: boolean;
};

type PersistedState = FormValues & {
  logoDataUrl?: string | null;
  logoFileName?: string;
};

type ThemeMode = 'light' | 'dark';

const defaultValues: FormValues = {
  keyType: 'cpf',
  key: '',
  merchantName: '',
  merchantCity: '',
  amount: '',
  description: '',
  txid: '',
  remember: false
};

const NO_FILE = 'Nenhuma imagem escolhida';

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue] as const;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useQrDataUrl(payload: string, hasLogo: boolean) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    if (!payload) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: hasLogo ? 'H' : 'M',
      margin: 1,
      width: 1024,
      color: { dark: '#0b0b0b', light: '#ffffff' }
    }).then((value) => {
      if (active) setDataUrl(value);
    });

    return () => {
      active = false;
    };
  }, [payload, hasLogo]);

  return dataUrl;
}

async function loadImage(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

async function composeQrWithLogo(qrDataUrl: string, logoDataUrl: string | null, logoScale: number) {
  const qrImage = await loadImage(qrDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = qrImage.naturalWidth || 1024;
  canvas.height = qrImage.naturalHeight || 1024;
  const context = canvas.getContext('2d');
  if (!context) {
    return qrDataUrl;
  }

  context.drawImage(qrImage, 0, 0, canvas.width, canvas.height);

  if (logoDataUrl) {
    const logoImage = await loadImage(logoDataUrl);
    const baseSize = canvas.width * 0.18 * clamp(logoScale, 0.7, 1.3);
    const size = Math.max(72, Math.round(baseSize));
    const x = Math.round((canvas.width - size) / 2);
    const y = Math.round((canvas.height - size) / 2);
    const radius = Math.round(size * 0.18);

    context.save();
    context.fillStyle = '#ffffff';
    roundRect(context, x - 12, y - 12, size + 24, size + 24, radius + 10);
    context.fill();
    context.drawImage(logoImage, x, y, size, size);
    context.restore();
  }

  return canvas.toDataURL('image/png');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-') || 'pagamento';
}

function downloadDataUrl(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
}

function Field({
  label,
  meta,
  htmlFor,
  note,
  children
}: {
  label: string;
  meta?: ReactNode;
  htmlFor?: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="field-label">
        <label htmlFor={htmlFor}>{label}</label>
        {meta ? <span className="field-meta">{meta}</span> : null}
      </div>
      {children}
      {note}
    </div>
  );
}

function ErrorNote({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="field-note field-note--error" role="alert">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

const KEY_TYPES: { id: FormValues['keyType']; label: string; placeholder: string; inputMode: 'numeric' | 'tel' | 'email' | 'text' }[] = [
  { id: 'cpf', label: 'CPF', placeholder: '000.000.000-00', inputMode: 'numeric' },
  { id: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00', inputMode: 'numeric' },
  { id: 'phone', label: 'Celular', placeholder: '(11) 99999-9999', inputMode: 'tel' },
  { id: 'email', label: 'E-mail', placeholder: 'voce@email.com', inputMode: 'email' },
  { id: 'random', label: 'Aleatória', placeholder: '123e4567-e89b-12d3-a456-426614174000', inputMode: 'text' }
];

const QUICK_AMOUNTS = [10, 20, 50, 100];

export default function App() {
  const [stored, setStored] = useStoredState<PersistedState>('fazopix.form', defaultValues);
  const [previewPrefs, setPreviewPrefs] = useStoredState<PreviewPrefs>('fazopix.preview-prefs', {
    logoScale: 1,
    logoVisible: true
  });
  const [themeMode, setThemeMode] = useStoredState<ThemeMode>('fazopix.theme', 'light');
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<'share' | null>(null);
  const [editReceiver, setEditReceiver] = useState(
    () => !(stored.remember && stored.key && stored.merchantName && stored.merchantCity)
  );
  const [canShare, setCanShare] = useState(false);
  const [stageActionsVisible, setStageActionsVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  const stageRef = useRef<HTMLElement>(null);
  const stageActionsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...stored, amount: '', description: '', txid: '' },
    mode: 'onChange'
  });

  const values = form.watch();
  const { errors } = form.formState;
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(stored.logoDataUrl ?? null);
  const [logoFileName, setLogoFileName] = useState(stored.logoFileName ?? NO_FILE);

  useEffect(() => {
    setCanShare(typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!values.remember) return;
    // "Meus dados" is the receiver only: the amount and notes belong to one sale.
    setStored({
      ...values,
      amount: '',
      description: '',
      txid: '',
      logoDataUrl,
      logoFileName
    });
  }, [logoDataUrl, logoFileName, setStored, values]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
    root.style.colorScheme = themeMode;
    // Keep the phone status bar in step with the page ground of each theme.
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeMode === 'dark' ? '#0f1113' : '#f4f5f6');
  }, [themeMode]);

  useEffect(() => {
    const target = stageActionsRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setStageActionsVisible(entry.isIntersecting), {
      threshold: 0
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const amount = normalizeAmount(values.amount ?? '');
  const keyValue = values.key ?? '';
  const validKey = validatePixKey(values.keyType as PixKeyType, keyValue);
  const name = values.merchantName.trim();
  const city = values.merchantCity.trim();
  const canGenerate = validKey && name.length > 0 && city.length > 0;
  const receiverCollapsed = !editReceiver && canGenerate;

  const missing = [
    !validKey ? 'chave' : null,
    !name ? 'nome' : null,
    !city ? 'cidade' : null
  ].filter(Boolean) as string[];

  const payload = canGenerate
    ? buildPixPayload({
        keyType: values.keyType,
        key: values.key,
        merchantName: values.merchantName,
        merchantCity: values.merchantCity,
        amount,
        description: values.description,
        txid: values.txid
      })
    : '';

  const logoScale = clamp(previewPrefs.logoScale, 0.7, 1.3);
  const showLogo = Boolean(logoDataUrl) && previewPrefs.logoVisible;
  const qrDataUrl = useQrDataUrl(payload, showLogo);
  const ready = canGenerate && Boolean(qrDataUrl);

  const activeKeyMeta = KEY_TYPES.find((k) => k.id === values.keyType) || KEY_TYPES[0];
  const keyInvalid = Boolean(errors.key) || (keyValue.length > 0 && !validKey);

  function addQuickAmount(val: number) {
    const currentNum = amount ? parseFloat(amount) : 0;
    const newTotal = (currentNum + val).toFixed(2);
    form.setValue('amount', newTotal.replace('.', ','), { shouldDirty: true, shouldValidate: true });
  }

  function clearAmount() {
    form.setValue('amount', '', { shouldDirty: true, shouldValidate: true });
  }

  function focusMissing() {
    setEditReceiver(true);
    const id = !validKey ? 'pix-key-input' : !name ? 'merchant-name-input' : 'merchant-city-input';
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(() => el?.focus({ preventScroll: true }), 300);
  }

  function goToStage() {
    stageRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  async function finalQr() {
    return await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
  }

  async function copyPayload() {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  async function shareQr() {
    if (!payload || !navigator.share) return;
    setBusy('share');
    try {
      const response = await fetch(await finalQr());
      const blob = await response.blob();
      const file = new File([blob], `pix-${slug(name)}.png`, { type: 'image/png' });
      const text = `Pix para ${name}${amount ? ` de ${formatMoney(amount)}` : ''}. Código copia e cola:\n${payload}`;
      const data: ShareData = navigator.canShare?.({ files: [file] })
        ? { title: 'Faz o PIX!', text, files: [file] }
        : { title: 'Faz o PIX!', text };
      await navigator.share(data);
    } catch {
    } finally {
      setBusy(null);
    }
  }

  async function downloadPng() {
    if (!qrDataUrl) return;
    downloadDataUrl(await finalQr(), `pix-${slug(name)}.png`);
  }

  async function downloadSvg() {
    if (!payload) return;
    const svg = await QRCode.toString(payload, {
      type: 'svg',
      errorCorrectionLevel: logoDataUrl ? 'H' : 'M',
      margin: 2,
      width: 1024
    });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `pix-${slug(name)}.svg`);
    URL.revokeObjectURL(url);
  }

  async function printCard() {
    if (!payload || !qrDataUrl) return;
    const qr = await finalQr();
    const win = window.open('', '_blank', 'width=800,height=1000');
    if (!win) return;
    win.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <title>Pix para ${escapeHtml(name)} · Faz o PIX!</title>
          <style>
            @page { margin: 14mm; }
            @font-face {
              font-family: 'Figtree Variable';
              src: url('${new URL(figtreeFontUrl, window.location.href).href}') format('woff2');
              font-weight: 100 900;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: 'Figtree Variable', 'Helvetica Neue', Arial, sans-serif;
              color: #111411;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet { max-width: 420px; margin: 0 auto; }
            .sticker { border: 1px solid #e3e5e8; border-radius: 24px; padding: 28px 28px 24px; text-align: center; }
            .head { font-weight: 800; font-size: 22px; letter-spacing: -0.02em; }
            .head b { color: #00806b; }
            .qr { margin: 18px auto 0; max-width: 300px; }
            .qr img { display: block; width: 100%; height: auto; }
            .name { margin: 14px 0 0; font-weight: 700; font-size: 18px; color: #5b6068; }
            .amount { margin: 4px 0 0; font-weight: 800; font-size: 40px; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
            .hint { margin: 8px 0 0; font-weight: 600; font-size: 14px; color: #5b6068; }
            .meta { text-align: center; font-size: 13px; font-weight: 600; color: #5b6068; margin: 14px 0 0; }
            .code { margin: 18px 0 0; padding-top: 12px; border-top: 1px solid #e3e5e8; font-size: 10px; line-height: 1.5; word-break: break-all; color: #5b6068; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="sticker">
              <div class="head">Pague com <b>Pix</b></div>
              <div class="qr"><img src="${qr}" alt="QR Code Pix" /></div>
              <p class="name">${escapeHtml(name)}</p>
              <p class="amount">${escapeHtml(amount ? formatMoney(amount) : 'Valor livre')}</p>
              <p class="hint">Escaneie no app do seu banco</p>
            </div>
            <p class="meta">${escapeHtml(city.toUpperCase())}${values.description ? ` · ${escapeHtml(values.description)}` : ''}</p>
            <p class="code">Pix copia e cola: ${escapeHtml(payload)}</p>
          </div>
          <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  function onLogoUpload(file?: File) {
    if (!file) {
      setLogoFileName(NO_FILE);
      setLogoDataUrl(null);
      return;
    }
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function clearSavedLogo() {
    setLogoFileName(NO_FILE);
    setLogoDataUrl(null);
    if (values.remember) {
      setStored({
        ...values,
        logoDataUrl: null,
        logoFileName: NO_FILE
      });
    }
  }

  const isDark = themeMode === 'dark';
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 300, damping: 28 };
  const slide = reduceMotion
    ? {}
    : {
        initial: { y: '0.4em', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-0.4em', opacity: 0 },
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }
      };

  const maskedKey = keyValue.length > 6 ? `•••${keyValue.slice(-6)}` : keyValue;

  return (
    <div className="min-h-dvh lg:mx-auto lg:grid lg:max-w-[72rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:px-10">
      <header className="flex items-center justify-between gap-3 px-5 pb-1 pt-5 lg:col-span-2 lg:px-0 lg:pt-7">
        <h1 className="brand whitespace-nowrap text-[1.35rem]">
          Faz o <span className="text-[var(--brand)]">PIX!</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-[0.85rem] font-semibold text-[var(--ink-soft)] lg:inline-flex">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Tudo gerado no seu aparelho
          </span>
          <button
            type="button"
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            className="icon-button"
            aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Cobrança: QR, valor e ações ──────────────────────────── */}
      <section
        ref={stageRef}
        className="px-4 pt-3 lg:sticky lg:top-0 lg:order-2 lg:self-start lg:px-0 lg:pt-4"
        aria-labelledby="charge-title"
      >
        <div className="charge">
          <h2 id="charge-title" className="text-[1.35rem] font-extrabold tracking-[-0.02em] lg:text-[1.7rem]">
            Cobrar com Pix
          </h2>
          <p className="mt-0.5 text-[0.92rem] text-[var(--ink-soft)]">
            {ready ? 'Mostre o QR ou envie o código.' : 'Preencha os dados e o QR aparece aqui.'}
          </p>

          <div className="mx-auto mt-4 w-full max-w-[15.5rem] lg:max-w-[18.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              {ready ? (
                <motion.div
                  key="qr"
                  className="qr-frame"
                  initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={spring}
                >
                  <div className="relative">
                    <img src={qrDataUrl} alt={`QR Code Pix para ${name}`} className="block aspect-square w-full" />
                    {showLogo ? (
                      <div
                        className="pointer-events-none absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-white p-1"
                        style={{ width: `${3 * logoScale}rem`, height: `${3 * logoScale}rem` }}
                      >
                        <img src={logoDataUrl ?? ''} alt="" className="h-full w-full rounded-md object-contain" />
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  type="button"
                  key="slot"
                  onClick={focusMissing}
                  className="qr-slot w-full"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                >
                  <QrCode className="h-8 w-8" aria-hidden="true" />
                  <span className="mt-2 block text-[0.9rem] font-semibold">Falta {missing.join(', ')}</span>
                  <span className="mt-0.5 block text-[0.8rem] font-semibold text-[var(--brand-ink)]">Preencher agora</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4">
            <label htmlFor="amount-input" className="sr-only">
              Valor em reais (opcional)
            </label>
            <div className="amount-hero">
              <span aria-hidden="true">R$</span>
              <input
                id="amount-input"
                placeholder="0,00"
                inputMode="decimal"
                autoComplete="off"
                {...form.register('amount')}
              />
              {values.amount ? (
                <button type="button" onClick={clearAmount} className="amount-clear" aria-label="Limpar valor">
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex justify-center gap-2">
              {QUICK_AMOUNTS.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => addQuickAmount(quick)}
                  className="quick-chip"
                  aria-label={`Somar ${quick} reais`}
                >
                  +{quick}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[0.9rem] font-semibold text-[var(--ink-soft)]">
            {amount ? (name ? `${name}${city ? ` · ${city}` : ''}` : 'Quem recebe?') : 'Sem valor: quem paga digita no banco'}
          </p>
          <p className="sr-only" aria-live="polite">
            {ready ? 'QR Code pronto.' : `Falta preencher: ${missing.join(', ')}.`}
          </p>

          <div ref={stageActionsRef} className="mt-5 flex flex-col gap-2">
            {ready ? (
              <>
                <button type="button" onClick={copyPayload} className="btn btn-main w-full">
                  {copied ? <Check className="h-5 w-5" strokeWidth={3} /> : <Copy className="h-5 w-5" />}
                  {copied ? 'Código copiado' : 'Copiar código Pix'}
                </button>
                {canShare ? (
                  <button type="button" onClick={shareQr} disabled={busy === 'share'} className="btn btn-soft w-full">
                    <Share2 className="h-5 w-5" />
                    {busy === 'share' ? 'Abrindo…' : 'Compartilhar'}
                  </button>
                ) : null}
                <div className="mt-1 flex items-center justify-center gap-5">
                  <button type="button" onClick={downloadPng} className="link-action">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    PNG
                  </button>
                  <button type="button" onClick={downloadSvg} className="link-action">
                    <FileCode2 className="h-4 w-4" aria-hidden="true" />
                    SVG
                  </button>
                  <button type="button" onClick={printCard} className="link-action">
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    Imprimir
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Dados da cobrança ────────────────────────────────────── */}
      <form
        className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 pb-28 pt-6 lg:order-1 lg:max-w-none lg:px-0 lg:pb-10"
        onSubmit={(event) => event.preventDefault()}
        noValidate
        aria-labelledby="form-title"
      >
        <h2 id="form-title" className="text-[1.15rem] font-extrabold tracking-[-0.01em]">
          Quem recebe
        </h2>

        <div className="card">
          {receiverCollapsed ? (
            <div className="flex items-center gap-3">
              <span className="avatar" aria-hidden="true">
                {name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{name}</p>
                <p className="truncate text-[0.85rem] text-[var(--ink-soft)]">
                  {activeKeyMeta.label} {maskedKey} · {city}
                </p>
              </div>
              <button type="button" onClick={() => setEditReceiver(true)} className="btn btn-soft btn-small">
                Editar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <p className="field-label" id="key-type-label">
                  Tipo de chave
                </p>
                <div className="segmented" role="radiogroup" aria-labelledby="key-type-label">
                  {KEY_TYPES.map((type) => {
                    const selected = values.keyType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => form.setValue('keyType', type.id, { shouldValidate: true })}
                        className="segmented-option"
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field
                label={`Chave Pix (${activeKeyMeta.label})`}
                htmlFor="pix-key-input"
                note={
                  keyInvalid ? (
                    <ErrorNote id="pix-key-error">
                      {errors.key?.message && !keyValue
                        ? errors.key.message
                        : `Isso não parece ${activeKeyMeta.id === 'email' ? 'um e-mail' : `uma chave ${activeKeyMeta.label}`}. Confira ou troque o tipo de chave.`}
                    </ErrorNote>
                  ) : validKey ? (
                    <p className="field-note field-note--ok">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      Chave válida
                    </p>
                  ) : null
                }
              >
                <input
                  id="pix-key-input"
                  className="input"
                  placeholder={activeKeyMeta.placeholder}
                  inputMode={activeKeyMeta.inputMode}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={keyInvalid}
                  aria-describedby={keyInvalid ? 'pix-key-error' : undefined}
                  {...form.register('key', {
                    validate: (value) =>
                      validatePixKey(values.keyType as PixKeyType, value ?? '') || 'Chave inválida para o tipo escolhido.'
                  })}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1.5fr_1fr] sm:gap-3">
                <Field
                  label="Nome de quem recebe"
                  meta={`${values.merchantName?.length || 0}/25`}
                  htmlFor="merchant-name-input"
                  note={errors.merchantName ? <ErrorNote id="merchant-name-error">{errors.merchantName.message}</ErrorNote> : null}
                >
                  <input
                    id="merchant-name-input"
                    className="input"
                    placeholder="Maria Silva"
                    maxLength={25}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.merchantName)}
                    aria-describedby={errors.merchantName ? 'merchant-name-error' : undefined}
                    {...form.register('merchantName')}
                  />
                </Field>
                <Field
                  label="Cidade"
                  meta={`${values.merchantCity?.length || 0}/15`}
                  htmlFor="merchant-city-input"
                  note={errors.merchantCity ? <ErrorNote id="merchant-city-error">{errors.merchantCity.message}</ErrorNote> : null}
                >
                  <input
                    id="merchant-city-input"
                    className="input uppercase"
                    placeholder="São Paulo"
                    maxLength={15}
                    autoComplete="address-level2"
                    aria-invalid={Boolean(errors.merchantCity)}
                    aria-describedby={errors.merchantCity ? 'merchant-city-error' : undefined}
                    {...form.register('merchantCity')}
                  />
                </Field>
              </div>
                <div className="flex items-start gap-3">
                  <Checkbox.Root
                    id="remember-data"
                    checked={values.remember ?? false}
                    onCheckedChange={(checked) => form.setValue('remember', checked === true, { shouldDirty: true })}
                    className="check-box mt-0.5"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor="remember-data" className="cursor-pointer select-none text-sm leading-relaxed">
                    <span className="block font-bold">Lembrar meus dados neste aparelho</span>
                    <span className="text-[var(--ink-soft)]">Ficam salvos só neste navegador, para a próxima cobrança.</span>
                  </label>
                </div>
              {canGenerate ? (
                <button type="button" onClick={() => setEditReceiver(false)} className="btn btn-soft btn-small self-start">
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Concluir
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="card !py-1">
          <button
            type="button"
            onClick={() => setShowMore((open) => !open)}
            className="disclosure-button"
            aria-expanded={showMore}
            aria-controls="more-options"
          >
            <span>
              <span className="block font-bold">Mais opções</span>
              <span className="block text-sm font-medium text-[var(--ink-faint)]">Descrição, identificador e logo no QR</span>
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {showMore ? (
              <motion.div
                id="more-options"
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-5 border-t border-[var(--rule)] pb-5 pt-4">
                  <Field label="Descrição" meta="Opcional" htmlFor="desc-input">
                    <input id="desc-input" className="input" placeholder="Almoço de domingo" {...form.register('description')} />
                  </Field>

                  <Field label="Identificador (TXID)" meta="Letras e números" htmlFor="txid-input">
                    <input
                      id="txid-input"
                      className="input uppercase"
                      placeholder="PEDIDO123"
                      autoComplete="off"
                      spellCheck={false}
                      {...form.register('txid')}
                    />
                  </Field>

                  <Field label="Logo no centro do QR" meta="PNG, JPG, WEBP ou SVG">
                    <label className="file-pick">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="sr-only"
                        onChange={(e) => onLogoUpload(e.target.files?.[0])}
                      />
                      <span className="file-pick-action">
                        <ImageIcon className="h-4 w-4" aria-hidden="true" />
                        Escolher imagem
                      </span>
                      <span className="min-w-0 truncate text-sm text-[var(--ink-soft)]">{logoFileName}</span>
                    </label>

                    {logoDataUrl ? (
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={logoDataUrl}
                            alt="Logo escolhida"
                            className="h-9 w-9 rounded-md border border-[var(--rule)] object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewPrefs((c) => ({ ...c, logoVisible: !c.logoVisible }))}
                            className="text-button"
                          >
                            {previewPrefs.logoVisible ? 'Tirar do QR' : 'Mostrar no QR'}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={clearSavedLogo}
                          className="text-button inline-flex items-center gap-1 text-[var(--error)]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Remover
                        </button>
                      </div>
                    ) : null}
                  </Field>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <p className="flex items-start gap-2.5 px-1 pt-2 text-sm lg:hidden leading-relaxed text-[var(--ink-soft)]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink)]" aria-hidden="true" />
          <span>
            <strong className="font-bold text-[var(--ink)]">Nada sai do seu aparelho.</strong> O código Pix e o QR são
            gerados aqui mesmo, sem servidor e sem cadastro.
          </span>
        </p>
      </form>

      {/* ── Dock móvel: copiar sem voltar ao topo ─────────────────── */}
      <AnimatePresence>
        {ready && !stageActionsVisible ? (
          <motion.div
            className="dock lg:hidden"
            initial={reduceMotion ? false : { y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 90, opacity: 0 }}
            transition={spring}
          >
            <button type="button" onClick={copyPayload} className="btn btn-main min-h-[3rem] flex-1">
              {copied ? <Check className="h-5 w-5" strokeWidth={3} /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copiado' : 'Copiar código'}
            </button>
            <button type="button" onClick={goToStage} className="btn btn-line min-h-[3rem]" aria-label="Ver o QR Code">
              <ArrowUp className="h-5 w-5" />
              QR
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
