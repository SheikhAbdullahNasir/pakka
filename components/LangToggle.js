'use client';
import { useLang } from '@/lib/i18n';

export default function LangToggle() {
  const { lang, changeLang } = useLang();
  return (
    <div className="segmented" role="group" aria-label="Language">
      <button className={lang === 'en' ? 'on' : ''} onClick={() => changeLang('en')}>
        English
      </button>
      <button className={lang === 'ur' ? 'on' : ''} onClick={() => changeLang('ur')}>
        Urdu
      </button>
    </div>
  );
}
