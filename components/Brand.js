// The "P" tile and the name, on the welcome and setup-error screens. The tile is a placeholder until a logo is designed.
export default function Brand() {
  return (
    <div className="brand">
      <div className="monogram" aria-hidden="true">
        P
      </div>
      <span className="wordmark">Pakka</span>
    </div>
  );
}
