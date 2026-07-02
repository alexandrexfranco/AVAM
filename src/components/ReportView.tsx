import React, { useRef, useState } from 'react';
import { Evaluation } from '../types';
import { CATEGORIES } from '../data';
import { ArrowLeft, Printer, ExternalLink } from 'lucide-react';

interface ReportViewProps {
  evaluation: Evaluation;
  onBack: () => void;
}

export default function ReportView({ evaluation, onBack }: ReportViewProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [showIframeWarning, setShowIframeWarning] = useState(false);

  const handlePrint = () => {
    // Detecta se está rodando dentro de um iframe (como no preview do AI Studio)
    if (window.self !== window.top) {
      setShowIframeWarning(true);
      setTimeout(() => setShowIframeWarning(false), 8000);
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      {/* Controls - Hidden in print */}
      <div className="max-w-[210mm] mx-auto pt-8 px-4 flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Printer className="w-5 h-5 mr-2" />
          Imprimir Relatório
        </button>
      </div>

      {showIframeWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 z-50 print:hidden max-w-md animate-in fade-in slide-in-from-top-4">
          <ExternalLink className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Impressão não suportada na pré-visualização</p>
            <p className="text-sm mt-1">Para imprimir, abra o aplicativo em uma nova aba clicando no ícone de <strong>"Open in new tab"</strong> no canto superior direito desta tela.</p>
          </div>
        </div>
      )}

      {/* A4 Paper Container Wrapper for Preview Centering */}
      <div className="flex justify-center bg-gray-100 py-4 overflow-x-auto print:bg-white print:py-0 print:overflow-visible">
        <div ref={componentRef} className="a4-page flex flex-col">
          
          {/* Document Header */}
        <div className="pb-0 mb-2 flex flex-col">
          {/* Row 1: Title & Logo */}
          <div className="flex border-b border-black min-h-[50px]">
            <div className="flex-[5.4] pr-2 flex items-center">
               <div className="text-[13px] font-bold">
                 FORMULÁRIO DE SISTEMA DE GESTÃO INTEGRADO
               </div>
            </div>
            <div className="flex-[3] border-l border-black flex justify-center items-center py-1">
               <img 
                 src="/logo.png" 
                 alt="TRANSILVA DTL" 
                 className="h-8 object-contain mx-auto"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   if (e.currentTarget.nextElementSibling) {
                     (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                   }
                 }}
               />
               <div style={{ display: 'none' }} className="text-lg font-black text-blue-800 tracking-tighter w-full text-center">
                 TRANSILVA <span className="text-green-600">DTL</span>
               </div>
            </div>
          </div>
          
          {/* Row 2: Subtitle & Metadada */}
          <div className="flex border-b border-black min-h-[35px] uppercase font-bold text-[10px] items-center">
            <div className="flex-[5.4] py-1">
              FOR REH 017 - TESTE PRÁTICO
            </div>
            <div className="flex-[3] flex h-full">
              <div className="flex-[0.8] border-l border-black py-0.5 flex flex-col justify-center items-center text-center">
                <span className="text-[8px] uppercase font-normal">Revisão</span>
                <span className="mt-0">05</span>
              </div>
              <div className="flex-[0.8] border-l border-black py-0.5 flex flex-col justify-center items-center text-center">
                <span className="text-[8px] uppercase font-normal">Página</span>
                <span className="mt-0">1/1</span>
              </div>
              <div className="flex-[1.4] border-l border-black py-0.5 flex flex-col justify-center items-center text-center whitespace-nowrap">
                <span className="text-[8px] uppercase font-normal">Aprovado em:</span>
                <span className="mt-0">13/04/2017</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box 1 */}
        <div className="flex border-b border-black mb-2 text-[10px] font-bold uppercase relative">
          <div className="w-[35%] flex flex-col justify-end pr-2 pl-2 border-l border-black pb-1">
            <div className="text-[9px] text-gray-800 mb-0.5 font-bold">TIPO</div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1">
                <div className={`w-3.5 h-3.5 border border-black rounded-[2px] flex items-center justify-center ${evaluation.tipo === 'Admissão' ? 'bg-black' : ''}`}>
                  {evaluation.tipo === 'Admissão' && <span className="text-white text-[10px]">X</span>}
                </div>
                <span>ADMISSÃO</span>
              </label>
              <label className="flex items-center space-x-1">
                <div className={`w-3.5 h-3.5 border border-black rounded-[2px] flex items-center justify-center ${evaluation.tipo === 'Promoção' ? 'bg-black' : ''}`}>
                  {evaluation.tipo === 'Promoção' && <span className="text-white text-[10px]">X</span>}
                </div>
                <span>PROMOÇÃO</span>
              </label>
            </div>
          </div>
          
          <div className="w-[20%] pr-4 flex flex-col pb-1">
            <div className="text-[9px] text-gray-800 font-bold mb-0.5">DATA</div>
            <div className="mt-0 font-normal text-xs flex-1 flex items-end pb-0.5">
              {evaluation.data ? new Date(evaluation.data + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
            </div>
          </div>
          
          <div className="w-[45%] border-l border-r border-black px-2 flex flex-col pb-1">
            <div className="text-[9px] text-gray-800 font-bold mb-0.5">INSTRUTOR</div>
            <div className="mt-0 font-normal text-xs flex-1 flex items-end pb-0.5">
              {evaluation.instrutorNome}
            </div>
          </div>
        </div>

        {/* Motorista Info Box */}
        <div className="border-b border-black mb-1.5 text-[10px] font-bold uppercase">
          <div className="text-[9px] text-gray-800 font-bold mb-0.5">MOTORISTA</div>
          <div className="flex flex-row">
             <div className="flex-[2_2_0%] px-2 flex flex-col border-l border-black min-h-[32px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">NOME</div>
               <div className="font-normal text-xs w-full flex-1 flex items-end pb-0.5 min-h-[16px]">
                 {evaluation.motoristaNome}
               </div>
             </div>
             <div className="flex-[1.5_1.5_0%] border-l border-black px-2 flex flex-col min-h-[32px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">CARGO</div>
               <div className="font-normal text-xs w-full flex-1 flex items-end pb-0.5 min-h-[16px]">
                 {evaluation.motoristaCargo}
               </div>
             </div>
             <div className="flex-[1.5_1.5_0%] border-l border-r border-black px-2 flex flex-col min-h-[32px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">NOVO CARGO</div>
               <div className="font-normal text-xs w-full flex-1 flex items-end pb-0.5 min-h-[16px]">
                 {evaluation.motoristaNovoCargo}
               </div>
             </div>
          </div>
        </div>

        {/* Cavalo Info */}
        <div className="border-b border-black mb-1 text-[10px] font-bold uppercase">
          <div className="text-[9px] text-gray-800 font-bold mb-0.5">CAVALO</div>
          <div className="flex flex-row">
             <div className="flex-[5.6_5.6_0%] pl-2 pr-6 flex flex-col justify-end border-l border-black min-h-[22px] pb-1">
               <div className="flex justify-between pb-0.5">
                 {['TOCO', 'TRUCK', 'AUTOMÓVEL', 'UTILITÁRIO'].map(type => (
                   <label key={type} className="flex items-center space-x-1 font-bold text-[9px]">
                      <div className={`w-3.5 h-3.5 border border-black rounded-[2px] flex items-center justify-center ${(evaluation.veiculoTipo?.toUpperCase() === type || (evaluation.veiculoTipo?.toUpperCase() === 'AUTOMÓVEL' && type === 'AUTOMÓVEL')) ? 'bg-black' : ''}`}>
                        {(evaluation.veiculoTipo?.toUpperCase() === type || (evaluation.veiculoTipo?.toUpperCase() === 'AUTOMÓVEL' && type === 'AUTOMÓVEL')) && <span className="text-white text-[9px]">X</span>}
                      </div>
                      <span>{type}</span>
                   </label>
                 ))}
               </div>
             </div>
             <div className="flex-[1.6_1.6_0%] border-l border-black px-2 flex flex-col min-h-[24px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">FROTA</div>
             </div>
             <div className="flex-[1.4_1.4_0%] border-l border-black px-2 flex flex-col min-h-[24px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">KM INICIAL</div>
             </div>
             <div className="flex-[1.4_1.4_0%] border-l border-r border-black px-2 flex flex-col min-h-[24px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">KM FINAL</div>
             </div>
          </div>
        </div>

        {/* Equipamento Info */}
        <div className="border-b border-black mb-2 text-[10px] font-bold uppercase">
          <div className="text-[9px] text-gray-800 font-bold mb-0.5">EQUIPAMENTO</div>
          <div className="flex flex-row">
             <div className="flex-[5.6_5.6_0%] border-l border-black min-h-[22px] pb-1"></div>
             <div className="flex-[1.6_1.6_0%] border-l border-black px-2 flex flex-col min-h-[22px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">FROTA</div>
             </div>
             <div className="flex-[2.8_2.8_0%] border-l border-r border-black px-2 flex flex-col min-h-[22px] pb-1">
              <div className="text-[9px] text-gray-800 font-bold mb-0">OBSERVAÇÃO</div>
             </div>
          </div>
        </div>

        {/* Evaluation Checklist */}
        <div className="border-t-2 border-black border-dashed pt-1 mb-1">
          <div className="flex space-x-2 text-[9px] font-bold uppercase mb-1 pl-1">
            <div className="flex-1">ITEM</div>
            <div className="w-14 text-center">BOM</div>
            <div className="w-14 text-center">MÉDIO</div>
            <div className="w-14 text-center pr-3">RUIM</div>
          </div>

          <div className="space-y-1">
             {CATEGORIES.map(cat => (
               <div key={cat.id}>
                 <div className="font-bold underline mb-0.5 text-[10px] uppercase">{cat.title}</div>
                 <div className="space-y-0">
                   {cat.items.map(item => (
                     <div key={item.id} className="flex items-center text-[9px] leading-tight py-0.5 border-b border-gray-50 last:border-0">
                       <div className="flex-1 pl-1">{item.label}</div>
                       <div className="w-14 flex justify-center">
                         <div className="w-5 h-3.5 border border-black rounded-[2px] flex items-center justify-center">
                            {evaluation.ratings[item.id] === 'Bom' && <span className="text-[10px]">X</span>}
                         </div>
                       </div>
                       <div className="w-14 flex justify-center">
                         <div className="w-5 h-3.5 border border-black rounded-[2px] flex items-center justify-center">
                            {evaluation.ratings[item.id] === 'Médio' && <span className="text-[10px]">X</span>}
                         </div>
                       </div>
                       <div className="w-14 flex justify-center pr-2">
                         <div className="w-5 h-3.5 border border-black rounded-[2px] flex items-center justify-center">
                            {evaluation.ratings[item.id] === 'Ruim' && <span className="text-[10px]">X</span>}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Footer Results */}
        <div className="border-t-2 border-black border-solid pt-1 mt-1">
           <div className="flex items-center justify-between text-[11px] font-bold uppercase mb-1.5">
             <div className="flex items-center">
               <div className="mr-3">RESULTADO:</div>
               <label className="flex items-center space-x-1 mr-5">
                  <div className={`w-3.5 h-3.5 border border-black rounded-[2px] flex items-center justify-center ${evaluation.resultado === 'Apto' ? 'bg-black text-white' : ''}`}>
                    {evaluation.resultado === 'Apto' && <span className="text-[10px] font-bold">X</span>}
                  </div>
                  <span>APTO</span>
               </label>
               <label className="flex items-center space-x-1 mr-5">
                  <div className={`w-3.5 h-3.5 border border-black rounded-[2px] flex items-center justify-center ${evaluation.resultado === 'Apto com Restrição' ? 'bg-black text-white' : ''}`}>
                    {evaluation.resultado === 'Apto com Restrição' && <span className="text-[10px] font-bold">X</span>}
                  </div>
                  <span>APTO COM RESTRIÇÃO</span>
               </label>
               <label className="flex items-center space-x-1">
                  <div className={`w-3.5 h-3.5 border border-black rounded-[2px] flex items-center justify-center ${evaluation.resultado === 'Inapto' ? 'bg-black text-white' : ''}`}>
                    {evaluation.resultado === 'Inapto' && <span className="text-[10px] font-bold">X</span>}
                  </div>
                  <span>INAPTO*</span>
               </label>
             </div>
             
             {/* Performance Summary for Report */}
             <div className="flex space-x-3 text-[8px] font-bold text-gray-600">
                <div>BOM: {Math.round((Object.values(evaluation.ratings).filter(r => r === 'Bom').length / (Object.values(evaluation.ratings).length || 1)) * 100)}%</div>
                <div>MÉDIO: {Math.round((Object.values(evaluation.ratings).filter(r => r === 'Médio').length / (Object.values(evaluation.ratings).length || 1)) * 100)}%</div>
                <div>RUIM: {Math.round((Object.values(evaluation.ratings).filter(r => r === 'Ruim').length / (Object.values(evaluation.ratings).length || 1)) * 100)}%</div>
             </div>
           </div>

           <div className="border border-black min-h-[45px] p-1.5 text-[10px]">
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0">
                {evaluation.motivos.length > 0 ? (
                  evaluation.motivos.map((m, i) => (
                    <span key={i} className="bg-gray-50 print:bg-transparent border border-gray-200 print:border-none px-1.5 py-0 rounded-sm leading-tight">
                      &bull; {m}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Nenhum motivo selecionado.</span>
                )}
              </div>
           </div>
           
           {evaluation.observacoes && (
             <div className="mt-1.5 border-b border-black p-1.5 min-h-[35px]">
                <div className="text-[8px] font-bold uppercase mb-0.5">Observações Adicionais:</div>
                <div className="text-[10px] whitespace-pre-wrap leading-tight text-gray-800">
                  {evaluation.observacoes}
                </div>
             </div>
           )}
        </div>

        <div className="flex-grow min-h-[20mm]" />

        {/* Signature Box */}
        <div className="mt-auto mb-0 flex justify-center pb-2">
             <div className="w-[50%] border-t border-black text-center pt-1.5">
               <div className="text-xs font-bold uppercase">{evaluation.instrutorNome}</div>
               <div className="text-[8px] uppercase text-gray-500 font-medium tracking-wide">Instrutor / Avaliador</div>
             </div>
        </div>

      </div>
    </div>
  </div>
  );
}
