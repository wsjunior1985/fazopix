import { type ReactNode, useEffect, useRef, useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  Image as ImageIcon,
  MoonStar,
  PenLine,
  Printer,
  Share2,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2
} from 'lucide-react';
import QRCode from 'qrcode';
import { buildPixPayload, validatePixKey } from './lib/pix/payload';
import { formatMoney, normalizeAmount } from './lib/pix/normalizers';
import { PixKeyType } from './lib/pix/validators';
import { renderStory } from './lib/story';
import archivoFontUrl from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2?url';

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

// The amount is the largest thing on the stage; long values step down so they never clip.
function amountSize(length: number) {
  if (length <= 8) return 'clamp(3.1rem, 15vw, 6rem)';
  if (length <= 10) return 'clamp(2.6rem, 12vw, 5rem)';
  return 'clamp(2.1rem, 9.5vw, 4.2rem)';
}

function nameSize(length: number) {
  if (length <= 10) return 'clamp(2.1rem, 8vw, 3.3rem)';
  if (length <= 18) return 'clamp(1.8rem, 6.4vw, 2.75rem)';
  return 'clamp(1.6rem, 5.4vw, 2.35rem)';
}

export default function App() {
  const [stored, setStored] = useStoredState<PersistedState>('fazopix.form', defaultValues);
  const [previewPrefs, setPreviewPrefs] = useStoredState<PreviewPrefs>('fazopix.preview-prefs', {
    logoScale: 1,
    logoVisible: true
  });
  const [themeMode, setThemeMode] = useStoredState<ThemeMode>('fazopix.theme', 'light');
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<'story' | 'share' | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [stageActionsVisible, setStageActionsVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  const stageRef = useRef<HTMLElement>(null);
  const stageActionsRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: stored,
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
    setStored({
      ...values,
      logoDataUrl,
      logoFileName
    });
  }, [logoDataUrl, logoFileName, setStored, values]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
    root.style.colorScheme = themeMode;
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

  function goToForm() {
    drawerRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('pix-key-input')?.focus({ preventScroll: true }), 350);
  }

  function goToStage() {
    stageRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  async function finalQr() {
    return await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
  }

  async function storyImage() {
    return await renderStory({
      merchantName: name,
      amountLabel: amount ? formatMoney(amount) : null,
      city,
      qrDataUrl: await finalQr()
    });
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

  async function shareStory() {
    if (!payload || !navigator.share) return;
    setBusy('share');
    try {
      const response = await fetch(await storyImage());
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

  async function downloadStory() {
    if (!ready) return;
    setBusy('story');
    try {
      downloadDataUrl(await storyImage(), `pix-${slug(name)}-story.png`);
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
              font-family: 'Archivo Variable';
              src: url('${new URL(archivoFontUrl, window.location.href).href}') format('woff2');
              font-weight: 100 900;
              font-stretch: 62% 125%;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: 'Archivo Variable', 'Helvetica Neue', Arial, sans-serif;
              color: #0b0b0b;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet { max-width: 520px; margin: 0 auto; }
            .band {
              background: #6b2bff;
              color: #fff;
              border-radius: 28px;
              padding: 28px 28px 32px;
            }
            .mark { font-weight: 850; font-stretch: 125%; font-size: 20px; letter-spacing: -0.03em; }
            .to { margin: 28px 0 0; font-size: 18px; font-weight: 600; color: #e4d9ff; }
            .name {
              margin: 4px 0 0;
              font-weight: 850;
              font-stretch: 125%;
              font-size: 44px;
              line-height: 0.95;
              letter-spacing: -0.035em;
            }
            .amount {
              margin: 14px 0 0;
              font-weight: 850;
              font-stretch: 125%;
              font-size: 40px;
              letter-spacing: -0.03em;
              color: #c8ff00;
            }
            .qr { margin: 24px auto 0; width: 300px; }
            .qr img { display: block; width: 100%; height: auto; }
            .hint { text-align: center; font-weight: 700; font-size: 16px; margin: 12px 0 0; }
            .meta { text-align: center; font-size: 13px; color: #4a4458; margin: 6px 0 0; }
            .code {
              margin: 24px 0 0;
              padding-top: 14px;
              border-top: 2px solid #0b0b0b;
              font-size: 10px;
              line-height: 1.5;
              word-break: break-all;
              color: #4a4458;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="band">
              <div class="mark">Faz o PIX!</div>
              <p class="to">Pix para</p>
              <p class="name">${escapeHtml(name)}</p>
              <p class="amount">${escapeHtml(amount ? formatMoney(amount) : 'Valor livre')}</p>
            </div>
            <div class="qr"><img src="${qr}" alt="QR Code Pix" /></div>
            <p class="hint">Escaneie no app do seu banco</p>
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
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 22 };
  const slide = reduceMotion
    ? {}
    : {
        initial: { y: '0.45em', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-0.45em', opacity: 0 },
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }
      };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      {/* ── Stage: the story being assembled ─────────────────────── */}
      <section
        ref={stageRef}
        className="stage lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
        aria-labelledby="story-title"
      >
        <div className="stage-shape stage-shape--disc" aria-hidden="true" />
        <div className="stage-shape stage-shape--bolt" aria-hidden="true" />
        <div className="stage-shape stage-shape--wedge" aria-hidden="true" />

        <div className="relative flex h-full flex-col px-5 pb-14 pt-5 sm:px-8 lg:px-12 lg:pb-10 lg:pt-8">
          <header className="flex items-center justify-between gap-4">
            <h1 className="display whitespace-nowrap text-[1.5rem] leading-none sm:text-[1.9rem]">
              Faz o <span className="text-[var(--lime)]">PIX!</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="privacy-chip hidden sm:inline-flex">
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                Tudo no seu aparelho
              </span>
              <button
                type="button"
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className="stage-icon-button"
                aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <div className="mt-9 flex flex-1 flex-col gap-7 lg:mt-8 lg:justify-center">
            <div className="relative pr-[5.5rem] sm:pr-36 lg:pr-44">
              {/* The sticker states progress in words; it never sits on the QR. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={ready ? 'ready' : missing.join('-')}
                  className={`sticker absolute -top-8 right-0 h-[6.4rem] w-[6.4rem] p-3.5 text-[0.68rem] sm:-top-1 sm:h-[7.5rem] sm:w-[7.5rem] sm:p-[1.1rem] sm:text-[0.74rem] ${
                    ready ? 'sticker--ready' : 'sticker--waiting'
                  }`}
                  initial={reduceMotion ? false : { scale: 0.3, rotate: -40 }}
                  animate={{ scale: 1, rotate: 12 }}
                  exit={reduceMotion ? undefined : { scale: 0.3, rotate: 40, opacity: 0 }}
                  transition={spring}
                  aria-hidden="true"
                >
                  {ready ? (
                    <span className="flex flex-col items-center gap-1">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                      Pix pronto
                    </span>
                  ) : (
                    <span>
                      Falta
                      <br />
                      {missing.join(', ')}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="sr-only" aria-live="polite">
                {ready ? 'QR Code pronto.' : `Falta preencher: ${missing.join(', ')}.`}
              </p>

              <h2 id="story-title" className="display min-h-[4.6rem] sm:min-h-[6.6rem]" style={{ fontSize: nameSize(name.length || 12) }}>
                <span className="mr-[0.3em] align-baseline text-[0.42em] font-semibold tracking-normal text-[var(--on-stage-soft)] [font-stretch:100%]">
                  Pix para
                </span>
                <span className={name ? '' : 'text-[var(--on-stage-soft)]'}>{name || 'Seu nome aqui'}</span>
              </h2>

              <p
                className="display amount-line tabular -mr-[5.5rem] mt-3 overflow-hidden whitespace-nowrap sm:-mr-36 lg:-mr-44"
                style={{ fontSize: amount ? amountSize(formatMoney(amount).length) : 'clamp(1.9rem, 6vw, 2.75rem)' }}
                aria-live="polite"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={amount || 'livre'} className="inline-block" {...slide}>
                    {amount ? formatMoney(amount) : 'Valor livre'}
                  </motion.span>
                </AnimatePresence>
              </p>
              {!amount ? (
                <p className="mt-2 text-sm font-medium text-[var(--on-stage-soft)]">
                  Quem paga digita o valor no banco.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col items-center gap-5 lg:items-start">
              <div className="relative w-full max-w-[19rem] lg:max-w-[16.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {ready ? (
                    <motion.div
                      key="qr"
                      className="qr-card"
                      initial={reduceMotion ? false : { scale: 0.7, rotate: -9, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
                      transition={spring}
                    >
                      <div className="relative">
                        <img src={qrDataUrl} alt={`QR Code Pix para ${name}`} className="block aspect-square w-full" />
                        {showLogo ? (
                          <div
                            className="pointer-events-none absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white p-1"
                            style={{ width: `${3.4 * logoScale}rem`, height: `${3.4 * logoScale}rem` }}
                          >
                            <img src={logoDataUrl ?? ''} alt="" className="h-full w-full rounded-lg object-contain" />
                          </div>
                        ) : null}
                      </div>
                      <p className="pb-1 pt-3 text-center text-sm font-bold">Escaneie no app do seu banco</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="slot"
                      className="qr-slot p-8"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                    >
                      <p className="max-w-[12rem] text-base font-semibold leading-snug">
                        O QR aparece aqui assim que chave, nome e cidade estiverem certos.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              <div ref={stageActionsRef} className="flex w-full max-w-[19rem] flex-col gap-2.5 lg:max-w-[16.5rem]">
                {ready ? (
                  <>
                    <button type="button" onClick={copyPayload} className="btn btn-lime w-full">
                      {copied ? <Check className="h-5 w-5" strokeWidth={3} /> : <Copy className="h-5 w-5" />}
                      {copied ? 'Código copiado' : 'Copiar código Pix'}
                    </button>
                    {canShare ? (
                      <button
                        type="button"
                        onClick={shareStory}
                        disabled={busy === 'share'}
                        className="btn btn-ghost-stage w-full"
                      >
                        <Share2 className="h-5 w-5" />
                        {busy === 'share' ? 'Preparando…' : 'Compartilhar story'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={downloadStory}
                      disabled={busy === 'story'}
                      className="btn btn-ghost-stage w-full"
                    >
                      <ArrowDownToLine className="h-5 w-5" />
                      {busy === 'story' ? 'Gerando imagem…' : 'Baixar story'}
                    </button>
                    <div className="grid grid-cols-[1fr_1fr_1.45fr] gap-2">
                      <button type="button" onClick={downloadPng} className="btn btn-ghost-stage btn-small !px-2">
                        <ImageIcon className="h-4 w-4" />
                        PNG
                      </button>
                      <button type="button" onClick={downloadSvg} className="btn btn-ghost-stage btn-small !px-2">
                        <FileCode2 className="h-4 w-4" />
                        SVG
                      </button>
                      <button type="button" onClick={printCard} className="btn btn-ghost-stage btn-small !px-2">
                        <Printer className="h-4 w-4" />
                        Imprimir
                      </button>
                    </div>
                  </>
                ) : (
                  <button type="button" onClick={goToForm} className="btn btn-ghost-stage w-full lg:hidden">
                    <PenLine className="h-5 w-5" />
                    Preencher dados
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Drawer: the form that builds the story ───────────────── */}
      <section ref={drawerRef} className="drawer scroll-mt-0" aria-labelledby="form-title">
        <form
          className="mx-auto flex max-w-xl flex-col gap-6 px-5 pb-28 pt-10 sm:px-8 lg:py-14"
          onSubmit={(event) => event.preventDefault()}
          noValidate
        >
          <div>
            <h2 id="form-title" className="display display-tight text-[1.9rem] sm:text-[2.2rem]">
              Monte sua cobrança
            </h2>
            <p className="mt-2 text-[0.95rem] text-[var(--ink-soft)]">
              Chave, nome e cidade bastam. Valor e o resto são opcionais.
            </p>
          </div>

          <div className="space-y-2">
            <p className="field-label" id="key-type-label">
              Tipo de chave
            </p>
            <div className="segment" role="radiogroup" aria-labelledby="key-type-label">
              {KEY_TYPES.map((type) => {
                const selected = values.keyType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => form.setValue('keyType', type.id, { shouldValidate: true })}
                    className="segment-option"
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
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

          <Field label="Valor" meta="Opcional" htmlFor="amount-input">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-extrabold text-[var(--ink-faint)]"
                aria-hidden="true"
              >
                R$
              </span>
              <input
                id="amount-input"
                className="input input-amount"
                placeholder="0,00"
                inputMode="decimal"
                autoComplete="off"
                {...form.register('amount')}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
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
              {values.amount ? (
                <button type="button" onClick={clearAmount} className="quick-chip quick-chip--reset">
                  Zerar
                </button>
              ) : null}
            </div>
          </Field>

          <div className="disclosure">
            <button
              type="button"
              onClick={() => setShowMore((open) => !open)}
              className="disclosure-button"
              aria-expanded={showMore}
              aria-controls="more-options"
            >
              <span>
                Mais opções
                <span className="block text-sm font-medium text-[var(--ink-faint)]">
                  Descrição, identificador e logo no centro do QR
                </span>
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
                  <div className="space-y-5 pb-6 pt-2">
                    <Field label="Descrição" meta="Opcional" htmlFor="desc-input">
                      <input
                        id="desc-input"
                        className="input"
                        placeholder="Almoço de domingo"
                        {...form.register('description')}
                      />
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
                              className="h-9 w-9 rounded-lg border-2 border-[var(--rule-soft)] object-contain"
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

          <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--chip)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink)]" aria-hidden="true" />
            <span>
              <strong className="font-bold text-[var(--ink)]">Nada sai do seu aparelho.</strong> O código Pix e o QR são
              gerados aqui mesmo, sem servidor e sem cadastro.
            </span>
          </p>
        </form>
      </section>

      {/* ── Mobile dock: copy without scrolling back up ──────────── */}
      <AnimatePresence>
        {ready && !stageActionsVisible ? (
          <motion.div
            className="dock lg:hidden"
            initial={reduceMotion ? false : { y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 90, opacity: 0 }}
            transition={spring}
          >
            <button type="button" onClick={copyPayload} className="btn btn-lime min-h-[2.9rem] flex-1">
              {copied ? <Check className="h-5 w-5" strokeWidth={3} /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copiado' : 'Copiar código'}
            </button>
            <button
              type="button"
              onClick={goToStage}
              className="btn min-h-[2.9rem] border-white/40 px-4 text-white"
              aria-label="Ver o QR Code"
            >
              <ArrowUp className="h-5 w-5" />
              Ver QR
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
