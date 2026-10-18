import type { PortfolioJourneyItem } from './portfolio';

export type JourneyCapabilityStatus = 'Pratique documentée' | 'Contribution' | 'En formation';

export type JourneyCapability = {
  name: string;
  status: JourneyCapabilityStatus;
  summary: string;
  source: PortfolioJourneyItem;
};

const capabilityRules: Array<{
  name: string;
  status: JourneyCapabilityStatus;
  matches: (item: PortfolioJourneyItem, text: string) => boolean;
  summaryPattern: RegExp;
}> = [
  {
    name: 'Assistance et dépannage informatique',
    status: 'Pratique documentée',
    matches: (_item, text) => /assistance technique|problèmes informatiques|connexion réseau|dépannage|impression/i.test(text),
    summaryPattern: /assistance technique|problèmes informatiques|connexion réseau|dépannage|impression/i,
  },
  {
    name: 'Accompagnement des utilisateurs',
    status: 'Pratique documentée',
    matches: (_item, text) => /accompagnement.{0,45}outils numériques|formation des utilisateurs/i.test(text),
    summaryPattern: /accompagnement.{0,45}outils numériques|formation des utilisateurs/i,
  },
  {
    name: 'Coordination d’équipe et travail collectif',
    status: 'Contribution',
    matches: (item, text) => item.category === 'Contribution' && /chef d’équipe|direction d’une équipe|équipe de cinq/i.test(text),
    summaryPattern: /chef d’équipe|direction d’une équipe|direction du club informatique|équipe de cinq/i,
  },
  {
    name: 'Conception d’une solution numérique',
    status: 'Contribution',
    matches: (_item, text) => /concevoir.{0,90}plateforme|conception.{0,80}solution|plateforme destinée à/i.test(text),
    summaryPattern: /Au Vibeathon|concevoir.{0,90}plateforme|plateforme destinée à/i,
  },
  {
    name: 'Digitalisation des services',
    status: 'En formation',
    matches: (item, text) => item.category === 'Formation' && /digitalisation des processus|transformation numérique|digitalisation des services/i.test(text),
    summaryPattern: /Formation axée sur|digitalisation des processus|transformation numérique/i,
  },
  {
    name: 'Rigueur et respect des procédures',
    status: 'Pratique documentée',
    matches: (_item, text) => /confidentialité.{0,80}rigueur|respect des procédures/i.test(text),
    summaryPattern: /confidentialité.{0,80}rigueur|respect des procédures/i,
  },
];

function sentenceFor(text: string, pattern: RegExp) {
  const sentence = text.split(/[.!?]\s+/).find((part) => pattern.test(part));
  return (sentence || text).trim();
}

export function getJourneyCapabilities(journey: PortfolioJourneyItem[]): JourneyCapability[] {
  return capabilityRules.flatMap((rule) => {
    const source = journey.find((item) => rule.matches(item, `${item.title} ${item.description}`));
    if (!source) return [];
    return [{
      name: rule.name,
      status: rule.status,
      summary: sentenceFor(source.description, rule.summaryPattern),
      source,
    }];
  });
}
