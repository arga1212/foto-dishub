export default function UploadPhoto({ onFileSelect }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFileSelect(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <label
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold cursor-pointer transition-all active:scale-95"
      style={{ borderColor: '#003087', color: '#003087', background: 'rgba(0,48,135,0.04)' }}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Upload Foto
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}
