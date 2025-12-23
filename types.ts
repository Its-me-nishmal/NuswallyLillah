
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  QURAN = 'QURAN',
  PRAYER = 'PRAYER',
  QIBLA = 'QIBLA',
  TASBEEH = 'TASBEEH',
  EVENTS = 'EVENTS',
  ZAKAT = 'ZAKAT',
  AI_ASSISTANT = 'AI_ASSISTANT',
  DONATE = 'DONATE',
  NAMES = 'NAMES',
  DUA = 'DUA',
  CALENDAR = 'CALENDAR',
  QUIZ = 'QUIZ',
  TRACKER = 'TRACKER',
  HAJJ = 'HAJJ',
  QURAN_AUDIO = 'QURAN_AUDIO'
}

export interface PrayerTime {
  name: string;
  time: string; // HH:MM 24h format
  isNext: boolean;
}

export interface PrayerApiResponse {
  code: number;
  status: string;
  data: {
    timings: {
      [key: string]: string;
    };
    date: {
      readable: string;
      hijri: {
        date: string;
        day: string;
        month: {
          en: string;
          ar: string;
        };
        year: string;
      };
    };
  };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  audio: string; // URL
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranEdition {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean | any;
    audio?: string; // Merged from audio edition
    translation?: string; // Merged from translation edition
  }[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  category: 'Lecture' | 'Community' | 'Charity';
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

// Quran Audio Types
export interface QuranAudioChapter {
  index: number;
  name: string;
  nameTrans: string;
  nameMl?: string;  // Malayalam
  fileName: string;
  size: string;
  durationInSecs: number;
}

export interface QuranAudioSource {
  baseUrl: string;
  language: string;
  reciterName?: string;
  chapters: QuranAudioChapter[];
}

export interface LastListened {
  language: string;
  reciterIndex?: number;
  chapterIndex: number;
  position: number; // seconds
  timestamp: number;
}

export type PlaybackMode = 'sequential' | 'loop-one' | 'loop-all' | 'shuffle';