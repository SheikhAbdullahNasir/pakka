import { useLang } from '@/lib/i18n';
import Mark from './Mark';

// The tile, the name and the slogan, on the welcome and setup-error screens.
export default function Brand() {
  const { t } = useLang();
  return (
    <div className="brand">
      <Mark size={56} />
      <div className="brand-text">
        <span className="wordmark">Pakka</span>
        <span className="brand-slogan">{t('slogan')}</span>
      </div>
    </div>
  );
}
