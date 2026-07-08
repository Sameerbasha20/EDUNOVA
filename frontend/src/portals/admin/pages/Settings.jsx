import { Database, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import api from "../lib/api";
import { Card, SectionTitle, Toast } from "../components/Common";

export default function Settings() {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  async function exportBackup() {
    setBusy(true);
    try {
      const { data } = await api.get("/admin-portal/backup/export/");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edunova-backup-${data.generated_at}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setToast("Backup downloaded.");
    } catch {
      setToast("Could not generate backup export.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Site content settings</SectionTitle>
        <p className="text-sm text-ink-secondary mb-3">
          School-wide settings, News/Events/Gallery content, and Testimonials are managed through the Django admin
          for now — the operational data (students, fees, transport, etc.) lives here in the Admin Portal.
        </p>
        <a
          href={`${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "")}/admin/`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-academic-blue hover:underline"
        >
          Open Django admin (News, Events, Gallery, School Settings) <ExternalLink size={14} />
        </a>
      </Card>

      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2"><Database size={18} /> Data export</span>
        </SectionTitle>
        <p className="text-sm text-ink-secondary mb-3">
          Downloads a JSON snapshot of the core operational tables (students, staff, fees, payments, library,
          transport). This is a convenience export, not a substitute for real automated, encrypted, offsite daily
          backups — set those up at the infrastructure level (see the security notes in the runbook).
        </p>
        <button
          disabled={busy}
          onClick={exportBackup}
          className="inline-flex items-center gap-2 bg-academic-blue text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Download size={16} /> {busy ? "Generating…" : "Download JSON export"}
        </button>
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
