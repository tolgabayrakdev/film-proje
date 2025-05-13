import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isQuizPage = pathname === '/quiz';

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/20 to-transparent backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <Link href="/" className="text-white font-bold text-xl hover:text-indigo-200 transition-colors">
            Film Öneri Asistanı
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Ana Sayfa
            </Link>
            {!isQuizPage && (
              <Link 
                href="/quiz" 
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Hemen Başlayalım
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 