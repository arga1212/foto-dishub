export default function LivePreview({ photo, name, location }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Pratinjau Kartu
      </p>

      {/* Outer cutting guide */}
      <div
        style={{
          width: '11.5cm',
          height: '14cm',
          border: '3px solid #000000',
          padding: '0.15cm',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Card */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#FFFFFF',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Photo */}
          <div style={{ padding: '0.2cm 0.2cm 0', background: '#fff', flex: 1, display: 'flex' }}>
            <div
              style={{
                flex: 1,
                overflow: 'hidden',
                background: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {photo ? (
                <img
                  src={photo}
                  alt="Foto Petugas"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2cm', color: '#9CA3AF' }}>
                  <svg style={{ width: '1cm', height: '1cm' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span style={{ fontSize: '0.25cm', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#9CA3AF' }}>
                    Upload foto
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name + Location */}
          <div
            style={{
              padding: '0.25cm 0.3cm 0.45cm',
              textAlign: 'center',
              borderTop: '0.04cm solid #E5E7EB',
              background: '#fff',
            }}
          >
            <div style={{
              fontSize: '0.75cm',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.04cm',
              color: name ? '#003087' : '#D1D5DB',
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.2,
            }}>
              {name || 'NAMA PETUGAS'}
            </div>
            <div style={{
              fontSize: '0.28cm',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.03cm',
              color: location ? '#555555' : '#D1D5DB',
              fontFamily: 'Montserrat, sans-serif',
              marginTop: '0.08cm',
            }}>
              {location || 'LOKASI TUGAS'}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 font-medium">11.5 cm × 14 cm</p>
    </div>
  );
}
