export type PortfolioProfile = {
  fullName: string;
  portraitUrl: string;
  title: string;
  introduction: string;
  about: string;
  email: string;
  linkedin: string;
  github: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  summary: string;
  problem: string;
  contribution: string;
  solution: string;
  technologies: string;
  proofUrl: string;
  link: string;
  imageUrl: string;
  published: boolean;
  featured: boolean;
};

export type PortfolioJourneyItem = {
  id: string;
  category: 'Formation' | 'Expérience' | 'Contribution';
  period: string;
  title: string;
  organization: string;
  description: string;
  published: boolean;
};

export type PortfolioCertificate = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  domain: string;
  level: string;
  type: string;
  skills: string;
  verificationUrl: string;
  fileUrl: string;
  published: boolean;
  featured: boolean;
};

export type PortfolioExperiment = {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  status: string;
  published: boolean;
};

export type PortfolioAccent = 'lime' | 'mint' | 'blue' | 'coral';

export type PortfolioSettings = {
  accent: PortfolioAccent;
  sceneDepth: number;
  motionSpeed: number;
};

export type PortfolioData = {
  profile: PortfolioProfile;
  journey: PortfolioJourneyItem[];
  projects: PortfolioProject[];
  certificates: PortfolioCertificate[];
  experiments: PortfolioExperiment[];
  settings: PortfolioSettings;
  cv: { fileUrl: string; fileName: string; updatedAt: string };
};

export const emptyPortfolio: PortfolioData = {
  profile: { fullName: '', portraitUrl: '', title: '', introduction: '', about: '', email: '', linkedin: '', github: '' },
  journey: [],
  projects: [],
  certificates: [],
  experiments: [],
  settings: { accent: 'lime', sceneDepth: 54, motionSpeed: 1 },
  cv: { fileUrl: '', fileName: '', updatedAt: '' },
};

export const portfolioAccents: Record<PortfolioAccent, string> = {
  lime: '#C7F36B',
  mint: '#8EE1B5',
  blue: '#9BB9FF',
  coral: '#FF9B7A',
};
