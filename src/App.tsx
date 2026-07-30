import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import EvaluationForm from './components/EvaluationForm';
import ReportView from './components/ReportView';
import { useEvaluations } from './hooks/useEvaluations';
import { Evaluation } from './types';

export default function App() {
  const { evaluations, saveEvaluation, deleteEvaluation, loading, dbConnected } = useEvaluations();
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'report'>('dashboard');
  const [selectedEvalId, setSelectedEvalId] = useState<string | null>(null);

  const handleNew = () => {
    setSelectedEvalId(null);
    setCurrentView('form');
  };

  const handleEdit = (id: string) => {
    setSelectedEvalId(id);
    setCurrentView('form');
  };

  const handlePrint = (id: string) => {
    setSelectedEvalId(id);
    setCurrentView('report');
  };

  const handleSave = async (evaluation: Evaluation) => {
    await saveEvaluation(evaluation);
    setCurrentView('dashboard');
  };

  const selectedEval = selectedEvalId ? evaluations.find(e => e.id === selectedEvalId) : undefined;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans print:h-auto print:overflow-visible print:bg-white">
      <header className="header-gradient h-auto min-h-[64px] py-2 flex-none flex items-center justify-between px-6 shadow-md z-20 flex-wrap gap-y-2 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded">
            <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v7M3.5 17l6-3.5M20.5 17l-6-3.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg tracking-tight leading-tight">SISTEMA DE AVALIAÇÃO DE CONDUTORES</h1>
            <span className="text-white/80 text-[10px] font-medium tracking-wide">Desenvolvido por: Alexandre de Oliveira Franco</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-white text-xs text-right hidden sm:block">
            <div className="opacity-80">DATA: {new Date().toLocaleDateString('pt-BR')}</div>

            <div className="opacity-80 mt-0.5">VERSÃO: 1.0.5</div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto relative print:overflow-visible">
        {currentView === 'dashboard' && (
          <Dashboard
            evaluations={evaluations}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={deleteEvaluation}
            onPrint={handlePrint}
          />
        )}
        
        {currentView === 'form' && (
          <EvaluationForm
            initialData={selectedEval}
            onSave={handleSave}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'report' && selectedEval && (
          <ReportView
            evaluation={selectedEval}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}


