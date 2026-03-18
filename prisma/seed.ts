import { PrismaClient } from "./generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import "dotenv/config"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function hoursAgo(hours: number): Date {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

async function main() {
  console.log("🐸 Frogia — Seed de la base de données")
  console.log("========================================\n")

  // ──────────────────────────────────────────
  // 1. Nettoyage
  // ──────────────────────────────────────────
  console.log("🧹 Suppression des données existantes...")

  await prisma.explorationQuestion.deleteMany()
  await prisma.explorationPath.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.documentSection.deleteMany()
  await prisma.document.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.projectIssue.deleteMany()
  await prisma.integration.deleteMany()
  await prisma.project.deleteMany()

  console.log("✅ Données supprimées\n")

  // ──────────────────────────────────────────
  // 2. Projet principal
  // ──────────────────────────────────────────
  console.log("📁 Création du projet Boom Boom Villette...")

  const project = await prisma.project.create({
    data: {
      name: "Boom Boom Villette",
      client: "Boom Boom Villette",
      industry: "Restauration & Divertissement",
      phase: "CADRAGE",
      status: "ACTIVE",
      summary:
        "Conception d'un système de réservation sur mesure pour un complexe multi-activités. Enjeu principal : gestion d'emplacements (pas de tables classiques) avec des contraintes de capacité variables.",
      description:
        "Boom Boom Villette est un complexe de loisirs et restauration proposant bowling, karaoké, escape game et restauration. Le système actuel de réservation par téléphone ne tient plus la charge. Besoin d'un outil digital sur mesure, type Zenchef, mais adapté aux emplacements et non aux tables.",
      lastActivity: hoursAgo(2),
      createdAt: daysAgo(14),
    },
  })

  console.log("✅ Projet créé\n")

  // ──────────────────────────────────────────
  // 3. Problématiques (ProjectIssues)
  // ──────────────────────────────────────────
  console.log("⚠️  Création des problématiques...")

  await prisma.projectIssue.createMany({
    data: [
      {
        title: "Gestion emplacements vs tables",
        description:
          "Le modèle classique table/couverts ne s'applique pas. Chaque emplacement a sa propre capacité et ses contraintes horaires.",
        severity: "high",
        projectId: project.id,
      },
      {
        title: "Parcours réservation multi-activités",
        description:
          "Un client peut réserver bowling + restaurant en une seule session. Flux à définir.",
        severity: "high",
        projectId: project.id,
      },
      {
        title: "Politique d'annulation floue",
        description:
          "Pas de règle claire sur les annulations et no-shows. À cadrer avant dev.",
        severity: "medium",
        projectId: project.id,
      },
    ],
  })

  console.log("✅ 3 problématiques créées\n")

  // ──────────────────────────────────────────
  // 4. Documents
  // ──────────────────────────────────────────
  console.log("📄 Création des documents...")

  const docsData: {
    title: string
    category:
      | "BUSINESS_CONTEXT"
      | "INDUSTRY_ANALYSIS"
      | "CAHIER_DES_CHARGES"
      | "COMPANY_KNOWLEDGE"
      | "OPEN_QUESTIONS"
      | "ARCHITECTURE_DECISIONS"
    summary: string
    status: "INDEXED" | "DRAFT" | "NEEDS_REVIEW"
    author: string
    tags: string[]
    sections: { title: string; content: string }[]
  }[] = [
    {
      title: "Contexte Boom Boom Villette",
      category: "BUSINESS_CONTEXT",
      summary: "Présentation du complexe, historique et enjeux actuels.",
      status: "INDEXED",
      author: "Marie Dupont",
      tags: ["contexte", "client"],
      sections: [
        {
          title: "Présentation",
          content:
            "Complexe de loisirs ouvert en 2019. 12 pistes de bowling, 4 salles karaoké, 2 escape games, 1 restaurant 120 couverts, 1 terrasse 60 places.",
        },
        {
          title: "Enjeux",
          content:
            "Réservation 100% téléphonique. 3 personnes dédiées à la prise de réservation. Perte estimée de 30% des demandes aux heures de pointe.",
        },
      ],
    },
    {
      title: "Analyse secteur Restauration & Loisirs",
      category: "INDUSTRY_ANALYSIS",
      summary: "Tendances du marché et pratiques de réservation dans le secteur.",
      status: "INDEXED",
      author: "Marie Dupont",
      tags: ["secteur", "benchmark"],
      sections: [
        {
          title: "Tendances",
          content:
            "Croissance de 15% des réservations en ligne dans le secteur loisirs. Les clients attendent un parcours fluide, mobile-first.",
        },
        {
          title: "Concurrence",
          content:
            "Zenchef, TheFork et Bookeo dominent mais sont pensés pour la restauration classique. Aucune solution ne gère nativement les emplacements multi-activités.",
        },
      ],
    },
    {
      title: "Cahier des charges - Réservation",
      category: "CAHIER_DES_CHARGES",
      summary: "Spécifications fonctionnelles du système de réservation cible.",
      status: "NEEDS_REVIEW",
      author: "Thomas Martin",
      tags: ["cdc", "réservation", "fonctionnel"],
      sections: [
        {
          title: "Fonctionnalités clés",
          content:
            "Réservation par emplacement, calendrier de disponibilité temps réel, gestion de la capacité par créneau, notifications SMS/email.",
        },
        {
          title: "Contraintes",
          content:
            "Doit s'intégrer à la caisse existante (Lightspeed). Interface back-office pour le personnel. Temps de réponse < 2s.",
        },
      ],
    },
    {
      title: "Benchmark Zenchef & concurrents",
      category: "COMPANY_KNOWLEDGE",
      summary: "Analyse comparative des solutions existantes sur le marché.",
      status: "INDEXED",
      author: "Marie Dupont",
      tags: ["benchmark", "zenchef", "concurrence"],
      sections: [
        {
          title: "Zenchef",
          content:
            "Solution leader en restauration. Gestion tables/couverts. Pas de concept d'emplacement. Widget de réservation embeddable. API limitée.",
        },
        {
          title: "Alternatives",
          content:
            "Bookeo : multi-activités mais UX datée. SimplyBook : flexible mais pas de gestion de capacité avancée. Conclusion : aucune solution ne couvre le besoin tel quel.",
        },
      ],
    },
    {
      title: "Notes RDV découverte 12 mars",
      category: "OPEN_QUESTIONS",
      summary: "Compte-rendu du premier rendez-vous avec le client.",
      status: "DRAFT",
      author: "Thomas Martin",
      tags: ["rdv", "notes", "questions"],
      sections: [
        {
          title: "Points abordés",
          content:
            "Le client veut lancer avant l'été. Budget indicatif 80-120k€. Équipe interne : 1 responsable digital, 1 responsable opérations.",
        },
        {
          title: "Questions ouvertes",
          content:
            "Quid du paiement en ligne ? Le client hésite. Gestion des groupes (anniversaires, CE) : besoin spécifique ? Intégration fidélité existante ?",
        },
      ],
    },
    {
      title: "Architecture cible envisagée",
      category: "ARCHITECTURE_DECISIONS",
      summary: "Premières orientations techniques pour le système de réservation.",
      status: "DRAFT",
      author: "Thomas Martin",
      tags: ["architecture", "technique"],
      sections: [
        {
          title: "Stack envisagée",
          content:
            "Next.js + PostgreSQL + API REST. Hébergement Vercel. Base Neon pour le serverless. Queue BullMQ pour les notifications.",
        },
        {
          title: "Modèle de données",
          content:
            "Entité centrale : Emplacement (type, capacité, créneaux). Réservation liée à 1..N emplacements. Pas de concept de table.",
        },
      ],
    },
  ]

  for (const doc of docsData) {
    await prisma.document.create({
      data: {
        title: doc.title,
        category: doc.category,
        status: doc.status,
        summary: doc.summary,
        author: doc.author,
        tags: doc.tags,
        ragIndexed: doc.status === "INDEXED",
        sectionsCount: doc.sections.length,
        projectId: project.id,
        createdAt: daysAgo(Math.floor(Math.random() * 10) + 2),
        sections: {
          create: doc.sections.map((s, i) => ({
            title: s.title,
            content: s.content,
            order: i,
          })),
        },
      },
    })
  }

  console.log("✅ 6 documents créés\n")

  // ──────────────────────────────────────────
  // 5. Conversations
  // ──────────────────────────────────────────
  console.log("💬 Création des conversations...")

  await prisma.conversation.create({
    data: {
      title: "Comment gérer les emplacements au lieu des tables ?",
      projectId: project.id,
      createdAt: daysAgo(5),
      messages: {
        create: [
          {
            role: "USER",
            content:
              "Comment structurer le modèle de données pour gérer des emplacements plutôt que des tables classiques ?",
            createdAt: daysAgo(5),
          },
          {
            role: "ASSISTANT",
            content:
              "Je recommande un modèle Emplacement avec type (bowling, karaoké, terrasse...), capacité variable par créneau, et une relation N-N avec les réservations. Cela permet de combiner plusieurs emplacements dans une même réservation.",
            summary: "Modèle Emplacement flexible avec capacité variable et réservation multi-emplacements.",
            operationalImpacts: [
              "Nouveau modèle de données à concevoir",
              "Migration depuis le système téléphonique actuel",
            ],
            clientImpacts: [
              "Réservation simplifiée en ligne",
              "Visibilité temps réel des disponibilités",
            ],
            processesUsed: ["Analyse de domaine", "Modélisation entité-relation"],
            documentsUsed: ["Cahier des charges - Réservation"],
            openQuestions: ["Gestion des créneaux chevauchants ?"],
            risks: ["Complexité du modèle multi-activités"],
            suggestedActions: ["Prototyper le modèle avec 3 types d'emplacements"],
            confidenceScore: 85,
            createdAt: daysAgo(5),
          },
        ],
      },
    },
  })

  await prisma.conversation.create({
    data: {
      title: "Quelles questions poser au prochain RDV ?",
      projectId: project.id,
      createdAt: daysAgo(2),
      messages: {
        create: [
          {
            role: "USER",
            content: "Quelles questions prioritaires préparer pour le prochain RDV client ?",
            createdAt: daysAgo(2),
          },
          {
            role: "ASSISTANT",
            content:
              "Voici les 5 questions clés : 1) Validation du périmètre MVP (réservation simple sans paiement). 2) Qui gère les annulations côté client ? 3) Budget pour l'intégration caisse Lightspeed. 4) Deadline ferme pour le lancement été. 5) Accès aux données actuelles de réservation pour le benchmark.",
            summary: "5 questions prioritaires couvrant périmètre, process, budget et planning.",
            operationalImpacts: [
              "Cadrage du périmètre MVP",
              "Clarification du process d'annulation",
            ],
            clientImpacts: [
              "Alignement sur les priorités",
              "Engagement sur le planning",
            ],
            processesUsed: ["Préparation de RDV", "Analyse des risques projet"],
            documentsUsed: ["Notes RDV découverte 12 mars"],
            openQuestions: ["Le client a-t-il un interlocuteur technique dédié ?"],
            risks: ["Risque de scope creep si périmètre mal défini"],
            suggestedActions: ["Envoyer les questions au client 48h avant le RDV"],
            confidenceScore: 90,
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  })

  console.log("✅ 2 conversations créées\n")

  // ──────────────────────────────────────────
  // 6. Pistes d'exploration
  // ──────────────────────────────────────────
  console.log("🧭 Création des pistes d'exploration...")

  const explorationsData: {
    category:
      | "CONTEXTE_ENTREPRISE"
      | "ENJEUX_SECTORIELS"
      | "QUESTIONS_RDV"
      | "HYPOTHESES"
      | "PISTES_CADRAGE"
    questions: {
      question: string
      priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
      status: "OPEN" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS"
      source?: string
    }[]
  }[] = [
    {
      category: "CONTEXTE_ENTREPRISE",
      questions: [
        {
          question: "Quelle est la saisonnalité de l'activité ?",
          priority: "HIGH",
          status: "OPEN",
          source: "RDV découverte",
        },
        {
          question: "Quel est le panier moyen par emplacement ?",
          priority: "MEDIUM",
          status: "OPEN",
          source: "Analyse interne",
        },
        {
          question: "Combien d'emplacements par activité ?",
          priority: "HIGH",
          status: "ACCEPTED",
          source: "RDV découverte",
        },
      ],
    },
    {
      category: "ENJEUX_SECTORIELS",
      questions: [
        {
          question: "Comment Zenchef gère les espaces atypiques ?",
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          source: "Benchmark",
        },
        {
          question: "Quels sont les standards du secteur loisirs ?",
          priority: "MEDIUM",
          status: "OPEN",
          source: "Analyse sectorielle",
        },
        {
          question: "Quelle part du marché réserve en ligne vs téléphone ?",
          priority: "LOW",
          status: "OPEN",
        },
      ],
    },
    {
      category: "QUESTIONS_RDV",
      questions: [
        {
          question: "Le client a-t-il une préférence de stack technique ?",
          priority: "MEDIUM",
          status: "OPEN",
        },
        {
          question: "Quel est le budget enveloppe ?",
          priority: "CRITICAL",
          status: "ACCEPTED",
          source: "RDV découverte",
        },
        {
          question: "Qui valide les choix fonctionnels côté client ?",
          priority: "HIGH",
          status: "OPEN",
        },
        {
          question: "Y a-t-il des contraintes RGPD spécifiques ?",
          priority: "MEDIUM",
          status: "OPEN",
        },
      ],
    },
    {
      category: "HYPOTHESES",
      questions: [
        {
          question: "Le système doit-il gérer le paiement en ligne ?",
          priority: "HIGH",
          status: "IN_PROGRESS",
          source: "CDC",
        },
        {
          question: "Les emplacements peuvent-ils être combinés ?",
          priority: "HIGH",
          status: "ACCEPTED",
          source: "RDV découverte",
        },
        {
          question: "Faut-il gérer les groupes (CE, anniversaires) dès le MVP ?",
          priority: "MEDIUM",
          status: "OPEN",
        },
      ],
    },
    {
      category: "PISTES_CADRAGE",
      questions: [
        {
          question: "Partir d'une solution SaaS existante ou sur mesure ?",
          priority: "CRITICAL",
          status: "ACCEPTED",
          source: "Benchmark",
        },
        {
          question: "MVP avec réservation simple puis itérer ?",
          priority: "HIGH",
          status: "ACCEPTED",
        },
        {
          question: "Intégrer la caisse existante ou la remplacer ?",
          priority: "HIGH",
          status: "IN_PROGRESS",
          source: "RDV découverte",
        },
      ],
    },
  ]

  for (const exp of explorationsData) {
    await prisma.explorationPath.create({
      data: {
        category: exp.category,
        projectId: project.id,
        questions: {
          create: exp.questions.map((q) => ({
            question: q.question,
            priority: q.priority,
            status: q.status,
            source: q.source ?? null,
            relatedDocs: [],
          })),
        },
      },
    })
  }

  console.log("✅ 5 pistes d'exploration créées\n")

  // ──────────────────────────────────────────
  // 7. Décisions
  // ──────────────────────────────────────────
  console.log("⚖️  Création des décisions...")

  await prisma.decision.createMany({
    data: [
      {
        title: "Emplacements et non tables",
        context:
          "Le modèle restaurant classique (tables/couverts) ne correspond pas au fonctionnement du complexe.",
        justification:
          "Chaque activité a ses propres emplacements avec des contraintes de capacité et d'horaires différentes.",
        impact: "Modèle de données sur mesure, pas de réutilisation de solutions restaurant existantes.",
        author: "Marie Dupont",
        status: "APPROVED",
        inputType: "TEXT",
        relatedDocs: ["Cahier des charges - Réservation", "Benchmark Zenchef & concurrents"],
        projectId: project.id,
        createdAt: daysAgo(10),
      },
      {
        title: "MVP réservation simple d'abord",
        context: "Le client veut lancer avant l'été. Le périmètre complet est trop large.",
        justification:
          "Livrer une v1 fonctionnelle rapidement, puis itérer. Le MVP couvre la réservation mono-emplacement.",
        impact: "Planning serré mais réaliste. Paiement en ligne reporté.",
        author: "Thomas Martin",
        status: "APPROVED",
        inputType: "TEXT",
        relatedDocs: ["Notes RDV découverte 12 mars"],
        projectId: project.id,
        createdAt: daysAgo(7),
      },
      {
        title: "Paiement en ligne reporté phase 2",
        context:
          "Discussion lors du RDV du 15 mars. Le client hésite entre acompte et paiement total.",
        justification:
          "Trop de questions ouvertes sur la politique tarifaire. Reporter pour ne pas bloquer le MVP.",
        impact: "Simplifie le MVP. À intégrer en phase 2 avec Stripe.",
        author: "Marie Dupont",
        status: "PENDING",
        inputType: "AUDIO",
        transcript:
          "Donc on a discuté du paiement en ligne avec le client... Il hésite entre demander un acompte de 30% ou le paiement total à la réservation. Il faut qu'il en parle avec son comptable. Du coup on a décidé de reporter ça à la phase 2 pour pas bloquer le MVP.",
        synthesis:
          "Le paiement en ligne est reporté en phase 2. Le client doit valider la politique tarifaire (acompte 30% vs paiement total) avec son comptable avant de trancher.",
        relatedDocs: ["Notes RDV découverte 12 mars", "Cahier des charges - Réservation"],
        projectId: project.id,
        createdAt: daysAgo(3),
      },
      {
        title: "Intégration caisse existante",
        context:
          "Le client utilise Lightspeed comme système de caisse. Question : intégrer ou remplacer ?",
        justification:
          "Lightspeed a une API REST documentée. Le personnel est formé dessus. Remplacer serait trop disruptif.",
        impact: "Développement d'un connecteur API Lightspeed. Contrainte de compatibilité.",
        author: "Thomas Martin",
        status: "PENDING",
        inputType: "TEXT",
        relatedDocs: ["Architecture cible envisagée"],
        projectId: project.id,
        createdAt: daysAgo(1),
      },
    ],
  })

  console.log("✅ 4 décisions créées\n")

  // ──────────────────────────────────────────
  // 8. Activités
  // ──────────────────────────────────────────
  console.log("📊 Création des activités...")

  await prisma.activity.createMany({
    data: [
      {
        type: "document_added",
        description: "Document « Cahier des charges - Réservation » ajouté",
        projectId: project.id,
        createdAt: hoursAgo(2),
      },
      {
        type: "decision_made",
        description: "Décision « Emplacements et non tables » approuvée",
        projectId: project.id,
        createdAt: hoursAgo(5),
      },
      {
        type: "question_asked",
        description: "Nouvelle question : politique d'annulation à cadrer",
        projectId: project.id,
        createdAt: hoursAgo(8),
      },
      {
        type: "document_indexed",
        description: "« Benchmark Zenchef & concurrents » indexé dans la base",
        projectId: project.id,
        createdAt: hoursAgo(12),
      },
      {
        type: "exploration_update",
        description: "3 nouvelles pistes de cadrage ajoutées",
        projectId: project.id,
        createdAt: daysAgo(1),
      },
      {
        type: "decision_made",
        description: "Décision « MVP réservation simple » validée",
        projectId: project.id,
        createdAt: daysAgo(2),
      },
      {
        type: "conversation_created",
        description: "Conversation « Questions pour le prochain RDV » créée",
        projectId: project.id,
        createdAt: daysAgo(2),
      },
      {
        type: "document_added",
        description: "Document « Notes RDV découverte 12 mars » ajouté",
        projectId: project.id,
        createdAt: daysAgo(6),
      },
    ],
  })

  console.log("✅ 8 activités créées\n")

  // ──────────────────────────────────────────
  // 9. Intégrations
  // ──────────────────────────────────────────
  console.log("🔗 Création des intégrations...")

  await prisma.integration.createMany({
    data: [
      {
        name: "Notion",
        type: "documentation",
        status: "CONNECTED",
        config: { workspace: "boom-boom-villette", lastSync: daysAgo(1).toISOString() },
      },
      {
        name: "Google Drive",
        type: "storage",
        status: "PENDING",
        config: { folder: "Projet BBV" },
      },
      {
        name: "Confluence",
        type: "documentation",
        status: "AVAILABLE",
      },
    ],
  })

  console.log("✅ 3 intégrations créées\n")

  console.log("========================================")
  console.log("🐸 Seed terminé avec succès !")
  console.log("   • 1 projet")
  console.log("   • 3 problématiques")
  console.log("   • 6 documents (12 sections)")
  console.log("   • 2 conversations (4 messages)")
  console.log("   • 5 pistes d'exploration (16 questions)")
  console.log("   • 4 décisions")
  console.log("   • 8 activités")
  console.log("   • 3 intégrations")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Erreur lors du seed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
