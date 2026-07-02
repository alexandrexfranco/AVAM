import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
// Fallback for this environment: if .env is missing, try .env.example
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  dotenv.config({ path: path.join(process.cwd(), '.env.example') });
}

const app = express();

app.use(express.json());

// Initialize Supabase (Lazy Initialization to prevent Vercel crashes)
let _supabaseClient: any = null;

function getSupabase() {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'CRITICAL: SUPABASE_URL ou SUPABASE_KEY não configurados no ambiente. Se você configurou na Vercel recentemente, faça um NOVO DEPLOY/REDEPLOY para aplicar as alterações.'
      );
    }
    _supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return _supabaseClient;
}

// Helper to map database fields to app fields (handles JSON parsing if stored as strings)
function safeParse(val: any, defaultVal: any) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'object') return val;
  if (typeof val !== 'string') return defaultVal;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
}

function mapEvaluation(record: any) {
  if (!record) return null;
  
  // Detecção/parse resiliente dos campos de motivos
  const motivos = Array.isArray(record.reasons) 
    ? record.reasons 
    : (typeof record.reasons === 'string' ? safeParse(record.reasons, []) : []);

  // Detecção/parse resiliente da coluna evaluation
  const evalData = typeof record.evaluation === 'object' && record.evaluation !== null
    ? record.evaluation
    : safeParse(record.evaluation, {});

  const ratings = evalData.ratings || evalData.itens || {};
  const resultado = evalData.resultado || record.resultado || 'Pendente';
  const motoristaCargo = evalData.motoristaCargo || record.motoristaCargo || '';
  const motoristaNovoCargo = evalData.motoristaNovoCargo || record.motoristaNovoCargo || '';

  return {
    id: record.id || record.ID || record.eu,
    createdAt: record.createdat || record.createdAt || record.created_at || record.criado_em || record.criadoEm || new Date().toISOString(),
    tipo: record.type || record.tipo || 'Admissão',
    data: record.date || record.data || new Date().toISOString().split('T')[0],
    instrutorNome: record.instructorname || record.instrutor_nome || record.instrutorNome || '',
    motoristaNome: record.drivername || record.motorista_nome || record.motoristaNome || '',
    motoristaCargo: motoristaCargo,
    motoristaNovoCargo: motoristaNovoCargo,
    veiculoTipo: record.vehicletype || record.veiculo_tipo || record.veiculoTipo || 'Automóvel',
    ratings: ratings,
    resultado: resultado,
    motivos: motivos,
    observacoes: record.observation || record.observacoes || ''
  };
}

// API Routes
app.get('/api/evaluations', async (req, res) => {
  try {
    const db = getSupabase();
    const { data, error } = await db
      .from('evaluations')
      .select('*');

    if (error) {
      console.error('Erro Supabase (GET):', error);
      return res.status(500).json({ 
        error: 'Erro no Banco de Dados', 
        message: error.message,
        details: error.details,
        code: error.code
      });
    }

    const items = (data || []).map(mapEvaluation);
    
    // Sort items by date/creation descending
    items.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    res.json(items);
  } catch (err: any) {
    console.error('Erro API (GET):', err);
    res.status(500).json({ error: 'Erro Interno', message: err.message });
  }
});

app.post('/api/evaluations', async (req, res) => {
  try {
    const db = getSupabase();

    const ev = req.body;
    
    // Log do que está sendo recebido para debug
    console.log('Recebendo avaliação para salvar:', JSON.stringify(ev, null, 2));

    // Mapeamento flexível de acordo com as colunas reais da tabela (em minúsculas/lowercase)
    const toUpsert: any = {
      id: ev.id,
      drivername: ev.motoristaNome,
      driverdoc: '', // não usado no formulário do frontend, mas mantido para o banco
      vehicletype: ev.veiculoTipo,
      type: ev.tipo,
      instructorname: ev.instrutorNome,
      date: ev.data,
      observation: ev.observacoes,
      reasons: ev.motivos, // serializado como JSON array pelo Supabase SDK
      evaluation: {
        resultado: ev.resultado,
        ratings: ev.ratings,
        motoristaCargo: ev.motoristaCargo,
        motoristaNovoCargo: ev.motoristaNovoCargo
      },
      createdat: ev.createdAt || new Date().toISOString()
    };

    const { data, error } = await db
      .from('evaluations')
      .upsert(toUpsert, { onConflict: 'id' });

    if (error) {
      console.error('Supabase Upsert Error Details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Erro ao salvar no banco', 
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
    }
    res.json(ev);
  } catch (err: any) {
    console.error('API Post Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.delete('/api/evaluations/:id', async (req, res) => {
  try {
    const db = getSupabase();

    const { id } = req.params;
    const { error } = await db
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Delete Error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        message: error.message,
        code: error.code
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('API Delete Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default app;
