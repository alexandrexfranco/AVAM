import React, { useState, useEffect } from 'react';
import { Evaluation, Rating, ResultType } from '../types';
import { CATEGORIES, MOTIVOS_APTO, MOTIVOS_INAPTO, MOTIVOS_RESSALVAS, VEHICLE_TYPES, CARGO_OPTIONS, NOVO_CARGO_OPTIONS } from '../data';
import { ArrowLeft, Save, AlertTriangle, Volume2 } from 'lucide-react';
import { cn, formatCPF } from '../lib/utils';
import { useSpeedTracker } from '../hooks/useSpeedTracker';

interface EvaluationFormProps {
  initialData?: Evaluation;
  onSave: (data: Evaluation) => void;
  onCancel: () => void;
}

const emptyEvaluation = (): Evaluation => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  tipo: 'Admissão',
  data: new Date().toISOString().split('T')[0],
  instrutorNome: 'Kleber Simão',
  motoristaNome: '',
  motoristaCargo: '',
  motoristaNovoCargo: '',
  veiculoTipo: 'Automóvel',
  ratings: {},
  resultado: null,
  motivos: [],
  observacoes: '',
  speedLimitExceededCount: 0,
});

export default function EvaluationForm({ initialData, onSave, onCancel }: EvaluationFormProps) {
  const [formData, setFormData] = useState<Evaluation>(initialData || emptyEvaluation());
  const [showSpeedAlert, setShowSpeedAlert] = useState(false);
  const { speed, isOverLimit, status, error: gpsError } = useSpeedTracker(30);

  // Audio and Popup Alert logic
  useEffect(() => {
    if (isOverLimit) {
      setShowSpeedAlert(true);
      
      // Increment infraction count
      setFormData(prev => ({
        ...prev,
        speedLimitExceededCount: (prev.speedLimitExceededCount || 0) + 1
      }));
      
      // Audio Alert using Speech Synthesis
      const msg = new SpeechSynthesisUtterance('Atenção: Velocidade acima de 30 quilômetros por hora!');
      msg.lang = 'pt-BR';
      msg.rate = 1.2;
      window.speechSynthesis.speak(msg);
    }
  }, [isOverLimit]);

  const handleChange = (field: keyof Evaluation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRating = (itemId: string, rating: Rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [itemId]: rating }
    }));
  };

  const handleMotivoToggle = (motivo: string) => {
    setFormData(prev => {
      const isSelected = prev.motivos.includes(motivo);
      if (isSelected) {
        return { ...prev, motivos: prev.motivos.filter(m => m !== motivo) };
      } else {
        return { ...prev, motivos: [...prev.motivos, motivo] };
      }
    });
  };

  // Automatic classification based on ratings
  useEffect(() => {
    const ratingsArray = Object.values(formData.ratings);
    const totalItems = CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    const ratedItemsCount = ratingsArray.length;
    
    if (ratedItemsCount === 0) return;

    // Calculate weight: Bom = 10pts, Médio = 5pts, Ruim = 0pts
    let score = 0;
    let ruinsCount = 0;
    let mediosCount = 0;

    ratingsArray.forEach(r => {
      if (r === 'Bom') score += 10;
      else if (r === 'Médio') {
        score += 5;
        mediosCount++;
      }
      else if (r === 'Ruim') {
        ruinsCount++;
      }
    });

    // We only calculate based on items ALREADY RATED to be fair during the process
    const maxPossibleScore = ratedItemsCount * 10;
    const percentage = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
    const percentageMedio = (mediosCount / ratedItemsCount) * 100;

    let newResultado: ResultType = 'Apto';

    // Criteria:
    // Inapto: percentage < 60% OR more than 51% of ratings are "Médio"
    // Apto com Restrição: Any "Ruim" OR percentage < 85% OR more than 4 "Médio"
    // Apto: 0 "Ruim", percentage >= 85%, <= 4 "Médio"

    if (percentage < 60 || percentageMedio > 51) {
      newResultado = 'Inapto';
    } else if (percentage < 85 || ruinsCount > 0 || mediosCount > 4) {
      newResultado = 'Apto com Restrição';
    } else {
      newResultado = 'Apto';
    }

    if (newResultado !== formData.resultado) {
      setFormData(prev => ({ ...prev, resultado: newResultado }));
    }
  }, [formData.ratings]);

  // When result changes, we no longer clear motives because user wants to see all of them
  // But we might want to keep the logic if we want to reset when result is null for some reason
  // Actually, the user wants them displayed AT THE SAME TIME.
  useEffect(() => {
    if (formData.resultado === null) {
      handleChange('motivos', []);
    }
  }, [formData.resultado]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {initialData ? 'Editar Avaliação' : 'Nova Avaliação'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Painel de Monitoramento de Velocidade em Tempo Real */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={cn(
            "p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all",
            isOverLimit ? "bg-red-50 border-red-500 shadow-xl shadow-red-100" : "bg-white border-slate-200"
          )}>
            <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Velocidade Atual</div>
            <div className={cn(
              "text-5xl font-black tabular-nums tracking-tighter italic",
              isOverLimit ? "text-red-600" : "text-slate-900"
            )}>
              {status === 'active' ? Math.round(speed) : '---'}
              <span className="text-sm ml-1 not-italic opacity-40 font-bold">KM/H</span>
            </div>
            <div className="mt-3 flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full">
              <span className={cn(
                "h-2 w-2 rounded-full",
                status === 'active' ? "bg-green-500 animate-pulse" : (status === 'error' ? "bg-red-500" : "bg-amber-500 animate-bounce")
              )} />
              <span className="text-[9px] font-black text-slate-600 uppercase">
                {status === 'active' ? 'Sinal GPS OK' : (status === 'error' ? 'Sem sinal GPS' : 'Buscando satélite...')}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center">
            <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total de Infrações</div>
            <div className={cn(
              "text-5xl font-black tabular-nums tracking-tighter italic",
              formData.speedLimitExceededCount > 0 ? "text-red-700" : "text-slate-200"
            )}>
              {formData.speedLimitExceededCount}
              <span className="text-sm ml-1 not-italic opacity-40 font-bold">X</span>
            </div>
            {formData.speedLimitExceededCount > 0 && (
              <div className="mt-2 text-[9px] font-black text-red-500 animate-bounce uppercase px-3 py-1 bg-red-50 rounded-full border border-red-100">
                Atenção ao Limite
              </div>
            )}
          </div>
        </div>
        {/* Cabeçalho */}
        <div className="card p-6">
          <h2 className="report-label mb-3 border-b pb-1 text-sm">Informações Iniciais</h2>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Tipo de Avaliação</label>
              <div className="mt-2 flex items-center space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-800"
                    checked={formData.tipo === 'Admissão'}
                    onChange={() => handleChange('tipo', 'Admissão')}
                  />
                  <span className="ml-2 text-sm text-slate-700 font-medium">Admissão</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-800"
                    checked={formData.tipo === 'Promoção'}
                    onChange={() => handleChange('tipo', 'Promoção')}
                  />
                  <span className="ml-2 text-sm text-slate-700 font-medium">Promoção</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Data</label>
              <input
                type="date"
                required
                className="mt-1 block w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.data}
                onChange={(e) => handleChange('data', e.target.value)}
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-3 mt-6 uppercase">Instrutor</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1 mb-6">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Nome</label>
              <input
                type="text"
                readOnly
                className="mt-1 block w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-sm cursor-not-allowed text-slate-500 focus:outline-none"
                value={formData.instrutorNome}
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-3 mt-6 uppercase">Motorista</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Nome</label>
              <input
                type="text"
                required
                className="mt-1 block w-full bg-blue-50/30 border border-blue-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.motoristaNome}
                onChange={(e) => handleChange('motoristaNome', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Cargo</label>
              <select
                className="mt-1 block w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.motoristaCargo}
                onChange={(e) => handleChange('motoristaCargo', e.target.value)}
              >
                <option value="">Selecione o cargo...</option>
                {CARGO_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={cn(
                "text-[10px] font-semibold uppercase",
                formData.tipo === 'Promoção' ? "text-slate-500" : "text-slate-400"
              )}>Novo Cargo</label>
              <select
                className={cn(
                  "mt-1 block w-full border rounded px-2 py-1.5 text-sm focus:outline-none",
                  formData.tipo === 'Promoção'
                    ? "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-400"
                    : "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400"
                )}
                value={formData.motoristaNovoCargo}
                onChange={(e) => handleChange('motoristaNovoCargo', e.target.value)}
                disabled={formData.tipo !== 'Promoção'}
              >
                <option value="">Selecione...</option>
                {NOVO_CARGO_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-3 mt-6 uppercase">Veículo</h3>
          <div className="mb-4">
            <label className="text-[10px] font-semibold text-slate-500 uppercase mb-2 block">Tipo de Veículo</label>
            <div className="flex flex-wrap gap-4">
              {VEHICLE_TYPES.map(type => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-800"
                    checked={formData.veiculoTipo === type}
                    onChange={() => handleChange('veiculoTipo', type)}
                  />
                  <span className="ml-2 text-sm text-slate-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Avaliação Prática */}
        <div className="card p-6">
          <h2 className="report-label mb-6 border-b pb-1 text-sm">Avaliação Prática</h2>
          
          <div className="space-y-8">
            {CATEGORIES.map(category => (
              <div key={category.id}>
                <h3 className="text-md font-bold text-gray-800 mb-4 bg-gray-50 p-2 rounded">{category.title}</h3>
                <div className="divide-y divide-gray-100">
                  <div className="flex mb-2 px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:flex">
                    <div className="flex-1">Item</div>
                    <div className="w-16 text-center">Bom</div>
                    <div className="w-16 text-center">Médio</div>
                    <div className="w-16 text-center">Ruim</div>
                  </div>
                  {category.items.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center py-3 px-2 hover:bg-gray-50 transition-colors rounded">
                      <div className="flex-1 text-sm text-gray-700 mb-2 sm:mb-0 pr-4">{item.label}</div>
                      <div className="flex space-x-2 sm:space-x-0 sm:justify-end">
                        <label className="w-auto sm:w-16 flex items-center justify-center cursor-pointer">
                          <input
                            type="radio"
                            name={`rating-${item.id}`}
                            className="form-radio text-green-600 h-5 w-5 focus:ring-green-500 disabled:opacity-50"
                            checked={formData.ratings[item.id] === 'Bom'}
                            onChange={() => handleRating(item.id, 'Bom')}
                          />
                          <span className="sm:hidden ml-2 text-sm">Bom</span>
                        </label>
                        <label className="w-auto sm:w-16 flex items-center justify-center cursor-pointer ml-4 sm:ml-0">
                          <input
                            type="radio"
                            name={`rating-${item.id}`}
                            className="form-radio text-yellow-500 h-5 w-5 focus:ring-yellow-400 disabled:opacity-50"
                            checked={formData.ratings[item.id] === 'Médio'}
                            onChange={() => handleRating(item.id, 'Médio')}
                          />
                          <span className="sm:hidden ml-2 text-sm">Médio</span>
                        </label>
                        <label className="w-auto sm:w-16 flex items-center justify-center cursor-pointer ml-4 sm:ml-0">
                          <input
                            type="radio"
                            name={`rating-${item.id}`}
                            className="form-radio text-red-600 h-5 w-5 focus:ring-red-500 disabled:opacity-50"
                            checked={formData.ratings[item.id] === 'Ruim'}
                            onChange={() => handleRating(item.id, 'Ruim')}
                          />
                          <span className="sm:hidden ml-2 text-sm">Ruim</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado */}
        <div className="card border-t-4 border-t-blue-800 p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="report-label text-sm m-0">Dashboard de Desempenho</h2>
            <div className="flex gap-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Bom: {
                  Math.round((Object.values(formData.ratings).filter(r => r === 'Bom').length / (Object.values(formData.ratings).length || 1)) * 100)
                }%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Médio: {
                  Math.round((Object.values(formData.ratings).filter(r => r === 'Médio').length / (Object.values(formData.ratings).length || 1)) * 100)
                }%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Ruim: {
                  Math.round((Object.values(formData.ratings).filter(r => r === 'Ruim').length / (Object.values(formData.ratings).length || 1)) * 100)
                }%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-slate-200">
              <input
                type="radio"
                className="form-radio text-green-600 h-5 w-5"
                checked={formData.resultado === 'Apto'}
                onChange={() => handleChange('resultado', 'Apto')}
              />
              <span className="ml-3 font-bold text-slate-800">APTO</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-slate-200">
              <input
                type="radio"
                className="form-radio text-yellow-600 h-5 w-5"
                checked={formData.resultado === 'Apto com Restrição'}
                onChange={() => handleChange('resultado', 'Apto com Restrição')}
              />
              <span className="ml-3 font-bold text-slate-800 text-sm lg:text-base">APTO COM RESTRIÇÃO</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-slate-200">
              <input
                type="radio"
                className="form-radio text-red-600 h-5 w-5"
                checked={formData.resultado === 'Inapto'}
                onChange={() => handleChange('resultado', 'Inapto')}
              />
              <span className="ml-3 font-bold text-slate-800">INAPTO</span>
            </label>
          </div>

          <div className="space-y-8">
            <div className="animate-in fade-in slide-in-from-top-2">
              <h3 className="report-label mb-4 text-green-700 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Pontos Positivos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOTIVOS_APTO.map(motivo => (
                  <div key={motivo} onClick={() => handleMotivoToggle(motivo)} className={cn(
                    "btn-chip",
                    formData.motivos.includes(motivo) ? "selected-apto" : "bg-white text-slate-700"
                  )}>
                    {motivo}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-top-2">
              <h3 className="report-label mb-4 text-yellow-700 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Ressalvas / Observações Técnicas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOTIVOS_RESSALVAS.map(motivo => (
                  <div key={motivo} onClick={() => handleMotivoToggle(motivo)} className={cn(
                    "btn-chip",
                    formData.motivos.includes(motivo) ? "border-yellow-400 bg-yellow-50 text-yellow-800 shadow-sm" : "bg-white text-slate-700"
                  )}>
                    {motivo}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-top-2">
              <h3 className="report-label mb-4 text-red-700 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Pontos de Atenção / Negativos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOTIVOS_INAPTO.map(motivo => (
                  <div key={motivo} onClick={() => handleMotivoToggle(motivo)} className={cn(
                    "btn-chip",
                    formData.motivos.includes(motivo) ? "selected-inapto" : "bg-white text-slate-700"
                  )}>
                    {motivo}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">* Apontar os motivos</h3>
              <div className="space-y-2">
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                  placeholder="Descreva aqui as observações detalhadas da avaliação..."
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                />
                <div className="text-[10px] text-slate-400 italic">
                  Utilize este espaço para detalhar comportamentos específicos observados durante o trajeto.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] flex justify-end px-4 sm:px-6 lg:px-8 z-10">
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black border transition-all",
                isOverLimit 
                  ? "bg-red-600 border-red-700 text-white shadow-lg shadow-red-200 scale-110" 
                  : "bg-slate-900 border-slate-800 text-slate-100"
              )}>
                <AlertTriangle className={cn("h-4 w-4", isOverLimit ? "animate-bounce" : "text-slate-500")} />
                <span className="tabular-nums tracking-tighter">{status === 'active' ? Math.round(speed) : '---'} KM/H</span>
              </div>
              
              {formData.speedLimitExceededCount > 0 && (
                <div className="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-[10px] font-black border border-red-200 flex items-center shadow-sm">
                  INFRAÇÕES: {formData.speedLimitExceededCount}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center items-center px-6 py-2 border border-transparent rounded font-bold shadow-md text-sm text-white bg-blue-800 hover:bg-blue-900 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Avaliação
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Speed Alert Popup */}
      {showSpeedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform animate-in zoom-in duration-300">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">ALERTA DE VELOCIDADE</h3>
            <p className="text-slate-600 mb-8 font-medium">
              O motorista ultrapassou o limite de <span className="font-bold text-red-600">30 KM/H</span> permitido durante o teste.
              <br/>
              <span className="text-xs mt-2 block bg-red-50 text-red-600 py-1 rounded">
                Total de infrações: <strong>{formData.speedLimitExceededCount}</strong>
              </span>
            </p>
            <button
              onClick={() => setShowSpeedAlert(false)}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center space-x-2"
            >
              <Volume2 className="h-5 w-5" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
