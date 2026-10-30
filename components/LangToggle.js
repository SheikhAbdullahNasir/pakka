'use client';
// Small "EN | Urdu" chip. `wide` stretches it across the row (used in Settings).
import { useLang } from '@/lib/i18n';

export default function LangToggle({ wide }) {
  const { lang, changeLang } = useLang();
  return (
    <div className={'lang' + (wide ? ' wide' : '')} role="group" aria-label="Language">
      {[
        ['en', 'EN', 'English'],
        ['ur', 'Urdu', 'Roman Urdu'],
      ].map(([code, short, full]) => (
        <button
          key={code}
          type="button"
          className={lang === code ? 'on' : ''}
          aria-pressed={lang === code}
          onClick={() => changeLang(code)}
        >
          <span>{wide ? full : short}</span>
        </button>
      ))}
    </div>
  );
}
