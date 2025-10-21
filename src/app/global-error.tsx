'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error to console
  if (typeof console !== 'undefined') {
    console.error('Global error:', error);
  }

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '28rem',
            margin: '0 auto',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '1rem'
            }}>
              Erro do Sistema
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              Ocorreu um erro crítico na aplicação. Por favor, tente recarregar a página.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}