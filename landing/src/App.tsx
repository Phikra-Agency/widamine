const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

export default function App() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <p className="landing-eyebrow">Widamine</p>
        <h1>Cabinet médical-esthétique</h1>
        <p className="landing-lead">
          Site public en cours de construction. La prise de rendez-vous et le contenu marketing
          seront portés ici.
        </p>
      </header>

      <section className="landing-actions">
        <a className="landing-btn landing-btn-primary" href={adminUrl}>
          Espace staff
        </a>
      </section>
    </div>
  )
}
