"use client";

"use client";

import React, { useMemo, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

const Button = ({ children, className = "", onClick, variant, asChild, ...props }) => {
  const base =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-900 px-4 py-2"
      : "bg-slate-900 text-white px-4 py-2";

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${base} ${className} inline-flex items-center justify-center`,
      ...props,
    });
  }

  return (
    <button onClick={onClick} className={`${base} ${className} inline-flex items-center justify-center`} {...props}>
      {children}
    </button>
  );
};

const STORAGE_KEY = "gtw-window-door-survey-v3";

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

const handleItems = [
  "White Espag Handle",
  "Black Espag Handle",
  "Chrome Espag Handle",
  "Gold Espag Handle",
  "Cockspur Handle",
  "Tilt & Turn Handle",
  "Patio Handle",
  "Door Handle Set",
  "Other Handle",
];

const lockItems = [
  "Multipoint Lock",
  "Gearbox Only",
  "Window Lock",
  "Shootbolt Gearbox",
  "Espag Mechanism",
  "Door Cylinder",
  "Patio Door Lock",
  "Other Lock / Mechanism",
];

const otherItems = [
  "Restrictor",
  "Gasket / Seal",
  "Letterbox",
  "Trickle Vent",
  "Door Hinge",
  "Keeps",
  "Striker Plate",
  "Drainage Cap",
  "Screw Cover Cap",
  "Other Component",
];

const paneThicknessOptions = ["4mm", "6mm", "6.4mm Laminated", "8mm", "10mm", "Other"];
const spacerSizeOptions = ["6mm", "8mm", "10mm", "12mm", "14mm", "16mm", "18mm", "20mm", "Other"];
const spacerBarOptions = ["Black Spacer", "Silver Spacer", "Warm Edge Spacer", "Black Swiss Spacer", "Ali Spacer (Any Colour)", "Other"];
const decorativeBarOptions = ["None", "Black Swiss Bars", "All Colour Ali Bars", "Georgian Bars", "Lead Work", "Other"];
const glassTypeOptions = ["Clear", "Low-E", "Toughened", "Laminated", "Pattern", "Obscure", "Other"];

function todayUk() {
  return new Date().toLocaleDateString("en-GB");
}

function mmNumber(value) {
  const match = String(value || "").match(/[0-9.]+/);
  return match ? Number(match[0]) : 0;
}

function calculateOverallThickness(outerPane, spacerSize, innerPane) {
  const total = mmNumber(outerPane) + mmNumber(spacerSize) + mmNumber(innerPane);
  return total ? `${total}mm` : "";
}

function makeId() {
  return crypto.randomUUID?.() || String(Date.now() + Math.random());
}

function emptyGlassRow() {
  return {
    id: makeId(),
    location: "",
    width: "",
    height: "",
    outerPane: "4mm",
    spacerSize: "16mm",
    innerPane: "4mm",
    overallThickness: "24mm",
    type: "Clear",
    spacerBar: "Black Spacer",
    decorativeBar: "None",
    pattern: "",
    notes: "",
    sketchImage: "",
  };
}

function emptyRoom() {
  const qtyMap = (items) => Object.fromEntries(items.map((item) => [item, ""]));
  return {
    id: makeId(),
    name: "",
    hinges: qtyMap(hingeItems),
    handles: qtyMap(handleItems),
    locks: qtyMap(lockItems),
    other: qtyMap(otherItems),
    notes: "",
  };
}

function getInitialSurvey() {
  return {
    job: { customer: "", jobRef: "", quoteNo: "", orderNo: "", date: todayUk(), page: "1 of 1" },
    glassRows: [emptyGlassRow()],
    rooms: [emptyRoom()],
    engineerNotes: "",
    sketchNotes: "",
    office: { quoteRef: "", totalJobTime: "" },
    photos: [],
  };
}

function Field({ label, value, onChange, placeholder = "", inputMode = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      <input
        inputMode={inputMode}
        value={value || ""}
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
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg shadow-sm outline-none focus:border-slate-900"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
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
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg shadow-sm outline-none focus:border-slate-900"
      />
    </label>
  );
}

function SketchPad({ value, onChange, title = "Sketch Pad" }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const loadExisting = () => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = value;
  };

  const saveSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const startDrawing = (event) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(event);
    isDrawingRef.current = true;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveSketch();
  };

  const clearSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="rounded-3xl border border-slate-300 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="text-xs text-slate-500">Use finger, stylus or Apple Pencil.</p>
        </div>
        <button onClick={clearSketch} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 no-print">
          Clear
        </button>
      </div>
      <canvas
        ref={(node) => {
          canvasRef.current = node;
          setTimeout(loadExisting, 0);
        }}
        width={900}
        height={520}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="h-72 w-full touch-none rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50"
      />
      {value && <p className="mt-2 text-xs font-bold text-green-700">Sketch saved.</p>}
    </div>
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
    const entries = Object.entries(group || {}).filter(([, qty]) => qty && Number(qty) !== 0);
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
    .map(
      (g, i) =>
        `${i + 1}. ${g.location || "No location"} - ${g.width} x ${g.height} - ${g.outerPane}/${g.spacerSize}/${g.innerPane} = ${g.overallThickness} - ${g.type} - ${g.spacerBar} - ${g.decorativeBar} - ${g.pattern} - ${g.notes}`
    )
    .join("%0D%0A");

  const hardware = rooms
    .map((room, i) => `Room ${i + 1}: ${room.name || "Unnamed"}%0D%0A${getHardwareLines(room).join("%0D%0A")}`)
    .join("%0D%0A%0D%0A");

  const subject = encodeURIComponent(`Survey - ${job.customer || "Customer"} - ${job.jobRef || "No Ref"}`);
  const body = `Customer: ${job.customer}%0D%0AJob Ref: ${job.jobRef}%0D%0AQuote No: ${job.quoteNo}%0D%0AOrder No: ${job.orderNo}%0D%0ADate: ${job.date}%0D%0A%0D%0ASUMMARY:%0D%0AGlass Units: ${summary.glassCount}%0D%0AHardware Items: ${summary.totalHardwareQty}%0D%0APhotos: ${summary.photoCount}%0D%0A%0D%0AGLASS:%0D%0A${glass || "None entered"}%0D%0A%0D%0AHARDWARE:%0D%0A${hardware || "None entered"}%0D%0A%0D%0AENGINEER NOTES:%0D%0A${encodeURIComponent(engineerNotes)}%0D%0A%0D%0ASKETCH / GENERAL NOTES:%0D%0A${encodeURIComponent(sketchNotes)}%0D%0A%0D%0AOFFICE:%0D%0AQuote Ref: ${office.quoteRef}%0D%0ATotal Job Time: ${office.totalJobTime}`;
  return `mailto:office@guernseytradewindows.net?subject=${subject}&body=${body}`;
}

export default function MobileWindowDoorSurveyApp() {
  const [survey, setSurvey] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : getInitialSurvey();
    } catch {
      return getInitialSurvey();
    }
  });

  const [activeGlassIndex, setActiveGlassIndex] = useState(0);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const { job, glassRows, rooms, engineerNotes, sketchNotes, office, photos } = survey;
  const activeGlass = glassRows[Math.min(activeGlassIndex, glassRows.length - 1)] || glassRows[0];
  const activeRoom = rooms[Math.min(activeRoomIndex, rooms.length - 1)] || rooms[0];

  const summary = useMemo(() => {
    const totalHardwareQty = rooms.reduce((sum, room) => {
      const groups = [room.hinges, room.handles, room.locks, room.other];
      return sum + groups.reduce((s, group) => s + Object.values(group || {}).reduce((a, q) => a + (Number(q) || 0), 0), 0);
    }, 0);

    const parts = {};
    rooms.forEach((room) => {
      [room.hinges, room.handles, room.locks, room.other].forEach((group) => {
        Object.entries(group || {}).forEach(([item, qty]) => {
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
    setSurvey(getInitialSurvey());
    setActiveGlassIndex(0);
    setActiveRoomIndex(0);
  };

  const exportJson = () => {
    const safeName = `${job.customer || "survey"}-${job.jobRef || "no-ref"}`.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
    downloadTextFile(`${safeName}.json`, JSON.stringify({ ...survey, summary }, null, 2));
  };

  const updateJob = (key, value) => setSurvey((prev) => ({ ...prev, job: { ...prev.job, [key]: value } }));
  const updateOffice = (key, value) => setSurvey((prev) => ({ ...prev, office: { ...prev.office, [key]: value } }));

  const updateGlass = (id, key, value) => {
    setSurvey((prev) => ({
      ...prev,
      glassRows: prev.glassRows.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [key]: value };
        if (["outerPane", "spacerSize", "innerPane"].includes(key)) {
          updated.overallThickness = calculateOverallThickness(updated.outerPane, updated.spacerSize, updated.innerPane);
        }
        return updated;
      }),
    }));
  };

  const addGlassRow = () => {
    const row = emptyGlassRow();
    setSurvey((prev) => ({ ...prev, glassRows: [...prev.glassRows, row] }));
    setActiveGlassIndex(glassRows.length);
  };

  const removeGlassRow = (id) => {
    if (glassRows.length === 1) return;
    setSurvey((prev) => ({ ...prev, glassRows: prev.glassRows.filter((row) => row.id !== id) }));
    setActiveGlassIndex((i) => Math.max(0, i - 1));
  };

  const addRoom = () => {
    const room = emptyRoom();
    setSurvey((prev) => ({ ...prev, rooms: [...prev.rooms, room] }));
    setActiveRoomIndex(rooms.length);
  };

  const duplicateRoom = (room) => {
    const copy = JSON.parse(JSON.stringify(room));
    copy.id = makeId();
    copy.name = `${room.name || "Room"} copy`;
    setSurvey((prev) => ({ ...prev, rooms: [...prev.rooms, copy] }));
    setActiveRoomIndex(rooms.length);
  };

  const removeRoom = (id) => {
    if (rooms.length === 1) return;
    setSurvey((prev) => ({ ...prev, rooms: prev.rooms.filter((room) => room.id !== id) }));
    setActiveRoomIndex((i) => Math.max(0, i - 1));
  };

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
        reader.onload = () => resolve({ id: makeId(), name: file.name, dataUrl: reader.result });
        reader.readAsDataURL(file);
      });
    const uploaded = await Promise.all(files.map(readFile));
    setSurvey((prev) => ({ ...prev, photos: [...prev.photos, ...uploaded] }));
  };

  const removePhoto = (id) => setSurvey((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== id) }));

  const glassLabel = activeGlass?.location ? activeGlass.location : `Glass Unit ${activeGlassIndex + 1}`;
  const roomLabel = activeRoom?.name ? activeRoom.name : `Room / Area ${activeRoomIndex + 1}`;

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
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm print:border-black print:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black leading-tight">Guernsey Trade Windows</h1>
              <p className="text-base font-bold text-slate-700">Window & Door Service Survey</p>
              <p className="text-xs text-slate-500 no-print">One active glass unit and one room at a time to reduce scrolling.</p>
            </div>
            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white print:bg-white print:text-black print:ring-1 print:ring-black">
              <div className="text-xs opacity-80">Items</div>
              <div className="text-2xl font-black">{summary.totalHardwareQty}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 no-print sm:grid-cols-5">
            <Button onClick={saveSurvey} className="h-14 rounded-2xl text-base font-bold"><Save className="mr-1 h-5 w-5" /> Save</Button>
            <Button onClick={() => window.print()} variant="outline" className="h-14 rounded-2xl text-base font-bold"><Printer className="mr-1 h-5 w-5" /> PDF</Button>
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
                <h2 className="text-xl font-black">Glass</h2>
              </div>
              <Button onClick={addGlassRow} className="h-14 rounded-2xl px-5 text-base font-bold no-print">
                <Plus className="mr-1 h-5 w-5" /> Add Glass
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 no-print">
              <button disabled={activeGlassIndex === 0} onClick={() => setActiveGlassIndex((i) => Math.max(0, i - 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-sm font-bold text-slate-500">{activeGlassIndex + 1} of {glassRows.length}</div>
                <div className="text-lg font-black">{glassLabel}</div>
              </div>
              <button disabled={activeGlassIndex >= glassRows.length - 1} onClick={() => setActiveGlassIndex((i) => Math.min(glassRows.length - 1, i + 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {activeGlass && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 print-break print:bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-black">{glassLabel}</h3>
                  {glassRows.length > 1 && (
                    <button onClick={() => removeGlassRow(activeGlass.id)} className="rounded-2xl p-3 text-slate-500 hover:bg-white hover:text-red-600 no-print">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Location" value={activeGlass.location} onChange={(v) => updateGlass(activeGlass.id, "location", v)} placeholder="Kitchen window" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Width mm" value={activeGlass.width} onChange={(v) => updateGlass(activeGlass.id, "width", v)} inputMode="numeric" />
                    <Field label="Height mm" value={activeGlass.height} onChange={(v) => updateGlass(activeGlass.id, "height", v)} inputMode="numeric" />
                  </div>
                  <SelectField label="Outer Pane" value={activeGlass.outerPane} onChange={(v) => updateGlass(activeGlass.id, "outerPane", v)} options={paneThicknessOptions} />
                  <SelectField label="Spacer Size" value={activeGlass.spacerSize} onChange={(v) => updateGlass(activeGlass.id, "spacerSize", v)} options={spacerSizeOptions} />
                  <SelectField label="Inner Pane" value={activeGlass.innerPane} onChange={(v) => updateGlass(activeGlass.id, "innerPane", v)} options={paneThicknessOptions} />
                  <Field label="Overall Thickness" value={activeGlass.overallThickness} onChange={(v) => updateGlass(activeGlass.id, "overallThickness", v)} placeholder="Auto calculated" />
                  <SelectField label="Glass Type" value={activeGlass.type} onChange={(v) => updateGlass(activeGlass.id, "type", v)} options={glassTypeOptions} />
                  <SelectField label="Spacer Bar Type" value={activeGlass.spacerBar} onChange={(v) => updateGlass(activeGlass.id, "spacerBar", v)} options={spacerBarOptions} />
                  <SelectField label="Bars / Lead" value={activeGlass.decorativeBar} onChange={(v) => updateGlass(activeGlass.id, "decorativeBar", v)} options={decorativeBarOptions} />
                  <Field label="Pattern / Design" value={activeGlass.pattern} onChange={(v) => updateGlass(activeGlass.id, "pattern", v)} />
                  <div className="sm:col-span-2">
                    <Field label="Notes" value={activeGlass.notes} onChange={(v) => updateGlass(activeGlass.id, "notes", v)} />
                  </div>
                  <div className="sm:col-span-2">
                    <SketchPad title="Glass Sketch" value={activeGlass.sketchImage} onChange={(v) => updateGlass(activeGlass.id, "sketchImage", v)} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6" />
                <h2 className="text-xl font-black">Parts / Room</h2>
              </div>
              <Button onClick={addRoom} className="h-14 rounded-2xl px-5 text-base font-bold no-print">
                <Plus className="mr-1 h-5 w-5" /> Add Area
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 no-print">
              <button disabled={activeRoomIndex === 0} onClick={() => setActiveRoomIndex((i) => Math.max(0, i - 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-sm font-bold text-slate-500">{activeRoomIndex + 1} of {rooms.length}</div>
                <div className="text-lg font-black">{roomLabel}</div>
              </div>
              <button disabled={activeRoomIndex >= rooms.length - 1} onClick={() => setActiveRoomIndex((i) => Math.min(rooms.length - 1, i + 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {activeRoom && (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 print-break">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field label="Room / Area" value={activeRoom.name} onChange={(v) => updateRoomName(activeRoom.id, v)} placeholder="Kitchen / Lounge / Bedroom" />
                  </div>
                  <button onClick={() => duplicateRoom(activeRoom)} className="mb-1 rounded-2xl border border-slate-200 p-4 text-slate-600 hover:bg-slate-50 no-print" title="Duplicate area">
                    <Copy className="h-6 w-6" />
                  </button>
                  {rooms.length > 1 && (
                    <button onClick={() => removeRoom(activeRoom.id)} className="mb-1 rounded-2xl border border-slate-200 p-4 text-slate-500 hover:text-red-600 no-print">
                      <Trash2 className="h-6 w-6" />
                    </button>
                  )}
                </div>

                <QtyGrid title="Hinges" items={hingeItems} values={activeRoom.hinges} onChange={(item, v) => updateRoomQty(activeRoom.id, "hinges", item, v)} />
                <QtyGrid title="Handles" items={handleItems} values={activeRoom.handles} onChange={(item, v) => updateRoomQty(activeRoom.id, "handles", item, v)} />
                <QtyGrid title="Locks / Mechanisms" items={lockItems} values={activeRoom.locks} onChange={(item, v) => updateRoomQty(activeRoom.id, "locks", item, v)} />
                <QtyGrid title="Other Components" items={otherItems} values={activeRoom.other} onChange={(item, v) => updateRoomQty(activeRoom.id, "other", item, v)} />
                <TextArea label="Room Notes" value={activeRoom.notes} onChange={(v) => updateRoomNotes(activeRoom.id, v)} placeholder="Anything unusual for this room/area" />
              </div>
            )}
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
              <h2 className="text-xl font-black">Photos / General Sketch Notes</h2>
            </div>
            <TextArea label="General Sketch / Lead Notes" value={sketchNotes} onChange={(v) => setSurvey((p) => ({ ...p, sketchNotes: v }))} placeholder="General job notes if not linked to one glass unit." />
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
        </div>
      </div>
    </div>
  );
}
