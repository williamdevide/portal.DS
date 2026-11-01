import React from 'react';
import { ShieldAlert, X, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';

export default function PalavraIncorretaModal({ isOpen, onClose, onTentarNovamente, mensagem, grupoNome }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-custom-card border border-[#E30613]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de Fechar no Topo */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-custom-muted hover:text-custom-text rounded-xl hover:bg-white/5 transition-colors"
          title="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho com Ícone de Alerta SENAI */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E30613]/15 text-[#E30613] border border-[#E30613]/30 shadow-lg shadow-[#E30613]/10">
            <ShieldAlert className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E30613]/15 text-[#E30613] dark:text-[#ff3b47] border border-[#E30613]/25 font-mono">
              <KeyRound className="h-3 w-3" />
              Autenticação de Grupo
            </span>
            <h3 className="text-xl font-extrabold text-custom-text font-sans tracking-tight">
              Palavra-Chave Incorreta
            </h3>
            {grupoNome && (
              <p className="text-xs font-semibold text-[#E30613] dark:text-[#ff3b47]">
                {grupoNome}
              </p>
            )}
          </div>
        </div>

        {/* Mensagem Principal */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            {mensagem || 'A palavra-chave secreta informada para este grupo não confere com o registro oficial.'}
          </div>
        </div>

        {/* Orientações Pedagógicas / SENAI */}
        <div className="p-4 rounded-2xl bg-custom-bg border border-custom-border space-y-2 text-xs text-custom-muted font-sans leading-relaxed">
          <h4 className="font-bold text-custom-text flex items-center gap-1.5 text-xs">
            💡 Como proceder?
          </h4>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Verifique se não houve erro de digitação ou espaços adicionais.</li>
            <li>Confirme a palavra-chave secreta com os outros integrantes da sua equipe.</li>
            <li>A palavra-chave é confidencial e foi entregue pessoalmente pelo <strong>Professor William Devidé</strong> para cada grupo de TCC.</li>
          </ul>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-custom-muted hover:text-custom-text rounded-xl border border-custom-border hover:bg-white/5 transition-colors"
          >
            Fechar
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (onTentarNovamente) onTentarNovamente();
              onClose();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#E30613] hover:bg-[#b8050f] active:scale-95 transition-all rounded-xl shadow-lg shadow-[#E30613]/25"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar Digitar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
