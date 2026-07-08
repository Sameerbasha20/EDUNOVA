import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

const ROLES = ["Student", "Teacher", "Parent", "Admin", "Employee"];
const ROLE_TONE = { Student: "blue", Teacher: "green", Parent: "gold", Admin: "red", Employee: "slate" };

export default function Users() {
  const [users, setUsers] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState({ role: "Student", first_name: "", last_name: "", email: "" });
  const [toast, setToast] = useState("");
  const [created, setCreated] = useState(null);

  function load() {
    api.get(`/admin-portal/users/${roleFilter ? `?role=${roleFilter}` : ""}`).then(({ data }) => setUsers(data)).catch(() => setUsers([]));
  }

  useEffect(() => { load(); }, [roleFilter]);

  async function createUser(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin-portal/users/", form);
      setCreated(data);
      setForm({ role: "Student", first_name: "", last_name: "", email: "" });
      load();
    } catch (err) {
      setToast(err?.response?.data?.detail || "Could not create user.");
    }
  }

  async function toggleActive(u) {
    await api.patch(`/admin-portal/users/${u.id}/`, { is_active: !u.is_active });
    load();
  }

  async function resetPassword(u) {
    const { data } = await api.post(`/admin-portal/users/${u.id}/reset-password/`, {});
    setToast(`New temp password for ${u.username}: ${data.temp_password}`);
  }

  return (
    <div className="space-y-6">
      {created && (
        <Card className="border-2 border-academic-green">
          <p className="font-semibold text-academic-green mb-1">User created</p>
          <p className="text-sm">Username: <b>{created.username}</b> · Temp password: <b>{created.temp_password}</b> · Role: {created.role}</p>
          <button onClick={() => setCreated(null)} className="mt-2 text-xs text-ink-secondary hover:underline">Dismiss</button>
        </Card>
      )}

      <Card>
        <SectionTitle>Create a user</SectionTitle>
        <form onSubmit={createUser} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input required placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button className="bg-academic-blue text-white rounded-xl py-2 font-medium">Create</button>
        </form>
      </Card>

      <Card>
        <SectionTitle
          action={
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
              <option value="">All roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          }
        >
          All users
        </SectionTitle>
        {!users ? <Loader rows={4} /> : users.length === 0 ? (
          <EmptyState label="No users found." />
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-primary truncate">{u.name}</p>
                  <p className="text-xs text-ink-secondary truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={ROLE_TONE[u.role] || "slate"}>{u.role}</Badge>
                  <Badge tone={u.is_active ? "green" : "red"}>{u.is_active ? "Active" : "Disabled"}</Badge>
                  <button onClick={() => toggleActive(u)} className="text-xs text-ink-secondary hover:underline">
                    {u.is_active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => resetPassword(u)} className="text-xs text-academic-blue hover:underline">Reset PW</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
