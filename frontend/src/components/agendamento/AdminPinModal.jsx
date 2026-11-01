import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle, KeyRound } from 'lucide-react';
import { autenticarProfessor } from '../../services/agendamentoService';

export default function AdminPinModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Por favor, informe o PIN administrativo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await autenticarProfessor(pin.trim());
      onSuccess(pin.trim());
      setPin('');
      onClose();
    } catch (err) {
      setError(err.message || 'PIN incorreto. Acesso restrito ao professor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-custom-card border border-custom-border rounded-2xl p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-custom-muted hover:text-custom-text rounded-lg hover:bg-white/5 transition-colors"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho do Modal */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-custom-accent/15 text-custom-accent border border-custom-accent/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-custom-text font-sans">
              Autenticação do Professor
            </h3>
            <p className="text-xs text-custom-muted font-sans">
              Área restrita para edição e cancelamento de bancas
            </p>
          </div>
        </div>

        {/* Mensagem Explicativa */}
        <p className="text-sm text-custom-muted font-sans leading-relaxed mb-5">
          Para garantir a integridade dos agendamentos, apenas o professor responsável pode alterar datas ou remover reservas de TCC.
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-custom-text mb-2 font-sans">
              PIN / Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Digite o PIN do professor..."
                autoFocus
                className="w-full px-4 py-3 text-sm rounded-xl bg-custom-bg border border-custom-border text-custom-text placeholder-custom-muted/60 focus:outline-none focus:border-custom-accent focus:ring-1 focus:ring-custom-accent transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-muted hover:text-custom-text p-1 transition-colors"
                title={showPin ? 'Ocultar PIN' : 'Exibir PIN'}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-custom-muted italic font-sans">
              Dica padrão de desenvolvimento: <span className="font-mono text-custom-accent">senai@2026</span>
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-custom-muted hover:text-custom-text transition-colors rounded-xl hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-custom-accent hover:opacity-90 active:scale-95 transition-all rounded-xl shadow-lg shadow-custom-accent/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Liberar Modo Professor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
