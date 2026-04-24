import React, { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  ClipboardList,
  Home,
  Wrench,
  GlassWater,
  FileText,
  Camera,
  Send,
  Save,
  Download,
  Printer,
  RotateCcw,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gtw-window-door-survey-v2";

const hingeItems = [
  "Top Hung 8\"",
  "Top Hung 10\"",
  "Top Hung 12\"",
  "Top Hung 16\"",
  "Side Hung 12\"",
  "Side Hung 16\"",
  "12\" Egress",
  "16\" Egress",
];

const handleItems = ["Espag Handle", "Cockspur", "Tilt & Turn", "Other Handle"];
const lockItems = ["Multipoint Lock", "Gearbox Only", "Window Lock", "Other Lock / Mechanism"];
const otherItems = ["Restrictor", "Gasket / Seal", "Letterbox", "Trickle Vent", "Other Component"];

const glassThicknessOptions = ["4/10/4 = 20mm", "4/16/4 = 24mm", "6/16/6 = 28mm", "Other"];
const spacerBarOptions = ["Black Spacer", "Silver Spacer", "Warm Edge Spacer", "Other"];
const decorativeBarOptions = ["None", "Black Swiss Bars", "All Colour Ali Bars", "Georgian Bars", "Lead Work", "Other"];
const glassTypeOptions = ["Clear", "Low-E", "Toughened", "Laminated", "Pattern", "Obscure", "Other"];

function todayUk() {
  return new Date().toLocaleDateString("en-GB");
}

function emptyGlassRow() {
  return {
    id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
    location: "",
    width: "",
    height: "",
    thickness: "4/16/4 = 24mm",
    type: "Clear",
    spacerBar: "Black Spacer",
    decorativeBar: "None",
    pattern: "",
    notes: "",
  };
}

function emptyRoom() {
  const qtyMap = (items) => Object.fromEntries(items.map((item) => [item, ""]));
  return {
    id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
    name: "",
    hinges: qtyMap(hingeItems),
    handles: qtyMap(handleItems),
    locks: qtyMap(lockItems),
    other: qtyMap(otherItems),
    notes: "",
  };
}

const initialSurvey = {
  job: { customer: "", jobRef: "", quoteNo: "", orderNo: "", date: todayUk(), page: "1 of 1" },
  glassRows: [emptyGlassRow(), emptyGlassRow(), emptyGlassRow()],
  rooms: [emptyRoom(), emptyRoom()],
  engineerNotes: "",
  sketchNotes: "",
  office: { quoteRef: "", totalJobTime: "" },
  photos: [],
};

function Field({ label, value, onChange, placeholder = "", inputMode = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      <input
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg shadow-sm outline-none focus:border-slate-900"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg shadow-sm outline-none focus:border-slate-900"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg shadow-sm outline-none focus:border-slate-900"
      />
    </label>
  );
}

function QtyGrid({ title, items, values, onChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-3 text-base font-black uppercase tracking-wide text-slate-700">{title}</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <label key={item} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="text-base font-bold text-slate-800">{item}</span>
            <input
              inputMode="numeric"
              value={values[item] || ""}
              onChange={(e) => onChange(item, e.target.value)}
              placeholder="Qty"
              className="h-14 w-24 rounded-2xl border border-slate-300 px-2 text-center text-lg font-bold outline-none focus:border-slate-900"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function downloadTextFile(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getHardwareLines(room) {
  const lines = [];
  const addGroup = (name, group) => {
    const entries = Object.entries(group).filter(([, qty]) => qty && Number(qty) !== 0);
    if (entries.length) lines.push(`${name}: ${entries.map(([item, qty]) => `${item} x ${qty}`).join(", ")}`);
  };
  addGroup("Hinges", room.hinges);
  addGroup("Handles", room.handles);
  addGroup("Locks", room.locks);
  addGroup("Other", room.other);
  if (room.notes) lines.push(`Notes: ${room.notes}`);
  return lines;
}

function buildOfficeEmail(survey, summary) {
  const { job, glassRows, rooms, engineerNotes, sketchNotes, office } = survey;
  const glass = glassRows
    .filter((g) => [g.location, g.width, g.height, g.notes].some(Boolean))
    .map((g, i) => `${i + 1}. ${g.location || "No location"} - ${g.width} x ${g.height} - ${g.thickness} - ${g.type} - ${g.spacerBar} - ${g.decorativeBar} - ${g.pattern} - ${g.notes}`)
    .join("%0D%0A");

  const hardware = rooms
    .map((room, i) => `Room ${i + 1}: ${room.name || "Unnamed"}%0D%0A${getHardwareLines(room).join("%0D%0A")}`)
    .join("%0D%0A%0D%0A");

  const subject = encodeURIComponent(`Survey - ${job.customer || "Customer"} - ${job.jobRef || "No Ref"}`);
  const body = `Customer: ${job.customer}%0D%0AJob Ref: ${job.jobRef}%0D%0AQuote No: ${job.quoteNo}%0D%0AOrder No: ${job.orderNo}%0D%0ADate: ${job.date}%0D%0A%0D%0ASUMMARY:%0D%0AGlass Units: ${summary.glassCount}%0D%0AHardware Items: ${summary.totalHardwareQty}%0D%0APhotos: ${summary.photoCount}%0D%0A%0D%0AGLASS:%0D%0A${glass || "None entered"}%0D%0A%0D%0AHARDWARE:%0D%0A${hardware || "None entered"}%0D%0A%0D%0AENGINEER NOTES:%0D%0A${encodeURIComponent(engineerNotes)}%0D%0A%0D%0ASKETCH / GEORGIAN / LEAD NOTES:%0D%0A${encodeURIComponent(sketchNotes)}%0D%0A%0D%0AOFFICE:%0D%0AQuote Ref: ${office.quoteRef}%0D%0ATotal Job Time: ${office.totalJobTime}%0D%0A%0D%0ANote: photos are held in the app/export and should be uploaded/sent separately unless a backend is added.`;
  return `mailto:office@guernseytradewindows.net?subject=${subject}&body=${body}`;
}

export default function MobileWindowDoorSurveyApp() {
  const [survey, setSurvey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialSurvey;
    } catch {
      return initialSurvey;
    }
  });

  const { job, glassRows, rooms, engineerNotes, sketchNotes, office, photos } = survey;

  const summary = useMemo(() => {
    const totalHardwareQty = rooms.reduce((sum, room) => {
      const groups = [room.hinges, room.handles, room.locks, room.other];
      return sum + groups.reduce((s, group) => s + Object.values(group).reduce((a, q) => a + (Number(q) || 0), 0), 0);
    }, 0);

    const parts = {};
    rooms.forEach((room) => {
      [room.hinges, room.handles, room.locks, room.other].forEach((group) => {
        Object.entries(group).forEach(([item, qty]) => {
          const n = Number(qty) || 0;
          if (n > 0) parts[item] = (parts[item] || 0) + n;
        });
      });
    });

    const glassCount = glassRows.filter((g) => [g.location, g.width, g.height, g.notes].some(Boolean)).length;

    return { totalHardwareQty, parts, glassCount, photoCount: photos.length };
  }, [rooms, glassRows, photos]);

  const saveSurvey = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
    alert("Survey saved on this device.");
  };

  const resetSurvey = () => {
    if (!confirm("Start a blank survey? This clears the current form on this device.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSurvey({ ...initialSurvey, job: { ...initialSurvey.job, date: todayUk() }, glassRows: [emptyGlassRow(), emptyGlassRow(), emptyGlassRow()], rooms: [emptyRoom(), emptyRoom()], photos: [] });
  };

  const exportJson = () => {
    const safeName = `${job.customer || "survey"}-${job.jobRef || "no-ref"}`.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    downloadTextFile(`${safeName}.json`, JSON.stringify({ ...survey, summary }, null, 2));
  };

  const printSurvey = () => window.print();

  const updateJob = (key, value) => setSurvey((prev) => ({ ...prev, job: { ...prev.job, [key]: value } }));
  const updateOffice = (key, value) => setSurvey((prev) => ({ ...prev, office: { ...prev.office, [key]: value } }));

  const updateGlass = (id, key, value) => {
    setSurvey((prev) => ({
      ...prev,
      glassRows: prev.glassRows.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
  };

  const addGlassRow = () => setSurvey((prev) => ({ ...prev, glassRows: [...prev.glassRows, emptyGlassRow()] }));
  const removeGlassRow = (id) => setSurvey((prev) => ({ ...prev, glassRows: prev.glassRows.filter((row) => row.id !== id) }));

  const addRoom = () => setSurvey((prev) => ({ ...prev, rooms: [...prev.rooms, emptyRoom()] }));
  const duplicateRoom = (room) => {
    const copy = JSON.parse(JSON.stringify(room));
    copy.id = crypto.randomUUID?.() || String(Date.now() + Math.random());
    copy.name = `${room.name || "Room"} copy`;
    setSurvey((prev) => ({ ...prev, rooms: [...prev.rooms, copy] }));
  };
  const removeRoom = (id) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.filter((room) => room.id !== id) }));

  const updateRoomName = (id, value) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((r) => (r.id === id ? { ...r, name: value } : r)) }));

  const updateRoomQty = (id, group, item, value) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === id ? { ...room, [group]: { ...room[group], [item]: value } } : room
      ),
    }));
  };

  const updateRoomNotes = (id, value) => setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((r) => (r.id === id ? { ...r, notes: value } : r)) }));

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    const readFile = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ id: crypto.randomUUID?.() || String(Date.now() + Math.random()), name: file.name, dataUrl: reader.result });
        reader.readAsDataURL(file);
      });
    const uploaded = await Promise.all(files.map(readFile));
    setSurvey((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
  };

  const removePhoto = (id) => setSurvey((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== id) }));

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-slate-900 print:bg-white sm:px-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { break-inside: avoid; page-break-inside: avoid; }
          body { background: white; }
          input, textarea, select { border: 1px solid #111 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-3xl space-y-4">
        <div className="sticky top-0 z-10 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur print:static print:border-black print:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black leading-tight">Guernsey Trade Windows</h1>
              <p className="text-base font-bold text-slate-700">Window & Door Service Survey</p>
              <p className="text-xs text-slate-500 no-print">Live mobile form with glass specs, camera photos, summary, print/export and email handoff.</p>
            </div>
            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white print:bg-white print:text-black print:ring-1 print:ring-black">
              <div className="text-xs opacity-80">Items</div>
              <div className="text-2xl font-black">{summary.totalHardwareQty}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 no-print sm:grid-cols-5">
            <Button onClick={saveSurvey} className="h-14 rounded-2xl text-base font-bold"><Save className="mr-1 h-5 w-5" /> Save</Button>
            <Button onClick={printSurvey} variant="outline" className="h-14 rounded-2xl text-base font-bold"><Printer className="mr-1 h-5 w-5" /> PDF</Button>
            <Button onClick={exportJson} variant="outline" className="h-14 rounded-2xl text-base font-bold"><Download className="mr-1 h-5 w-5" /> Export</Button>
            <Button asChild variant="outline" className="h-14 rounded-2xl text-base font-bold"><a href={buildOfficeEmail(survey, summary)}><Send className="mr-1 h-5 w-5" /> Email</a></Button>
            <Button onClick={resetSurvey} variant="outline" className="h-14 rounded-2xl text-base font-bold"><RotateCcw className="mr-1 h-5 w-5" /> New</Button>
          </div>
        </div>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              <h2 className="text-xl font-black">Job Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Customer Name" value={job.customer} onChange={(v) => updateJob("customer", v)} />
              <Field label="Job Reference" value={job.jobRef} onChange={(v) => updateJob("jobRef", v)} />
              <Field label="Quote Number" value={job.quoteNo} onChange={(v) => updateJob("quoteNo", v)} />
              <Field label="Order Number" value={job.orderNo} onChange={(v) => updateJob("orderNo", v)} />
              <Field label="Date" value={job.date} onChange={(v) => updateJob("date", v)} placeholder="DD/MM/YYYY" />
              <Field label="Page" value={job.page} onChange={(v) => updateJob("page", v)} placeholder="1 of 2" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <h2 className="text-xl font-black">Auto Summary</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-2xl font-black">{summary.glassCount}</div><div className="text-xs font-bold text-slate-500">Glass Units</div></div>
              <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-2xl font-black">{summary.totalHardwareQty}</div><div className="text-xs font-bold text-slate-500">Hardware Qty</div></div>
              <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-2xl font-black">{summary.photoCount}</div><div className="text-xs font-bold text-slate-500">Photos</div></div>
            </div>
            {Object.keys(summary.parts).length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="mb-2 font-black">Parts Summary</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(summary.parts).map(([item, qty]) => (
                    <div key={item} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm font-bold">
                      <span>{item}</span><span>x {qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GlassWater className="h-6 w-6" />
                <h2 className="text-xl font-black">Glass / Double-Glazed Units</h2>
              </div>
              <Button onClick={addGlassRow} className="h-14 rounded-2xl px-5 text-base font-bold no-print">
                <Plus className="mr-1 h-5 w-5" /> Add
              </Button>
            </div>

            {glassRows.map((row, index) => (
              <div key={row.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 print-break print:bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-black">Glass Unit {index + 1}</h3>
                  {glassRows.length > 1 && (
                    <button onClick={() => removeGlassRow(row.id)} className="rounded-2xl p-3 text-slate-500 hover:bg-white hover:text-red-600 no-print">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Location" value={row.location} onChange={(v) => updateGlass(row.id, "location", v)} placeholder="Kitchen window" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Width mm" value={row.width} onChange={(v) => updateGlass(row.id, "width", v)} inputMode="numeric" />
                    <Field label="Height mm" value={row.height} onChange={(v) => updateGlass(row.id, "height", v)} inputMode="numeric" />
                  </div>
                  <SelectField label="Unit Thickness" value={row.thickness} onChange={(v) => updateGlass(row.id, "thickness", v)} options={glassThicknessOptions} />
                  <SelectField label="Glass Type" value={row.type} onChange={(v) => updateGlass(row.id, "type", v)} options={glassTypeOptions} />
                  <SelectField label="Spacer Bar" value={row.spacerBar} onChange={(v) => updateGlass(row.id, "spacerBar", v)} options={spacerBarOptions} />
                  <SelectField label="Bars / Lead" value={row.decorativeBar} onChange={(v) => updateGlass(row.id, "decorativeBar", v)} options={decorativeBarOptions} />
                  <Field label="Pattern / Design" value={row.pattern} onChange={(v) => updateGlass(row.id, "pattern", v)} />
                  <Field label="Notes" value={row.notes} onChange={(v) => updateGlass(row.id, "notes", v)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6" />
                <h2 className="text-xl font-black">Rooms / Hardware</h2>
              </div>
              <Button onClick={addRoom} className="h-14 rounded-2xl px-5 text-base font-bold no-print">
                <Plus className="mr-1 h-5 w-5" /> Room
              </Button>
            </div>

            {rooms.map((room, index) => (
              <div key={room.id} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 print-break">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field label={`Room / Area ${index + 1}`} value={room.name} onChange={(v) => updateRoomName(room.id, v)} placeholder="Kitchen / Lounge / Bedroom" />
                  </div>
                  <button onClick={() => duplicateRoom(room)} className="mb-1 rounded-2xl border border-slate-200 p-4 text-slate-600 hover:bg-slate-50 no-print" title="Duplicate room">
                    <Copy className="h-6 w-6" />
                  </button>
                  {rooms.length > 1 && (
                    <button onClick={() => removeRoom(room.id)} className="mb-1 rounded-2xl border border-slate-200 p-4 text-slate-500 hover:text-red-600 no-print">
                      <Trash2 className="h-6 w-6" />
                    </button>
                  )}
                </div>

                <QtyGrid title="Hinges" items={hingeItems} values={room.hinges} onChange={(item, v) => updateRoomQty(room.id, "hinges", item, v)} />
                <QtyGrid title="Handles" items={handleItems} values={room.handles} onChange={(item, v) => updateRoomQty(room.id, "handles", item, v)} />
                <QtyGrid title="Locks / Mechanisms" items={lockItems} values={room.locks} onChange={(item, v) => updateRoomQty(room.id, "locks", item, v)} />
                <QtyGrid title="Other Components" items={otherItems} values={room.other} onChange={(item, v) => updateRoomQty(room.id, "other", item, v)} />
                <TextArea label="Room Notes" value={room.notes} onChange={(v) => updateRoomNotes(room.id, v)} placeholder="Anything unusual for this room/area" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              <h2 className="text-xl font-black">Engineer Notes</h2>
            </div>
            <TextArea label="Maintenance / Repair Requirements" value={engineerNotes} onChange={(v) => setSurvey((p) => ({ ...p, engineerNotes: v }))} placeholder="Urgent repairs, general maintenance, parts required..." />
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              <h2 className="text-xl font-black">Photos / Sketch / Lead / Georgian Bar Notes</h2>
            </div>
            <TextArea label="Sketch Description" value={sketchNotes} onChange={(v) => setSurvey((p) => ({ ...p, sketchNotes: v }))} placeholder="Describe bar layout or lead pattern." />
            <label className="block rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center text-base font-bold text-slate-700 no-print">
              <Camera className="mx-auto mb-3 h-10 w-10" />
              Tap to take photos or upload from device
              <input type="file" accept="image/*" capture="environment" multiple onChange={addPhotos} className="hidden" />
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img src={photo.dataUrl} alt={photo.name} className="h-36 w-full object-cover" />
                    <button onClick={() => removePhoto(photo.id)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow no-print">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="truncate px-2 py-1 text-xs text-slate-600">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <h2 className="text-xl font-black">Office Use Only</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Quote Ref" value={office.quoteRef} onChange={(v) => updateOffice("quoteRef", v)} />
              <Field label="Total Job Time" value={office.totalJobTime} onChange={(v) => updateOffice("totalJobTime", v)} placeholder="e.g. 4 hours" />
            </div>
          </CardContent>
        </Card>

        <div className="pb-8 no-print">
          <Button asChild className="h-16 w-full rounded-3xl text-lg font-black">
            <a href={buildOfficeEmail(survey, summary)}>
              <Send className="mr-2 h-6 w-6" /> Submit Survey to Office
            </a>
          </Button>
          <p className="mt-2 text-center text-xs text-slate-500">
            Photos can be captured from the device. For automatic photo/email attachment and office dashboard storage, add a backend next.
          </p>
        </div>
      </div>
    </div>
  );
}
