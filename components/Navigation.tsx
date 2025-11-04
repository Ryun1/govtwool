'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dreps', label: 'DReps' },
    { href: '/actions', label: 'Actions' },
    { href: '/delegate', label: 'Delegate' },
    { href: '/register-drep', label: 'Register' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 font-display text-xl font-bold">
            <span className="text-2xl">🐑</span>
            <span className="bg-gradient-to-r from-field-green to-field-dark bg-clip-text text-transparent dark:from-field-light dark:to-field-green">
              GovTwool
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

