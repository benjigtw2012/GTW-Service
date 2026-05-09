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

const STORAGE_KEY = "gtw-window-door-survey-v5";

const hingeTypeOptions = ["", "Top Hung", "Side Hung", "Egress"];
const hingeSizeOptions = {
  "Top Hung": ["8 inch", "10 inch", "12 inch", "16 inch", "20 inch", "24 inch"],
  "Side Hung": ["10 inch", "12 inch", "16 inch"],
  Egress: ["12 inch", "16 inch"],
};

const handleTypeOptions = ["", "Espag Handle", "Cockspur Handle", "Tilt & Turn Handle", "Patio Handle", "Door Handle Set", "Other Handle"];
const handleColourOptions = {
  "Espag Handle": ["White", "Black", "Chrome", "Gold"],
  "Cockspur Handle": ["White", "Black", "Chrome", "Gold"],
  "Tilt & Turn Handle": ["White", "Black", "Chrome"],
  "Patio Handle": ["White", "Black", "Chrome", "Gold"],
  "Door Handle Set": ["White", "Black", "Chrome", "Gold"],
  "Other Handle": ["White", "Black", "Chrome", "Gold", "Other"],
};

const lockTypeOptions = [
  "",
  "Multipoint Lock",
  "Gearbox Only",
  "Window Lock",
  "Shootbolt Gearbox",
  "Espag Mechanism",
  "Door Cylinder",
  "Patio Door Lock",
  "Other Lock / Mechanism",
];

const lockDetailOptions = {
  "Multipoint Lock": ["GU", "Yale", "Mila", "Fullex", "Other"],
  "Gearbox Only": ["35mm", "45mm", "55mm", "Other"],
  "Window Lock": ["Inline", "Offset", "Cockspur", "Other"],
  "Shootbolt Gearbox": ["Mila", "Saracen", "Other"],
  "Espag Mechanism": ["200mm", "400mm", "600mm", "Other"],
  "Door Cylinder": ["Euro", "Thumbturn", "Anti Snap", "Other"],
  "Patio Door Lock": ["Hook", "Slider", "Other"],
  "Other Lock / Mechanism": ["Other"],
};

const roomItemTypeOptions = ["", "Window", "Door", "French Door", "Patio Door", "Composite Door", "Other"];

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
const spacerBarOptions = ["Black Swiss", "Silver Ali", "Black Ali", "White Ali", "Other - check notes"];
const decorativeBarOptions = ["None", "18mm G Bar", "25mm G Bar", "Lead"];
const glassTypeOptions = ["Standard Toughened Low-E", "Acoustic", "Laminated", "Single Glaze"];

const patternOptions = [
  "",
  "Satin",
  "Stippolyte",
  "Arctic",
  "Autumn",
  "Cassini",
  "Chantilly",
  "Charcoal Sticks",
  "Contora",
  "Cotswold",
  "Digital",
  "Everglade",
  "Flemish",
  "Florielle",
  "Mayflower",
  "Minster",
  "Oak",
  "Pelerine",
  "Reeded",
  "Sycamore",
  "Taffeta",
  "Tribal",
  "Warwick",
  "Other - check notes",
];

function todayUk() {
  return new Date().toLocaleDateString("en-GB");
}

function makeId() {
  return crypto.randomUUID?.() || String(Date.now() + Math.random());
}

function mmNumber(value) {
  const match = String(value || "").match(/[0-9.]+/);
  return match ? Number(match[0]) : 0;
}

function calculateOverallThickness(outerPane, spacerSize, innerPane) {
  const total = mmNumber(outerPane) + mmNumber(spacerSize) + mmNumber(innerPane);
  return total ? `${total}mm` : "";
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
    type: "Standard Toughened Low-E",
    spacerBar: "Black Spacer",
    decorativeBar: "None",
   pattern: "",
barColour: "",
    notes: "",
    sketchImage: "",
  };
}

function emptyRoom() {
  const qtyMap = (items) => Object.fromEntries(items.map((item) => [item, ""]));

  return {
    id: makeId(),
    name: "",
    hinges: [],
    handles: [],
    locks: [],
    other: qtyMap(otherItems),
   items: [],
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

const Card = ({ children, className = "" }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => <div className={className}>{children}</div>;

function Button({ children, className = "", onClick, variant, asChild, ...props }) {
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
            {option || "Select"}
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
              value={values?.[item] || ""}
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

function HingesSection({ room, addHinge, updateHinge, removeHinge }) {
  const hinges = Array.isArray(room.hinges) ? room.hinges : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-base font-black uppercase tracking-wide text-slate-700">Hinges</h4>
        <button onClick={() => addHinge(room.id)} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-print">
          <Plus className="mr-1 inline h-4 w-4" /> Add Hinge
        </button>
      </div>
      {hinges.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">No hinges added yet.</p>}
      <div className="space-y-3">
        {hinges.map((hinge) => (
          <div key={hinge.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectField label="Hinge Type" value={hinge.type} onChange={(v) => updateHinge(room.id, hinge.id, "type", v)} options={hingeTypeOptions} />
              {hinge.type && (
                <SelectField label="Hinge Size" value={hinge.size} onChange={(v) => updateHinge(room.id, hinge.id, "size", v)} options={["", ...(hingeSizeOptions[hinge.type] || [])]} />
              )}
              {hinge.size && <Field label="Quantity" value={hinge.quantity} onChange={(v) => updateHinge(room.id, hinge.id, "quantity", v)} inputMode="numeric" placeholder="Qty" />}
            </div>
            <button onClick={() => removeHinge(room.id, hinge.id)} className="mt-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-red-600 no-print">
              <Trash2 className="mr-1 inline h-4 w-4" /> Remove Hinge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HandlesSection({ room, addHandle, updateHandle, removeHandle }) {
  const handles = Array.isArray(room.handles) ? room.handles : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-base font-black uppercase tracking-wide text-slate-700">Handles</h4>
        <button onClick={() => addHandle(room.id)} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-print">
          <Plus className="mr-1 inline h-4 w-4" /> Add Handle
        </button>
      </div>
      {handles.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">No handles added yet.</p>}
      <div className="space-y-3">
        {handles.map((handle) => (
          <div key={handle.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectField label="Handle Type" value={handle.type} onChange={(v) => updateHandle(room.id, handle.id, "type", v)} options={handleTypeOptions} />
              {handle.type && (
                <SelectField label="Colour" value={handle.colour} onChange={(v) => updateHandle(room.id, handle.id, "colour", v)} options={["", ...(handleColourOptions[handle.type] || [])]} />
              )}
              {handle.colour && <Field label="Quantity" value={handle.quantity} onChange={(v) => updateHandle(room.id, handle.id, "quantity", v)} inputMode="numeric" placeholder="Qty" />}
            </div>
            <button onClick={() => removeHandle(room.id, handle.id)} className="mt-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-red-600 no-print">
              <Trash2 className="mr-1 inline h-4 w-4" /> Remove Handle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocksSection({ room, addLock, updateLock, removeLock }) {
  const locks = Array.isArray(room.locks) ? room.locks : [];
  
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-base font-black uppercase tracking-wide text-slate-700">
          Locks / Mechanisms
        </h4>

        <button
          onClick={() => addLock(room.id)}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-print"
        >
          <Plus className="mr-1 inline h-4 w-4" />
          Add Lock
        </button>
      </div>

      {locks.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">
          No locks added yet.
        </p>
      )}

      <div className="space-y-3">
        {locks.map((lock) => (
          <div key={lock.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              <SelectField
                label="Lock Type"
                value={lock.type}
                onChange={(v) => updateLock(room.id, lock.id, "type", v)}
                options={lockTypeOptions}
              />

              {lock.type && (
                <SelectField
                  label="Detail"
                  value={lock.detail}
                  onChange={(v) => updateLock(room.id, lock.id, "detail", v)}
                  options={["", ...(lockDetailOptions[lock.type] || [])]}
                />
              )}

              {lock.detail && (
                <Field
                  label="Quantity"
                  value={lock.quantity}
                  onChange={(v) => updateLock(room.id, lock.id, "quantity", v)}
                  inputMode="numeric"
                  placeholder="Qty"
                />
              )}
            </div>

            <button
              onClick={() => removeLock(room.id, lock.id)}
              className="mt-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-red-600 no-print"
            >
              <Trash2 className="mr-1 inline h-4 w-4" />
              Remove Lock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomItemsSection({
  room,
  addRoomItem,
  updateRoomItem,
  removeRoomItem,
  addItemHinge,
  updateItemHinge,
  removeItemHinge,
    addItemHandle,
  updateItemHandle,
  removeItemHandle,
}) {
  const items = Array.isArray(room.items) ? room.items : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-base font-black uppercase tracking-wide text-slate-700">
          Windows / Doors in this Room
        </h4>

        <button
          onClick={() => addRoomItem(room.id)}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-print"
        >
          <Plus className="mr-1 inline h-4 w-4" />
          Add Window / Door
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">
          No windows or doors added yet.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h5 className="font-black">Window / Door {index + 1}</h5>

              <button
                onClick={() => removeRoomItem(room.id, item.id)}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-red-600 no-print"
              >
                <Trash2 className="mr-1 inline h-4 w-4" />
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Name"
                value={item.name}
                onChange={(v) => updateRoomItem(room.id, item.id, "name", v)}
                placeholder="Kitchen window 1"
              />

              <SelectField
                label="Type"
                value={item.type}
                onChange={(v) => updateRoomItem(room.id, item.id, "type", v)}
                options={roomItemTypeOptions}
              />

              <div className="sm:col-span-2">
                <TextArea
                  label="Window / Door Notes"
                  value={item.notes}
                  onChange={(v) => updateRoomItem(room.id, item.id, "notes", v)}
                  placeholder="Opening direction, issue, access notes, etc."
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h6 className="font-black text-slate-700">Hinges for this Window / Door</h6>

                <button
                  onClick={() => addItemHinge(room.id, item.id)}
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-print"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  Add Hinge
                </button>
              </div>

              {(Array.isArray(item.hinges) ? item.hinges : []).length === 0 && (
                <p className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-500">
                  No hinges added to this item yet.
                </p>
              )}

              <div className="space-y-3">
                {(Array.isArray(item.hinges) ? item.hinges : []).map((hinge) => (
                  <div key={hinge.id} className="rounded-2xl bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <SelectField
                        label="Hinge Type"
                        value={hinge.type}
                        onChange={(v) => updateItemHinge(room.id, item.id, hinge.id, "type", v)}
                        options={hingeTypeOptions}
                      />

                      {hinge.type && (
                        <SelectField
                          label="Hinge Size"
                          value={hinge.size}
                          onChange={(v) => updateItemHinge(room.id, item.id, hinge.id, "size", v)}
                          options={["", ...(hingeSizeOptions[hinge.type] || [])]}
                        />
                      )}

                      {hinge.size && (
                        <Field
                          label="Quantity"
                          value={hinge.quantity}
                          onChange={(v) => updateItemHinge(room.id, item.id, hinge.id, "quantity", v)}
                          inputMode="numeric"
                          placeholder="Qty"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => removeItemHinge(room.id, item.id, hinge.id)}
                      className="mt-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-red-600 no-print"
                    >
                      <Trash2 className="mr-1 inline h-4 w-4" />
                      Remove Hinge
                    </button>
                  </div>
                ))}
              </div>
            </div>
                  
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
  <div className="mb-3 flex items-center justify-between gap-3">
    <h6 className="font-black text-slate-700">Handles for this Window / Door</h6>

    <button
      onClick={() => addItemHandle(room.id, item.id)}
      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white no-print"
    >
      <Plus className="mr-1 inline h-4 w-4" />
      Add Handle
    </button>
  </div>

  {(Array.isArray(item.handles) ? item.handles : []).length === 0 && (
    <p className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-500">
      No handles added to this item yet.
    </p>
  )}

  <div className="space-y-3">
    {(Array.isArray(item.handles) ? item.handles : []).map((handle) => (
      <div key={handle.id} className="rounded-2xl bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <SelectField
            label="Handle Type"
            value={handle.type}
            onChange={(v) => updateItemHandle(room.id, item.id, handle.id, "type", v)}
            options={handleTypeOptions}
          />

          {handle.type && (
            <SelectField
              label="Colour"
              value={handle.colour}
              onChange={(v) => updateItemHandle(room.id, item.id, handle.id, "colour", v)}
              options={["", ...(handleColourOptions[handle.type] || [])]}
            />
          )}

          {handle.colour && (
            <Field
              label="Quantity"
              value={handle.quantity}
              onChange={(v) => updateItemHandle(room.id, item.id, handle.id, "quantity", v)}
              inputMode="numeric"
              placeholder="Qty"
            />
          )}
        </div>

        <button
          onClick={() => removeItemHandle(room.id, item.id, handle.id)}
          className="mt-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-red-600 no-print"
        >
          <Trash2 className="mr-1 inline h-4 w-4" />
          Remove Handle
        </button>
      </div>
    ))}
  </div>
</div>
                  
          </div>
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

  if (Array.isArray(room.hinges)) {
    const hinges = room.hinges.filter((h) => h.type && h.size && Number(h.quantity) > 0);
    if (hinges.length) lines.push(`Hinges: ${hinges.map((h) => `${h.type} ${h.size} x ${h.quantity}`).join(", ")}`);
  }

  if (Array.isArray(room.handles)) {
    const handles = room.handles.filter((h) => h.type && h.colour && Number(h.quantity) > 0);
    if (handles.length) lines.push(`Handles: ${handles.map((h) => `${h.colour} ${h.type} x ${h.quantity}`).join(", ")}`);
  }

  const addGroup = (name, group) => {
    const entries = Object.entries(group || {}).filter(([, qty]) => qty && Number(qty) !== 0);
    if (entries.length) lines.push(`${name}: ${entries.map(([item, qty]) => `${item} x ${qty}`).join(", ")}`);
  };

  if (Array.isArray(room.locks)) {
  const locks = room.locks.filter((l) => l.type && l.detail && Number(l.quantity) > 0);

  if (locks.length) {
    lines.push(`Locks: ${locks.map((l) => `${l.type} ${l.detail} x ${l.quantity}`).join(", ")}`);
  }
}
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
      const hingeTotal = Array.isArray(room.hinges) ? room.hinges.reduce((s, h) => s + (Number(h.quantity) || 0), 0) : 0;
      const handleTotal = Array.isArray(room.handles) ? room.handles.reduce((s, h) => s + (Number(h.quantity) || 0), 0) : 0;
      const lockTotal = Array.isArray(room.locks)
  ? room.locks.reduce((s, l) => s + (Number(l.quantity) || 0), 0)
  : 0;

const groups = [room.other];
      return sum + hingeTotal + handleTotal + lockTotal + groups.reduce((s, group) => s + Object.values(group || {}).reduce((a, q) => a + (Number(q) || 0), 0), 0);
    }, 0);

    const parts = {};
    rooms.forEach((room) => {
      if (Array.isArray(room.hinges)) {
        room.hinges.forEach((hinge) => {
          const n = Number(hinge.quantity) || 0;
          if (hinge.type && hinge.size && n > 0) {
            const item = `${hinge.type} ${hinge.size}`;
            parts[item] = (parts[item] || 0) + n;
          }
        });
      }

      if (Array.isArray(room.handles)) {
        room.handles.forEach((handle) => {
          const n = Number(handle.quantity) || 0;
          if (handle.type && handle.colour && n > 0) {
            const item = `${handle.colour} ${handle.type}`;
            parts[item] = (parts[item] || 0) + n;
          }
        });
      }

      if (Array.isArray(room.locks)) {
  room.locks.forEach((lock) => {
    const n = Number(lock.quantity) || 0;

    if (lock.type && lock.detail && n > 0) {
      const item = `${lock.type} ${lock.detail}`;
      parts[item] = (parts[item] || 0) + n;
    }
  });
}

[room.other].forEach((group) => {
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
        if (key === "type" && value === "Single Glaze") {
  updated.spacerSize = "";
  updated.innerPane = "";
  updated.spacerBar = "";
  updated.overallThickness = updated.outerPane || "";
}

if (key === "type" && value !== "Single Glaze") {
  updated.spacerSize = updated.spacerSize || "16mm";
  updated.innerPane = updated.innerPane || "4mm";
  updated.spacerBar = updated.spacerBar || "Black Swiss";
  updated.overallThickness = calculateOverallThickness(updated.outerPane, updated.spacerSize, updated.innerPane);
}

if (["outerPane", "spacerSize", "innerPane"].includes(key)) {
  updated.overallThickness =
    updated.type === "Single Glaze"
      ? updated.outerPane || ""
      : calculateOverallThickness(updated.outerPane, updated.spacerSize, updated.innerPane);
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
    if (Array.isArray(copy.hinges)) copy.hinges = copy.hinges.map((hinge) => ({ ...hinge, id: makeId() }));
    if (Array.isArray(copy.handles)) copy.handles = copy.handles.map((handle) => ({ ...handle, id: makeId() }));
    setSurvey((prev) => ({ ...prev, rooms: [...prev.rooms, copy] }));
    setActiveRoomIndex(rooms.length);
  };

  const removeRoom = (id) => {
    if (rooms.length === 1) return;
    setSurvey((prev) => ({ ...prev, rooms: prev.rooms.filter((room) => room.id !== id) }));
    setActiveRoomIndex((i) => Math.max(0, i - 1));
  };

  const updateRoomName = (id, value) => {
    setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((r) => (r.id === id ? { ...r, name: value } : r)) }));
  };

  const updateRoomQty = (id, group, item, value) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => (room.id === id ? { ...room, [group]: { ...room[group], [item]: value } } : room)),
    }));
  };

  const addHinge = (roomId) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? { ...room, hinges: [...(Array.isArray(room.hinges) ? room.hinges : []), { id: makeId(), type: "", size: "", quantity: "" }] }
          : room
      ),
    }));
  };

  const updateHinge = (roomId, hingeId, key, value) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              hinges: (Array.isArray(room.hinges) ? room.hinges : []).map((hinge) => {
                if (hinge.id !== hingeId) return hinge;
                const updated = { ...hinge, [key]: value };
                if (key === "type") {
                  updated.size = "";
                  updated.quantity = "";
                }
                if (key === "size") updated.quantity = "";
                return updated;
              }),
            }
          : room
      ),
    }));
  };

  const removeHinge = (roomId, hingeId) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? { ...room, hinges: (Array.isArray(room.hinges) ? room.hinges : []).filter((hinge) => hinge.id !== hingeId) } : room
      ),
    }));
  };

  const addHandle = (roomId) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? { ...room, handles: [...(Array.isArray(room.handles) ? room.handles : []), { id: makeId(), type: "", colour: "", quantity: "" }] }
          : room
      ),
    }));
  };

  const updateHandle = (roomId, handleId, key, value) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              handles: (Array.isArray(room.handles) ? room.handles : []).map((handle) => {
                if (handle.id !== handleId) return handle;
                const updated = { ...handle, [key]: value };
                if (key === "type") {
                  updated.colour = "";
                  updated.quantity = "";
                }
                if (key === "colour") updated.quantity = "";
                return updated;
              }),
            }
          : room
      ),
    }));
  };

  const removeHandle = (roomId, handleId) => {
    setSurvey((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? { ...room, handles: (Array.isArray(room.handles) ? room.handles : []).filter((handle) => handle.id !== handleId) } : room
      ),
    }));
  };
const addLock = (roomId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            locks: [
              ...(Array.isArray(room.locks) ? room.locks : []),
              { id: makeId(), type: "", detail: "", quantity: "" },
            ],
          }
        : room
    ),
  }));
};

const updateLock = (roomId, lockId, key, value) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            locks: (Array.isArray(room.locks) ? room.locks : []).map((lock) => {
              if (lock.id !== lockId) return lock;

              const updated = { ...lock, [key]: value };

              if (key === "type") {
                updated.detail = "";
                updated.quantity = "";
              }

              if (key === "detail") {
                updated.quantity = "";
              }

              return updated;
            }),
          }
        : room
    ),
  }));
};

const removeLock = (roomId, lockId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            locks: (Array.isArray(room.locks) ? room.locks : []).filter((lock) => lock.id !== lockId),
          }
        : room
    ),
  }));
};

  const addRoomItem = (roomId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: [
              ...(Array.isArray(room.items) ? room.items : []),
              {
  id: makeId(),
  name: "",
  type: "",
  notes: "",
  hinges: [],
  handles: [],
  locks: [],
},
            ],
          }
        : room
    ),
  }));
};

const updateRoomItem = (roomId, itemId, key, value) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId ? { ...item, [key]: value } : item
            ),
          }
        : room
    ),
  }));
};

 const addItemHinge = (roomId, itemId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    hinges: [
                      ...(Array.isArray(item.hinges) ? item.hinges : []),
                      { id: makeId(), type: "", size: "", quantity: "" },
                    ],
                  }
                : item
            ),
          }
        : room
    ),
  }));
};

const updateItemHinge = (roomId, itemId, hingeId, key, value) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    hinges: (Array.isArray(item.hinges) ? item.hinges : []).map((hinge) => {
                      if (hinge.id !== hingeId) return hinge;

                      const updated = { ...hinge, [key]: value };

                      if (key === "type") {
                        updated.size = "";
                        updated.quantity = "";
                      }

                      if (key === "size") {
                        updated.quantity = "";
                      }

                      return updated;
                    }),
                  }
                : item
            ),
          }
        : room
    ),
  }));
};

const removeItemHinge = (roomId, itemId, hingeId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    hinges: (Array.isArray(item.hinges) ? item.hinges : []).filter((hinge) => hinge.id !== hingeId),
                  }
                : item
            ),
          }
        : room
    ),
  }));
}; 
 const addItemHandle = (roomId, itemId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    handles: [
                      ...(Array.isArray(item.handles) ? item.handles : []),
                      { id: makeId(), type: "", colour: "", quantity: "" },
                    ],
                  }
                : item
            ),
          }
        : room
    ),
  }));
};

const updateItemHandle = (roomId, itemId, handleId, key, value) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    handles: (Array.isArray(item.handles) ? item.handles : []).map((handle) => {
                      if (handle.id !== handleId) return handle;

                      const updated = { ...handle, [key]: value };

                      if (key === "type") {
                        updated.colour = "";
                        updated.quantity = "";
                      }

                      if (key === "colour") {
                        updated.quantity = "";
                      }

                      return updated;
                    }),
                  }
                : item
            ),
          }
        : room
    ),
  }));
};

const removeItemHandle = (roomId, itemId, handleId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    handles: (Array.isArray(item.handles) ? item.handles : []).filter(
                      (handle) => handle.id !== handleId
                    ),
                  }
                : item
            ),
          }
        : room
    ),
  }));
};

const removeRoomItem = (roomId, itemId) => {
  setSurvey((prev) => ({
    ...prev,
    rooms: prev.rooms.map((room) =>
      room.id === roomId
        ? {
            ...room,
            items: (Array.isArray(room.items) ? room.items : []).filter((item) => item.id !== itemId),
          }
        : room
    ),
  }));
};
  
  const updateRoomNotes = (id, value) => {
    setSurvey((prev) => ({ ...prev, rooms: prev.rooms.map((r) => (r.id === id ? { ...r, notes: value } : r)) }));
  };

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
            <div className="flex items-center gap-2"><ClipboardList className="h-6 w-6" /><h2 className="text-xl font-black">Job Details</h2></div>
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
            <div className="flex items-center gap-2"><FileText className="h-6 w-6" /><h2 className="text-xl font-black">Auto Summary</h2></div>
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
                    <div key={item} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm font-bold"><span>{item}</span><span>x {qty}</span></div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><GlassWater className="h-6 w-6" /><h2 className="text-xl font-black">Glass</h2></div>
              <Button onClick={addGlassRow} className="h-14 rounded-2xl px-5 text-base font-bold no-print"><Plus className="mr-1 h-5 w-5" /> Add Glass</Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 no-print">
              <button disabled={activeGlassIndex === 0} onClick={() => setActiveGlassIndex((i) => Math.max(0, i - 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
              <div className="text-center"><div className="text-sm font-bold text-slate-500">{activeGlassIndex + 1} of {glassRows.length}</div><div className="text-lg font-black">{glassLabel}</div></div>
              <button disabled={activeGlassIndex >= glassRows.length - 1} onClick={() => setActiveGlassIndex((i) => Math.min(glassRows.length - 1, i + 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
            </div>

            {activeGlass && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 print-break print:bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-black">{glassLabel}</h3>
                  {glassRows.length > 1 && <button onClick={() => removeGlassRow(activeGlass.id)} className="rounded-2xl p-3 text-slate-500 hover:bg-white hover:text-red-600 no-print"><Trash2 className="h-5 w-5" /></button>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Location" value={activeGlass.location} onChange={(v) => updateGlass(activeGlass.id, "location", v)} placeholder="Kitchen window" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Width mm" value={activeGlass.width} onChange={(v) => updateGlass(activeGlass.id, "width", v)} inputMode="numeric" />
                    <Field label="Height mm" value={activeGlass.height} onChange={(v) => updateGlass(activeGlass.id, "height", v)} inputMode="numeric" />
                  </div>
                  <SelectField label="Outer Pane" value={activeGlass.outerPane} onChange={(v) => updateGlass(activeGlass.id, "outerPane", v)} options={paneThicknessOptions} />
                  <SelectField label="Glass Type" value={activeGlass.type} onChange={(v) => updateGlass(activeGlass.id, "type", v)} options={glassTypeOptions} />

{activeGlass.type !== "Single Glaze" && (
  <>
    <SelectField label="Spacer Size" value={activeGlass.spacerSize} onChange={(v) => updateGlass(activeGlass.id, "spacerSize", v)} options={spacerSizeOptions} />
    <SelectField label="Inner Pane" value={activeGlass.innerPane} onChange={(v) => updateGlass(activeGlass.id, "innerPane", v)} options={paneThicknessOptions} />
    <SelectField label="Spacer Bar Type" value={activeGlass.spacerBar} onChange={(v) => updateGlass(activeGlass.id, "spacerBar", v)} options={spacerBarOptions} />
  </>
)}

<Field label="Overall Thickness" value={activeGlass.overallThickness} onChange={(v) => updateGlass(activeGlass.id, "overallThickness", v)} placeholder="Auto calculated" />

<SelectField label="Bars / Lead" value={activeGlass.decorativeBar} onChange={(v) => updateGlass(activeGlass.id, "decorativeBar", v)} options={decorativeBarOptions} />

{["18mm G Bar", "25mm G Bar"].includes(activeGlass.decorativeBar) && (
  <Field label="G Bar Colour" value={activeGlass.barColour} onChange={(v) => updateGlass(activeGlass.id, "barColour", v)} placeholder="e.g. White, Black, Anthracite" />
)}

<SelectField label="Pattern / Design" value={activeGlass.pattern} onChange={(v) => updateGlass(activeGlass.id, "pattern", v)} options={patternOptions} />
                  <div className="sm:col-span-2"><Field label="Notes" value={activeGlass.notes} onChange={(v) => updateGlass(activeGlass.id, "notes", v)} /></div>
                  <div className="sm:col-span-2"><SketchPad title="Glass Sketch" value={activeGlass.sketchImage} onChange={(v) => updateGlass(activeGlass.id, "sketchImage", v)} /></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Home className="h-6 w-6" /><h2 className="text-xl font-black">Parts / Room</h2></div>
              <Button onClick={addRoom} className="h-14 rounded-2xl px-5 text-base font-bold no-print"><Plus className="mr-1 h-5 w-5" /> Add Area</Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 no-print">
              <button disabled={activeRoomIndex === 0} onClick={() => setActiveRoomIndex((i) => Math.max(0, i - 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
              <div className="text-center"><div className="text-sm font-bold text-slate-500">{activeRoomIndex + 1} of {rooms.length}</div><div className="text-lg font-black">{roomLabel}</div></div>
              <button disabled={activeRoomIndex >= rooms.length - 1} onClick={() => setActiveRoomIndex((i) => Math.min(rooms.length - 1, i + 1))} className="rounded-xl border border-slate-300 bg-white p-3 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
            </div>

            {activeRoom && (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 print-break">
                <div className="flex items-end gap-3">
                  <div className="flex-1"><Field label="Room / Area" value={activeRoom.name} onChange={(v) => updateRoomName(activeRoom.id, v)} placeholder="Kitchen / Lounge / Bedroom" /></div>
                  <button onClick={() => duplicateRoom(activeRoom)} className="mb-1 rounded-2xl border border-slate-200 p-4 text-slate-600 hover:bg-slate-50 no-print" title="Duplicate area"><Copy className="h-6 w-6" /></button>
                  {rooms.length > 1 && <button onClick={() => removeRoom(activeRoom.id)} className="mb-1 rounded-2xl border border-slate-200 p-4 text-slate-500 hover:text-red-600 no-print"><Trash2 className="h-6 w-6" /></button>}
                </div>

<RoomItemsSection
  room={activeRoom}
  addRoomItem={addRoomItem}
  updateRoomItem={updateRoomItem}
  removeRoomItem={removeRoomItem}
  addItemHinge={addItemHinge}
  updateItemHinge={updateItemHinge}
  removeItemHinge={removeItemHinge}
      addItemHandle={addItemHandle}
  updateItemHandle={updateItemHandle}
  removeItemHandle={removeItemHandle}
/>
                    
                <HingesSection room={activeRoom} addHinge={addHinge} updateHinge={updateHinge} removeHinge={removeHinge} />
                <HandlesSection room={activeRoom} addHandle={addHandle} updateHandle={updateHandle} removeHandle={removeHandle} />
                    
                <LocksSection
  room={activeRoom}
  addLock={addLock}
  updateLock={updateLock}
  removeLock={removeLock}
/>
    
                <QtyGrid title="Other Components" items={otherItems} values={activeRoom.other} onChange={(item, v) => updateRoomQty(activeRoom.id, "other", item, v)} />
                <TextArea label="Room Notes" value={activeRoom.notes} onChange={(v) => updateRoomNotes(activeRoom.id, v)} placeholder="Anything unusual for this room/area" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2"><Wrench className="h-6 w-6" /><h2 className="text-xl font-black">Engineer Notes</h2></div>
            <TextArea label="Maintenance / Repair Requirements" value={engineerNotes} onChange={(v) => setSurvey((p) => ({ ...p, engineerNotes: v }))} placeholder="Urgent repairs, general maintenance, parts required..." />
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2"><Camera className="h-6 w-6" /><h2 className="text-xl font-black">Photos / General Sketch Notes</h2></div>
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
                    <button onClick={() => removePhoto(photo.id)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow no-print"><Trash2 className="h-4 w-4" /></button>
                    <p className="truncate px-2 py-1 text-xs text-slate-600">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm print-break print:shadow-none">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2"><FileText className="h-6 w-6" /><h2 className="text-xl font-black">Office Use Only</h2></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Quote Ref" value={office.quoteRef} onChange={(v) => updateOffice("quoteRef", v)} />
              <Field label="Total Job Time" value={office.totalJobTime} onChange={(v) => updateOffice("totalJobTime", v)} placeholder="e.g. 4 hours" />
            </div>
          </CardContent>
        </Card>

        <div className="pb-8 no-print">
          <Button asChild className="h-16 w-full rounded-3xl text-lg font-black">
            <a href={buildOfficeEmail(survey, summary)}><Send className="mr-2 h-6 w-6" /> Submit Survey to Office</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
