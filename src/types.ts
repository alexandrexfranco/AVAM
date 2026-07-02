export type VehicleType = 'Toco' | 'Truck' | 'Automóvel' | 'Utilitário';

export type Rating = 'Bom' | 'Médio' | 'Ruim' | null;

export interface CategoryItem {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  title: string;
  items: CategoryItem[];
}

export type ResultType = 'Apto' | 'Apto com Restrição' | 'Inapto' | null;

export interface Evaluation {
  id: string;
  createdAt: string;

  // Cabeçalho
  tipo: 'Admissão' | 'Promoção' | null;
  data: string;
  
  instrutorNome: string;
  
  motoristaNome: string;
  motoristaCargo: string;
  motoristaNovoCargo: string;

  veiculoTipo: VehicleType | null;

  // Notas
  ratings: Record<string, Rating>; // item_id -> rating

  // Resultado
  resultado: ResultType;
  motivos: string[];
  observacoes: string;
}
