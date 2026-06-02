import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const PHOTO_ASPECT = 14 / 15.5; // Card width / card height minus name section

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Output at high resolution for PDF quality
      const scale = 4;
      canvas.width = pixelCrop.width * scale;
      canvas.height = pixelCrop.height * scale;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas is empty')); return; }
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg', 0.95);
    });
    image.addEventListener('error', reject);
    image.src = imageSrc;
  });
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((c) => setCrop(c), []);
  const onZoomChange = useCallback((z) => setZoom(z), []);

  const onCropCompleteHandler = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-700 text-gray-900" style={{ fontWeight: 700 }}>
            Sesuaikan Foto
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Geser dan zoom untuk menyesuaikan posisi foto</p>
        </div>

        {/* Cropper */}
        <div className="relative bg-gray-900" style={{ height: '360px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={PHOTO_ASPECT}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
            cropShape="rect"
            showGrid={true}
            style={{
              cropAreaStyle: {
                border: '2px solid #003087',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
              }
            }}
          />
        </div>

        {/* Zoom Slider */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium w-8">Min</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-blue-900 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-medium w-8 text-right">Max</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            style={{ background: isProcessing ? '#9CA3AF' : '#003087', color: 'white' }}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Memproses...
              </>
            ) : 'Gunakan Foto Ini'}
          </button>
        </div>
      </div>
    </div>
  );
}
