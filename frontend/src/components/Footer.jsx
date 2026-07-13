import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-custom-border bg-custom-card transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-sm text-custom-muted">
            &copy; {currentYear} SENAI Ourinhos. Todos os direitos reservados.
          </p>
          <p className="text-center text-xs text-custom-muted">
            Curso Técnico em Desenvolvimento de Sistemas • Disciplina de Banco de Dados
          </p>
        </div>
      </div>
    </footer>
  );
}
