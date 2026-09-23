import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  MoonStar,
  Printer,
  QrCode,
  RotateCcw,
  ScanLine,
  Share2,
  ShieldCheck,
  SquarePen,
  Sun,
  Trash2
} from 'lucide-react';
import QRCode from 'qrcode';
import { buildPixPayload, validatePixKey } from './lib/pix/payload';
import { formatMoney, normalizeAmount } from './lib/pix/normalizers';
import { PixKeyType } from './lib/pix/validators';

const schema = z.object({
  keyType: z.enum(['cpf', 'cnpj', 'phone', 'email', 'random']),
  key: z.string().min(1, 'A chave Pix é obrigatória.'),
  merchantName: z.string().min(1, 'O nome é obrigatório.').max(25, 'Máximo 25 caracteres.'),
  merchantCity: z.string().min(1, 'A cidade é obrigatória.').max(15, 'Máximo 15 caracteres.'),
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
      margin: 2,
      width: 1024,
      color: { dark: '#18181b', light: '#ffffff' }
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
    context.strokeStyle = 'rgba(24, 24, 27, 0.15)';
    context.lineWidth = Math.max(4, Math.round(size * 0.05));
    roundRect(context, x - 10, y - 10, size + 20, size + 20, radius + 8);
    context.fill();
    context.stroke();
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

function SectionField({
  label,
  hint,
  hintClassName = '',
  htmlFor,
  children
}: {
  label: string;
  hint?: string;
  hintClassName?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="field-label">
        <label htmlFor={htmlFor}>{label}</label>
        {hint ? <span className={hintClassName}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

const KEY_TYPES: { id: FormValues['keyType']; label: string; placeholder: string }[] = [
  { id: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
  { id: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { id: 'phone', label: 'Celular', placeholder: '+55 11 99999-9999' },
  { id: 'email', label: 'E-mail', placeholder: 'seu@email.com' },
  { id: 'random', label: 'Chave Aleatória', placeholder: '123e4567-e89b-12d3-a456-426614174000' }
];

const QUICK_AMOUNTS = [
  { label: '+R$ 10', value: 10 },
  { label: '+R$ 20', value: 20 },
  { label: '+R$ 50', value: 50 },
  { label: '+R$ 100', value: 100 }
];

export default function App() {
  const [stored, setStored] = useStoredState<PersistedState>('fazopix.form', defaultValues);
  const [previewPrefs, setPreviewPrefs] = useStoredState<PreviewPrefs>('fazopix.preview-prefs', {
    logoScale: 1,
    logoVisible: true
  });
  const [themeMode, setThemeMode] = useStoredState<ThemeMode>('fazopix.theme', 'light');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'receipt' | 'share'>('editor');
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'share') {
      actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);
  const [timestamp, setTimestamp] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: stored,
    mode: 'onChange'
  });

  const values = form.watch();
  const { errors } = form.formState;
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(stored.logoDataUrl ?? null);
  const [logoFileName, setLogoFileName] = useState(stored.logoFileName ?? 'Nenhum arquivo selecionado');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        now.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) +
          ' ' +
          now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
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

  const amount = normalizeAmount(values.amount ?? '');
  const validKey = validatePixKey(values.keyType as PixKeyType, values.key ?? '');
  const canGenerate = validKey && values.merchantName.trim().length > 0 && values.merchantCity.trim().length > 0;

  const payload = useMemo(() => {
    if (!canGenerate) return '';
    return buildPixPayload({
      keyType: values.keyType,
      key: values.key,
      merchantName: values.merchantName,
      merchantCity: values.merchantCity,
      amount,
      description: values.description,
      txid: values.txid
    });
  }, [amount, canGenerate, values]);

  const logoScale = clamp(previewPrefs.logoScale, 0.7, 1.3);
  const showLogo = Boolean(logoDataUrl) && previewPrefs.logoVisible;
  const qrDataUrl = useQrDataUrl(payload, showLogo);

  const activeKeyMeta = KEY_TYPES.find((k) => k.id === values.keyType) || KEY_TYPES[0];

  function addQuickAmount(val: number) {
    const currentNum = amount ? parseFloat(amount) : 0;
    const newTotal = (currentNum + val).toFixed(2);
    form.setValue('amount', newTotal.replace('.', ','), { shouldDirty: true, shouldValidate: true });
  }

  function clearAmount() {
    form.setValue('amount', '', { shouldDirty: true, shouldValidate: true });
  }

  async function copyPayload() {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function sharePayload() {
    if (!payload || !navigator.share) return;
    try {
      const finalQrDataUrl = await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
      const response = await fetch(finalQrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'comprovante-pix.png', { type: 'image/png' });
      await navigator.share({
        title: 'Faz o PIX! - Comprovante de Pagamento',
        text: `Pagamento Pix para ${values.merchantName}${amount ? ` no valor de ${formatMoney(amount)}` : ''}:\n${payload}`,
        files: [file]
      });
    } catch {}
  }

  async function downloadPng() {
    if (!qrDataUrl) return;
    const finalQrDataUrl = await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
    const link = document.createElement('a');
    link.href = finalQrDataUrl;
    link.download = `pix-${values.merchantName.trim().toLowerCase().replace(/\s+/g, '-') || 'pagamento'}.png`;
    link.click();
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `pix-${values.merchantName.trim().toLowerCase().replace(/\s+/g, '-') || 'pagamento'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function printCard() {
    if (!payload || !qrDataUrl) return;
    const finalQrDataUrl = await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
    const win = window.open('', '_blank', 'width=800,height=1000');
    if (!win) return;
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Recibo Pix - ${escapeHtml(values.merchantName || 'Faz o PIX!')}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              margin: 0;
              padding: 40px 20px;
              background: #fff;
              color: #18181b;
              display: flex;
              justify-content: center;
            }
            .slip {
              width: 380px;
              border: 1px solid #e4e4e7;
              padding: 24px;
              text-align: center;
            }
            .tear-top {
              border-bottom: 2px dashed #a1a1aa;
              margin-bottom: 16px;
              padding-bottom: 8px;
              font-size: 11px;
              letter-spacing: 0.1em;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 4px 0;
            }
            .meta {
              font-size: 12px;
              color: #52525b;
              margin-bottom: 12px;
            }
            .divider {
              border-top: 1px dashed #71717a;
              margin: 12px 0;
            }
            .data-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin: 4px 0;
              text-align: left;
            }
            .data-label {
              font-weight: bold;
              color: #52525b;
            }
            .data-val {
              font-weight: bold;
            }
            .amount-box {
              margin: 14px 0;
              padding: 10px;
              background: #f4f4f5;
              border: 1px dashed #a1a1aa;
            }
            .amount-val {
              font-size: 20px;
              font-weight: bold;
            }
            .qr-stage {
              margin: 16px auto;
              width: 240px;
              height: 240px;
            }
            .qr-stage img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .stamp {
              display: inline-block;
              border: 2px dashed #15803d;
              color: #15803d;
              padding: 4px 10px;
              font-weight: bold;
              font-size: 12px;
              margin-top: 8px;
              transform: rotate(-3deg);
            }
            .code-text {
              word-break: break-all;
              font-size: 9px;
              color: #71717a;
              margin-top: 16px;
              border-top: 1px dotted #ccc;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="tear-top">RECEBIMENTO VIA PIX · SISTEMA BALCÃO</div>
            <div class="title">FAZ O PIX!</div>
            <div class="meta">EMISSÃO: ${escapeHtml(timestamp)}</div>
            <div class="divider"></div>
            <div class="data-row">
              <span class="data-label">BENEFICIÁRIO:</span>
              <span class="data-val">${escapeHtml(values.merchantName.toUpperCase())}</span>
            </div>
            <div class="data-row">
              <span class="data-label">CIDADE:</span>
              <span class="data-val">${escapeHtml(values.merchantCity.toUpperCase())}</span>
            </div>
            <div class="data-row">
              <span class="data-label">CHAVE PIX:</span>
              <span class="data-val">${escapeHtml(values.key)}</span>
            </div>
            ${values.description ? `
            <div class="data-row">
              <span class="data-label">DESCRIÇÃO:</span>
              <span class="data-val">${escapeHtml(values.description)}</span>
            </div>` : ''}
            <div class="amount-box">
              <div style="font-size: 11px; margin-bottom: 2px;">VALOR COBRADO:</div>
              <div class="amount-val">${escapeHtml(amount ? formatMoney(amount) : 'VALOR EM ABERTO')}</div>
            </div>
            <div class="qr-stage">
              <img src="${finalQrDataUrl}" alt="QR Code Pix" />
            </div>
            <div class="stamp">✓ PIX PRONTO · ESCANEIE PARA PAGAR</div>
            <div class="code-text">${escapeHtml(payload)}</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  function onLogoUpload(file?: File) {
    if (!file) {
      setLogoFileName('Nenhum arquivo selecionado');
      setLogoDataUrl(null);
      return;
    }
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function clearSavedLogo() {
    setLogoFileName('Nenhum arquivo selecionado');
    setLogoDataUrl(null);
    if (values.remember) {
      setStored({
        ...values,
        logoDataUrl: null,
        logoFileName: 'Nenhum arquivo selecionado'
      });
    }
  }

  const isDark = themeMode === 'dark';
  const amountFormatted = amount ? formatMoney(amount) : 'Valor livre';

  return (
    <main className="min-h-screen text-[var(--ink)] pb-12 pt-4 sm:pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Header / App Shell */}
        <header className="workbench-shell rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="brand-mark shrink-0">
                <img src="/brand-icon-transparent.png" alt="Faz o PIX!" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl leading-none text-[var(--ink)]">
                  Faz o PIX!
                </h1>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[var(--ink-secondary)]">
                  Emissão de QR Code e Comprovante de Balcão
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--brand-subtle)] text-[var(--brand)]">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Local & Sem Servidor</span>
              </div>

              <button
                type="button"
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className="button-secondary h-10 w-10 !p-0 rounded-xl"
                aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                title={isDark ? 'Modo claro' : 'Modo escuro'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile View Switcher */}
          <div className="mt-4 flex gap-2 lg:hidden border-t border-dashed border-[var(--line-dashed)] pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`nav-tab flex-1 justify-center ${activeTab === 'editor' ? 'nav-tab-active' : ''}`}
            >
              <SquarePen className="h-4 w-4" />
              <span>Preencher</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('receipt')}
              className={`nav-tab flex-1 justify-center ${activeTab === 'receipt' ? 'nav-tab-active' : ''}`}
            >
              <FileText className="h-4 w-4" />
              <span>Comprovante</span>
              {canGenerate && (
                <span className="h-2 w-2 rounded-full bg-[var(--brand)] ml-1"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`nav-tab flex-1 justify-center ${activeTab === 'share' ? 'nav-tab-active' : ''}`}
            >
              <Share2 className="h-4 w-4" />
              <span>Ações</span>
            </button>
          </div>
        </header>

        {/* Main Grid: Workbench Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Console */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="workbench-card">
              <div className="card-tear-top" aria-hidden="true" />
              <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-dashed border-[var(--line-dashed)] pb-3.5">
                <div>
                  <h2 className="font-display text-lg sm:text-xl text-[var(--ink)]">
                    Dados do Recebimento
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
                    Preencha os campos para emitir a cobrança instantânea.
                  </p>
                </div>
                <span className="font-mono-receipt text-xs font-semibold px-2.5 py-1 rounded bg-[var(--surface-subtle)] text-[var(--ink-secondary)] border border-[var(--line)]">
                  PASSO 1/2
                </span>
              </div>

              {/* Chave Pix & Tipo */}
              <div className="space-y-3">
                <SectionField label="Tipo de Chave">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--line)]">
                    {KEY_TYPES.map((type) => {
                      const selected = values.keyType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => form.setValue('keyType', type.id, { shouldValidate: true })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                            selected
                              ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm'
                              : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </SectionField>

                <SectionField
                  label={`Chave Pix (${activeKeyMeta.label})`}
                  hint={values.key ? (validKey ? 'Chave válida' : 'Formato incorreto') : ''}
                  hintClassName={validKey ? 'text-emerald-600 font-bold text-xs' : 'text-rose-600 font-bold text-xs'}
                  htmlFor="pix-key-input"
                >
                  <div className="relative">
                    <input
                      id="pix-key-input"
                      className={`input font-mono-receipt ${
                        errors.key || (values.key && !validKey) ? 'input-error' : ''
                      }`}
                      placeholder={activeKeyMeta.placeholder}
                      {...form.register('key', {
                        validate: (value) =>
                          validatePixKey(values.keyType as PixKeyType, value ?? '') ||
                          'Chave inválida para o tipo selecionado'
                      })}
                    />
                  </div>
                  {errors.key ? (
                    <p className="field-error">{errors.key.message}</p>
                  ) : values.key && !validKey ? (
                    <p className="field-error">Chave Pix não bate com o formato selecionado.</p>
                  ) : null}
                </SectionField>
              </div>

              {/* Nome e Cidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SectionField
                  label="Nome do Recebedor"
                  hint={`${values.merchantName?.length || 0}/25`}
                  hintClassName="field-counter"
                  htmlFor="merchant-name-input"
                >
                  <input
                    id="merchant-name-input"
                    className={`input ${errors.merchantName ? 'input-error' : ''}`}
                    placeholder="Ex.: Maria Silva"
                    maxLength={25}
                    {...form.register('merchantName')}
                  />
                  {errors.merchantName && <p className="field-error">{errors.merchantName.message}</p>}
                </SectionField>

                <SectionField
                  label="Cidade do Recebedor"
                  hint={`${values.merchantCity?.length || 0}/15`}
                  hintClassName="field-counter"
                  htmlFor="merchant-city-input"
                >
                  <input
                    id="merchant-city-input"
                    className={`input uppercase ${errors.merchantCity ? 'input-error' : ''}`}
                    placeholder="SAO PAULO"
                    maxLength={15}
                    {...form.register('merchantCity')}
                  />
                  {errors.merchantCity && <p className="field-error">{errors.merchantCity.message}</p>}
                </SectionField>
              </div>

              {/* Valor com atalhos rápidos */}
              <div className="space-y-2">
                <SectionField
                  label="Valor da Cobrança"
                  hint="Opcional (em branco = valor livre)"
                  htmlFor="amount-input"
                >
                  <div className="relative">
                    <input
                      id="amount-input"
                      className="input font-mono-receipt pl-8 text-base font-bold"
                      placeholder="0,00"
                      inputMode="decimal"
                      {...form.register('amount')}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-receipt text-sm font-bold text-[var(--ink-muted)]">
                      R$
                    </span>
                  </div>
                </SectionField>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-[var(--ink-muted)] mr-1">Atalhos:</span>
                  {QUICK_AMOUNTS.map((quick) => (
                    <button
                      key={quick.value}
                      type="button"
                      onClick={() => addQuickAmount(quick.value)}
                      className="value-chip"
                    >
                      {quick.label}
                    </button>
                  ))}
                  {values.amount ? (
                    <button
                      type="button"
                      onClick={clearAmount}
                      className="value-chip !text-rose-500 hover:!border-rose-300 ml-auto"
                    >
                      <RotateCcw className="h-3 w-3 inline mr-1" />
                      Zerar
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Sanfona / Mais Opções (Descrição, TXID, Logo) */}
              <div className="border-t border-dashed border-[var(--line-dashed)] pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-1 text-xs font-bold text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Opções Avançadas (Identificador, Descrição, Logo Central)
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showAdvanced ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 overflow-hidden"
                    >
                      <SectionField label="Descrição da Cobrança" hint="Opcional" htmlFor="desc-input">
                        <input
                          id="desc-input"
                          className="input"
                          placeholder="Ex.: Almoço de domingo, Mensalidade..."
                          {...form.register('description')}
                        />
                      </SectionField>

                      <SectionField label="Identificador da Transação (TXID)" hint="Opcional (sem espaços)" htmlFor="txid-input">
                        <input
                          id="txid-input"
                          className="input font-mono-receipt uppercase"
                          placeholder="Ex.: PEDIDO123"
                          {...form.register('txid')}
                        />
                      </SectionField>

                      <SectionField label="Logo no Centro do QR Code" hint="Opcional (PNG ou SVG)">
                        <label className="file-shell">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            className="sr-only"
                            onChange={(e) => onLogoUpload(e.target.files?.[0])}
                          />
                          <span className="file-action">
                            <ImageIcon className="h-3.5 w-3.5 inline mr-1" />
                            Carregar Imagem
                          </span>
                          <span className="file-name">{logoFileName}</span>
                        </label>

                        {logoDataUrl ? (
                          <div className="flex items-center justify-between gap-4 mt-2 p-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--line)]">
                            <div className="flex items-center gap-2">
                              <img src={logoDataUrl} alt="Logo" className="h-7 w-7 rounded object-contain border border-[var(--line)]" />
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewPrefs((c) => ({ ...c, logoVisible: !c.logoVisible }))
                                }
                                className="text-xs font-semibold text-[var(--brand)] hover:underline"
                              >
                                {previewPrefs.logoVisible ? 'Ocultar no QR' : 'Exibir no QR'}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={clearSavedLogo}
                              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remover
                            </button>
                          </div>
                        ) : null}
                      </SectionField>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Checkbox "Lembrar dados" */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--line)]">
                <Checkbox.Root
                  id="remember-data"
                  checked={values.remember ?? false}
                  onCheckedChange={(checked) =>
                    form.setValue('remember', checked === true, { shouldDirty: true })
                  }
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--line-dashed)] bg-[var(--surface)] transition data-[state=checked]:border-[var(--brand)] data-[state=checked]:bg-[var(--brand)]"
                >
                  <Checkbox.Indicator className="text-white">
                    <Check className="h-3 w-3" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="remember-data" className="text-xs leading-relaxed select-none cursor-pointer">
                  <span className="font-bold text-[var(--ink)] block">
                    Salvar meus dados para as próximas cobranças
                  </span>
                  <span className="text-[var(--ink-secondary)]">
                    Os dados são guardados exclusivamente no localStorage deste navegador.
                  </span>
                </label>
              </div>

              {/* Mobile CTA to jump to receipt */}
              <div className="lg:hidden pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('receipt')}
                  disabled={!canGenerate}
                  className="button-primary w-full"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Ver Comprovante & QR Code</span>
                </button>
              </div>
              </div>
            </div>
          </div>

          {/* Right Column: Thermal Receipt Ticket */}
          <div
            className={`lg:col-span-5 ${
              activeTab === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="sticky top-6">
              {/* Thermal Receipt Component */}
              <div className="thermal-receipt">
                {/* Serrated Top Tear Edge */}
                <div className="receipt-tear-top" aria-hidden="true" />

                <div className="receipt-inner">
                  {/* Receipt Header */}
                  <div className="text-center font-mono-receipt space-y-1">
                    <div className="text-[0.68rem] tracking-widest font-bold uppercase text-[var(--ink-muted)]">
                      Comprovante de Cobrança
                    </div>
                    <div className="text-xl font-bold tracking-tight text-[var(--ink)]">
                      FAZ O PIX!
                    </div>
                    <div className="text-[0.72rem] text-[var(--ink-muted)]">
                      SISTEMA 100% LOCAL · BALCÃO BR
                    </div>
                    <div className="text-[0.7rem] text-[var(--ink-muted)]">
                      EMISSÃO: {timestamp || 'AGUARDANDO...'}
                    </div>
                  </div>

                  <div className="receipt-divider" />

                  {/* Transaction Metadata Breakdown */}
                  <div className="font-mono-receipt text-xs space-y-1.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-[var(--ink-muted)] text-[0.7rem]">RECEBEDOR:</span>
                      <span className="font-bold text-[var(--ink)] truncate text-right">
                        {values.merchantName.trim() ? values.merchantName.toUpperCase() : '------'}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-[var(--ink-muted)] text-[0.7rem]">CIDADE:</span>
                      <span className="font-bold text-[var(--ink)] text-right">
                        {values.merchantCity.trim() ? values.merchantCity.toUpperCase() : '------'}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-[var(--ink-muted)] text-[0.7rem]">CHAVE ({activeKeyMeta.label}):</span>
                      <span className="font-bold text-[var(--ink)] truncate max-w-[190px] text-right">
                        {values.key.trim() || '------'}
                      </span>
                    </div>

                    {values.description?.trim() && (
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-[var(--ink-muted)] text-[0.7rem]">DESCRIÇÃO:</span>
                        <span className="text-[var(--ink)] truncate max-w-[190px] text-right">
                          {values.description.trim()}
                        </span>
                      </div>
                    )}

                    {values.txid?.trim() && (
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-[var(--ink-muted)] text-[0.7rem]">IDENTIFICADOR:</span>
                        <span className="font-bold text-[var(--ink)] uppercase text-right">
                          {values.txid.trim()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total Value Box */}
                  <div className="my-3.5 p-2.5 rounded-lg border border-dashed border-[var(--line-dashed)] bg-[var(--surface-subtle)] text-center font-mono-receipt">
                    <div className="text-[0.68rem] tracking-wider uppercase text-[var(--ink-muted)]">
                      Total a Pagar
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[var(--ink)] mt-0.5">
                      {amountFormatted}
                    </div>
                  </div>

                  {/* QR Code Well */}
                  <div className="receipt-qr-well my-3 flex flex-col items-center justify-center min-h-[220px]">
                    {canGenerate && qrDataUrl ? (
                      <div className="relative flex items-center justify-center w-full max-w-[210px] aspect-square">
                        <img
                          src={qrDataUrl}
                          alt="QR Code Pix"
                          className="w-full h-full object-contain"
                        />
                        {showLogo && (
                          <div
                            className="absolute pointer-events-none p-1 rounded-lg bg-white shadow-md flex items-center justify-center"
                            style={{
                              width: `${3.2 * logoScale}rem`,
                              height: `${3.2 * logoScale}rem`
                            }}
                          >
                            <img
                              src={logoDataUrl ?? ''}
                              alt=""
                              className="w-full h-full object-contain rounded"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--ink-muted)]">
                        <ScanLine className="h-10 w-10 stroke-1 mb-2 opacity-50" />
                        <span className="font-mono-receipt text-xs font-semibold">
                          Aguardando chave e nome para emitir o QR Code
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Approval / Status Stamp */}
                  <div className="flex justify-center my-2">
                    {canGenerate ? (
                      <div className="receipt-stamp-badge">
                        <span>✓ PIX PRONTO</span>
                        <span className="text-[0.62rem] opacity-80">ESCANEIE PARA PAGAR</span>
                      </div>
                    ) : (
                      <span className="font-mono-receipt text-[0.68rem] text-[var(--ink-muted)]">
                        STATUS: AGUARDANDO PREENCHIMENTO
                      </span>
                    )}
                  </div>

                  <div className="receipt-divider" />

                  {/* Immediate Action Buttons */}
                  <div ref={actionsRef} className="space-y-2 pt-1 scroll-mt-6">
                    <button
                      type="button"
                      onClick={copyPayload}
                      disabled={!canGenerate}
                      className="button-primary w-full !py-2.5"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Código Pix Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copiar Código Pix</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={printCard}
                        disabled={!canGenerate}
                        className="button-secondary text-xs !py-2"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Imprimir</span>
                      </button>

                      <button
                        type="button"
                        onClick={sharePayload}
                        disabled={!canGenerate}
                        className="button-secondary text-xs !py-2"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Compartilhar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={downloadPng}
                        disabled={!canGenerate}
                        className="button-secondary text-xs !py-2"
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        <span>Baixar PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadSvg}
                        disabled={!canGenerate}
                        className="button-secondary text-xs !py-2"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Baixar SVG</span>
                      </button>
                    </div>
                  </div>

                  {/* Dotted Receipt Hash Footer */}
                  <div className="mt-4 pt-2 border-t border-dotted border-[var(--line)] text-center font-mono-receipt text-[0.65rem] text-[var(--ink-muted)] break-all">
                    {payload ? `BR.GOV.BCB.PIX • CRC16:${payload.slice(-4)}` : 'SISTEMA SEGURO CLIENT-SIDE'}
                  </div>
                </div>

                {/* Serrated Bottom Tear Edge */}
                <div className="receipt-tear-bottom" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
