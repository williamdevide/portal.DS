import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Disciplina from './pages/Disciplina';
import Aula from './pages/Aula';

export default function App() {
  // Inicialização do tema híbrido lendo o localStorage ou preferência do sistema
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fallback para preferência de sistema do usuário
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Atualiza as classes do HTML/body e o localStorage sempre que o tema muda
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-custom-bg text-custom-text transition-colors duration-300">
        
        {/* Cabeçalho do portal */}
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        
        {/* Conteúdo principal - Ajustado para expandir e ocupar a tela */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/disciplina/:disciplinaSlug" element={<Disciplina />} />
            {/* Template dinâmico para a aula da semana */}
            <Route path="/disciplina/:disciplinaSlug/semana/:semanaId" element={<Aula />} />
            
            {/* Fallback de rotas - Redireciona para Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Rodapé do portal */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
