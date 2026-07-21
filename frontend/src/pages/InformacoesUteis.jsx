import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock, FileText, Award, Layers, Terminal, Play, Trophy, ArrowRight } from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import dadosUteis from '../data/informacoes_uteis/conteudo.json';

export default function InformacoesUteis() {
  // Estado para controle de acessibilidade de fontes (escala)
  const [fontScale, setFontScale] = useState(1.0);
  
  // Efeito para resetar o scroll do body ao carregar
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  const handleAumentarFonte = () => {
    if (fontScale < 1.3) setFontScale(prev => prev + 0.1);
  };

  const handleDiminuirFonte = () => {
    if (fontScale > 0.85) setFontScale(prev => prev - 0.1);
  };

  const handleResetarFonte = () => {
    setFontScale(1.0);
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 !== 0) {
        return <strong key={index} className="font-bold text-custom-text">{part}</strong>;
      }
      return part;
    });
  };

  const heroImageUrl = "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-custom-bg text-custom-text transition-colors duration-300 relative">
      
      {/* Barra de Navegação Superior */}
      <div className="bg-custom-card border-b border-custom-border transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-custom-muted hover:text-custom-accent transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Home
          </Link>
        </div>
      </div>

      {/* Hero Imersivo */}
      <section className="bg-custom-card border-b border-custom-border py-16 transition-colors duration-300 relative overflow-hidden flex items-center min-h-[360px]">
        {/* Imagem de Fundo Dinâmica com Ken Burns */}
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
          <img 
            src={heroImageUrl} 
            alt="Calendário e Planejamento" 
            className="w-full h-full object-cover opacity-15 dark:opacity-20 scale-100 animate-ken-burns"
          />
        </div>

        {/* Máscara de Gradiente para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-r from-custom-bg via-custom-bg/95 to-transparent z-10 transition-colors duration-300" />
        
        <div 
          style={{ fontSize: `${fontScale * 1.50}rem` }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full"
        >
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Texto Principal */}
            <div className="lg:col-span-8 animate-fade-in space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 px-3.5 py-1 text-xs font-bold font-mono">
                <Calendar className="h-3.5 w-3.5" />
                Secretaria Acadêmica
              </span>
              
              <h1 className="text-[2.25em] sm:text-[3em] lg:text-[3.75em] font-black tracking-tight font-sans text-custom-text leading-none bg-clip-text text-transparent bg-gradient-to-r from-custom-text via-custom-text to-custom-accent/80">
                {dadosUteis.titulo}
              </h1>
              
              <p className="mt-8 text-[1em] sm:text-[1.125em] text-custom-muted leading-relaxed font-sans max-w-4xl text-justify">
                {dadosUteis.contexto_aluno}
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2 mt-8 max-w-4xl">
                <div className="rounded-3xl border border-custom-border bg-custom-card/40 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:border-custom-accent/30">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-custom-accent/5 blur-2xl pointer-events-none" />
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-custom-accent/10 text-custom-accent border border-custom-accent/20">
                      🎯 Foco da Central
                    </span>
                    <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans">
                      {dadosUteis.foco}
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-custom-border bg-custom-card/40 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      🛠️ Orientação Prática
                    </span>
                    <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans">
                      {dadosUteis.pratica}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel do Módulo de Vidro (Controle de Acessibilidade) */}
            <div className="lg:col-span-4 flex justify-center w-full">
              <div className="w-full max-w-[340px] rounded-3xl overflow-hidden bg-custom-card/50 border border-custom-border p-6 shadow-2xl relative backdrop-blur-md transition-colors duration-300">
                <span className="text-[10px] font-bold text-custom-accent uppercase tracking-wider block mb-3 font-mono">Controle de Visualização</span>
                
                <div className="space-y-4">
                  <div className="bg-custom-bg/60 border border-custom-border rounded-2xl p-4.5 space-y-2">
                    <span className="text-xs font-semibold text-custom-muted block">Tamanho da Fonte:</span>
                    <div className="flex items-center justify-between gap-2.5">
                      <button 
                        onClick={handleDiminuirFonte}
                        disabled={fontScale <= 0.85}
                        className="flex-1 py-2 text-xs font-bold rounded-xl border border-custom-border bg-custom-card hover:bg-custom-bg disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        A-
                      </button>
                      <button 
                        onClick={handleResetarFonte}
                        className="flex-1 py-2 text-xs font-black rounded-xl bg-custom-accent/10 border border-custom-accent/20 text-custom-accent hover:bg-custom-accent/20 transition-colors cursor-pointer text-center"
                      >
                        {(fontScale * 100).toFixed(0)}%
                      </button>
                      <button 
                        onClick={handleAumentarFonte}
                        disabled={fontScale >= 1.3}
                        className="flex-1 py-2 text-xs font-bold rounded-xl border border-custom-border bg-custom-card hover:bg-custom-bg disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-custom-muted font-mono pt-3 border-t border-custom-border/40">
                    <span>Unidade:</span>
                    <span className="font-bold text-custom-text">Ourinhos (7.94)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Técnico Principal */}
      <div 
        style={{ fontSize: `${fontScale * 1.0}rem` }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-20 space-y-16"
      >
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Coluna Esquerda: Calendário (Bloco A) e Grade Horária (Bloco B) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Bloco A: Calendário */}
            <div className="space-y-6">
              <h2 className="text-[1.5em] font-extrabold text-custom-text tracking-tight font-sans border-b border-custom-border pb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-custom-accent/10 text-custom-accent font-black text-xs">
                  A
                </span>
                {dadosUteis.bloco_A.titulo}
              </h2>
              
              <div className="bg-custom-card border border-custom-border rounded-3xl p-6 sm:p-8 space-y-6 text-[0.875rem] sm:text-[1rem] leading-relaxed text-custom-muted text-justify font-sans whitespace-pre-line">
                {renderMarkdown(dadosUteis.bloco_A.conteudo)}
              </div>

              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  📁 {dadosUteis.bloco_A.atividade_pratica.nome}
                </span>
                <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans">
                  {dadosUteis.bloco_A.atividade_pratica.instrucoes}
                </p>
              </div>
            </div>

            {/* Bloco B: Grade Horária */}
            <div className="space-y-6">
              <h2 className="text-[1.5em] font-extrabold text-custom-text tracking-tight font-sans border-b border-custom-border pb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-custom-accent/10 text-custom-accent font-black text-xs">
                  B
                </span>
                {dadosUteis.bloco_B.titulo}
              </h2>
              
              <div className="bg-custom-card border border-custom-border rounded-3xl p-6 sm:p-8 space-y-6 text-[0.875rem] sm:text-[1rem] leading-relaxed text-custom-muted text-justify font-sans whitespace-pre-line">
                {renderMarkdown(dadosUteis.bloco_B.conteudo)}
              </div>

              <div className="rounded-3xl border border-custom-accent/20 bg-custom-accent/5 p-6 space-y-3">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-custom-accent/10 text-custom-accent border border-custom-accent/20">
                  📅 {dadosUteis.bloco_B.atividade_pratica.nome}
                </span>
                <p className="text-xs sm:text-sm text-custom-muted leading-relaxed font-sans">
                  {dadosUteis.bloco_B.atividade_pratica.instrucoes}
                </p>
              </div>
            </div>

          </div>

          {/* Coluna Direita: Arquivo do Calendário (PDFViewer) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[1.125em] font-bold text-custom-text font-sans flex items-center gap-2">
                <FileText className="h-5 w-5 text-custom-accent" />
                Visualizador de Documentos
              </h3>
              
              {dadosUteis.recursos_multimidia.apresentacao_pptx && (
                <PDFViewer 
                  file={`/arquivos/informacoes_uteis/${dadosUteis.recursos_multimidia.apresentacao_pptx}`}
                  downloadUrl={`/arquivos/informacoes_uteis/${dadosUteis.recursos_multimidia.apresentacao_pptx}`}
                />
              )}

              {dadosUteis.recursos_multimidia.imagens_correlacionadas && dadosUteis.recursos_multimidia.imagens_correlacionadas.length > 0 && (
                <div className="rounded-3xl border border-custom-border bg-custom-card p-6 shadow-lg space-y-6 mt-8">
                  <h3 className="text-[1.125em] font-bold text-custom-text font-sans flex items-center gap-2">
                    <Layers className="h-5 w-5 text-custom-accent" />
                    Grade de Horários & Mídias
                  </h3>
                  
                  <div className="space-y-6">
                    {dadosUteis.recursos_multimidia.imagens_correlacionadas.map((imagem, idx) => (
                      <div key={idx} className="space-y-2">
                        <span className="text-[0.75em] font-mono text-custom-muted block truncate" title={imagem}>
                          🖼️ {imagem}
                        </span>
                        <div className="rounded-2xl overflow-hidden border border-custom-border bg-custom-bg/60 shadow-md">
                          <img 
                            src={`/arquivos/informacoes_uteis/${imagem}`}
                            alt={imagem}
                            className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
