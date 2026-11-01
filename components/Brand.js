import Mark from './Mark';

// The tile and the name, on the welcome and setup-error screens.
export default function Brand() {
  return (
    <div className="brand">
      <Mark size={56} />
      <span className="wordmark">Pakka</span>
    </div>
  );
}
