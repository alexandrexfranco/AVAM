import { useState, useEffect } from 'react';
import { Evaluation } from '../types';

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/evaluations')
      .then(async res => {
        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        const data = isJson ? await res.json() : null;

        if (!res.ok) {
          setDbConnected(false);
          const errorMsg = data?.message || data?.error || (isJson ? 'Erro desconhecido' : await res.text()) || 'Erro de conexão';
          throw new Error(errorMsg);
        }
        setDbConnected(true);
        return data;
      })
      .then(data => {
        if (Array.isArray(data)) {
          setEvaluations(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load evaluations:', err.message);
        setLoading(false);
      });
  }, []);

  const saveEvaluation = async (evaluation: Evaluation) => {
    // Optimistic update
    setEvaluations(prev => {
      const exists = prev.findIndex(e => e.id === evaluation.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = evaluation;
        return copy;
      }
      return [evaluation, ...prev];
    });

    try {
      await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluation),
      });
    } catch (err) {
      console.error('Failed to save evaluation to DB', err);
    }
  };

  const deleteEvaluation = async (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
    
    try {
      await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete evaluation from DB', err);
    }
  };

  return {
    evaluations,
    saveEvaluation,
    deleteEvaluation,
    loading,
    dbConnected
  };
}
