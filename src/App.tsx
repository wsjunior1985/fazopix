import { type ReactNode, useEffect, useMemo, useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownToLine,
  CheckCircle2,
  Copy,
  Download,
  LayoutGrid,
  MoonStar,
  Printer,
  ScanLine,
  Share2,
  SquarePen,
  StepForward,
  Smartphone
} from 'lucide-react';
import QRCode from 'qrcode';
import { buildPixPayload, validatePixKey } from './lib/pix/payload';
import { formatMoney, normalizeAmount } from './lib/pix/normalizers';
import { PixKeyType } from './lib/pix/validators';

const schema = z.object({
  keyType: z.enum(['cpf', 'cnpj', 'phone', 'email', 'random']),
  key: z.string().min(1),
  merchantName: z.string().min(1).max(25),
  merchantCity: z.string().min(1).max(15),
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
      color: { dark: '#07111f', light: '#ffffff' }
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
    context.strokeStyle = 'rgba(255,255,255,0.96)';
    context.lineWidth = Math.max(4, Math.round(size * 0.05));
    roundRect(context, x - 12, y - 12, size + 24, size + 24, radius + 10);
    context.fill();
    context.stroke();
    context.drawImage(logoImage, x, y, size, size);
    context.restore();
  }

  return canvas.toDataURL('image/png');
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function SectionLabel({
  label,
  hint,
  hintClassName = '',
  children
}: {
  label: string;
  hint?: string;
  hintClassName?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <div className="field-label">
        <span>{label}</span>
        {hint ? <span className={hintClassName}>{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function MotionPanel({
  children,
  className = '',
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [stored, setStored] = useStoredState<PersistedState>('fazopix.form', defaultValues);
  const [previewPrefs, setPreviewPrefs] = useStoredState<PreviewPrefs>('fazopix.preview-prefs', {
    logoScale: 1,
    logoVisible: true
  });
  const [themeMode, setThemeMode] = useStoredState<ThemeMode>('fazopix.theme', 'light');
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: stored,
    mode: 'onChange'
  });
  const values = form.watch();
  const { errors } = form.formState;
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(stored.logoDataUrl ?? null);
  const [logoFileName, setLogoFileName] = useState(stored.logoFileName ?? 'Nenhum arquivo selecionado');
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'export'>('editor');

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
  const logoSizeLabel = `${Math.round(logoScale * 100)}%`;
  const showLogo = Boolean(logoDataUrl) && previewPrefs.logoVisible;
  const qrDataUrl = useQrDataUrl(payload, showLogo);
  const previewBlocker = !values.key
    ? 'Falta preencher a chave Pix.'
    : !validKey
      ? 'Corrija a chave Pix.'
      : !values.merchantName.trim()
        ? 'Falta preencher o nome do recebedor.'
        : !values.merchantCity.trim()
          ? 'Falta preencher a cidade.'
          : '';

  const keyRegistration = form.register('key', {
    validate: (value) => (validatePixKey(values.keyType as PixKeyType, value ?? '') ? true : 'A chave Pix não bate com o tipo selecionado.')
  });

  async function advanceToPreview() {
    const ok = await form.trigger(['key', 'merchantName', 'merchantCity']);
    if (!ok) return;
    setActiveView('preview');
  }

  async function copyPayload() {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function sharePayload() {
    if (!payload || !navigator.share) return;
    const finalQrDataUrl = await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
    const response = await fetch(finalQrDataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'meu-pix-qr.png', { type: 'image/png' });
    await navigator.share({
      title: 'Faz o PIX!',
      text: payload,
      files: [file]
    });
  }

  async function downloadPng() {
    if (!qrDataUrl) return;
    const finalQrDataUrl = await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
    const link = document.createElement('a');
    link.href = finalQrDataUrl;
    link.download = 'meu-pix-qr.png';
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
    link.download = 'meu-pix-qr.svg';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function printCard() {
    if (!payload || !qrDataUrl) return;
    const finalQrDataUrl = await composeQrWithLogo(qrDataUrl, showLogo ? logoDataUrl : null, logoScale);
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Faz o PIX!</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #fff; color: #07111f; }
            .card { max-width: 640px; margin: 0 auto; border: 1px solid #dbe4ea; border-radius: 28px; padding: 32px; text-align: center; }
            img { width: 420px; max-width: 100%; aspect-ratio: 1; }
            h1 { margin: 0 0 12px; font-size: 32px; letter-spacing: -0.04em; }
            p { margin: 8px 0; }
            .muted { color: #64748b; }
            .code { word-break: break-all; font-size: 12px; color: #475569; margin-top: 20px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>PIX</h1>
            <img src="${finalQrDataUrl}" alt="QR Code Pix" />
            <p><strong>${escapeHtml(values.merchantName || '')}</strong></p>
            <p class="muted">Escaneie para pagar</p>
            ${amount ? `<p><strong>${escapeHtml(formatMoney(amount))}</strong></p>` : ''}
            <div class="code">${escapeHtml(payload)}</div>
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

  const amountLabel = amount ? formatMoney(amount) : 'Sem valor fixo';
  const isDark = themeMode === 'dark';
  const navigation = [
    { id: 'editor' as const, label: 'Personalize', icon: SquarePen },
    { id: 'preview' as const, label: 'Veja como ficou', icon: LayoutGrid },
    { id: 'export' as const, label: 'Compartilhe', icon: StepForward }
  ];
  const activeNavIndex = navigation.findIndex((item) => item.id === activeView);

  return (
    <main className="min-h-screen overflow-hidden text-slate-900">
      <div className="relative isolate">
        <div className="noise-overlay pointer-events-none absolute inset-0 -z-10" />
        <div className="ambient-orb ambient-orb-1 pointer-events-none absolute -left-24 top-4 -z-10 h-72 w-72 rounded-full blur-3xl" />
        <div className="ambient-orb ambient-orb-2 pointer-events-none absolute right-0 top-24 -z-10 h-96 w-96 rounded-full blur-3xl" />
        <div className="ambient-grid pointer-events-none absolute inset-0 -z-10" />

        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <header className="vault-shell rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="brand-mark h-16 w-16 shrink-0 overflow-hidden rounded-[1.45rem] p-0 shadow-none"
                  style={{ background: 'transparent' }}
                >
                  <img src="/brand-icon-transparent.png" alt="" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[1.95rem] leading-[0.95] tracking-[-0.07em] text-slate-950 sm:text-[2.15rem]">
                    Faz o PIX!
                  </div>
                  <div className="mt-2 max-w-[19rem] text-[0.9rem] font-medium leading-snug text-slate-500 sm:max-w-[22rem]">
                    Seu QR Code pronto para receber pagamentos.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className="theme-toggle inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                <MoonStar className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 h-px w-full bg-slate-200/80" />

            <div className="mt-6 hidden flex-wrap gap-2 md:flex">
              {navigation.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`nav-chip ${active ? 'nav-chip-active' : ''}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </header>

          <section className="mt-5 sm:mt-6">
            <MotionPanel className="vault-card rounded-[2rem] p-4 sm:p-6" delay={0.08}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2.5 sm:pb-3">
                <div>
                  <h2 className="font-display text-[1.55rem] tracking-[-0.045em] text-slate-950 sm:text-2xl">
                    {activeView === 'editor' ? 'Insira os dados do seu PIX' : activeView === 'preview' ? 'Pré-visualização' : 'Exportar'}
                  </h2>
                </div>
              </div>

              {activeView === 'editor' ? (
                <div className="mt-3 sm:mt-4">
                  <div className="grid gap-3.5 sm:gap-4">
                    <SectionLabel
                      label="Tipo de chave"
                      hint={errors.keyType ? 'Inválido' : ''}
                      hintClassName="field-hint-error"
                    >
                      <select
                        className={`input input-dark ${errors.keyType ? 'input-error' : ''}`}
                        aria-invalid={errors.keyType ? 'true' : 'false'}
                        {...form.register('keyType')}
                      >
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="phone">Telefone</option>
                        <option value="email">E-mail</option>
                        <option value="random">Chave aleatória</option>
                      </select>
                      {errors.keyType ? <p className="field-error">Escolha um tipo de chave válido.</p> : null}
                    </SectionLabel>

                    <SectionLabel
                      label="Chave Pix"
                      hint={values.key ? (validKey ? 'Formato válido' : 'Formato inválido') : 'Validação de formato'}
                      hintClassName={values.key ? (validKey ? 'field-hint-valid' : 'field-hint-error') : ''}
                    >
                      <input
                        className={`input input-dark ${errors.key ? 'input-error' : ''}`}
                        aria-invalid={errors.key ? 'true' : 'false'}
                        {...keyRegistration}
                        placeholder="Digite sua chave Pix"
                      />
                      {errors.key ? (
                        <p className="field-error">{errors.key.message || 'Preencha a chave Pix.'}</p>
                      ) : !validKey && values.key ? (
                        <p className="field-error">A chave informada não combina com o tipo selecionado.</p>
                      ) : null}
                    </SectionLabel>

                    <SectionLabel
                      label="Nome do recebedor"
                      hint={errors.merchantName ? 'Inválido' : 'Até 25 caracteres'}
                      hintClassName={errors.merchantName ? 'field-hint-error' : 'field-hint-muted'}
                    >
                      <input
                        className={`input input-dark ${errors.merchantName ? 'input-error' : ''}`}
                        aria-invalid={errors.merchantName ? 'true' : 'false'}
                        {...form.register('merchantName')}
                        maxLength={25}
                        placeholder="Ex.: Maria Silva"
                      />
                      {errors.merchantName ? <p className="field-error">Digite o nome do recebedor.</p> : null}
                    </SectionLabel>

                    <SectionLabel
                      label="Cidade"
                      hint={errors.merchantCity ? 'Inválido' : 'Até 15 caracteres'}
                      hintClassName={errors.merchantCity ? 'field-hint-error' : 'field-hint-muted'}
                    >
                      <input
                        className={`input input-dark uppercase ${errors.merchantCity ? 'input-error' : ''}`}
                        aria-invalid={errors.merchantCity ? 'true' : 'false'}
                        {...form.register('merchantCity')}
                        maxLength={15}
                        placeholder="BRASILIA"
                      />
                      {errors.merchantCity ? <p className="field-error">Digite a cidade do recebedor.</p> : null}
                    </SectionLabel>

                    <SectionLabel label="Valor" hint="Opcional" hintClassName="field-hint-muted">
                      <input className="input input-dark" {...form.register('amount')} inputMode="decimal" placeholder="R$ 0,00" />
                    </SectionLabel>

                    <SectionLabel label="Descrição" hint="Curta e discreta" hintClassName="field-hint-muted">
                      <input className="input input-dark" {...form.register('description')} placeholder="Mensagem opcional" />
                    </SectionLabel>

                    <SectionLabel label="Identificador da cobrança (TXID)" hint="Opcional" hintClassName="field-hint-muted">
                      <input className="input input-dark uppercase" {...form.register('txid')} placeholder="Ex.: WALDEAPPS" />
                    </SectionLabel>

                    <SectionLabel label="Logo" hint="PNG, JPG ou WebP" hintClassName="field-hint-muted">
                      <label className="file-shell">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          onChange={(e) => onLogoUpload(e.target.files?.[0])}
                        />
                        <span className="file-action">Escolher arquivo</span>
                        <span className="file-name">{logoFileName}</span>
                      </label>
                      {logoDataUrl ? (
                        <button
                          type="button"
                          className="mt-2 text-xs font-medium text-slate-500 transition hover:text-slate-700"
                          onClick={clearSavedLogo}
                        >
                          Remover logo salva
                        </button>
                      ) : null}
                    </SectionLabel>
                  </div>

                  <label className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-3.5">
                    <Checkbox.Root
                      checked={values.remember ?? false}
                      onCheckedChange={(checked) => form.setValue('remember', checked === true, { shouldDirty: true })}
                      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-[6px] border border-slate-300 bg-white outline-none transition data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                      aria-label="Lembrar meus dados neste dispositivo"
                    >
                      <Checkbox.Indicator className="text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <div>
                      <div className="text-sm font-medium text-slate-950">Lembrar meus dados neste dispositivo</div>
                      <div className="text-sm text-slate-500">Se ativado, os dados ficam só neste navegador.</div>
                    </div>
                  </label>

                  <div className="step-footer flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                    {canGenerate ? 'Tudo pronto para gerar o QR.' : previewBlocker}
                    </p>
                    <button
                      type="button"
                      onClick={() => void advanceToPreview()}
                      disabled={!canGenerate}
                      className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Avançar para o QR
                    </button>
                  </div>
                </div>
              ) : null}

              {activeView === 'preview' ? (
                <div className="mt-3">
                  <div className="receipt-preview compact-receipt">
                    <div className="receipt-top">
                      <div>
                        <div className="receipt-title">{payload ? 'QR pronto para receber' : 'Aguardando dados'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPrefs((current) => ({
                              ...current,
                              logoVisible: !current.logoVisible
                            }))
                          }
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                        >
                          {previewPrefs.logoVisible ? 'Ocultar logo' : 'Mostrar logo'}
                        </button>
                        <div className="receipt-status">{amountLabel}</div>
                      </div>
                    </div>
                    {logoDataUrl && previewPrefs.logoVisible ? (
                      <div className="mt-3 rounded-[1.15rem] border border-slate-200 bg-white/80 p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-950">Logo no QR</p>
                            <p className="text-xs text-slate-500">Ajuste rápido sem perder leitura.</p>
                          </div>
                          <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.7rem] font-medium text-slate-500">
                            {logoSizeLabel}
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {[
                            { label: 'Pequena', value: 0.8 },
                            { label: 'Média', value: 1 },
                            { label: 'Grande', value: 1.2 }
                          ].map((preset) => {
                            const active = Math.abs(logoScale - preset.value) < 0.03;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() =>
                                  setPreviewPrefs((current) => ({
                                    ...current,
                                    logoScale: preset.value,
                                    logoVisible: true
                                  }))
                                }
                                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                                  active
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    <div className="receipt-body">
                      <div className="receipt-stage">
                        {qrDataUrl ? (
                          <>
                            <img src={qrDataUrl} alt="QR Code Pix" className="receipt-qr" />
                            {showLogo ? (
                              <div
                                className="receipt-logo"
                                style={{
                                  width: `${4.5 * logoScale}rem`,
                                  height: `${4.5 * logoScale}rem`
                                }}
                              >
                                <img src={logoDataUrl ?? ''} alt="" className="h-full w-full rounded-[1rem] object-contain" />
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div className="receipt-empty-light">
                            <ScanLine className="h-9 w-9 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-slate-500">Escaneie para pagar</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs text-slate-500">Escaneie para receber</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeView === 'export' ? (
                <div className="mt-4 grid gap-3">
                  <div className="status-chip status-chip-valid">{validKey ? 'Chave válida' : 'Chave inválida'}</div>
                  <div className="status-chip status-chip-neutral">{copied ? 'Copiado' : 'Local'}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyPayload}
                      disabled={!payload}
                      className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copiado' : 'Copiar Pix'}
                    </button>
                    <button
                      type="button"
                      onClick={sharePayload}
                      disabled={!payload}
                      className="button-secondary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </button>
                    <button
                      type="button"
                      onClick={downloadPng}
                      disabled={!payload}
                      className="button-secondary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDownToLine className="h-4 w-4" />
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={downloadSvg}
                      disabled={!payload}
                      className="button-secondary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download className="h-4 w-4" />
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={printCard}
                      disabled={!payload}
                      className="button-secondary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </button>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-3.5 text-sm text-slate-600">Dados ficam só neste navegador.</div>
                </div>
              ) : null}

              <div className="mt-6 md:hidden">
                <div className="mobile-dock">
                  <div className="mobile-dock-track">
                    <div className="mobile-dock-highlight" style={{ transform: `translateX(${activeNavIndex * 100}%)` }} />
                    {navigation.map((item) => {
                      const active = activeView === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveView(item.id)}
                          className={`mobile-dock-item ${active ? 'mobile-dock-item-active' : ''}`}
                        >
                          <motion.span
                            className="mobile-dock-icon"
                            animate={active ? { scale: 1.08, y: -1 } : { scale: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <item.icon className="h-4 w-4" />
                          </motion.span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </MotionPanel>
          </section>
        </div>
      </div>
    </main>
  );
}
