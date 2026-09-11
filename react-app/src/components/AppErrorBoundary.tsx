import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i;

export function isChunkLoadError(error: Error) {
  return CHUNK_ERROR_PATTERN.test(`${error.name} ${error.message}`);
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  private headingRef = { current: null as HTMLHeadingElement | null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uygulama çalışma zamanı hatası', error, info);
    window.requestAnimationFrame(() => this.headingRef.current?.focus());
  }

  private retry = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    const chunkError = isChunkLoadError(error);

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <section
          className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-sm p-8 text-center"
          role="alert"
          aria-labelledby="app-error-title"
        >
          <p className="text-cyan text-sm font-semibold tracking-[0.18em] uppercase">CyberSense</p>
          <h1
            id="app-error-title"
            ref={(node) => { this.headingRef.current = node; }}
            tabIndex={-1}
            className="mt-3 text-2xl font-bold text-navy outline-none"
          >
            {chunkError ? 'Site güncellendi' : 'Beklenmeyen bir sorun oluştu'}
          </h1>
          <p className="mt-3 text-gray-600 leading-relaxed">
            {chunkError
              ? 'Yeni sürümü yüklemek için sayfayı yenileyin.'
              : 'Sayfa şu anda görüntülenemiyor. Yeniden yükleyerek tekrar deneyebilirsiniz.'}
          </p>
          <button type="button" className="btn-cyber mt-7" onClick={this.retry}>
            Sayfayı yenile
          </button>
          <p className="mt-5 text-sm text-gray-500">
            Sorun sürerse internet bağlantınızı kontrol edip bir süre sonra tekrar deneyin.
          </p>
        </section>
      </main>
    );
  }
}
