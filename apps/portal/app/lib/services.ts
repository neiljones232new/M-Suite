export interface Service {
  id: string;
  name: string;
  url: string;
  health: string;
  description?: string;
}

export const services: Service[] = [
  {
    id: 'practice-ui',
    name: 'Practice Web UI',
    url: 'http://localhost:3000',
    health: 'http://localhost:3000',
    description: 'Client management and compliance platform',
  },
  {
    id: 'practice-api',
    name: 'Practice API',
    url: 'http://localhost:3001',
    health: 'http://localhost:3001/api/v1/health',
    description: 'Practice Manager backend services',
  },
  {
    id: 'customs-ui',
    name: 'Customs UI',
    url: 'http://localhost:5173',
    health: 'http://localhost:5173',
    description: 'Duty and VAT repayment automation',
  },
  {
    id: 'customs-api',
    name: 'Customs Backend',
    url: 'http://localhost:3100',
    health: 'http://localhost:3100/health',
    description: 'Customs Manager backend API',
  },
];
