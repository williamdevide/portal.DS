import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utilitário para formatar datas ISO (AAAA-MM-DD) para padrão brasileiro (DD/MM/AAAA)
 */
export function formatarDataBr(dataStr) {
  if (!dataStr) return '—';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
}

/**
 * Enriquece os dados básicos de agendamento com as informações detalhadas
 * dos grupos (tema, projeto, integrantes) e das turmas (sala, local)
 */
export function enriquecerAgendamentos(agendamentos = [], config = null) {
  return agendamentos.map(item => {
    const turmaInfo = config?.turmas?.find(t => t.id === item.turma_id);
    const grupoInfo = turmaInfo?.grupos?.find(g => {
      const nome = typeof g === 'string' ? g : g.nome;
      return nome?.toLowerCase() === item.grupo_nome?.toLowerCase();
    });

    const projeto = typeof grupoInfo === 'object' && grupoInfo.projeto ? grupoInfo.projeto : '—';
    const tema = typeof grupoInfo === 'object' && grupoInfo.tema ? grupoInfo.tema : '—';
    const integrantesArray = typeof grupoInfo === 'object' && Array.isArray(grupoInfo.integrantes)
      ? grupoInfo.integrantes
      : [];
    const integrantesStr = integrantesArray.length > 0 ? integrantesArray.join(', ') : '—';
    const sala = turmaInfo?.sala_ou_local || 'Metrologia';

    return {
      ...item,
      turma_nome_completo: turmaInfo?.nome || item.turma_nome || 'Turma não identificada',
      projeto,
      tema,
      integrantes: integrantesStr,
      integrantes_lista: integrantesArray,
      sala,
      data_formatada: formatarDataBr(item.data)
    };
  }).sort((a, b) => {
    // Ordena primariamente por turma, depois data e horário
    const cmpTurma = (a.turma_nome_completo || '').localeCompare(b.turma_nome_completo || '');
    if (cmpTurma !== 0) return cmpTurma;
    const cmpData = (a.data || '').localeCompare(b.data || '');
    if (cmpData !== 0) return cmpData;
    return (a.horario || '').localeCompare(b.horario || '');
  });
}

/**
 * Exporta a lista de agendamentos já realizados para formato CSV (Padrão Excel pt-BR)
 * Utiliza codificação UTF-8 com BOM e separador ';' para compatibilidade direta com o Excel.
 */
export function exportarAgendamentosParaCSV({ agendamentos, config, filtroTurmaNome = 'Todas as Turmas' }) {
  if (!agendamentos || agendamentos.length === 0) {
    throw new Error('Nenhum agendamento realizado encontrado para exportar.');
  }

  const dadosEnriquecidos = enriquecerAgendamentos(agendamentos, config);

  const colunas = [
    'Turma',
    'Data da Apresentação',
    'Horário',
    'Sala / Local',
    'Grupo',
    'Nome do Projeto',
    'Tema do TCC',
    'Integrantes da Equipe',
    'Observações / Título',
    'Data de Registro'
  ];

  // Escapa valores para o padrão CSV com aspas duplas caso contenham delimitadores
  const escaparCampo = (valor) => {
    if (valor === null || valor === undefined) return '""';
    const str = String(valor).replace(/"/g, '""');
    return `"${str}"`;
  };

  const linhas = [
    colunas.map(escaparCampo).join(';')
  ];

  dadosEnriquecidos.forEach(item => {
    const linha = [
      escaparCampo(item.turma_nome_completo),
      escaparCampo(item.data_formatada),
      escaparCampo(item.horario),
      escaparCampo(item.sala),
      escaparCampo(item.grupo_nome),
      escaparCampo(item.projeto),
      escaparCampo(item.tema),
      escaparCampo(item.integrantes),
      escaparCampo(item.observacoes || '—'),
      escaparCampo(item.criado_em ? item.criado_em.replace('T', ' ').substring(0, 16) : '—')
    ];
    linhas.push(linha.join(';'));
  });

  // \uFEFF é o Byte Order Mark (BOM) UTF-8 essencial para o Excel no Windows
  const conteudoCSV = '\uFEFF' + linhas.join('\r\n');
  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dataAtual = new Date().toISOString().split('T')[0];
  const sufixoFiltro = filtroTurmaNome.toLowerCase().includes('todas') ? 'geral' : 'turma';
  const nomeArquivo = `agendamentos_tcc_senai_${sufixoFiltro}_${dataAtual}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { total: dadosEnriquecidos.length, nomeArquivo };
}

/**
 * Exporta a lista de agendamentos já realizados para formato PDF Profissional
 * Utiliza A4 Paisagem (Landscape), cabeçalho institucional SENAI Ourinhos,
 * tabelas organizadas por turma e rodapé com numeração dinâmica de páginas.
 */
export function exportarAgendamentosParaPDF({ agendamentos, config, filtroTurmaNome = 'Todas as Turmas', filtroDataStr = '' }) {
  if (!agendamentos || agendamentos.length === 0) {
    throw new Error('Nenhum agendamento realizado encontrado para exportar.');
  }

  const dadosEnriquecidos = enriquecerAgendamentos(agendamentos, config);

  // Instancia jsPDF em A4 Paisagem (Landscape: 297mm de largura x 210mm de altura)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const corVermelhoSenai = [227, 6, 19];   // #E30613
  const corTextoEscuro = [33, 37, 41];     // #212529
  const corTextoCinza = [108, 117, 125];   // #6C757D
  const corLinhaClara = [222, 226, 230];   // #DEE2E6

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margem = 14;
  let cursorY = margem;

  // 1. Faixa decorativa superior vermelha institucional SENAI
  doc.setFillColor(...corVermelhoSenai);
  doc.rect(0, 0, pageWidth, 4, 'F');

  cursorY += 2;

  // 2. Logotipo / Identificação SENAI
  doc.setFillColor(...corVermelhoSenai);
  doc.roundedRect(margem, cursorY, 32, 12, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SENAI', margem + 16, cursorY + 8, { align: 'center' });

  // 3. Título e Subtítulo Institucional
  doc.setTextColor(...corTextoEscuro);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Escola e Faculdade de Tecnologia SENAI Ourinhos', margem + 36, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...corTextoCinza);
  doc.text('Técnico em Desenvolvimento de Sistemas • Cronograma Oficial de Bancas Examinadoras de TCC', margem + 36, cursorY + 10);

  cursorY += 16;

  // 4. Cartão de Resumo / Metadados do Relatório
  const dataEmissao = new Date().toLocaleString('pt-BR');
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(...corLinhaClara);
  doc.roundedRect(margem, cursorY, pageWidth - (margem * 2), 14, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(...corTextoEscuro);
  doc.setFont('helvetica', 'bold');
  doc.text('Disciplina:', margem + 4, cursorY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Projeto de Software III (PSOF3)', margem + 21, cursorY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Escopo:', margem + 80, cursorY + 5.5);
  doc.setFont('helvetica', 'normal');
  const textoFiltro = filtroTurmaNome + (filtroDataStr ? ` (Data: ${formatarDataBr(filtroDataStr)})` : '');
  doc.text(textoFiltro.substring(0, 50), margem + 93, cursorY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Total de Bancas:', margem + 190, cursorY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dadosEnriquecidos.length} agendamentos confirmados`, margem + 214, cursorY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Gerado em:', margem + 4, cursorY + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(dataEmissao, margem + 21, cursorY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', margem + 80, cursorY + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129); // Verde
  doc.text('Documento Oficial de Apresentações Confirmadas', margem + 92, cursorY + 10.5);
  doc.setTextColor(...corTextoEscuro);

  cursorY += 19;

  // 5. Agrupamento dos dados por Turma
  const turmasUnicas = Array.from(new Set(dadosEnriquecidos.map(d => d.turma_nome_completo)));

  turmasUnicas.forEach((nomeTurma) => {
    const itensTurma = dadosEnriquecidos.filter(d => d.turma_nome_completo === nomeTurma);
    const salaTurma = itensTurma[0]?.sala || 'Metrologia';

    // Se o espaço restante na página for pequeno, adiciona nova página antes do cabeçalho da turma
    if (cursorY > pageHeight - 35) {
      doc.addPage();
      cursorY = margem + 4;
    }

    // Faixa da Turma
    doc.setFillColor(235, 238, 242);
    doc.setDrawColor(...corLinhaClara);
    doc.roundedRect(margem, cursorY, pageWidth - (margem * 2), 7.5, 1.5, 1.5, 'FD');

    // Marcador vermelho SENAI
    doc.setFillColor(...corVermelhoSenai);
    doc.circle(margem + 4, cursorY + 3.75, 1.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...corTextoEscuro);
    doc.text(nomeTurma, margem + 8, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...corTextoCinza);
    doc.text(`Sala / Local: ${salaTurma}  •  ${itensTurma.length} apresentações`, pageWidth - margem - 4, cursorY + 5, { align: 'right' });

    cursorY += 10;

    // Configuração das linhas da tabela
    const corpoTabela = itensTurma.map(item => {
      const projetoTexto = item.projeto !== '—' ? `${item.projeto}\nTema: ${item.tema}` : item.tema;
      return [
        item.data_formatada,
        item.horario,
        item.grupo_nome,
        projetoTexto,
        item.integrantes,
        item.observacoes || '—'
      ];
    });

    // Chamada do autoTable
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margem, right: margem },
      head: [[
        'Data',
        'Horário',
        'Grupo',
        'Projeto / Tema do TCC',
        'Integrantes da Equipe',
        'Título / Observações'
      ]],
      body: corpoTabela,
      theme: 'grid',
      headStyles: {
        fillColor: corVermelhoSenai,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
        valign: 'middle',
        cellPadding: 2.2
      },
      bodyStyles: {
        fontSize: 8,
        textColor: corTextoEscuro,
        valign: 'top',
        cellPadding: 2.5,
        lineColor: [230, 230, 230],
        lineWidth: 0.2
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: 'bold', halign: 'center' }, // Data
        1: { cellWidth: 32, fontStyle: 'bold', halign: 'center' }, // Horário
        2: { cellWidth: 25, fontStyle: 'bold', halign: 'center' }, // Grupo
        3: { cellWidth: 80 },                                      // Projeto / Tema
        4: { cellWidth: 65 },                                      // Integrantes
        5: { cellWidth: 'auto' }                                   // Observações
      },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      didDrawPage: () => {
        // Assegura espaço de rodapé
      }
    });

    // Atualiza cursorY para o fim da tabela mais um espaçamento
    cursorY = doc.lastAutoTable.finalY + 8;
  });

  // 6. Rodapé padronizado em todas as páginas com numeração dinâmica
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);

    // Linha divisória de rodapé
    doc.setDrawColor(...corLinhaClara);
    doc.setLineWidth(0.3);
    doc.line(margem, pageHeight - 10, pageWidth - margem, pageHeight - 10);

    // Texto institucional do rodapé
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...corTextoCinza);
    doc.text(
      'SENAI Ourinhos • Escola e Faculdade de Tecnologia SENAI • Curso Técnico em Desenvolvimento de Sistemas',
      margem,
      pageHeight - 6
    );

    // Paginação
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      pageWidth - margem,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  const dataAtual = new Date().toISOString().split('T')[0];
  const sufixoFiltro = filtroTurmaNome.toLowerCase().includes('todas') ? 'geral' : 'turma';
  const nomeArquivo = `agendamentos_tcc_senai_${sufixoFiltro}_${dataAtual}.pdf`;

  doc.save(nomeArquivo);

  return { total: dadosEnriquecidos.length, nomeArquivo, totalPaginas };
}
