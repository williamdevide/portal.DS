import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, GraduationCap } from 'lucide-react';

export default function Header({ isDark, toggleTheme }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-custom-border bg-custom-card/85 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-custom-accent text-white shadow-sm transition-all duration-300">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-custom-text font-sans">
              William <span className="text-custom-accent">D. Komel</span>
            </span>
            <span className="hidden sm:block text-xs text-custom-muted font-medium">
              Portal do Professor
            </span>
          </div>
        </Link>

        {/* Menu e Alternador de Tema */}
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-sm font-semibold text-custom-muted hover:text-custom-accent transition-colors duration-300"
          >
            Início
          </Link>
          
          <div className="h-4 w-px bg-custom-border" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="relative rounded-lg p-2 text-custom-muted hover:bg-custom-bg hover:text-custom-text transition-all duration-300 focus:outline-none cursor-pointer"
            aria-label="Alternar Tema"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
