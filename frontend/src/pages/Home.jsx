import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowRight, Code, Terminal, Brain } from 'lucide-react';
import informacoes_gerais from '../data/informacoes_gerais.json';
import listaDisciplinas from '../data/disciplinas.json';

export default function Home() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDisciplinas = async () => {
      const carregadas = [];
      for (const disc of listaDisciplinas) {
        try {
          const data = await import(`../data/${disc.pasta}/disciplina.json`);
          carregadas.push({
            ...disc,
            ...(data.default || data)
          });
        } catch (e) {
          console.error(`Erro ao carregar disciplina ${disc.pasta}:`, e);
        }
      }
      setDisciplinas(carregadas);
      setLoading(false);
    };
    loadDisciplinas();
  }, []);

  // Imagem de datacenter premium em alta resolução para plano de fundo cinemático
  const heroImageUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-custom-bg text-custom-text transition-colors duration-300">
      
      {/* Banner Hero Cinemático e Tecnológico (Imagem em Segundo Plano com Efeito Ken Burns) */}
      <section className="relative overflow-hidden min-h-[500px] lg:min-h-[600px] flex items-center bg-slate-950 text-white rounded-b-[2.5rem] shadow-2xl transition-all duration-300">
        
        {/* Imagem de Fundo Dinâmica com Movimentação Lenta (Ken Burns) */}
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
          <img 
            src={heroImageUrl} 
            alt="Datacenter e Redes" 
            className="w-full h-full object-cover opacity-35 dark:opacity-25 scale-100 animate-ken-burns"
          />
        </div>

        {/* Máscara de Gradiente Avançada para Fusão e Altíssima Legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30 z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 z-10" />
        
        {/* Glows de Luz Colorida Adicionais */}
        <div className="absolute -top-40 -right-40 h-[450px] w-[450px] rounded-full bg-custom-accent/15 blur-[120px] pointer-events-none z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 w-full py-16">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Conteúdo Textual (Primeiro Plano) */}
            <div className="lg:col-span-7 max-w-3xl animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-stone-200 backdrop-blur-md mb-6">
                <span className="flex h-2.5 w-2.5 rounded-full bg-custom-accent animate-ping" />
                {informacoes_gerais.curso}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-sans leading-tight">
                Portal do Professor <br />
                <span className="text-custom-accent font-black drop-shadow-md">
                  {informacoes_gerais.professor}
                </span>
              </h1>
              
              <p className="mt-6 text-lg font-medium text-stone-300 font-sans max-w-2xl leading-relaxed">
                {informacoes_gerais.boas_vindas}
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <a 
                  href="#disciplinas"
                  className="inline-flex items-center gap-2 rounded-xl bg-custom-accent bg-custom-accent-hover px-7 py-4 text-sm font-bold text-white shadow-lg shadow-custom-accent transition-all hover:translate-y-[-2px] focus:outline-none"
                >
                  Acessar Disciplinas
                  <ArrowRight className="h-4.5 w-4.5" />
                </a>
                <div className="flex items-center gap-3 text-stone-300 px-5 py-3 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                  <Code className="h-5 w-5 text-custom-accent" />
                  <span className="text-sm font-mono font-medium">#{informacoes_gerais.unidade.replace(/\s+/g, '-')}</span>
                </div>
              </div>
            </div>

            {/* Painel Cyberpunk de Simulação de Banco de Dados (Glassmorphism no Primeiro Plano) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-[440px] rounded-3xl overflow-hidden glass-panel border border-white/15 p-6 shadow-2xl relative group hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white/50">MySQL Terminal • Active</span>
                </div>
                
                {/* Console Log Simulando Consultas Dinâmicas de BD */}
                <div className="font-mono text-xs space-y-3.5 text-stone-200">
                  <p className="text-stone-400">
                    $ mysql -u professor_william -p
                  </p>
                  <p className="text-emerald-400 font-bold">
                    Connected to database 'senai_db'
                  </p>
                  <div className="bg-black/35 rounded-lg p-3 border border-white/5">
                    <span className="text-sky-400 font-bold block mb-1">SELECT</span>
                    <span className="pl-3 block text-stone-300">aluno_nome, matricula_status</span>
                    <span className="text-sky-400 font-bold block my-1">FROM</span>
                    <span className="pl-3 block text-stone-300">desenvolvimento_sistemas</span>
                    <span className="text-sky-400 font-bold block my-1">WHERE</span>
                    <span className="pl-3 block text-emerald-400">autonomia = 'AUT';</span>
                  </div>
                  <p className="text-stone-500 text-[10px] italic">
                    &gt; 25 rows in set (0.02 sec)
                  </p>
                  
                  {/* Sinalizador Holográfico */}
                  <div className="border border-custom-accent/25 bg-custom-accent/10 rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-custom-accent uppercase">MSEP Nível 4</span>
                    <span className="text-[10px] font-bold text-emerald-400">Autônomo (AUT)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Seção de Disciplinas */}
      <section id="disciplinas" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-custom-border pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight font-sans sm:text-4xl">
              Minhas Disciplinas
            </h2>
            <p className="mt-2 text-base text-custom-muted max-w-xl">
              Acesse as trilhas pedagógicas, cronogramas de aula e critérios de avaliação de cada módulo.
            </p>
          </div>
          <span className="text-sm font-bold text-custom-accent bg-custom-accent/10 px-4 py-2 rounded-full border border-custom-accent/10">
            {loading ? "..." : `${disciplinas.length} ${disciplinas.length === 1 ? 'Disciplina' : 'Disciplinas'} em Destaque`}
          </span>
        </div>

        {/* Grid de Disciplinas */}
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12 text-custom-muted font-sans animate-pulse">
              Carregando disciplinas...
            </div>
          ) : (
            disciplinas.map((disc) => (
              <div 
                key={disc.pasta}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-custom-border bg-custom-card p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                {/* Linha Accent Decorativa */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-custom-accent group-hover:h-2 transition-all duration-300" />
                
                <div className="relative">
                  {/* Icon Container */}
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-custom-accent/10 text-custom-accent shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {disc.pasta === 'banco_de_dados' ? (
                      <Database className="h-6 w-6" />
                    ) : (
                      <Terminal className="h-6 w-6" />
                    )}
                  </div>
                  
                  <span className="block text-xs font-bold uppercase tracking-wider text-custom-muted mb-1 font-sans">
                    {disc.semestre} • {disc.carga_horaria}
                  </span>
                  
                  <h3 className="text-2xl font-extrabold text-custom-text font-sans group-hover:text-custom-accent transition-colors duration-300 leading-tight">
                    {disc.nome}
                  </h3>
                  
                  <p className="mt-4 text-sm text-custom-muted leading-relaxed font-sans line-clamp-5">
                    {disc.abertura}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-custom-border">
                  <Link 
                    to={`/disciplina/${disc.pasta}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-custom-accent text-slate-500 hover:text-white dark:bg-slate-800 dark:hover:bg-custom-accent dark:text-slate-300 dark:hover:text-white px-4 py-3.5 text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Acessar Disciplina
                    <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))
          )}

          {/* Placeholders para futuras disciplinas */}
          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-custom-border bg-custom-card/40 p-6 opacity-60">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-custom-border text-custom-muted">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-custom-muted font-sans">
                Projeto de Software III
              </h3>
              <p className="mt-2 text-xs text-custom-muted max-w-[220px] font-sans">
                Módulo reservado para o próximo semestre.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-custom-border bg-custom-card/40 p-6 opacity-60">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-custom-border text-custom-muted">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-custom-muted font-sans">
                Levantamento de Requisitos
              </h3>
              <p className="mt-2 text-xs text-custom-muted max-w-[220px] font-sans">
                Módulo reservado para o próximo semestre.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-custom-border bg-custom-card/40 p-6 opacity-60">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-custom-border text-custom-muted">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-custom-muted font-sans">
                Programação Back-end I
              </h3>
              <p className="mt-2 text-xs text-custom-muted max-w-[220px] font-sans">
                Módulo reservado para o próximo semestre.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-custom-border bg-custom-card/40 p-6 opacity-60">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-custom-border text-custom-muted">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-custom-muted font-sans">
                Programação Back-end II
              </h3>
              <p className="mt-2 text-xs text-custom-muted max-w-[220px] font-sans">
                Módulo reservado para o próximo semestre.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-custom-border bg-custom-card/40 p-6 opacity-60">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-custom-border text-custom-muted">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-custom-muted font-sans">
                Testes de Software
              </h3>
              <p className="mt-2 text-xs text-custom-muted max-w-[220px] font-sans">
                Módulo reservado para o próximo semestre.
              </p>
            </div>
          </div>          
        </div>
      </section>
    </div>
  );
}
