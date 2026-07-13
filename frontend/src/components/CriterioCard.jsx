import React, { useState } from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';

export default function CriterioCard({ criterio }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isCritico = criterio.tipo === 'Crítico';

  // Cores conforme o tipo de critério
  const typeBadgeClass = isCritico
    ? 'bg-custom-accent/10 text-custom-accent border border-custom-accent/20'
    : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50';

  const categoryColorClass = criterio.id.startsWith('CT')
    ? 'text-custom-accent/15'
    : 'text-purple-500/15';

  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      className="perspective-1000 w-full h-[320px] cursor-pointer group"
    >
      <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        
        {/* LADO FRENTE */}
        <div className="backface-hidden absolute inset-0 w-full h-full rounded-2xl border border-custom-border bg-custom-card p-6 flex flex-col justify-between shadow-sm group-hover:shadow-md transition-all duration-300">
          {/* Topo: Categoria ID e Tipo */}
          <div className="flex items-center justify-between">
            <span className={`text-5xl font-black tracking-tight ${categoryColorClass} font-sans`}>
              {criterio.id}
            </span>
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${typeBadgeClass}`}>
              {criterio.tipo}
            </span>
          </div>

          {/* Centro: Critério de Avaliação */}
          <div className="my-auto">
            <span className="block text-[10px] font-bold text-custom-muted uppercase tracking-wider mb-1.5 font-sans">
              Critério de Avaliação
            </span>
            <h3 className="text-xl font-extrabold text-custom-text font-sans group-hover:text-custom-accent transition-colors duration-300 leading-tight">
              {criterio.criterio_avaliacao}
            </h3>
          </div>

          {/* Rodapé da Frente */}
          <div className="flex items-center justify-between pt-3 border-t border-custom-border/40 text-custom-muted">
            <span className="text-[11px] font-semibold font-sans truncate max-w-[180px]">
              Capacidade: {criterio.capacidade}
            </span>
            <span className="text-[11px] font-bold flex items-center gap-1 text-custom-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <RefreshCw className="h-3 w-3" />
              Detalhes MSEP
            </span>
          </div>
        </div>

        {/* LADO VERSO */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl border border-custom-border bg-custom-card p-5 flex flex-col justify-between shadow-md overflow-hidden">
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] pr-1">
            {/* Capacidade */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-custom-accent block mb-0.5">
                Capacidade Técnica / Socioemocional
              </span>
              <p className="text-xs text-custom-text font-bold leading-relaxed font-sans">
                {criterio.capacidade}
              </p>
            </div>

            {/* Descrição do Critério */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-custom-muted block mb-0.5">
                Critério de Sucesso (Evidência)
              </span>
              <p className="text-xs text-custom-muted leading-relaxed font-sans text-justify">
                {criterio.descricao_criterio}
              </p>
            </div>

            {/* Conhecimento */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-custom-muted block mb-0.5 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Conhecimento Associado
              </span>
              <p className="text-[11px] text-custom-muted leading-relaxed font-sans">
                {criterio.conhecimento}
              </p>
            </div>
          </div>

          {/* Rodapé: Aulas e Voltar */}
          <div className="pt-2.5 border-t border-custom-border/40 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] scrollbar-none py-0.5">
              {criterio.aplicacao_aulas.map((aula, aIdx) => (
                <span key={aIdx} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-medium flex-shrink-0">
                  {aula.split(' ')[0]}
                </span>
              ))}
            </div>
            
            <span className="text-[10px] font-bold text-custom-muted flex items-center gap-1 flex-shrink-0">
              <RefreshCw className="h-3 w-3" />
              Voltar
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
