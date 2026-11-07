import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, AlertCircle, LogOut } from 'lucide-react';
import { loginComGoogle, logoutProfessor, obterProfessorAtual, PROFESSOR_EMAIL } from '../../services/authService';

export default function AdminPinModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setCurrentUser(obterProfessorAtual());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginGoogle = async () => {
    setLoading(true);
    setError('');

    try {
      const professor = await loginComGoogle();
      setCurrentUser(professor);
      onSuccess(professor);
      onClose();
    } catch (err) {
      setError(err.message || 'Falha ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutProfessor();
      setCurrentUser(null);
    } catch (err) {
      setError('Falha ao desconectar conta: ' + err.message);
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
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-custom-text font-sans">
              Autenticação do Professor
            </h3>
            <p className="text-xs text-custom-muted font-sans">
              Acesso restrito via Google Sign-In
            </p>
          </div>
        </div>

        {/* Mensagem Explicativa */}
        <div className="bg-custom-bg/60 border border-custom-border/80 rounded-xl p-3.5 mb-5 text-xs text-custom-muted font-sans leading-relaxed">
          <p className="mb-1 text-custom-text font-medium">
            🛡️ Proteção de Segurança Máxima
          </p>
          <p>
            Para garantir a integridade total do cronograma e evitar manipulações indevidas, o Modo Professor requer autenticação oficial com a Conta Google do docente responsável: <strong className="text-custom-accent font-mono">{PROFESSOR_EMAIL}</strong>.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Estado: Usuário já autenticado como o Professor William */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName} 
                  className="h-10 w-10 rounded-full border border-emerald-500/30 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">
                  W
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-custom-text truncate">
                  {currentUser.displayName}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Desconectar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSuccess(currentUser);
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-custom-accent hover:opacity-90 active:scale-95 transition-all rounded-xl shadow-lg shadow-custom-accent/25"
              >
                <ShieldCheck className="h-4 w-4" />
                Entrar no Modo Professor
              </button>
            </div>
          </div>
        ) : (
          /* Estado: Não autenticado - Botão Oficial do Google */
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleLoginGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-custom-border bg-white text-gray-800 hover:bg-gray-50 active:scale-[0.98] font-sans text-sm font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                  <span>Conectando com o Google...</span>
                </>
              ) : (
                <>
                  {/* Google 'G' Logo SVG oficial */}
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Entrar com Conta Google</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-custom-muted font-sans">
              * Apenas a conta Google oficial do professor será aceita pelo sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
