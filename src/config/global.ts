export const globalConfig = {
  site: {
    name: "Portfolio personnel",
    author: "Portfolio",
    description: "Projets, certificats et parcours professionnel.",
    url: "/"
  },
  navigation: {
    aria: "Navigation principale",
    items: [
      {
        title: "Accueil",
        href: "/"
      },
      {
        title: "Projets",
        href: "/projects"
      },
      {
        title: "Certificats",
        href: "/certifications"
      },
      {
        title: "Compétences",
        href: "/competences"
      },
      {
        title: "À propos",
        href: "/about"
      },
      {
        title: "CV",
        href: "/cv"
      }
    ]
  },
  footer: {
    aria: "Navigation de pied de page",
    copyright: "© 2026 Portfolio personnel. Tous droits réservés.",
    social: {
      twitter: "#",
      github: "#",
      email: ""
    }
  }
} as const; 
