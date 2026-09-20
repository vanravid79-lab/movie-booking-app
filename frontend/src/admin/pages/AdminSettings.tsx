import { useState } from "react";
import {
  Settings,
  Building2,
  DollarSign,
  Globe,
  Clock,
  ShieldCheck,
  Bell,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function AdminSettings() {
  const [cinemaName, setCinemaName] = useState("Cambo Cinema Network");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh (UTC+7)");
  const [operatingHours, setOperatingHours] = useState("09:30 AM - 11:45 PM");
  const [khqrMerchant, setKhqrMerchant] = useState("CAMBO CINEMA");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">System Settings</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure cinema chain parameters, payment display, and business operations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cinema Organization Info */}
        <div className="rounded-2xl border border-zinc-800 bg-[#18181f] p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-4 text-sm font-bold text-white">
            <Building2 className="h-4 w-4 text-rose-500" />
            General Information
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Cinema Chain Name
              </label>
              <input
                type="text"
                value={cinemaName}
                onChange={(e) => setCinemaName(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="KHR">KHR (៛) - Khmer Riel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Timezone
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-300">
                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                <span>{timezone}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Operating Hours
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment & KHQR Settings */}
        <div className="rounded-2xl border border-zinc-800 bg-[#18181f] p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-4 text-sm font-bold text-white">
            <DollarSign className="h-4 w-4 text-rose-500" />
            Payment & KHQR Configuration
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                KHQR Merchant Display Name
              </label>
              <input
                type="text"
                value={khqrMerchant}
                onChange={(e) => setKhqrMerchant(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                This name appears on the Bakong payment QR code shown to customers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Accepted Payment Channels
              </label>
              <div className="space-y-2 pt-1 text-xs text-zinc-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                  Bakong / ABA KHQR (Cambodia)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                  Cash on Arrival
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
                  Credit / Debit Card
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="rounded-2xl border border-zinc-800 bg-[#18181f] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-4 text-sm font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Security & Authentication
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div>
              <p className="font-semibold text-white">Database Role Guard</p>
              <p className="text-zinc-400">JWT Token Expiry: 24 hours with bcrypt-hashed credentials</p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-bold text-emerald-400">
              Active & Protected
            </span>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition"
          >
            <Save size={14} />
            Save Configuration
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 animate-fadeIn">
              <CheckCircle2 size={14} />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
