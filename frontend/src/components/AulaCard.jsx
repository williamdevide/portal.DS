import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RefreshCw, ArrowRight } from 'lucide-react';

export default function AulaCard({ aula }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const numSemana = parseInt(aula.semana_numero, 10);

  // Calcula a duração com base nos dados reais do JSON
  const obterDuracao = () => {
    if (aula.bloco_A?.tempo && aula.bloco_B?.tempo) {
      // Semana 1 possui: "1h 30min / 2 aulas" e "2h 15min / 3 aulas"
      // Se detectarmos os valores padrão, podemos calcular de forma inteligente:
      if (aula.bloco_A.tempo.includes("1h 30min") && aula.bloco_B.tempo.includes("2h 15min")) {
        return "3h 45min (5 aulas)";
      }
      return `${aula.bloco_A.tempo.split(' / ')[0]} + ${aula.bloco_B.tempo.split(' / ')[0]}`;
    }
    return "A Informar";
  };

  const duracaoFormatada = obterDuracao();

  // Cores de badge conforme a situação de aprendizagem (SA)
  let saBadgeClass = '';
  if (aula.situacao_aprendizagem.includes('SA1')) {
    saBadgeClass = 'bg-custom-accent/10 text-custom-accent border border-custom-accent/25';
  } else if (aula.situacao_aprendizagem.includes('SA2')) {
    saBadgeClass = 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50';
  } else if (aula.situacao_aprendizagem.includes('SA3')) {
    saBadgeClass = 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50';
  } else {
    saBadgeClass = 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
  }

  const handleCardClick = (e) => {
    // Evita o flip se o usuário clicar no botão/link de acessar a aula completa
    if (e.target.closest('.action-btn')) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="perspective-1000 w-full h-[280px] cursor-pointer group"
    >
      <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        
        {/* LADO FRENTE */}
        <div className="backface-hidden absolute inset-0 w-full h-full rounded-2xl border border-custom-border bg-custom-card p-6 flex flex-col justify-between shadow-sm group-hover:shadow-md transition-all duration-300">
          {/* Topo: Semana e Badge */}
          <div className="flex items-center justify-between">
            <span className="text-5xl font-black tracking-tight text-custom-accent/15 font-sans">
              #{aula.semana_numero}
            </span>
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${saBadgeClass}`}>
              {aula.situacao_aprendizagem}
            </span>
          </div>

          {/* Centro: Título da Aula */}
          <div className="my-auto">
            <h3 className="text-xl font-extrabold text-custom-text font-sans group-hover:text-custom-accent transition-colors duration-300 leading-tight">
              {aula.titulo}
            </h3>
          </div>

          {/* Rodapé da Frente */}
          <div className="flex items-center justify-between pt-3 border-t border-custom-border/40 text-custom-muted">
            <span className="text-xs font-semibold flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {duracaoFormatada}
            </span>
            <span className="text-[11px] font-bold flex items-center gap-1 text-custom-accent opacity-0 group-hover:opacity-100 transition-opacity">
              <RefreshCw className="h-3 w-3" />
              Ver verso
            </span>
          </div>
        </div>

        {/* LADO VERSO */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl border border-custom-border bg-custom-card p-6 flex flex-col justify-between shadow-md">
          {/* Topo do Verso */}
          <div className="flex items-center justify-between border-b border-custom-border/40 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-custom-accent font-sans">
              Semana {aula.semana_numero} • Detalhes
            </span>
            <span className="text-[10px] text-custom-muted font-bold font-mono">
              {aula.situacao_aprendizagem}
            </span>
          </div>

          {/* Centro do Verso: Descrição de Contexto */}
          <div className="my-auto overflow-y-auto max-h-[120px] pr-1">
            <p className="text-xs text-custom-muted leading-relaxed font-sans text-justify">
              {aula.contexto}
            </p>
          </div>

          {/* Rodapé do Verso: Botão de Navegação Física */}
          <div className="pt-3 border-t border-custom-border/40 flex items-center justify-between">
            <span className="text-[10px] font-bold text-custom-muted flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Voltar
            </span>
            
            <Link 
              to={`/disciplina/banco-de-dados/semana/${numSemana}`}
              className="action-btn inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white hover:bg-custom-accent dark:bg-slate-800 dark:hover:bg-custom-accent px-4.5 py-2 text-xs font-bold shadow-sm transition-all hover:translate-x-0.5"
            >
              Acessar Aula
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
