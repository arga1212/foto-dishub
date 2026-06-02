const MAX_CHARS = 15;

export default function NameInput({ value, onChange }) {
  const isOver = value.length > MAX_CHARS;
  const count = value.length;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Nama Petugas
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="NAMA PETUGAS"
          maxLength={20}
          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold tracking-wide transition-all outline-none
            ${isOver
              ? 'border-red-400 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 bg-white text-gray-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-100'
            }`}
          style={{ fontFamily: 'inherit', letterSpacing: '0.05em' }}
        />
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
          isOver ? 'text-red-500' : count > 12 ? 'text-amber-500' : 'text-gray-400'
        }`}>
          {count}/{MAX_CHARS}
        </span>
      </div>
      {isOver && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          Nama maksimal {MAX_CHARS} karakter
        </p>
      )}
    </div>
  );
}
