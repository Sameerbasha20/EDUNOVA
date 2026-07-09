import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Shared across every portal — avatar_url lives on portal_user_profile
 * regardless of role, and POST/DELETE /profile/avatar/ works the same way
 * for any authenticated user. Pass each portal's own `api` client so the
 * request carries that portal's bearer token.
 */
export default function AvatarUploader({ api, avatarUrl, name, onChange }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.post("/profile/avatar/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.avatar_url);
    } catch (err) {
      setError(err?.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setError("");
    setBusy(true);
    try {
      await api.delete("/profile/avatar/");
      onChange(null);
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't remove picture.");
    } finally {
      setBusy(false);
    }
  }

  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-academic-blue/10 flex items-center justify-center shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-heading font-bold text-academic-blue">{initial}</span>
        )}
        {busy && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 size={18} className="text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-academic-blue text-white rounded-lg px-3 py-1.5 hover:bg-academic-blue/90 disabled:opacity-60"
          >
            <Camera size={14} /> {avatarUrl ? "Change" : "Upload"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-danger rounded-lg px-3 py-1.5 hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-ink-secondary">JPEG, PNG, WEBP or GIF, up to 5MB.</p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
