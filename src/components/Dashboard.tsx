import React, { useState } from 'react';
import { Evaluation } from '../types';
import { FileText, Plus, Trash2, Printer, Edit2, Search, X, ChevronRight } from 'lucide-react';

interface DashboardProps {
  evaluations: Evaluation[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPrint: (id: string) => void;
}

export default function Dashboard({ evaluations, onNew, onEdit, onDelete, onPrint }: DashboardProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoreModal, setShowMoreModal] = useState(false);

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const filteredEvaluations = evaluations.filter(evaluacao => {
    const searchLower = searchTerm.toLowerCase();
    const motoristaNome = evaluacao.motoristaNome?.toLowerCase() || '';
    const instrutorNome = evaluacao.instrutorNome?.toLowerCase() || '';
    return motoristaNome.includes(searchLower) || instrutorNome.includes(searchLower);
  });

  const displayedEvaluations = evaluations.slice(0, 5);

  const renderEvaluationList = (evals: Evaluation[], inModal: boolean = false) => {
    if (evals.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-700 uppercase tracking-tighter">Nenhuma avaliação</h3>
          <p className="mt-1 text-sm text-slate-500">
            {inModal && searchTerm ? 'Nenhuma avaliação encontrada para a sua busca.' : 'Comece criando uma nova avaliação prática.'}
          </p>
        </div>
      );
    }
    return (
      <ul className="divide-y divide-slate-100">
        {evals.map((evaluation) => (
          <li key={evaluation.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0" onClick={() => { if(inModal) setShowMoreModal(false); onEdit(evaluation.id); }} role="button">
                  <p className="text-sm font-bold text-blue-800 truncate">
                    {evaluation.motoristaNome || 'Motorista não identificado'}
                  </p>
                  <div className="text-xs text-slate-500 mt-1 font-medium flex flex-col gap-0.5">
                    <span>Instrutor: {evaluation.instrutorNome || 'N/A'}</span>
                    <div className="flex items-center">
                      <span>Data: {evaluation.data ? new Date(evaluation.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</span>
                      <span className="mx-2">&bull;</span>
                      <span className={`font-bold ${
                        evaluation.resultado === 'Apto' ? 'text-green-600' :
                        evaluation.resultado === 'Apto com Restrição' ? 'text-green-600 opacity-80' :
                        evaluation.resultado === 'Inapto' ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {evaluation.resultado ? evaluation.resultado.toUpperCase() : 'PENDENTE'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                  <button
                    onClick={() => { if(inModal) setShowMoreModal(false); onEdit(evaluation.id); }}
                    className="text-slate-400 hover:text-blue-800 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => { if(inModal) setShowMoreModal(false); onPrint(evaluation.id); }}
                    className="text-slate-400 hover:text-blue-800 transition-colors"
                    title="Imprimir/PDF"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(evaluation.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full flex flex-col pt-8 relative">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Avaliações</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Gerencie as avaliações práticas de motoristas.</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={onNew}
            className="w-full inline-flex items-center justify-center px-6 py-4 rounded-lg font-bold bg-blue-800 text-white shadow-lg hover:bg-blue-900 transition-all transform active:scale-[0.98] text-lg uppercase tracking-wider"
          >
            <Plus className="-ml-1 mr-3 h-6 w-6" aria-hidden="true" />
            Nova Avaliação
          </button>
        </div>

        <div className="card mb-4">
          {renderEvaluationList(displayedEvaluations, false)}
        </div>
        
        {evaluations.length > 5 && (
          <div className="mb-8 text-center flex-shrink-0">
            <button
              onClick={() => setShowMoreModal(true)}
              className="inline-flex items-center px-6 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Ver mais avaliações
              <ChevronRight className="ml-2 h-4 w-4 text-slate-400" />
            </button>
          </div>
        )}

      </div>

      {showMoreModal && (
        <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 sm:p-4">
          <div className="flex-1 w-full max-w-4xl mx-auto bg-white sm:rounded-xl sm:shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-4 sm:px-6 border-b border-slate-200 flex justify-between items-center bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">Todas as Avaliações</h2>
              <button
                onClick={() => setShowMoreModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 -mr-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-4 py-4 sm:px-6 border-b border-slate-100 bg-slate-50 z-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por motorista ou instrutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm shadow-sm transition-shadow"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {renderEvaluationList(filteredEvaluations, true)}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center transform transition-all">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir Avaliação?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}