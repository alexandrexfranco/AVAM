import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  dotenv.config({ path: path.join(process.cwd(), '.env.example') });
}

const app = express();
app.use(express.json());

let _supabaseClient: any = null;

function getSupabase() {
  if (!_supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('CRITICAL: SUPABASE_URL ou SUPABASE_KEY não configurados.');
    }
    _supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return _supabaseClient;
}

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
  const motivos = Array.isArray(record.reasons) ? record.reasons : (typeof record.reasons === 'string' ? safeParse(record.reasons, []) : []);
  const evalData = typeof record.evaluation === 'object' && record.evaluation !== null ? record.evaluation : safeParse(record.evaluation, {});

  return {
    id: record.id || record.ID || record.eu,
    createdAt: record.createdat || record.createdAt || record.created_at || record.criado_em || record.criadoEm || new Date().toISOString(),
    tipo: record.type || record.tipo || 'Admissão',
    data: record.date || record.data || new Date().toISOString().split('T')[0],
    instrutorNome: record.instructorname || record.instrutor_nome || record.instrutorNome || '',
    motoristaNome: record.drivername || record.motorista_nome || record.motoristaNome || '',
    motoristaCargo: evalData.motoristaCargo || record.motoristaCargo || '',
    motoristaNovoCargo: evalData.motoristaNovoCargo || record.motoristaNovoCargo || '',
    veiculoTipo: record.vehicletype || record.veiculo_tipo || record.veiculoTipo || 'Automóvel',
    ratings: evalData.ratings || evalData.itens || {},
    resultado: evalData.resultado || record.resultado || 'Pendente',
    motivos: motivos,
    observacoes: record.observation || record.observacoes || ''
  };
}

app.get('/api/evaluations', async (req, res) => {
  try {
    const db = getSupabase();
    const { data, error } = await db.from('evaluations').select('*');
    if (error) return res.status(500).json({ error: 'Erro no Banco de Dados', message: error.message, details: error.details, code: error.code });
    const items = (data || []).map(mapEvaluation);
    items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro Interno', message: err.message });
  }
});

app.post('/api/evaluations', async (req, res) => {
  try {
    const db = getSupabase();
    const ev = req.body;
    const toUpsert = {
      id: ev.id,
      drivername: ev.motoristaNome,
      driverdoc: '',
      vehicletype: ev.veiculoTipo,
      type: ev.tipo,
      instructorname: ev.instrutorNome,
      date: ev.data,
      observation: ev.observacoes,
      reasons: ev.motivos,
      evaluation: { resultado: ev.resultado, ratings: ev.ratings, motoristaCargo: ev.motoristaCargo, motoristaNovoCargo: ev.motoristaNovoCargo },
      createdat: ev.createdAt || new Date().toISOString()
    };
    const { error } = await db.from('evaluations').upsert(toUpsert, { onConflict: 'id' });
    if (error) return res.status(500).json({ error: 'Erro ao salvar no banco', message: error.message, details: error.details, code: error.code });
    res.json(ev);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.delete('/api/evaluations/:id', async (req, res) => {
  try {
    const db = getSupabase();
    const { error } = await db.from('evaluations').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Database error', message: error.message, code: error.code });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default app;
