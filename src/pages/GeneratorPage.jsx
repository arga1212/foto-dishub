import { useState, useCallback, useEffect } from 'react';
import UploadPhoto from '../components/UploadPhoto';
import CameraCapture from '../components/CameraCapture';
import ImageCropper from '../components/ImageCropper';
import NameInput from '../components/NameInput';
import LocationInput from '../components/LocationInput';
import LivePreview from '../components/LivePreview';
import PdfGenerator, { getSavedCards } from '../components/PdfGenerator';
import SavedCards from '../components/SavedCards';

function Toast({ message }) {
  return (
    <div
      className="toast-enter fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold"
      style={{ background: '#003087', color: 'white' }}
    >
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {message}
    </div>
  );
}

// Request camera permission on load so browser asks immediately
async function requestCameraPermission() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    // Check if already granted — don't re-ask if already decided
    if (navigator.permissions) {
      const status = await navigator.permissions.query({ name: 'camera' });
      if (status.state === 'granted' || status.state === 'denied') return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(t => t.stop());
  } catch {
    // silently ignore — user denied or not supported
  }
}

export default function GeneratorPage() {
  const [rawImage, setRawImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [savedCards, setSavedCards] = useState(() => getSavedCards());
  const [showSaved, setShowSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => { requestCameraPermission(); }, []);

  const handlePhotoSelect = useCallback((src) => { setRawImage(src); setShowCropper(true); }, []);
  const handleCameraCapture = useCallback((src) => { setShowCamera(false); setRawImage(src); setShowCropper(true); }, []);
  const handleCropComplete = useCallback((src) => { setCroppedImage(src); setShowCropper(false); setRawImage(null); }, []);
  const handleCropCancel = useCallback(() => { setShowCropper(false); setRawImage(null); }, []);
  const refreshSaved = useCallback(() => setSavedCards(getSavedCards()), []);

  const handleReset = () => { setRawImage(null); setCroppedImage(null); setName(''); setLocation(''); };

  const handlePdfSuccess = () => {
    setToastMsg('PDF berhasil diunduh & disimpan!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
    refreshSaved();
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F4F8 50%, #EDF2F7 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ background: '#003087' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight tracking-wide">Dishub Surabaya</h1>
              <p className="text-blue-200 text-xs">Photo Card Generator</p>
            </div>
          </div>
          {/* Saved cards toggle button (mobile) */}
          <button
            onClick={() => setShowSaved(s => !s)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{ background: showSaved ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Tersimpan {savedCards.length > 0 && `(${savedCards.length})`}
          </button>
        </div>
      </header>

      {/* Saved cards drawer (mobile: slide from top, desktop: sidebar) */}
      {showSaved && (
        <div className="xl:hidden mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: '#FAFBFC' }}>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Kartu Tersimpan</h2>
              <p className="text-xs text-gray-500 mt-0.5">{savedCards.length} kartu</p>
            </div>
            <button onClick={() => setShowSaved(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SavedCards cards={savedCards} onCardsChange={refreshSaved} />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">

          {/* Desktop saved cards sidebar */}
          <div className="hidden xl:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100" style={{ background: '#FAFBFC' }}>
                <h2 className="text-sm font-bold text-gray-800">Kartu Tersimpan</h2>
                <p className="text-xs text-gray-500 mt-0.5">{savedCards.length} kartu</p>
              </div>
              <SavedCards cards={savedCards} onCardsChange={refreshSaved} />
            </div>
          </div>

          {/* Form panel */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100" style={{ background: '#FAFBFC' }}>
                <h2 className="text-sm font-bold text-gray-800">Panel Pengaturan</h2>
                <p className="text-xs text-gray-500 mt-0.5">Isi data petugas parkir</p>
              </div>

              <div className="p-5 space-y-5">
                {/* Photo thumbnail */}
                {croppedImage && (
                  <div className="rounded-xl overflow-hidden border border-gray-100 relative group">
                    <img src={croppedImage} alt="Preview foto" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button onClick={() => handlePhotoSelect(croppedImage)} className="text-xs text-white font-semibold bg-black/50 px-3 py-1.5 rounded-lg">
                        Ubah Foto
                      </button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload + Camera */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {croppedImage ? 'Ganti Foto' : 'Tambah Foto'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <UploadPhoto onFileSelect={handlePhotoSelect} />
                    <button
                      onClick={() => setShowCamera(true)}
                      className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all active:scale-95"
                      style={{ borderColor: '#C8993A', color: '#C8993A', background: 'rgba(200,153,58,0.04)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Kamera
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100" />
                <NameInput value={name} onChange={setName} />
                <LocationInput value={location} onChange={setLocation} />
                <div className="border-t border-gray-100" />

                <div className="space-y-2">
                  <PdfGenerator photo={croppedImage} name={name} location={location} onSuccess={handlePdfSuccess} />
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Form
                  </button>
                </div>

                {(!croppedImage || !name) && (
                  <div className="rounded-xl p-3 border border-amber-100" style={{ background: '#FFFBEB' }}>
                    <p className="text-xs font-semibold text-amber-700 mb-1.5">Diperlukan:</p>
                    <ul className="space-y-1">
                      {!croppedImage && (
                        <li className="text-xs text-amber-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />Foto petugas
                        </li>
                      )}
                      {!name && (
                        <li className="text-xs text-amber-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />Nama petugas
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Collapsible header */}
              <button
                onClick={() => setShowPreview(s => !s)}
                className="w-full px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Preview</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showPreview ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showPreview && (
                <div className="px-4 pb-5 overflow-auto">
                  {/* Scale down on mobile so card fits screen */}
                  <div
                    className="flex justify-center"
                    style={{ transformOrigin: 'top center' }}
                  >
                    <div style={{
                      transform: 'scale(var(--preview-scale, 1))',
                      transformOrigin: 'top center',
                    }}
                      ref={el => {
                        if (!el) return;
                        const containerW = el.parentElement.offsetWidth - 32;
                        const cardW = 11.5 * 37.8; // 11.5cm in px at 96dpi
                        const scale = Math.min(1, containerW / cardW);
                        el.style.setProperty('--preview-scale', scale);
                        el.style.marginBottom = `${-(el.scrollHeight * (1 - scale))}px`;
                      }}
                    >
                      <LivePreview photo={croppedImage} name={name} location={location} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400 text-center">
              Kartu <strong>11.5 × 14 cm</strong> dicetak di tengah halaman A5.
            </p>
          </div>
        </div>
      </main>

      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      {showCropper && rawImage && <ImageCropper imageSrc={rawImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />}
      {showToast && <Toast message={toastMsg} />}
    </div>
  );
}
