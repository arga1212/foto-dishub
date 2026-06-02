export default function LocationInput({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Lokasi Tugas
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder="NAMA LOKASI"
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold tracking-wide transition-all outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
        style={{ fontFamily: 'inherit', letterSpacing: '0.05em' }}
      />
    </div>
  );
}
