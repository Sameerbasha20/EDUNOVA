import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Transport() {
  const [vehicles, setVehicles] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [vForm, setVForm] = useState({ vehicle_number: "", capacity: "", driver_id: "", gps_device_id: "", maintenance_status: "Active" });
  const [rForm, setRForm] = useState({ route_name: "", start_point: "", end_point: "" });
  const [aForm, setAForm] = useState({ student_id: "", vehicle_id: "", route_id: "", pickup_point: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get("/admin-portal/vehicles/").then(({ data }) => setVehicles(data)).catch(() => setVehicles([]));
    api.get("/admin-portal/routes/").then(({ data }) => setRoutes(data)).catch(() => setRoutes([]));
  }
  useEffect(() => { load(); }, []);

  async function addVehicle(e) {
    e.preventDefault();
    try { await api.post("/admin-portal/vehicles/", vForm); setVForm({ vehicle_number: "", capacity: "", driver_id: "", gps_device_id: "", maintenance_status: "Active" }); load(); }
    catch { setToast("Could not add vehicle."); }
  }
  async function addRoute(e) {
    e.preventDefault();
    try { await api.post("/admin-portal/routes/", rForm); setRForm({ route_name: "", start_point: "", end_point: "" }); load(); }
    catch { setToast("Could not add route."); }
  }
  async function allocate(e) {
    e.preventDefault();
    try { await api.post("/admin-portal/transport-allocations/", aForm); setToast("Student allocated to bus route."); setAForm({ student_id: "", vehicle_id: "", route_id: "", pickup_point: "" }); }
    catch { setToast("Could not allocate transport."); }
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Add vehicle</SectionTitle>
          <form onSubmit={addVehicle} className="grid grid-cols-2 gap-3">
            <input required placeholder="Vehicle number" value={vForm.vehicle_number} onChange={(e) => setVForm({ ...vForm, vehicle_number: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input placeholder="Capacity" type="number" value={vForm.capacity} onChange={(e) => setVForm({ ...vForm, capacity: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input placeholder="Driver user ID" value={vForm.driver_id} onChange={(e) => setVForm({ ...vForm, driver_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input placeholder="GPS device ID" value={vForm.gps_device_id} onChange={(e) => setVForm({ ...vForm, gps_device_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="col-span-2 bg-academic-blue text-white rounded-xl py-2 font-medium">Add vehicle</button>
          </form>
        </Card>
        <Card>
          <SectionTitle>Add route</SectionTitle>
          <form onSubmit={addRoute} className="grid grid-cols-2 gap-3">
            <input required placeholder="Route name" value={rForm.route_name} onChange={(e) => setRForm({ ...rForm, route_name: e.target.value })} className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input placeholder="Start point" value={rForm.start_point} onChange={(e) => setRForm({ ...rForm, start_point: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input placeholder="End point" value={rForm.end_point} onChange={(e) => setRForm({ ...rForm, end_point: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="col-span-2 bg-academic-blue text-white rounded-xl py-2 font-medium">Add route</button>
          </form>
        </Card>
      </div>

      <Card>
        <SectionTitle>Allocate a student to a bus route</SectionTitle>
        <form onSubmit={allocate} className="grid sm:grid-cols-4 gap-3">
          <input required placeholder="Student user ID" value={aForm.student_id} onChange={(e) => setAForm({ ...aForm, student_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Vehicle ID" value={aForm.vehicle_id} onChange={(e) => setAForm({ ...aForm, vehicle_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Route ID" value={aForm.route_id} onChange={(e) => setAForm({ ...aForm, route_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Pickup point" value={aForm.pickup_point} onChange={(e) => setAForm({ ...aForm, pickup_point: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button className="sm:col-span-4 bg-academic-green text-white rounded-xl py-2 font-medium">Allocate</button>
        </form>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Vehicles</SectionTitle>
          {!vehicles ? <Loader rows={3} /> : vehicles.length === 0 ? <EmptyState label="No vehicles yet." /> : (
            <div className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <div key={v.id} className="py-2 text-sm flex justify-between">
                  <span>{v.vehicle_number}</span>
                  <span className="text-ink-secondary">{v.maintenance_status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <SectionTitle>Routes</SectionTitle>
          {!routes ? <Loader rows={3} /> : routes.length === 0 ? <EmptyState label="No routes yet." /> : (
            <div className="divide-y divide-slate-100">
              {routes.map((r) => (
                <div key={r.id} className="py-2 text-sm flex justify-between">
                  <span>{r.route_name}</span>
                  <span className="text-ink-secondary">{r.start_point} → {r.end_point}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <p className="text-xs text-ink-secondary">
        Note: live GPS pings arrive via <code>portal_live_bus_log</code>, written by whatever GPS-tracker hardware/service the school
        integrates with the vehicle's device ID — this admin UI covers routes, vehicles and allocations, not physical hardware integration.
      </p>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
