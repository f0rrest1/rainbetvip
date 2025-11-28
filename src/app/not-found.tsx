import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[--background]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-white/70 mb-8">Page not found</p>
        <Link 
          href="/" 
          className="rbv-button-primary"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
