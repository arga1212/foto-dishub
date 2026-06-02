import { useRef, useState, useEffect } from 'react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  const startCamera = async (mode = 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          setError('https_required');
        } else {
          setError('Browser tidak mendukung akses kamera. Coba gunakan Chrome atau Safari terbaru.');
        }
        return;
      }

      let stream;
      try {
        // Try with ideal facingMode first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        // Fallback: try without facingMode constraint (some Android devices)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsReady(true);
          setError(null);
        };
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('permission_denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Kamera tidak ditemukan di perangkat ini.');
      } else {
        setError('Tidak dapat mengakses kamera. Pastikan tidak digunakan aplikasi lain.');
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleFlip = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    setIsReady(false);
    await startCamera(newMode);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ambil Foto</h3>
            <p className="text-sm text-gray-500 mt-0.5">Posisikan wajah di tengah frame</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black" style={{ aspectRatio: '11.5 / 12.5', maxHeight: '70vh' }}>
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-3">
              <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M3 8a2 2 0 00-2 2v4a2 2 0 002 2h9a2 2 0 002-2v-4a2 2 0 00-2-2H3z" />
              </svg>
              {error === 'permission_denied' ? (
                <>
                  <p className="text-white text-sm font-semibold">Izin kamera ditolak</p>
                  <p className="text-gray-400 text-xs">Buka pengaturan browser/HP kamu, lalu izinkan akses kamera untuk situs ini.</p>
                  <button
                    onClick={() => { setError(null); setIsReady(false); startCamera(facingMode); }}
                    className="mt-1 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: '#003087' }}
                  >
                    Coba Lagi
                  </button>
                </>
              ) : error === 'https_required' ? (
                <>
                  <p className="text-white text-sm font-semibold">Koneksi HTTPS diperlukan</p>
                  <p className="text-gray-400 text-xs">Akses kamera hanya bisa lewat HTTPS. Pastikan URL diawali <strong className="text-white">https://</strong> bukan http://</p>
                </>
              ) : (
                <p className="text-white text-sm">{error}</p>
              )}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                playsInline
                muted
              />
              {/* Guide overlay - oval wajah lebih kecil, posisi agak atas */}
              <div className="absolute inset-0 pointer-events-none" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12%' }}>
                <div style={{
                  width: '52%',
                  aspectRatio: '3 / 4',
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                }} />
              </div>
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleFlip}
            className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Balik Kamera"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={handleCapture}
            disabled={!isReady}
            className="w-16 h-16 rounded-full border-4 border-gray-300 flex items-center justify-center transition-all hover:border-blue-900 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: isReady ? '#003087' : '#9CA3AF' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
