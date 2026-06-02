import { useState } from 'react';
import { Document, Page, View, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatFileName } from '../utils/pdfHelpers';
import { deleteCard } from './PdfGenerator';

const CM = 28.3465;
const CARD_W = 11.5 * CM;
const CARD_H = 14 * CM;

const styles = StyleSheet.create({
  page: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  outline: { width: CARD_W, height: CARD_H, borderWidth: 0.5, borderColor: '#AAAAAA', borderStyle: 'dashed', flexDirection: 'column', overflow: 'hidden' },
  photoWrapper: { flex: 1, padding: 6, backgroundColor: '#FFFFFF' },
  photo: { flex: 1, width: '100%', height: '100%', objectFit: 'cover' },
  nameSection: { paddingHorizontal: 0.3 * CM, paddingTop: 0.25 * CM, paddingBottom: 0.3 * CM, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  nameText: { fontSize: 15, fontWeight: 'bold', color: '#003087', textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center' },
  locationText: { fontSize: 8, color: '#555555', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginTop: 3 },
});

function CardDocument({ photoDataUrl, name, location }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.outline}>
          <View style={styles.photoWrapper}>
            <Image src={photoDataUrl} style={styles.photo} />
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.nameText}>{name.toUpperCase()}</Text>
            {location ? <Text style={styles.locationText}>{location.toUpperCase()}</Text> : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SavedCards({ cards, onCardsChange }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleReprint = async (card) => {
    setLoadingId(card.id);
    try {
      const blob = await pdf(
        <CardDocument photoDataUrl={card.photo} name={card.name} location={card.location} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const isSafariIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
      if (isSafariIOS) {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = formatFileName(card.name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = (id) => {
    deleteCard(id);
    onCardsChange();
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <p className="text-xs text-gray-400">Belum ada kartu tersimpan</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3">
      {cards.map((card) => (
        <div key={card.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50">
          {/* Thumbnail */}
          <img
            src={card.photo}
            alt={card.name}
            className="w-10 h-12 object-cover rounded-lg flex-shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{card.name}</p>
            {card.location && (
              <p className="text-xs text-gray-500 truncate">{card.location}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(card.savedAt)}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button
              onClick={() => handleReprint(card)}
              disabled={loadingId === card.id}
              title="Unduh PDF"
              className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
              style={{ color: '#003087' }}
            >
              {loadingId === card.id ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleDelete(card.id)}
              title="Hapus"
              className="p-1.5 rounded-lg transition-colors hover:bg-red-50 text-gray-400 hover:text-red-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
