import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast, Badge } from "../components/Common";

export default function Inventory() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ item_name: "", category: "General", quantity: 0, department: "Administration" });
  const [toast, setToast] = useState("");

  function load() {
    api.get("/admin-portal/inventory/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }
  useEffect(() => { load(); }, []);

  async function addItem(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/inventory/", form);
      setForm({ item_name: "", category: "General", quantity: 0, department: "Administration" });
      setToast("Item added.");
      load();
    } catch { setToast("Could not add item."); }
  }

  async function adjust(id, delta) {
    try {
      await api.patch("/admin-portal/inventory/", { id, quantity_delta: delta });
      load();
    } catch { setToast("Could not update stock."); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Add inventory item</SectionTitle>
        <form onSubmit={addItem} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input required placeholder="Item name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button className="bg-academic-blue text-white rounded-xl py-2 font-medium">Add item</button>
        </form>
      </Card>

      <Card>
        <SectionTitle>Stock</SectionTitle>
        {items === null ? <Loader /> : items.length === 0 ? <EmptyState label="No inventory items yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Item</th><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">Department</th><th className="py-2 pr-4">Quantity</th><th className="py-2 pr-4">Adjust</th>
              </tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4">{i.item_name}</td>
                    <td className="py-2 pr-4"><Badge tone="blue">{i.category}</Badge></td>
                    <td className="py-2 pr-4">{i.department}</td>
                    <td className="py-2 pr-4 font-medium">{i.quantity}</td>
                    <td className="py-2 pr-4 flex gap-2">
                      <button onClick={() => adjust(i.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold">−</button>
                      <button onClick={() => adjust(i.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold">+</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
