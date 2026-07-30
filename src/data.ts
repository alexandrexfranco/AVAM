import { Category, VehicleType } from './types';

export const VEHICLE_TYPES: VehicleType[] = ['Toco', 'Truck', 'Automóvel', 'Utilitário'];

export const CATEGORIES: Category[] = [
  {
    id: 'conducao',
    title: 'Condução',
    items: [
      { id: 'c_dominio', label: 'Domínio do veículo' },
      { id: 'c_pedais', label: 'Uso correto dos pedais' },
      { id: 'c_re', label: 'Uso da Marcha Ré' },
      { id: 'c_vaga', label: 'Colocar o veículo na vaga' },
      { id: 'c_estacionamento', label: 'Estacionamento e Parada' },
    ]
  },
  {
    id: 'conhecimento',
    title: 'Conhecimento do Veículo',
    items: [
      { id: 'cv_sinalizacao', label: 'Sinalização correta com antecedência' },
      { id: 'cv_espelhos', label: 'Uso dos espelhos retrovisores' },
      { id: 'cv_bancos', label: 'Ajuste dos bancos' },
      { id: 'cv_painel', label: 'Conhecimento dos Instrumentos do Painel' },
    ]
  },
  {
    id: 'atencao',
    title: 'Atenção e Segurança',
    items: [
      { id: 'as_distancia', label: 'Distância de segurança' },
      { id: 'as_velocidade', label: 'Limite de velocidade' },
      { id: 'as_trafego_pedestres', label: 'Atenção ao tráfego de pedestres' },
      { id: 'as_trafego_carros', label: 'Atenção ao tráfego de carros' },
      { id: 'as_curvas_cruzamentos', label: 'Atenção a curvas e cruzamentos' },
      { id: 'as_rotatorias_frenagem', label: 'Atenção a rotatórias e frenagem' },
      { id: 'as_pista', label: 'Acesso a pista' },
      { id: 'as_faixa', label: 'Manter o veículo centralizado na faixa' },
      { id: 'as_regras', label: 'Respeito a Sinalização e Regras de Trânsito' },
    ]
  },
  {
    id: 'postura',
    title: 'Postura do Condutor',
    items: [
      { id: 'p_apresentacao', label: 'Apresentação Pessoal' },
      { id: 'p_postura', label: 'Postura ao conduzir o veículo' },
      { id: 'p_concentracao', label: 'Concentração durante o trajeto' },
      { id: 'p_seguranca', label: 'Atenção a Segurança' },
      { id: 'p_comportamento', label: 'Comportamento Geral do Condutor' },
    ]
  }
];

export const MOTIVOS_APTO = [
  'Bom condutor', 
  'Atento', 
  'Condução Segura', 
  'Bom controle de Direção',
  'Bom controle de Velocidade', 
  'Antecipa Sinalização', 
  'Mantém distância Segura',
  'Mantem o foco na Via', 
  'Bom equilibrio Emocional'
];

export const MOTIVOS_INAPTO = [
  'Imprudente', 
  'Falta de Atenção', 
  'Excesso de Confiança', 
  'Inaptidão Técnica',
  'Falta de prática', 
  'Não Sinaliza', 
  'Reações Incorretas', 
  'Vícios na Direção',
  'Reações lentas'
];

export const MOTIVOS_RESSALVAS = [
  'Necessita Treinamento',
  'Acompanhamento Técnico',
  'Observar uso de EPI',
  'Ajustar postura',
  'Melhorar troca de marchas'
];

export const CARGO_OPTIONS = ['Parqueador(a)', 'Operador PDI', 'Conferente'];

export const NOVO_CARGO_OPTIONS = [
  'Conferente',
  'Operador PDI',
  'Facilitador',
  'Encarregado'
];
