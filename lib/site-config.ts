// Configuração central do estúdio — editável pelo painel da profissional.
// Os valores abaixo são os padrões exibidos para todas as clientes.

export interface ServiceDef {
  id: string
  name: string
  sub: string
  dur: number       // duração em minutos (não editável pelo painel — afeta agenda)
  blurb: string
  price: number | null
}

export interface FooterDef {
  instagram: string
  address: string
  note: string
}

export interface SiteConfig {
  services: ServiceDef[]
  footer: FooterDef
}

export const DEFAULT_CONFIG: SiteConfig = {
  services: [
    {
      id: '1',
      name: 'Spá de mãos',
      sub: '',
      dur: 15,
      blurb: 'Esfoliação, hidratação.',
      price: null,
    },
    {
      id: '2',
      name: 'Esmaltação Tradicional',
      sub: '',
      dur: 90,
      blurb: 'Cuticulagem e esmaltação tradicional.',
      price: null,
    },
    {
      id: '3',
      name: 'Esmaltação em gel',
      sub: '',
      dur: 120,
      blurb: 'Cuticulagem e esmaltação em gel.',
      price: null,
    },
    {
      id: '4',
      name: 'Extensão de unha',
      sub: '',
      dur: 180,
      blurb: 'Alongamento completo com esmaltação e Nail Art inclusa (opcional)',
      price: null,
    },
  ],
  footer: {
    instagram: '@luminails.studio',
    address: 'Rua das Acácias, 120 · sala 4 — São Paulo, SP',
    note: 'Atendimento com hora marcada',
  },
}
