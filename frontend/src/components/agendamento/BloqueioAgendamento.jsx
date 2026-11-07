import React from 'react';
import { Lock, ShieldAlert, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export default function BloqueioAgendamento({ onNavigateToQuadro, onAbrirPinModal }) {
  return (
    <div className="max-w-3xl mx-auto my-8 animate-fade-in">
      <div className="rounded-3xl p-8 sm:p-12 bg-custom-card border-2 border-rose-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 h-56 w-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 bg-[#E30613]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ícone de Bloqueio em Destaque */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/20 to-[#E30613]/25 border-2 border-rose-500/30 text-rose-500 shadow-xl shadow-rose-500/10">
          <Lock className="h-10 w-10 animate-pulse" />
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30 font-sans shadow-sm">
            <ShieldAlert className="h-4 w-4" />
            Agendamentos bloqueados
          </span>
        </div>

        {/* Título e Explicação */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-custom-text font-sans tracking-tight">
            Agendamento de Bancas Temporariamente Bloqueado
          </h2>
          <p className="text-sm sm:text-base text-custom-muted font-sans leading-relaxed">
            A escolha de datas e horários para as bancas de defesa de TCC está bloqueada no momento pelo <strong className="text-custom-text">Professor William</strong>.
          </p>
          <p className="text-xs sm:text-sm text-custom-muted/90 font-sans leading-relaxed">
            A liberação ocorrerá presencialmente em sala de aula durante a aula de Projeto de Software III. Enquanto estiver bloqueado, nenhum aluno conseguirá realizar agendamentos.
          </p>
        </div>

        {/* Caixa de Aviso Acadêmico */}
        <div className="p-4 rounded-2xl bg-custom-bg/60 border border-custom-border text-xs text-custom-muted font-sans max-w-lg mx-auto flex items-center gap-3 text-left">
          <Sparkles className="h-5 w-5 text-custom-accent shrink-0" />
          <span>
            Você ainda pode consultar as datas de bancas e os horários que já foram preenchidos acessando o <strong>Quadro de Apresentações</strong>.
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onNavigateToQuadro && (
            <button
              type="button"
              onClick={onNavigateToQuadro}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-custom-accent hover:opacity-90 active:scale-95 transition-all rounded-xl shadow-lg shadow-custom-accent/25 cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              Ver Quadro de Apresentações
            </button>
          )}

          {onAbrirPinModal && (
            <button
              type="button"
              onClick={onAbrirPinModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold text-custom-muted hover:text-custom-text rounded-xl border border-custom-border hover:bg-white/5 transition-all cursor-pointer"
              title="Acesso privativo do professor via Google"
            >
              <ShieldCheck className="h-4 w-4 text-custom-accent" />
              Acesso do Professor (Google)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

