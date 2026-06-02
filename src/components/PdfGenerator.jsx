import { useState } from 'react';
import { Document, Page, View, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { imageUrlToDataUrl, formatFileName } from '../utils/pdfHelpers';

const CM = 28.3465;
const CARD_W = 11.5 * CM;
const CARD_H = 14 * CM;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  // Cutting outline
  outline: {
    width: CARD_W,
    height: CARD_H,
    borderWidth: 0.5,
    borderColor: '#AAAAAA',
    borderStyle: 'dashed',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  photoWrapper: {
    flex: 1,
    padding: 6,
    backgroundColor: '#FFFFFF',
  },
  photo: {
    flex: 1,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  nameSection: {
    paddingHorizontal: 0.3 * CM,
    paddingTop: 0.25 * CM,
    paddingBottom: 0.3 * CM,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  nameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003087',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 8,
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 3,
  },
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

export function saveCardToStorage(photo, name, location) {
  const saved = JSON.parse(localStorage.getItem('dishub_cards') || '[]');
  const card = {
    id: Date.now(),
    photo,
    name,
    location,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem('dishub_cards', JSON.stringify([card, ...saved]));
  return card;
}

export function getSavedCards() {
  return JSON.parse(localStorage.getItem('dishub_cards') || '[]');
}

export function deleteCard(id) {
  const saved = getSavedCards().filter(c => c.id !== id);
  localStorage.setItem('dishub_cards', JSON.stringify(saved));
}

export default function PdfGenerator({ photo, name, location, onSuccess }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!photo || !name) return;
    setIsGenerating(true);
    try {
      const photoDataUrl = await imageUrlToDataUrl(photo);

      const blob = await pdf(
        <CardDocument photoDataUrl={photoDataUrl} name={name} location={location} />
      ).toBlob();

      const url = URL.createObjectURL(blob);

      // Safari iOS doesn't support blob download via anchor click — open in new tab
      const isSafariIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
      if (isSafariIOS) {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = formatFileName(name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      // Save to localStorage (simpan foto as data URL biar bisa generate ulang)
      saveCardToStorage(photoDataUrl, name, location);

      onSuccess?.();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = !photo || !name || isGenerating;

  return (
    <button
      onClick={handleGenerate}
      disabled={isDisabled}
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all"
      style={{
        background: isDisabled ? '#D1D5DB' : '#003087',
        color: isDisabled ? '#9CA3AF' : 'white',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isDisabled ? 'none' : '0 4px 14px rgba(0,48,135,0.35)',
      }}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Membuat PDF...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Buat & Unduh PDF
        </>
      )}
    </button>
  );
}
