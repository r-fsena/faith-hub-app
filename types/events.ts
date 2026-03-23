export type EventCategory = 'ACAMPAMENTO' | 'CONFERÊNCIA' | 'JANTAR' | 'CULTO' | 'SEMINÁRIO' | 'OUTROS';
export type CourseCategory = 'FUNDAMENTOS' | 'LIDERANÇA' | 'MINISTÉRIO' | 'BÍBLICO' | 'AVANÇADO';

export interface BaseActivity {
  id: string;
  title: string;
  color: string;
  /** Endereço curto para card (Ex: "Templo Principal") */
  location: string;
  /** Endereço completo para mapas (Ex: "Rua João Silva, 123 - Centro, SP") */
  fullAddress: string;
  /** Data principal do evento/início do curso */
  startDate: string;
  /** Horário do evento ou das aulas */
  time: string;
  
  // Future backend fields for mapping
  imageUrl?: string;
  speakerOrTeacher?: string;
  price?: number;
  
  // Rota de Inscrição / Checkout
  route?: string;
  
  // Sistema de Escassez (Vagas)
  totalSpots: number;
  filledSpots: number;
}

export interface ChurchEvent extends BaseActivity {
  category: EventCategory;
  /** Rota ou Deeplink de Inscrição */
  route: string;
}

export interface ChurchCourse extends BaseActivity {
  category: CourseCategory;
  /** Duração em módulos, meses ou horas (Ex: "8 Módulos") */
  duration: string;
  /** Ícone ilustrativo (Feather Icon) */
  icon: string;
  /** Badge dinâmico (Ex: "VAGAS LIMITADAS" ou "INSCRIÇÕES ABERTAS") */
  tag: string;
}
