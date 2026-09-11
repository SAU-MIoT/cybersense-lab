import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-20 text-center" aria-labelledby="not-found-title">
      <p className="text-cyan text-sm font-semibold tracking-[0.2em] uppercase">404</p>
      <h1 id="not-found-title" className="mt-3 text-3xl sm:text-4xl font-bold text-navy">
        Bu sayfa bulunamadı
      </h1>
      <p className="mt-4 text-gray-600">
        Bağlantı değişmiş veya sayfa kaldırılmış olabilir.
      </p>
      <Link to="/" className="btn-cyber mt-8">
        Ana sayfaya dön
      </Link>
    </section>
  );
}
