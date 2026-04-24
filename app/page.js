'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ClipboardList, Home, Wrench, GlassWater, FileText, Camera, Send, Save, Download, Printer, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const STORAGE_KEY = 'gtw-window-door-survey-v1';
const OFFICE_EMAIL = 'office@guernseytradewindows.net';

const hingeItems = ['Top Hung 8"', 'Top Hung 10"', 'Top Hung 12"', 'Top Hung 16"', 'Side Hung 12"', 'Side Hung 16"', '12" Egress', '16" Egress'];
const handleItems = ['Espag Handle', 'Cockspur', 'Tilt & Turn', 'Other Handle'];
const lockItems = ['Multipoint Lock', 'Gearbox Only', 'Window Lock', 'Other Lock / Mechanism'];
const otherItems = ['Restrictor', 'Gasket / Seal', 'Letterbox', 'Other Component'];

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now() + Math.random());
}

function emptyGlassRow() {
  return { id: newId(), location: '', width: '', height: '', type: '', pattern: '', georgian: '', notes: '' };
}

function emptyRoom() {
  const qtyMap = (items) => Object.fromEntries(items.map((item) => [item, '']));
  return { id: newId(), name: '', hinges: qtyMap(hingeItems), handles: qtyMap(handleItems), locks: qtyMap(lockItems), other: qtyMap(otherItems), notes: '' };
}

function blankSurvey() {
  return {
    job: { customer: '', jobRef: '', quoteNo: '', orderNo: '', date: '', page: '' },
    glassRows: [emptyGlassRow(), emptyGlassRow(), emptyGlassRow()],
    rooms: [emptyRoom(), emptyRoom()],
    engineerNotes: '',
    sketchNotes: '',
    office: { quoteRef: '', totalJobTime: '' },
    photos: [],
  };
}

function Field({ label, value, onChange, placeholder = '', inputMode = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base shadow-sm outline-none focus:border-slate-900" />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base shadow-sm outline-none focus:border-slate-900" />
    </label>
  );
}

function QtyGrid({ title, items, values, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">{title}</h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label key={item} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
            <span className="text-sm font-medium text-slate-800">{item}</span>
            <input inputMode="numeric" value={values[item] || ''} onChange={(e) => onChange(item, e.target.value)} placeholder="Qty" className="h-11 w-20 rounded-lg border border-slate-300 px-2 text-center text-base outline-none focus:border-slate-900" />
          </label>
        ))}
      </div>
    </div>
  );
}

function downloadTextFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildOfficeEmail(survey) {
  const { job, glassRows, rooms, engineerNotes, sketchNotes, office } = survey;
  const glass = glassRows
    .filter((g) => Object.entries(g).some(([key, val]) => key !== 'id' && val))
    .map((g, i) => `${i + 1}. ${g.location || 'No location'} - ${g.width} x ${g.height} - ${g.type} - ${g.pattern} - ${g.georgian} - ${g.notes}`)
    .join('\n');

  const hardware = rooms.map((room, i) => {
    const lines = [];
    const addGroup = (name, group) => {
      const entries = Object.entries(group).filter(([, qty]) => qty);
      if (entries.length) lines.push(`${name}: ${entries.map(([item, qty]) => `${item} x ${qty}`).join(', ')}`);
    };
    addGroup('Hinges', room.hinges);
    addGroup('Handles', room.handles);
    addGroup('Locks', room.locks);
    addGroup('Other', room.other);
    if (room.notes) lines.push(`Notes: ${room.notes}`);
    return `Room ${i + 1}: ${room.name || 'Unnamed'}\n${lines.join('\n')}`;
  }).join('\n\n');

  const subject = `Survey - ${job.customer || 'Customer'} - ${job.jobRef || 'No Ref'}`;
  const body = `Customer: ${job.customer}\nJob Ref: ${job.jobRef}\nQuote No: ${job.quoteNo}\nOrder No: ${job.orderNo}\nDate: ${job.date}\n\nGLASS:\n${glass || 'None entered'}\n\nHARDWARE:\n${hardware || 'None entered'}\n\nENGINEER NOTES:\n${engineerNotes}\n\nSKETCH / GEORGIAN / LEAD NOTES:\n${sketchNotes}\n\nOFFICE:\nQuote Ref: ${office.quoteRef}\nTotal Job Time: ${office.totalJobTime}`;
  return `mailto:${OFFICE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function MobileWindowDoorSurveyApp() {
  const [survey, setSurvey] = useState(() => {
    if (typeof window === 'undefined') return blankSurvey();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved || !saved.trim()) return blankSurvey();
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? parsed : blankSurvey();
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      return blankSurvey();
    }
  });

  const { job, glassRows, rooms, engineerNotes, sketchNotes, office, photos } = survey;

  const totalHardwareQty = useMemo(() => rooms.reduce((sum, room) => {
    const groups = [room.hinges, room.handles, room.locks, room.other];
    return sum + groups.reduce((s, group) => s + Object.values(group).reduce((a, q) => a + (Number(q) || 0), 0), 0);
  }, 0), [rooms]);

  const saveSurvey = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
    alert('Survey saved on this device.');
  };

  const resetSurvey = () => {
    if (!confirm('Start a blank survey? This clears the current form on this device.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setSurvey(blankSurvey());
  };

  const exportJson = () => {
    const safeName = `${job.customer || 'survey'}-${job.jobRef || 'no-ref'}`.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    downloadTextFile(`${safeName}.json`, JSON.stringify(survey, null, 2));
  };

  const updateJob = (key, value) => setSurvey((prev) => ({ ...prev, job: { ...prev.job, [key]: value } }));
  const updateOffice = (key, value) => setSurvey((prev) => ({ ...prev, office: { ...prev.office, [key]: value } }));
  const updateGlass = (id, key, value) => setSurvey((prev) => ({ ...prev, glassRows: prev.glassRows.map((row) => (row.id === id ? { ...row, [key]: value } : row)) }));
  const addGlassRow = () => setSurvey((prev) => ({ ...prev, glassRows: [...prev.glassRows, emptyGlassRow()] }));
  const removeGlassRow = (id) => setSurvey((prev) => ({ ...prev, glassRows: prev.glassRows.filter((row) => row.id !== id) }));
  const addRoom = () => setSurvey((prev) => ({ ...prev, rooms: [...prev.rooms, emptyRoom()] }));
  const removeRoom = (id) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.filter((room) => room.id !== id) }));
  const updateRoomName = (id, value) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((r) => (r.id === id ? { ...r, name: value } : r)) }));
  const updateRoomQty = (id, group, item, value) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((room) => room.id === id ? { ...room, [group]: { ...room[group], [item]: value } } : room) }));
  const updateRoomNotes = (id, value) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((r) => (r.id === id ? { ...r, notes: value } : r)) }));

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    const readFile = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: newId(), name: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    });
    const uploaded = await Promise.all(files.map(readFile));
    setSurvey((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
  };

  const removePhoto = (id) => setSurvey((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== id) }));

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-900 print:bg-white sm:px-6">
      <style>{`@media print { .no-print { display: none !important; } .print-break { break-inside: avoid; page-break-inside: avoid; } body { background: white; } }`}</style>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur print:static print:border-black print:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight">Guernsey Trade Windows</h1>
              <p className="text-sm font-semibold text-slate-700">Window & Door Service Survey</p>
              <p className="text-xs text-slate-500 no-print">Mobile form with save, photos, print/export and office email handoff.</p>
            </div>
            <div className="rounded-xl bg-slate-900 px-3 py-2 text-right text-white print:bg-white print:text-black print:ring-1 print:ring-black"><div className="text-xs opacity-80">Items</div><div className="text-lg font-bold">{totalHardwareQty}</div></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 no-print sm:grid-cols-5">
            <Button onClick={saveSurvey} className="h-11 rounded-xl"><Save className="mr-1 h-4 w-4" /> Save</Button>
            <Button onClick={() => window.print()} variant="outline" className="h-11 rounded-xl"><Printer className="mr-1 h-4 w-4" /> PDF</Button>
            <Button onClick={exportJson} variant="outline" className="h-11 rounded-xl"><Download className="mr-1 h-4 w-4" /> Export</Button>
            <Button asChild variant="outline" className="h-11 rounded-xl"><a href={buildOfficeEmail(survey)}><Send className="mr-1 h-4 w-4" /> Email</a></Button>
            <Button onClick={resetSurvey} variant="outline" className="h-11 rounded-xl"><RotateCcw className="mr-1 h-4 w-4" /> New</Button>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm print-break print:shadow-none"><CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /><h2 className="text-lg font-bold">Job Details</h2></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Customer Name" value={job.customer} onChange={(v) => updateJob('customer', v)} />
            <Field label="Job Reference" value={job.jobRef} onChange={(v) => updateJob('jobRef', v)} />
            <Field label="Quote Number" value={job.quoteNo} onChange={(v) => updateJob('quoteNo', v)} />
            <Field label="Order Number" value={job.orderNo} onChange={(v) => updateJob('orderNo', v)} />
            <Field label="Date" value={job.date} onChange={(v) => updateJob('date', v)} placeholder="DD/MM/YYYY" />
            <Field label="Page" value={job.page} onChange={(v) => updateJob('page', v)} placeholder="1 of 2" />
          </div>
        </CardContent></Card>

        <Card className="rounded-2xl shadow-sm print:shadow-none"><CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><GlassWater className="h-5 w-5" /><h2 className="text-lg font-bold">Glass / Double-Glazed Units</h2></div><Button onClick={addGlassRow} className="rounded-xl no-print"><Plus className="mr-1 h-4 w-4" /> Add</Button></div>
          {glassRows.map((row, index) => <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 print-break print:bg-white"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Glass Unit {index + 1}</h3>{glassRows.length > 1 && <button onClick={() => removeGlassRow(row.id)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600 no-print"><Trash2 className="h-4 w-4" /></button>}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Location" value={row.location} onChange={(v) => updateGlass(row.id, 'location', v)} placeholder="Kitchen window" /><div className="grid grid-cols-2 gap-3"><Field label="Width mm" value={row.width} onChange={(v) => updateGlass(row.id, 'width', v)} inputMode="numeric" /><Field label="Height mm" value={row.height} onChange={(v) => updateGlass(row.id, 'height', v)} inputMode="numeric" /></div><Field label="Type" value={row.type} onChange={(v) => updateGlass(row.id, 'type', v)} placeholder="Clear / Low-E / Pattern" /><Field label="Pattern / Design" value={row.pattern} onChange={(v) => updateGlass(row.id, 'pattern', v)} /><Field label="Georgian / Lead" value={row.georgian} onChange={(v) => updateGlass(row.id, 'georgian', v)} /><Field label="Notes" value={row.notes} onChange={(v) => updateGlass(row.id, 'notes', v)} /></div></div>)}
        </CardContent></Card>

        <Card className="rounded-2xl shadow-sm print:shadow-none"><CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Home className="h-5 w-5" /><h2 className="text-lg font-bold">Rooms / Hardware</h2></div><Button onClick={addRoom} className="rounded-xl no-print"><Plus className="mr-1 h-4 w-4" /> Room</Button></div>
          {rooms.map((room, index) => <div key={room.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 print-break"><div className="flex items-end gap-3"><div className="flex-1"><Field label={`Room / Area ${index + 1}`} value={room.name} onChange={(v) => updateRoomName(room.id, v)} placeholder="Kitchen / Lounge / Bedroom" /></div>{rooms.length > 1 && <button onClick={() => removeRoom(room.id)} className="mb-1 rounded-xl border border-slate-200 p-3 text-slate-500 hover:text-red-600 no-print"><Trash2 className="h-5 w-5" /></button>}</div><QtyGrid title="Hinges" items={hingeItems} values={room.hinges} onChange={(item, v) => updateRoomQty(room.id, 'hinges', item, v)} /><QtyGrid title="Handles" items={handleItems} values={room.handles} onChange={(item, v) => updateRoomQty(room.id, 'handles', item, v)} /><QtyGrid title="Locks / Mechanisms" items={lockItems} values={room.locks} onChange={(item, v) => updateRoomQty(room.id, 'locks', item, v)} /><QtyGrid title="Other Components" items={otherItems} values={room.other} onChange={(item, v) => updateRoomQty(room.id, 'other', item, v)} /><TextArea label="Room Notes" value={room.notes} onChange={(v) => updateRoomNotes(room.id, v)} placeholder="Anything unusual for this room/area" /></div>)}
        </CardContent></Card>

        <Card className="rounded-2xl shadow-sm print-break print:shadow-none"><CardContent className="space-y-4 p-4"><div className="flex items-center gap-2"><Wrench className="h-5 w-5" /><h2 className="text-lg font-bold">Engineer Notes</h2></div><TextArea label="Maintenance / Repair Requirements" value={engineerNotes} onChange={(v) => setSurvey((p) => ({ ...p, engineerNotes: v }))} placeholder="Urgent repairs, general maintenance, parts required..." /></CardContent></Card>

        <Card className="rounded-2xl shadow-sm print-break print:shadow-none"><CardContent className="space-y-4 p-4"><div className="flex items-center gap-2"><Camera className="h-5 w-5" /><h2 className="text-lg font-bold">Photos / Sketch / Lead / Georgian Bar Notes</h2></div><TextArea label="Sketch Description" value={sketchNotes} onChange={(v) => setSurvey((p) => ({ ...p, sketchNotes: v }))} placeholder="Describe bar layout or lead pattern." /><label className="block rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 no-print"><Camera className="mx-auto mb-2 h-8 w-8" />Tap to add site photos<input type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" /></label>{photos.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo) => <div key={photo.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={photo.dataUrl} alt={photo.name} className="h-32 w-full object-cover" /><button onClick={() => removePhoto(photo.id)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow no-print"><Trash2 className="h-4 w-4" /></button><p className="truncate px-2 py-1 text-xs text-slate-600">{photo.name}</p></div>)}</div>}</CardContent></Card>

        <Card className="rounded-2xl shadow-sm print-break print:shadow-none"><CardContent className="space-y-4 p-4"><div className="flex items-center gap-2"><FileText className="h-5 w-5" /><h2 className="text-lg font-bold">Office Use Only</h2></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Quote Ref" value={office.quoteRef} onChange={(v) => updateOffice('quoteRef', v)} /><Field label="Total Job Time" value={office.totalJobTime} onChange={(v) => updateOffice('totalJobTime', v)} placeholder="e.g. 4 hours" /></div></CardContent></Card>

        <div className="pb-8 no-print"><Button asChild className="h-14 w-full rounded-2xl text-base font-bold"><a href={buildOfficeEmail(survey)}><Send className="mr-2 h-5 w-5" /> Submit Survey to Office</a></Button><p className="mt-2 text-center text-xs text-slate-500">Saves locally, prints to PDF, exports JSON, stores photos locally, and opens a prepared office email.</p></div>
      </div>
    </div>
  );
}
