// A small fixed credit pill, bottom-start: an ink border with a hard offset
// shadow, in the app's pixel style. Names no private individual — it just
// points at the framework the demo is built on.
const CREDIT_URL = "https://nextjs.org";

export function BuilderCredit() {
  return (
    <a
      className="builder-credit"
      dir="ltr"
      href={CREDIT_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Built with Next.js"
      title="Built with Next.js"
    >
      <span className="builder-credit__label">Built with</span>
      <span className="builder-credit__sep" aria-hidden="true">
        ·
      </span>
      <strong className="builder-credit__name">Next.js</strong>
    </a>
  );
}
