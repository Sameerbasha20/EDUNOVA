import { useState } from "react";

/**
 * The client's requirements doc calls out "barcode digital identity
 * validations" and a QR id code per student. This card is the portal's
 * signature element: a tap-to-flip digital ID showing the QR / barcode
 * side, echoing the physical hall-pass students already carry.
 */
export default function IdCard({ profile }) {
  const [flipped, setFlipped] = useState(false);
  if (!profile) return null;

  return (
    <div
      className={`flip-card h-48 w-full max-w-sm cursor-pointer select-none ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      aria-label="Tap to flip your digital student ID"
    >
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-face rounded-card bg-gradient-to-br from-academic-blue to-[#12245c] text-white p-5 shadow-raised flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] tracking-widest text-white/60 font-sub">EDUNOVA GLOBAL ACADEMY</p>
              <p className="font-heading font-semibold text-lg leading-tight mt-0.5">{profile.name}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-academic-gold text-academic-blue flex items-center justify-center font-heading font-bold text-sm">
              E
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-white/60 font-sub">ADMISSION NO.</p>
              <p className="font-numeric text-sm tracking-wide">{profile.admission_number}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-sub text-right">CLASS</p>
              <p className="font-numeric text-sm text-right">{profile.class_name || "—"}</p>
            </div>
          </div>
          <p className="text-[10px] text-white/50 font-sub">Tap card to view QR ID</p>
        </div>

        {/* Back */}
        <div className="flip-card-face flip-card-back rounded-card bg-white p-5 shadow-raised flex flex-col items-center justify-center gap-3 border border-slate-200">
          <QrGlyph seed={profile.qr_id_code || profile.admission_number} />
          <p className="font-numeric text-xs tracking-widest text-ink-secondary">{profile.qr_id_code || "NOT ISSUED"}</p>
          <p className="text-[11px] text-ink-secondary font-sub">Scan at library / gate / exam hall</p>
        </div>
      </div>
    </div>
  );
}

/** Deterministic pseudo-QR pattern generated from the id string — a visual
 * stand-in until a real QR library is wired to the printed qr_id_code. */
function QrGlyph({ seed = "EDUNOVA" }) {
  const size = 9;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

  const cells = [];
  for (let i = 0; i < size * size; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    cells.push((hash >> 16) % 3 === 0);
  }

  return (
    <div
      className="grid gap-[2px] p-2 bg-ink-primary rounded-lg"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 108, height: 108 }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-white rounded-[1px]" : "bg-transparent"} />
      ))}
    </div>
  );
}
