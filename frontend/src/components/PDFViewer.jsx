import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X, Download, AlertCircle } from 'lucide-react';

export default function PDFViewer({ file, downloadUrl }) {
  const canvasRef = useRef(null);
  const modalCanvasRef = useRef(null);
  
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [libLoaded, setLibLoaded] = useState(false);

  // Efeito 1: Carrega a biblioteca PDF.js dinamicamente se não estiver disponível globalmente
  useEffect(() => {
    let active = true;

    const loadLib = () => {
      if (window.pdfjsLib) {
        if (active) setLibLoaded(true);
        return;
      }

      // Adiciona o script de PDF.js ao document body
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          if (active) setLibLoaded(true);
        }
      };
      script.onerror = () => {
        if (active) setError('Não foi possível carregar o visualizador de PDF.');
      };
      document.body.appendChild(script);
    };

    loadLib();

    return () => {
      active = false;
    };
  }, []);

  // Efeito 2: Carrega o arquivo de PDF quando o arquivo ou a lib carregar
  useEffect(() => {
    if (!libLoaded || !file) return;

    let active = true;
    setLoading(true);
    setError(null);

    const loadingTask = window.pdfjsLib.getDocument(file);
    loadingTask.promise.then(
      (pdfDoc) => {
        if (active) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setPageNum(1);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erro ao abrir PDF:', err);
        if (active) {
          setError('Erro ao carregar o arquivo PDF.');
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [file, libLoaded]);

  // Efeito 3: Renderiza no Canvas Principal
  useEffect(() => {
    if (!pdf || isZoomed) return;

    let active = true;
    let renderTask = null;

    pdf.getPage(pageNum).then((page) => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      // Escala ideal para visualização padrão (~1.3 no desktop)
      // Ajustamos a escala física interna, mas o CSS controlará o tamanho fluido.
      const scale = window.innerWidth < 640 ? 1.0 : 1.3;
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTask = page.render(renderContext);
      renderTask.promise.catch((err) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Erro na renderização:', err);
        }
      });
    });

    return () => {
      active = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNum, isZoomed]);

  // Efeito 4: Renderiza no Canvas do Modal de Zoom
  useEffect(() => {
    if (!pdf || !isZoomed) return;

    let active = true;
    let renderTask = null;

    // Aguarda um pequeno frame para o canvas do modal ser montado no DOM
    const renderModalPage = () => {
      pdf.getPage(pageNum).then((page) => {
        if (!active) return;
        const canvas = modalCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        // Escala bem alta no modal para máxima nitidez (2.2)
        const scale = window.innerWidth < 640 ? 1.5 : 2.2;
        const viewport = page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        renderTask = page.render(renderContext);
        renderTask.promise.catch((err) => {
          if (err.name !== 'RenderingCancelledException') {
            console.error('Erro na renderização do modal:', err);
          }
        });
      });
    };

    // Delay mínimo para garantir montagem do canvas no modal
    const timeoutId = setTimeout(renderModalPage, 50);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNum, isZoomed]);

  // Bloqueia a rolagem do body de trás quando o modal de ampliação (zoom) está ativo
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isZoomed]);

  const handlePrevPage = () => {
    if (pageNum <= 1) return;
    setPageNum(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (pageNum >= numPages) return;
    setPageNum(prev => prev + 1);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="rounded-3xl border border-custom-border bg-custom-card p-6 sm:p-8 shadow-lg space-y-4 transition-colors duration-300">
      
      {/* Cabeçalho do Visualizador */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-custom-border/40 pb-4">
        <h3 className="text-[1.125em] font-bold text-custom-text font-sans flex items-center gap-2">
          <span>📖</span>
          Apresentação da Aula
        </h3>
        
        <div className="flex items-center gap-2">
          {downloadUrl && (
            <a 
              href={downloadUrl}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[0.75em] font-bold rounded-xl bg-custom-accent/10 border border-custom-accent/25 text-custom-accent hover:bg-custom-accent hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              title="Baixar material completo"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </a>
          )}
          
          {!loading && !error && pdf && (
            <button
              onClick={toggleZoom}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[0.75em] font-bold rounded-xl bg-custom-bg border border-custom-border text-custom-text hover:border-custom-accent hover:text-custom-accent transition-all cursor-pointer shadow-sm active:scale-95"
              title="Ampliar visualização"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Ampliar</span>
            </button>
          )}
        </div>
      </div>

      {/* Área Central: Visualizador do PDF */}
      <div className="relative flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px] rounded-2xl border border-custom-border bg-custom-bg/60 p-4 shadow-inner overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-custom-accent"></div>
            <p className="text-xs font-semibold text-custom-muted font-sans animate-pulse">Carregando páginas...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-semibold text-custom-text">{error}</p>
            {downloadUrl && (
              <a 
                href={downloadUrl}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-custom-accent text-white hover:bg-custom-accent/90 transition-all shadow-md"
              >
                <Download className="h-4 w-4" />
                Baixar para ler localmente
              </a>
            )}
          </div>
        )}

        {!loading && !error && pdf && (
          <div className="flex items-center justify-center w-full overflow-hidden select-none">
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto rounded-xl shadow-md border border-custom-border/60 transition-transform duration-300"
            />
          </div>
        )}
      </div>

      {/* Rodapé: Controles de Navegação */}
      {!loading && !error && pdf && (
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-custom-border/40">
          <button
            onClick={handlePrevPage}
            disabled={pageNum <= 1}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-custom-border bg-custom-card text-custom-text hover:border-custom-accent hover:text-custom-accent disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-xs sm:text-sm font-bold shadow-sm active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <span className="text-xs sm:text-sm font-semibold text-custom-muted font-mono bg-custom-bg px-3 py-1.5 rounded-lg border border-custom-border">
            Página <strong className="text-custom-text">{pageNum}</strong> de <strong className="text-custom-text">{numPages}</strong>
          </span>

          <button
            onClick={handleNextPage}
            disabled={pageNum >= numPages}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-custom-border bg-custom-card text-custom-text hover:border-custom-accent hover:text-custom-accent disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer text-xs sm:text-sm font-bold shadow-sm active:scale-95"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Lightbox / Modal de Ampliação em Tela Cheia (Renderizado via React Portal) */}
      {isZoomed && !loading && pdf && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/90 backdrop-blur-md animate-fade-in p-4 sm:p-6"
          onClick={toggleZoom} // fecha ao clicar fora
        >
          {/* Top Bar do Modal */}
          <div 
            className="flex items-center justify-between w-full pb-4 border-b border-white/10"
            onClick={(e) => e.stopPropagation()} // impede fechar ao clicar no cabeçalho
          >
            <div className="flex flex-col">
              <span className="text-xs font-mono text-gray-400">VISUALIZAÇÃO AMPLIADA</span>
              <h4 className="text-sm sm:text-base font-bold text-white font-sans truncate max-w-[250px] sm:max-w-md">
                {file.split('/').pop()}
              </h4>
            </div>
            
            <div className="flex items-center gap-3">
              {downloadUrl && (
                <a 
                  href={downloadUrl}
                  download
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer active:scale-95"
                  title="Baixar PDF"
                >
                  <Download className="h-5 w-5" />
                </a>
              )}
              <button
                onClick={toggleZoom}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-gray-200 hover:bg-white/25 hover:text-white transition-all cursor-pointer shadow-md active:scale-95 text-xs sm:text-sm font-bold"
                title="Fechar ampliação"
              >
                <X className="h-4.5 w-4.5" />
                <span>Fechar</span>
              </button>
            </div>
          </div>

          {/* Canvas no Modal (Central) */}
          <div 
            className="flex-1 flex items-center justify-center overflow-auto py-6"
            onClick={toggleZoom}
          >
            <div 
              className="max-h-full max-w-full overflow-auto select-none"
              onClick={(e) => e.stopPropagation()} // impede fechar ao arrastar/clicar no canvas
            >
              <canvas 
                ref={modalCanvasRef} 
                className="rounded-lg shadow-2xl border border-white/15 max-w-[95vw] h-auto bg-white"
              />
            </div>
          </div>

          {/* Controles de Navegação no Modal (Rodapé) */}
          <div 
            className="flex items-center justify-between w-full pt-4 border-t border-white/10 bg-black/40 backdrop-blur-sm px-4 py-2.5 rounded-2xl"
            onClick={(e) => e.stopPropagation()} // impede fechar ao clicar nas ações do rodapé
          >
            <button
              onClick={handlePrevPage}
              disabled={pageNum <= 1}
              className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer text-xs sm:text-sm font-bold active:scale-95"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
              Anterior
            </button>

            <span className="text-xs sm:text-sm font-semibold text-gray-400 font-mono bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
              Página <strong className="text-white">{pageNum}</strong> de <strong className="text-white">{numPages}</strong>
            </span>

            <button
              onClick={handleNextPage}
              disabled={pageNum >= numPages}
              className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer text-xs sm:text-sm font-bold active:scale-95"
            >
              Próxima
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
