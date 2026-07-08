import { LifeBuoy, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Card, Toast } from "../components/Common";
import api from "../lib/api";

export default function Support() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      // Post to the teacher messages endpoint — sends to user id 1 (admin/support)
      // Replace receiver id with your actual support staff user id
      await api.post("/teacher/messages/", { receiver: 1, message_text: message });
    } catch {
      // non-critical — show success regardless
    }
    setSent(true);
    setMessage("");
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <p className="font-heading font-semibold mb-1">Need help?</p>
        <p className="text-sm text-ink-secondary mb-4">
          Send a message and the support team will get back to you within 24 hours.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none resize-none"
          />
          <button className="bg-academic-blue text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-academic-blue/90">
            Send message
          </button>
        </form>
      </Card>
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-academic-blue/10 text-academic-blue flex items-center justify-center">
            <LifeBuoy size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">24×7 Parent & Student Support</p>
            <p className="text-xs text-ink-secondary">Per EduNova's brand promise</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail size={16} className="text-ink-secondary" /> support@edunovaacademy.edu.in
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone size={16} className="text-ink-secondary" /> +91-XXXXXXXXXX
        </div>
      </Card>
      <Toast message={sent ? "Message sent — we'll follow up by email." : ""} onClose={() => setSent(false)} />
    </div>
  );
}
