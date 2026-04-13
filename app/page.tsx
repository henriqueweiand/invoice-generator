'use client';

import { useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────
type Status = 'pending' | 'paid' | 'overdue' | 'draft';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  status: Status;
  invoiceDate: string;
  currency: string;
  billToName: string;
  billToAddress: string;
  billToCity: string;
  billToZip: string;
  billToCountry: string;
  billFromName: string;
  billFromAddress: string;
  billFromCity: string;
  billFromZip: string;
  billFromCountry: string;
  taxDetails: string;
  items: LineItem[];
  vatRate: number;
  contact: string;
  notes: string;
  reference: string;
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_COLORS: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// ── Default data ───────────────────────────────────────────────────────
const DEFAULT: InvoiceData = {
  invoiceNumber: 'EINV-2026-10',
  status: 'pending',
  invoiceDate: new Date().toISOString().split('T')[0],
  currency: 'USD',
  billToName: '',
  billToAddress: '',
  billToCity: '',
  billToZip: '',
  billToCountry: '',
  billFromName: '',
  billFromAddress: '',
  billFromCity: '',
  billFromZip: '',
  billFromCountry: '',
  taxDetails: '',
  items: [{ id: '1', description: '', qty: 1, unit: 'items', rate: 0 }],
  vatRate: 0,
  contact: '',
  notes: '',
  reference: '',
};

// ── Shared class strings ──────────────────────────────────────────────
const inp =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm';
const lbl =
  'block text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1';

// ── Section card ──────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Address block helper ──────────────────────────────────────────────
function AddressFields({
  prefix,
  data,
  onChange,
  placeholder,
}: {
  prefix: 'billFrom' | 'billTo';
  data: InvoiceData;
  onChange: (field: keyof InvoiceData, value: string) => void;
  placeholder: string;
}) {
  const f = (suffix: string) => `${prefix}${suffix}` as keyof InvoiceData;
  return (
    <div className="space-y-3">
      <div>
        <label className={lbl}>Company / Name</label>
        <input className={inp} value={data[f('Name')] as string} onChange={(e) => onChange(f('Name'), e.target.value)} placeholder={placeholder} />
      </div>
      <div>
        <label className={lbl}>Street Address</label>
        <input className={inp} value={data[f('Address')] as string} onChange={(e) => onChange(f('Address'), e.target.value)} placeholder="123 Main St" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>City</label>
          <input className={inp} value={data[f('City')] as string} onChange={(e) => onChange(f('City'), e.target.value)} placeholder="City" />
        </div>
        <div>
          <label className={lbl}>ZIP</label>
          <input className={inp} value={data[f('Zip')] as string} onChange={(e) => onChange(f('Zip'), e.target.value)} placeholder="00000" />
        </div>
      </div>
      <div>
        <label className={lbl}>Country</label>
        <input className={inp} value={data[f('Country')] as string} onChange={(e) => onChange(f('Country'), e.target.value)} placeholder="Country" />
      </div>
    </div>
  );
}

// ── Invoice content shared between print + preview ────────────────────
function InvoiceContent({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const vat = subtotal * (data.vatRate / 100);
  const total = subtotal + vat;

  return (
    <div
      style={{
        padding: '48px 56px',
        minHeight: '297mm',
        display: 'flex',
        flexDirection: 'column',
        fontSize: '13px',
        color: '#111',
        fontFamily: 'Arial, Helvetica, sans-serif',
        background: 'white',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
          {data.billFromName || 'Your Company'}
        </h1>
        <div style={{ background: '#f0f0f0', padding: '8px 22px', letterSpacing: '5px', fontSize: '11px', fontWeight: '600', color: '#444' }}>
          I N V O I C E
        </div>
      </div>

      {/* ── Bill To + Invoice meta ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', margin: '0 0 8px' }}>Bill To:</p>
          {[data.billToName, data.billToAddress, data.billToCity, data.billToZip, data.billToCountry]
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} style={{ margin: '0 0 2px', fontSize: '12px' }}>{line}</p>
            ))}
        </div>
        <div style={{ textAlign: 'right' }}>
          <table style={{ marginLeft: 'auto', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: '#777', paddingRight: '16px', paddingBottom: '4px', fontSize: '12px' }}>#</td>
                <td style={{ fontSize: '12px', paddingBottom: '4px' }}>{data.invoiceNumber}</td>
              </tr>
              <tr>
                <td style={{ color: '#777', paddingRight: '16px', paddingBottom: '4px', fontSize: '12px' }}>Status</td>
                <td style={{ fontSize: '12px', paddingBottom: '4px' }}>{data.status}</td>
              </tr>
              <tr>
                <td style={{ color: '#777', paddingRight: '16px', paddingBottom: '4px', fontSize: '12px' }}>Invoice date</td>
                <td style={{ fontSize: '12px', paddingBottom: '4px' }}>{formatDate(data.invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', paddingRight: '16px', fontSize: '12px' }}>Total amount</td>
                <td style={{ fontWeight: 'bold', fontSize: '12px' }}>{formatMoney(total, data.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bill From + Tax Details ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', margin: '0 0 8px' }}>Bill From:</p>
          {[data.billFromName, data.billFromAddress, data.billFromCity, data.billFromZip, data.billFromCountry]
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} style={{ margin: '0 0 2px', fontSize: '12px' }}>{line}</p>
            ))}
        </div>
        <div>
          <p style={{ color: '#888', marginBottom: '8px', fontSize: '12px', margin: '0 0 8px' }}>Tax Details:</p>
          {data.taxDetails && <p style={{ margin: 0, fontSize: '12px' }}>{data.taxDetails}</p>}
        </div>
      </div>

      {/* ── Items table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#111', color: '#fff' }}>
            {[
              { label: 'DESCRIPTION', align: 'left' as const },
              { label: 'QTY (UNIT)', align: 'center' as const },
              { label: 'RATE', align: 'right' as const },
              { label: 'TOTAL', align: 'right' as const },
            ].map(({ label, align }) => (
              <th key={label} style={{ padding: '11px 14px', textAlign: align, fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px 14px', fontWeight: '600', fontSize: '12px' }}>{item.description}</td>
              <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px' }}>{item.qty} ({item.unit})</td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '12px' }}>{formatMoney(item.rate, data.currency)}</td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '12px' }}>{formatMoney(item.qty * item.rate, data.currency)}</td>
            </tr>
          ))}
          {/* VAT row */}
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td colSpan={2} style={{ padding: '10px 14px' }} />
            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#777', fontSize: '12px' }}>VAT</td>
            <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px' }}>{formatMoney(vat, data.currency)}</td>
          </tr>
          {/* Total Due row */}
          <tr style={{ borderBottom: '2px solid #111' }}>
            <td colSpan={2} style={{ padding: '10px 14px' }} />
            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#777', fontSize: '12px' }}>Total Due</td>
            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>{formatMoney(total, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Spacer ── */}
      <div style={{ flex: 1, minHeight: '60px' }} />

      {/* ── Footer ── */}
      <div style={{ marginTop: '48px' }}>
        {/* Contact + Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            {data.contact && (
              <p style={{ margin: 0, fontSize: '12px' }}>
                <strong>Contact:</strong> {data.contact}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '30px', fontWeight: '700', margin: 0, lineHeight: 1 }}>
              {data.billFromName || 'Your Company'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', fontSize: '12px' }}>
            <strong style={{ whiteSpace: 'nowrap' }}>Note</strong>
            <div style={{ whiteSpace: 'pre-line' }}>{data.notes}</div>
          </div>
        )}

        {/* Reference + Page number */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', paddingTop: '12px', fontSize: '10px', color: '#555' }}>
          {data.reference ? <span>REF: {data.reference}</span> : <span />}
          <span>PAGE 1 OUT OF 1</span>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '9px', color: '#aaa', margin: '6px 0 0' }}>
          The responsibility to ensure compliance and validity rests with the invoicing party.
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function InvoicePage() {
  const [data, setData] = useState<InvoiceData>(DEFAULT);
  const [showPreview, setShowPreview] = useState(false);

  const update = useCallback(<K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateItem = useCallback(<K extends keyof LineItem>(id: string, field: K, value: LineItem[K]) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }, []);

  const addItem = useCallback(() => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', qty: 1, unit: 'items', rate: 0 }],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  }, []);

  const subtotal = data.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const vat = subtotal * (data.vatRate / 100);
  const total = subtotal + vat;

  return (
    <>
      {/* ── Print layout — always rendered, only shows when printing ── */}
      <div className="print-only" style={{ width: '210mm' }}>
        <InvoiceContent data={data} />
      </div>

      {/* ── App UI ── */}
      <div className="no-print min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

        {/* Sticky header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Invoice Generator</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">{data.invoiceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 012-2h6a2 2 0 012 2v2" />
                </svg>
                <span className="hidden sm:inline">Print / Save PDF</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          </div>
        </header>

        {/* Form body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">

          {/* ── Invoice Details ── */}
          <Card title="Invoice Details">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={lbl}>Invoice #</label>
                <input className={inp} value={data.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} placeholder="EINV-2026-01" />
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select className={inp} value={data.status} onChange={(e) => update('status', e.target.value as Status)}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Invoice Date</label>
                <input type="date" className={inp} value={data.invoiceDate} onChange={(e) => update('invoiceDate', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Currency</label>
                <select className={inp} value={data.currency} onChange={(e) => update('currency', e.target.value)}>
                  <option value="USD">USD – US Dollar</option>
                  <option value="EUR">EUR – Euro</option>
                  <option value="GBP">GBP – British Pound</option>
                  <option value="BRL">BRL – Brazilian Real</option>
                  <option value="CAD">CAD – Canadian Dollar</option>
                  <option value="AUD">AUD – Australian Dollar</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">Status:</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[data.status]}`}>
                {data.status}
              </span>
            </div>
          </Card>

          {/* ── Addresses ── */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Card title="Bill From (You)">
              <AddressFields prefix="billFrom" data={data} onChange={(f, v) => update(f, v)} placeholder="Your company name" />
            </Card>
            <Card title="Bill To (Client)">
              <AddressFields prefix="billTo" data={data} onChange={(f, v) => update(f, v)} placeholder="Client name or company" />
            </Card>
          </div>

          {/* ── Tax Details ── */}
          <Card title="Tax Details (Optional)">
            <div>
              <label className={lbl}>Tax Information</label>
              <input className={inp} value={data.taxDetails} onChange={(e) => update('taxDetails', e.target.value)} placeholder="e.g. VAT number, tax ID…" />
            </div>
          </Card>

          {/* ── Line Items ── */}
          <Card title="Line Items">
            {/* Column headers — desktop */}
            <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-3">
              {data.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-start bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3">
                  <div className="col-span-12 md:col-span-5">
                    <label className="md:hidden block mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Description</label>
                    <input className={inp} value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Service or product description" />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="md:hidden block mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Qty</label>
                    <input type="number" className={inp} value={item.qty} min={0} onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)} placeholder="1" />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="md:hidden block mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Unit</label>
                    <input className={inp} value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} placeholder="items" />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="md:hidden block mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Rate</label>
                    <input type="number" className={`${inp} text-right`} value={item.rate} min={0} step={0.01} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                  </div>
                  <div className="col-span-1 flex items-center justify-center pt-1 md:pt-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={data.items.length === 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Line total */}
                  <div className="col-span-12 flex justify-end items-center gap-1 px-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">= </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {formatMoney(item.qty * item.rate, data.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add item */}
            <button onClick={addItem} className="mt-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Line Item
            </button>

            {/* Totals */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{formatMoney(subtotal, data.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">VAT (%)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={data.vatRate}
                      min={0}
                      max={100}
                      step={0.1}
                      onChange={(e) => update('vatRate', parseFloat(e.target.value) || 0)}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-200 w-28 text-right">{formatMoney(vat, data.currency)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white">Total Due</span>
                  <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{formatMoney(total, data.currency)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Footer Details ── */}
          <Card title="Footer Details">
            <div className="space-y-4">
              <div>
                <label className={lbl}>Contact</label>
                <input className={inp} value={data.contact} onChange={(e) => update('contact', e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className={lbl}>Notes</label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={4}
                  value={data.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder={'- Contract value\n- English lessons\n- Health Related Expenses'}
                />
              </div>
              <div>
                <label className={lbl}>Reference ID</label>
                <input className={inp} value={data.reference} onChange={(e) => update('reference', e.target.value)} placeholder="e.g. a2bbb9c8-ce9e-4798-bdd8-25453930b2ad" />
              </div>
            </div>
          </Card>

          {/* ── Bottom actions ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pb-10">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Invoice
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 012-2h6a2 2 0 012 2v2" />
              </svg>
              Print / Save as PDF
            </button>
          </div>
        </main>
      </div>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div
          className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Invoice Preview</h3>
                <p className="text-xs text-gray-400 mt-0.5">This is how your invoice will look when printed</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowPreview(false); setTimeout(() => window.print(), 150); }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 012-2h6a2 2 0 012 2v2" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scaled invoice preview */}
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-b-2xl overflow-auto">
              <div className="origin-top-left" style={{ transform: 'scale(0.72)', width: '138.9%', transformOrigin: 'top left' }}>
                <div className="shadow-xl rounded overflow-hidden">
                  <InvoiceContent data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
