export const globalConfig = {
  site: {
    name: "The Living Portfolio",
    author: "Abdoulrhamane Ivo",
    description: "Un portfolio vivant : projets numériques, parcours, expérimentations et apprentissages documentés.",
    url: "/"
  },
  navigation: {
    aria: "Navigation principale",
    items: [
      { title: "Accueil", href: "/" },
      { title: "Profil", href: "/about" },
      { title: "Projets", href: "/projects" },
      { title: "Compétences", href: "/competences" },
      { title: "Certifications", href: "/certifications" },
      { title: "Parcours", href: "/about#parcours" },
      { title: "Labo", href: "/experiments" },
      { title: "Contact", href: "/#contact" },
      { title: "CV", href: "/cv" }
    ]
  },
  footer: {
    aria: "Navigation de pied de page",
    copyright: "© 2026 The Living Portfolio. Tous droits réservés.",
    social: {
      twitter: "#",
      github: "#",
      email: ""
    }
  }
} as const; 
