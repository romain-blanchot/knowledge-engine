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
  // 1. Nettoyage des données existantes
  // ──────────────────────────────────────────
  console.log("🧹 Suppression des données existantes...")

  await prisma.explorationQuestion.deleteMany()
  await prisma.explorationPath.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.documentSection.deleteMany()
  await prisma.document.deleteMany()
  await prisma.apiEndpoint.deleteMany()
  await prisma.impactAnalysis.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.integration.deleteMany()
  await prisma.project.deleteMany()

  console.log("✅ Données existantes supprimées\n")

  // ──────────────────────────────────────────
  // 2. Création des projets
  // ──────────────────────────────────────────
  console.log("📁 Création des projets...")

  const projectBBV = await prisma.project.create({
    data: {
      name: "Boom Boom Villette",
      client: "Boom Boom Villette",
      description:
        "Plateforme de réservation et expérience client pour un complexe de divertissement (bowling, karting, escape game, restauration, événementiel)",
      status: "ACTIVE",
      industry: "Divertissement/Loisirs",
      completionScore: 78,
      lastActivity: hoursAgo(2),
      createdAt: daysAgo(45),
    },
  })

  const projectHotel = await prisma.project.create({
    data: {
      name: "Hotel Booking Platform",
      client: "HotelCorp International",
      description:
        "Plateforme de réservation hôtelière multi-établissements avec gestion des tarifs dynamiques, intégration channel manager et portail client unifié",
      status: "ACTIVE",
      industry: "Hôtellerie",
      completionScore: 62,
      lastActivity: hoursAgo(8),
      createdAt: daysAgo(30),
    },
  })

  const projectGiftCard = await prisma.project.create({
    data: {
      name: "Gift Card Commerce",
      client: "RetailMax France",
      description:
        "Solution e-commerce de cartes cadeaux B2B et B2C avec personnalisation, distribution multi-canal et tableau de bord analytique pour les enseignes partenaires",
      status: "ACTIVE",
      industry: "E-commerce",
      completionScore: 45,
      lastActivity: daysAgo(1),
      createdAt: daysAgo(20),
    },
  })

  const projectCopilot = await prisma.project.create({
    data: {
      name: "Internal Developer Copilot",
      client: "TechVision SAS",
      description:
        "Assistant IA interne pour développeurs : génération de code, revue automatique, documentation contextuelle et intégration IDE pour accélérer le cycle de développement",
      status: "DRAFT",
      industry: "SaaS/DevTools",
      completionScore: 15,
      lastActivity: daysAgo(3),
      createdAt: daysAgo(10),
    },
  })

  console.log(`✅ ${4} projets créés\n`)

  // ──────────────────────────────────────────
  // 3. Création des documents (projet BBV)
  // ──────────────────────────────────────────
  console.log("📄 Création des documents pour Boom Boom Villette...")

  // Document 1 — Contexte métier
  const doc1 = await prisma.document.create({
    data: {
      title: "Contexte métier — Boom Boom Villette",
      category: "BUSINESS_CONTEXT",
      status: "INDEXED",
      summary:
        "Document décrivant le contexte métier du complexe Boom Boom Villette, incluant les activités proposées (bowling, karting, escape game), le modèle économique et les objectifs stratégiques. Ce document constitue la base de compréhension du projet pour l'ensemble des équipes.",
      author: "Marie Dupont",
      tags: ["contexte", "métier", "stratégie", "activités", "bowling", "karting"],
      ragIndexed: true,
      ringUsed: true,
      sectionsCount: 4,
      projectId: projectBBV.id,
      createdAt: daysAgo(40),
      sections: {
        create: [
          {
            title: "Présentation du complexe",
            content:
              "Boom Boom Villette est un complexe de divertissement situé à La Villette (Paris 19e) proposant une offre diversifiée : 24 pistes de bowling, un circuit de karting indoor, 6 salles d'escape game thématiques, un espace de restauration de 200 couverts et des salles événementielles modulables. Le complexe accueille en moyenne 3 500 visiteurs par semaine avec des pics à 5 000 lors des périodes de vacances scolaires.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Modèle économique",
            content:
              "Le chiffre d'affaires se répartit comme suit : 35% bowling, 25% karting, 20% escape game, 15% restauration et 5% événementiel. Les réservations en ligne représentent actuellement 40% du CA total avec un objectif de 70% à horizon 12 mois. Le panier moyen est de 45€ par personne pour une visite loisir et de 85€ pour un événement d'entreprise.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Objectifs stratégiques 2026",
            content:
              "Les objectifs incluent : augmenter la part de réservation en ligne à 70%, lancer un programme de fidélité, développer l'offre B2B (séminaires, team building), intégrer un système de carte cadeau entreprise et optimiser le yield management sur les créneaux horaires. Le taux de conversion web actuel est de 3.2% avec un objectif de 5.5%.",
            order: 3,
            highlighted: false,
          },
          {
            title: "Concurrence et positionnement",
            content:
              "Les principaux concurrents directs sont Lucky Strike (bowling), Karting Indoor de Paris, et divers escape games indépendants. L'avantage concurrentiel de BBV réside dans l'offre multi-activités sous un même toit, permettant des packages combinés et une expérience client unifiée. Le positionnement prix est milieu-haut de gamme.",
            order: 4,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 2 — Connaissance entreprise
  const doc2 = await prisma.document.create({
    data: {
      title: "Connaissance entreprise — Groupe BBV",
      category: "COMPANY_KNOWLEDGE",
      status: "INDEXED",
      summary:
        "Fiche d'identité du Groupe BBV comprenant l'organigramme, les processus internes clés, les outils existants et les contraintes organisationnelles. Ce document sert de référence pour comprendre le fonctionnement interne du client.",
      author: "Thomas Bernard",
      tags: ["entreprise", "organisation", "processus", "outils"],
      ragIndexed: true,
      ringUsed: false,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(38),
      sections: {
        create: [
          {
            title: "Organisation et équipes",
            content:
              "Le Groupe BBV emploie 120 personnes dont 15 au siège (direction, marketing, IT). L'équipe IT interne compte 3 développeurs et 1 chef de projet. Le directeur technique, Jean-Marc Lévy, est le sponsor du projet de refonte digitale. Les décisions stratégiques sont validées par un COPIL mensuel composé du PDG, du DAF, du directeur marketing et du DT.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Systèmes existants",
            content:
              "Le SI actuel repose sur : un ERP propriétaire (GestionLoisirs v3.2) pour la facturation et le stock, une caisse enregistreuse Lightspeed POS, un site vitrine WordPress, et des réservations par téléphone ou email. Il n'existe pas de système de réservation en ligne intégré. Les données clients sont dispersées entre l'ERP, des fichiers Excel et le logiciel de mailing Sendinblue.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Contraintes et dépendances",
            content:
              "Les contraintes principales sont : compatibilité avec l'ERP GestionLoisirs (API REST disponible mais documentation limitée), respect du RGPD pour les données clients, intégration avec le terminal de paiement Ingenico en caisse, et disponibilité 24/7 du système de réservation. Le budget alloué au projet est de 180K€ sur 8 mois.",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 3 — CDC Plateforme de Réservation
  const doc3 = await prisma.document.create({
    data: {
      title: "CDC — Plateforme de Réservation v2",
      category: "CAHIER_DES_CHARGES",
      status: "INDEXED",
      summary:
        "Cahier des charges de la plateforme de réservation en ligne v2, couvrant le parcours utilisateur complet, la gestion des créneaux, le paiement en ligne et l'intégration avec le système de gestion existant. Version validée par le COPIL le 15/01/2026.",
      author: "Marie Dupont",
      tags: ["réservation", "CDC", "paiement", "parcours-utilisateur", "créneaux"],
      ragIndexed: true,
      ringUsed: true,
      sectionsCount: 4,
      projectId: projectBBV.id,
      createdAt: daysAgo(35),
      sections: {
        create: [
          {
            title: "Parcours de réservation standard",
            content:
              "L'utilisateur sélectionne une ou plusieurs activités, choisit un créneau horaire parmi les disponibilités affichées en temps réel, renseigne le nombre de participants, et procède au paiement. Un email de confirmation avec QR code est envoyé automatiquement. Le parcours doit être réalisable en moins de 3 minutes (objectif UX). Le système doit gérer les réservations simultanées via un mécanisme de verrouillage temporaire des créneaux (5 minutes).",
            order: 1,
            highlighted: true,
          },
          {
            title: "Gestion des créneaux et disponibilités",
            content:
              "Chaque activité dispose de créneaux paramétrables par l'administrateur (durée, capacité, prix). Les disponibilités sont calculées en temps réel en tenant compte des réservations existantes, des maintenances planifiées et des événements privés. Un algorithme de yield management ajuste les prix en fonction du taux de remplissage (paliers à 50%, 75% et 90% de capacité).",
            order: 2,
            highlighted: true,
          },
          {
            title: "Système de paiement",
            content:
              "Le paiement s'effectue via Stripe (CB, Apple Pay, Google Pay). Le montant est débité à la confirmation de la réservation. En cas d'annulation plus de 24h avant, remboursement intégral. Entre 24h et 2h avant, remboursement de 50%. Moins de 2h avant, aucun remboursement. Les cartes cadeaux sont acceptées comme moyen de paiement (total ou partiel).",
            order: 3,
            highlighted: false,
          },
          {
            title: "Intégration avec le SI existant",
            content:
              "Les réservations sont synchronisées en temps réel avec l'ERP GestionLoisirs via son API REST. Les données de paiement sont transmises au module comptable. Un webhook notifie le système de caisse Lightspeed pour préparer l'accueil du client. En cas d'indisponibilité de l'ERP, les réservations sont mises en file d'attente et synchronisées dès le retour du service.",
            order: 4,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 4 — CDC Module Carte Cadeau
  const doc4 = await prisma.document.create({
    data: {
      title: "CDC — Module Carte Cadeau Entreprise",
      category: "CAHIER_DES_CHARGES",
      status: "INDEXED",
      summary:
        "Cahier des charges du module de carte cadeau entreprise permettant aux sociétés d'acheter des cartes cadeaux en volume pour leurs collaborateurs. Inclut le portail d'administration entreprise, la personnalisation des cartes et le suivi des consommations.",
      author: "Sophie Martin",
      tags: ["carte-cadeau", "B2B", "entreprise", "CDC", "personnalisation"],
      ragIndexed: true,
      ringUsed: false,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(30),
      sections: {
        create: [
          {
            title: "Parcours d'achat entreprise",
            content:
              "Le responsable RH ou CE accède à un portail dédié après authentification. Il peut commander des cartes cadeaux en lot (minimum 10, maximum 500 par commande), personnaliser le visuel et le message, choisir le montant (25€, 50€, 75€, 100€ ou montant libre), et planifier la date d'envoi par email aux bénéficiaires. La facturation est mensuelle avec un délai de paiement de 30 jours.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Gestion et suivi des cartes",
            content:
              "Chaque carte cadeau dispose d'un code unique et d'une date de validité de 12 mois. Le portail entreprise permet de suivre en temps réel le statut de chaque carte (émise, activée, partiellement utilisée, expirée). Un tableau de bord affiche les statistiques agrégées : taux d'activation, montant moyen dépensé, activités les plus choisies.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Règles métier spécifiques",
            content:
              "Les cartes cadeaux entreprise ne sont pas cumulables avec les promotions en cours. Le solde restant après utilisation partielle est conservé jusqu'à expiration. Aucun remboursement n'est possible sur les cartes entreprise. Les CSE bénéficient d'une remise de 5% à partir de 50 cartes et de 10% à partir de 200 cartes. L'API de vérification du solde doit répondre en moins de 200ms.",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 5 — SFD Module Réservation
  const doc5 = await prisma.document.create({
    data: {
      title: "SFD — Module Réservation en Ligne",
      category: "SFD",
      status: "INDEXED",
      summary:
        "Spécifications fonctionnelles détaillées du module de réservation en ligne. Décrit les écrans, les règles de gestion, les cas d'erreur et les interactions avec les services backend. Document de référence pour l'équipe de développement.",
      author: "Lucas Moreau",
      tags: ["réservation", "SFD", "frontend", "parcours-utilisateur", "écrans"],
      ragIndexed: true,
      ringUsed: true,
      sectionsCount: 4,
      projectId: projectBBV.id,
      createdAt: daysAgo(28),
      sections: {
        create: [
          {
            title: "Écran de sélection des activités",
            content:
              "L'écran principal affiche les activités sous forme de cartes (image, nom, prix à partir de, note moyenne). Un filtre par catégorie (sport, jeu, détente) et par nombre de participants est disponible. Chaque carte dispose d'un bouton « Réserver » qui ouvre le sélecteur de créneau. Le composant React utilisé est ActivityCard avec les variantes « default », « featured » et « soldOut ».",
            order: 1,
            highlighted: true,
          },
          {
            title: "Sélecteur de créneau horaire",
            content:
              "Le calendrier affiche les 14 prochains jours avec une vue par défaut sur la semaine en cours. Les créneaux sont affichés par tranche de 30 minutes avec un code couleur : vert (disponible), orange (presque complet, >75%), rouge (complet). Le composant TimeSlotPicker récupère les disponibilités via GET /api/slots/availability avec les paramètres activityId, date et participants.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Récapitulatif et panier",
            content:
              "Avant le paiement, un écran récapitulatif affiche : activité(s) sélectionnée(s), date et heure, nombre de participants, prix unitaire et total, options éventuelles. L'utilisateur peut modifier sa sélection ou ajouter une autre activité. Le composant BookingSummary gère l'état du panier via un store Zustand local avec persistance en sessionStorage.",
            order: 3,
            highlighted: false,
          },
          {
            title: "Gestion des erreurs et cas limites",
            content:
              "Si un créneau devient indisponible pendant la réservation, un message d'erreur propose les 3 prochains créneaux disponibles. En cas d'échec de paiement, la réservation est annulée et les créneaux libérés. Un timeout de 10 minutes s'applique au panier : passé ce délai, les créneaux verrouillés sont libérés et l'utilisateur est notifié. Le retry automatique est limité à 2 tentatives pour le paiement.",
            order: 4,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 6 — SFD Parcours Carte Cadeau
  const doc6 = await prisma.document.create({
    data: {
      title: "SFD — Parcours Carte Cadeau",
      category: "SFD",
      status: "NEEDS_REVIEW",
      summary:
        "Spécifications fonctionnelles du parcours d'achat et d'utilisation des cartes cadeaux. Ce document nécessite une revue car certaines interactions avec le module de paiement n'ont pas été finalisées avec l'équipe technique.",
      author: "Sophie Martin",
      tags: ["carte-cadeau", "SFD", "parcours-utilisateur", "paiement"],
      ragIndexed: false,
      ringUsed: false,
      needsClarification: true,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(22),
      sections: {
        create: [
          {
            title: "Parcours d'achat carte cadeau (particulier)",
            content:
              "Le particulier accède à la page carte cadeau depuis le menu principal. Il choisit un montant prédéfini ou un montant libre (min 15€, max 250€), personnalise le visuel parmi 6 templates thématiques, ajoute un message personnel (max 200 caractères) et renseigne l'email du destinataire. Le paiement est immédiat par CB via Stripe. La carte est envoyée par email au destinataire avec un PDF téléchargeable.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Utilisation de la carte cadeau",
            content:
              "Lors de la réservation, le bénéficiaire saisit le code de la carte cadeau dans le champ dédié à l'étape de paiement. Le système vérifie la validité et le solde disponible via POST /api/gift-cards/{id}/redeem. Si le solde est insuffisant, le complément est payé par CB. Si le solde est supérieur au montant, le reste est conservé. Le composant GiftCardInput gère la saisie et la validation en temps réel.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Points en attente de clarification",
            content:
              "Les points suivants nécessitent une validation : (1) le paiement mixte carte cadeau + CB doit-il être géré en une seule transaction Stripe ou en deux ? (2) Les cartes cadeaux périmées doivent-elles générer un avoir ou être définitivement perdues ? (3) Le solde de la carte cadeau doit-il être visible sur l'espace client ou uniquement lors du paiement ? Ces points sont en attente de retour du COPIL.",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 7 — Documentation API Réservation
  const doc7 = await prisma.document.create({
    data: {
      title: "Documentation API — Service Réservation",
      category: "API_DOCUMENTATION",
      status: "INDEXED",
      summary:
        "Documentation technique complète de l'API du service de réservation. Couvre les endpoints de consultation des activités, de vérification des disponibilités, de création et gestion des réservations. Inclut les schémas de requêtes/réponses et les codes d'erreur.",
      author: "Lucas Moreau",
      tags: ["API", "réservation", "backend", "REST", "documentation"],
      ragIndexed: true,
      ringUsed: false,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(25),
      sections: {
        create: [
          {
            title: "Endpoints de consultation",
            content:
              "GET /api/activities : liste toutes les activités avec pagination (limit, offset). Filtres disponibles : category, minPrice, maxPrice, minCapacity. Réponse : tableau d'objets Activity avec id, name, description, priceFrom, rating, imageUrl, category. GET /api/activities/{id} : détail d'une activité incluant les créneaux types, les options disponibles et les avis clients.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Endpoints de réservation",
            content:
              "POST /api/reservations : crée une nouvelle réservation. Body : { activityId, slotId, participants, customerInfo, paymentMethod }. Réponse : objet Reservation avec confirmationCode et qrCodeUrl. GET /api/reservations/{id} : détail d'une réservation. PUT /api/reservations/{id}/cancel : annulation avec calcul automatique du remboursement selon la politique en vigueur.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Gestion des erreurs",
            content:
              "Les codes d'erreur spécifiques sont : SLOT_UNAVAILABLE (409), PAYMENT_FAILED (402), INVALID_GIFT_CARD (422), RESERVATION_NOT_FOUND (404), CANCELLATION_TOO_LATE (422), MAX_PARTICIPANTS_EXCEEDED (422). Chaque erreur retourne un objet { code, message, details } avec un message localisé en français.",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 8 — Documentation API Paiement
  const doc8 = await prisma.document.create({
    data: {
      title: "Documentation API — Service Paiement",
      category: "API_DOCUMENTATION",
      status: "INDEXED",
      summary:
        "Documentation technique de l'API du service de paiement. Couvre la génération de liens de paiement Stripe, le traitement des webhooks, la gestion des remboursements et l'intégration des cartes cadeaux comme moyen de paiement.",
      author: "Thomas Bernard",
      tags: ["API", "paiement", "Stripe", "backend", "sécurité", "carte-cadeau"],
      ragIndexed: true,
      ringUsed: false,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(24),
      sections: {
        create: [
          {
            title: "Génération de lien de paiement",
            content:
              "POST /api/checkout/payment-link : génère un lien de paiement Stripe Checkout. Body : { reservationId, amount, currency, successUrl, cancelUrl, giftCardCode? }. Si un code carte cadeau est fourni, le montant est réduit du solde disponible. Le lien expire après 30 minutes. Réponse : { paymentLinkUrl, sessionId, expiresAt }.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Webhooks de paiement",
            content:
              "Le service écoute les webhooks Stripe suivants : checkout.session.completed (confirmation de la réservation), charge.refunded (mise à jour du statut de remboursement), payment_intent.payment_failed (notification d'échec au client). Chaque webhook est vérifié via la signature Stripe et traité de manière idempotente avec un identifiant unique.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Sécurité et conformité",
            content:
              "Aucune donnée de carte bancaire ne transite par nos serveurs (conformité PCI DSS SAQ A). Les montants sont vérifiés côté serveur avant envoi à Stripe pour prévenir la manipulation des prix. Les remboursements sont soumis à une double validation (automatique selon la politique + manuelle pour les cas exceptionnels). Les logs de paiement sont conservés 5 ans conformément aux obligations légales.",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 9 — Note Technique Architecture
  const doc9 = await prisma.document.create({
    data: {
      title: "Note Technique — Architecture Microservices",
      category: "TECHNICAL_NOTES",
      status: "INDEXED",
      summary:
        "Note technique décrivant l'architecture microservices retenue pour la plateforme. Détaille la répartition des services, les protocoles de communication inter-services et les choix d'infrastructure (Kubernetes, PostgreSQL, Redis).",
      author: "Thomas Bernard",
      tags: ["architecture", "microservices", "backend", "infrastructure", "Kubernetes"],
      ragIndexed: false,
      ringUsed: false,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(32),
      sections: {
        create: [
          {
            title: "Découpage des services",
            content:
              "L'architecture repose sur 5 microservices : (1) Service Réservation — gestion du cycle de vie des réservations, (2) Service Paiement — orchestration des paiements via Stripe, (3) Service Activités — catalogue et disponibilités, (4) Service Utilisateurs — authentification et profils, (5) Service Notification — emails et SMS. Chaque service possède sa propre base de données PostgreSQL (database-per-service pattern).",
            order: 1,
            highlighted: true,
          },
          {
            title: "Communication inter-services",
            content:
              "Les communications synchrones utilisent REST/JSON via un API Gateway (Kong). Les communications asynchrones passent par RabbitMQ pour les événements (réservation créée, paiement confirmé, etc.). Le pattern Saga est utilisé pour les transactions distribuées, notamment le flux réservation → paiement → confirmation. Un circuit breaker (Resilience4j) protège les appels inter-services.",
            order: 2,
            highlighted: false,
          },
          {
            title: "Infrastructure et déploiement",
            content:
              "Les services sont conteneurisés (Docker) et orchestrés par Kubernetes sur GKE. Le scaling horizontal est automatique (HPA) avec un minimum de 2 replicas par service en production. Redis est utilisé comme cache distribué (TTL de 5 minutes pour les disponibilités) et pour le verrouillage distribué des créneaux. Les logs sont centralisés via la stack ELK (Elasticsearch, Logstash, Kibana).",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 10 — ADR Stack Technique
  const doc10 = await prisma.document.create({
    data: {
      title: "ADR — Stack Technique et Choix d'Architecture",
      category: "ARCHITECTURE_DECISIONS",
      status: "INDEXED",
      summary:
        "Architecture Decision Record documentant les choix techniques structurants du projet : stack frontend (Next.js + React), backend (Node.js + NestJS), base de données (PostgreSQL), cache (Redis), et les justifications associées.",
      author: "Thomas Bernard",
      tags: ["architecture", "ADR", "stack", "Next.js", "NestJS", "PostgreSQL"],
      ragIndexed: false,
      ringUsed: true,
      sectionsCount: 3,
      projectId: projectBBV.id,
      createdAt: daysAgo(42),
      sections: {
        create: [
          {
            title: "Choix du framework frontend",
            content:
              "Next.js 15 avec App Router est retenu pour le frontend. Justification : rendu serveur (SSR) pour le SEO des pages publiques, routing basé sur le filesystem, support natif de React Server Components pour les performances, et écosystème mature (auth, i18n, analytics). Alternative considérée : Remix — écarté pour un écosystème plus restreint et une communauté plus petite.",
            order: 1,
            highlighted: true,
          },
          {
            title: "Choix du framework backend",
            content:
              "NestJS avec TypeScript est retenu pour les microservices backend. Justification : architecture modulaire native, injection de dépendances, support de multiples protocoles de transport (REST, gRPC, WebSockets), excellent support TypeScript et documentation exhaustive. Prisma est utilisé comme ORM pour chaque service. Alternative considérée : Fastify standalone — écarté pour le manque de structure imposée.",
            order: 2,
            highlighted: true,
          },
          {
            title: "Choix de la base de données et du cache",
            content:
              "PostgreSQL 16 est retenu comme base de données principale pour chaque microservice. Justification : robustesse, support JSON natif pour les données semi-structurées, extensions PostGIS pour la géolocalisation future, performances en lecture et écriture. Redis 7 est utilisé comme cache distribué et broker de sessions. Alternative considérée : MongoDB — écarté pour les besoins de cohérence transactionnelle.",
            order: 3,
            highlighted: false,
          },
        ],
      },
    },
  })

  // Document 11 — Questions ouvertes Paiement
  const doc11 = await prisma.document.create({
    data: {
      title: "Questions ouvertes — Intégration Paiement",
      category: "OPEN_QUESTIONS",
      status: "PENDING",
      summary:
        "Liste des questions ouvertes concernant l'intégration du système de paiement. Plusieurs points restent à clarifier avec Stripe et avec le service comptabilité du client avant de pouvoir finaliser le développement.",
      author: "Emma Laurent",
      tags: ["paiement", "Stripe", "questions", "comptabilité", "intégration"],
      ragIndexed: false,
      ringUsed: false,
      needsClarification: true,
      sectionsCount: 2,
      projectId: projectBBV.id,
      createdAt: daysAgo(15),
      sections: {
        create: [
          {
            title: "Questions techniques Stripe",
            content:
              "1. Le mode de paiement en deux temps (authorize puis capture) est-il nécessaire pour les réservations à plus de 7 jours ? 2. Stripe Connect est-il requis si BBV souhaite reverser une commission aux partenaires événementiels ? 3. La migration depuis l'ancien PSP (PayPlug) nécessite-t-elle un transfert des mandats de prélèvement existants ? 4. Quel est le SLA garanti par Stripe pour les webhooks en cas de pic de charge ?",
            order: 1,
            highlighted: true,
          },
          {
            title: "Questions comptables et légales",
            content:
              "1. La TVA sur les cartes cadeaux doit-elle être comptabilisée à l'achat ou à l'utilisation ? (en attente de validation de l'expert-comptable) 2. Les remboursements partiels doivent-ils générer un avoir ou un remboursement direct ? 3. Comment gérer la comptabilisation des cartes cadeaux expirées non utilisées ? 4. Le délai de rétractation de 14 jours s'applique-t-il aux réservations d'activités de loisir ?",
            order: 2,
            highlighted: true,
          },
        ],
      },
    },
  })

  // Document 12 — Note Technique Cache
  const doc12 = await prisma.document.create({
    data: {
      title: "Note Technique — Stratégie de Cache et Performance",
      category: "TECHNICAL_NOTES",
      status: "DRAFT",
      summary:
        "Document de travail sur la stratégie de cache pour optimiser les performances de la plateforme. Couvre le cache des disponibilités, du catalogue et des sessions utilisateur. En cours de rédaction.",
      author: "Lucas Moreau",
      tags: ["cache", "performance", "Redis", "backend", "optimisation"],
      ragIndexed: false,
      ringUsed: false,
      sectionsCount: 2,
      projectId: projectBBV.id,
      createdAt: daysAgo(5),
      sections: {
        create: [
          {
            title: "Stratégie de cache par couche",
            content:
              "Trois niveaux de cache sont prévus : (1) Cache navigateur — assets statiques (images, CSS, JS) avec Cache-Control immutable et CDN Cloudflare, (2) Cache API Gateway — réponses GET avec TTL variable selon l'endpoint (catalogue : 10min, disponibilités : 30s, profil utilisateur : 5min), (3) Cache applicatif Redis — données fréquemment lues (liste des activités, tarifs, créneaux types). L'invalidation se fait par événements (publish/subscribe Redis).",
            order: 1,
            highlighted: true,
          },
          {
            title: "Objectifs de performance",
            content:
              "Temps de réponse cible : page catalogue < 200ms (P95), vérification disponibilité < 100ms (P95), création de réservation < 500ms (P95). Le cache des disponibilités est le plus critique : il doit être invalidé instantanément lors d'une réservation confirmée tout en supportant 500 requêtes/seconde en pic. Un mécanisme de cache-aside avec write-through est envisagé pour ce cas d'usage.",
            order: 2,
            highlighted: false,
          },
        ],
      },
    },
  })

  const allDocs = [doc1, doc2, doc3, doc4, doc5, doc6, doc7, doc8, doc9, doc10, doc11, doc12]
  console.log(`✅ ${allDocs.length} documents créés avec leurs sections\n`)

  // ──────────────────────────────────────────
  // 4. Création des conversations (projet BBV)
  // ──────────────────────────────────────────
  console.log("💬 Création des conversations...")

  // Conversation 1
  await prisma.conversation.create({
    data: {
      title: "Impacts de la feature carte cadeau entreprise",
      projectId: projectBBV.id,
      createdAt: daysAgo(7),
      messages: {
        create: [
          {
            role: "USER",
            content:
              "Quels sont les impacts de la feature carte cadeau entreprise sur l'ensemble de la plateforme ? Je voudrais comprendre ce qui est touché côté backend, frontend, et les risques éventuels.",
            createdAt: daysAgo(7),
          },
          {
            role: "ASSISTANT",
            content:
              "Voici mon analyse complète des impacts de la fonctionnalité carte cadeau entreprise sur la plateforme Boom Boom Villette.\n\n**Résumé** : La feature carte cadeau entreprise impacte significativement le service de paiement (intégration d'un nouveau moyen de paiement), le parcours de réservation (ajout du champ de saisie carte cadeau), et nécessite la création d'un nouveau portail B2B. Le niveau de complexité est élevé en raison des interactions avec Stripe et le module comptable.\n\n**Impacts backend** :\n- Création d'un nouveau microservice GiftCard avec endpoints CRUD, validation et solde\n- Modification du service Paiement pour gérer le paiement mixte (carte cadeau + CB)\n- Ajout d'un système de génération de codes uniques avec vérification anti-fraude\n- Intégration avec le module comptable de l'ERP pour la comptabilisation des cartes\n- Mise en place d'un job CRON pour l'expiration automatique des cartes\n\n**Impacts frontend** :\n- Nouveau composant GiftCardWizard pour le parcours d'achat en 4 étapes\n- Composant GiftCardInput intégré à la page de paiement existante\n- Création du portail entreprise (dashboard, commande en lot, suivi)\n- Modification du composant CheckoutForm pour accepter les cartes cadeaux\n- Ajout de la page « Mon solde carte cadeau » dans l'espace client",
            summary:
              "Analyse d'impact complète de la feature carte cadeau entreprise identifiant les modifications backend (nouveau microservice, intégration paiement), frontend (wizard d'achat, portail B2B) et les risques associés.",
            backendImpacts: [
              "Création du microservice GiftCard avec endpoints CRUD et validation",
              "Modification du service Paiement pour le paiement mixte carte cadeau + CB",
              "Système de génération de codes uniques avec vérification anti-fraude",
              "Intégration comptable avec l'ERP GestionLoisirs",
              "Job CRON pour l'expiration automatique des cartes à 12 mois",
            ],
            frontendImpacts: [
              "Nouveau composant GiftCardWizard (parcours d'achat 4 étapes)",
              "Composant GiftCardInput intégré à CheckoutForm",
              "Portail entreprise complet (dashboard, commande lot, suivi)",
              "Modification de la page paiement pour accepter les cartes cadeaux",
              "Page « Mon solde carte cadeau » dans l'espace client",
            ],
            documentsUsed: [
              "CDC — Module Carte Cadeau Entreprise",
              "SFD — Parcours Carte Cadeau",
              "Documentation API — Service Paiement",
              "CDC — Plateforme de Réservation v2",
            ],
            apisUsed: [
              "POST /api/gift-cards",
              "POST /api/gift-cards/{id}/redeem",
              "GET /api/gift-cards",
              "POST /api/checkout/payment-link",
              "GET /api/companies/{id}/offers",
            ],
            openQuestions: [
              "Le paiement mixte carte cadeau + CB doit-il être une ou deux transactions Stripe ?",
              "La TVA sur les cartes cadeaux est-elle comptabilisée à l'achat ou à l'utilisation ?",
              "Les cartes cadeaux périmées génèrent-elles un avoir ?",
            ],
            risks: [
              "Complexité du paiement mixte avec Stripe (pas de support natif, nécessite un développement custom)",
              "Risque de fraude sur la génération de codes si l'algorithme n'est pas suffisamment robuste",
              "Dépendance au retour du COPIL sur les questions comptables en suspens",
              "Impact potentiel sur les performances du checkout si la vérification du solde est trop lente",
            ],
            suggestedActions: [
              "Valider avec Stripe le mode de paiement mixte avant le développement",
              "Organiser une réunion avec le service comptable pour les questions de TVA",
              "Prototyper le composant GiftCardInput avec tests de performance",
              "Définir les spécifications de l'API anti-fraude pour la génération de codes",
              "Planifier un POC du portail entreprise pour validation UX",
            ],
            confidenceScore: 87,
            createdAt: daysAgo(7),
          },
        ],
      },
    },
  })

  // Conversation 2
  await prisma.conversation.create({
    data: {
      title: "Cohérence CDC et SFD sur les paiements",
      projectId: projectBBV.id,
      createdAt: daysAgo(4),
      messages: {
        create: [
          {
            role: "USER",
            content:
              "Peux-tu vérifier la cohérence entre le CDC de la plateforme de réservation et le SFD du module réservation en ligne, spécifiquement sur la partie paiement ? Y a-t-il des incohérences ou des zones grises ?",
            createdAt: daysAgo(4),
          },
          {
            role: "ASSISTANT",
            content:
              "J'ai analysé en détail la cohérence entre le CDC (Plateforme de Réservation v2) et le SFD (Module Réservation en Ligne) sur la partie paiement. Voici les incohérences identifiées :\n\n**1. Délai de verrouillage des créneaux**\n Le CDC mentionne un verrouillage de 5 minutes, tandis que le SFD parle d'un timeout de panier de 10 minutes. Cette différence crée une ambiguïté : un créneau peut-il être libéré après 5 minutes alors que le panier est encore actif pendant 10 minutes ?\n\n**2. Politique de remboursement et retry**\n Le CDC définit une politique de remboursement à 3 paliers (>24h: 100%, 24h-2h: 50%, <2h: 0%) mais le SFD mentionne un retry automatique limité à 2 tentatives sans préciser le comportement en cas d'échec définitif vis-à-vis de la politique de remboursement.\n\n**3. Carte cadeau comme moyen de paiement**\n Le CDC mentionne que « les cartes cadeaux sont acceptées comme moyen de paiement (total ou partiel) » mais le SFD ne décrit pas le composant de saisie de la carte cadeau dans le parcours de paiement. Le SFD du parcours carte cadeau est en statut NEEDS_REVIEW.\n\n**4. Modes de paiement**\n Le CDC liste CB, Apple Pay et Google Pay. Le SFD ne mentionne pas explicitement les modes de paiement alternatifs (Apple Pay, Google Pay) dans la description du parcours.\n\n**Recommandation** : Mettre à jour le SFD pour aligner les délais de timeout (recommandation : 5 minutes de verrouillage créneau + 10 minutes de session panier avec renouvellement du lock) et ajouter les spécifications du composant GiftCardInput.",
            summary:
              "Analyse de cohérence CDC/SFD identifiant 4 incohérences principales : délais de verrouillage contradictoires, politique de retry non alignée, carte cadeau manquante dans le SFD, et modes de paiement alternatifs non spécifiés.",
            backendImpacts: [
              "Le service de verrouillage des créneaux doit gérer deux TTL distincts (créneau vs panier)",
              "Le service de paiement doit être clarifié sur le comportement après échec des 2 retries",
              "L'intégration carte cadeau dans le flux de paiement n'est pas spécifiée techniquement",
            ],
            frontendImpacts: [
              "Le composant BookingSummary doit gérer la différence entre timeout panier et lock créneau",
              "Le composant de paiement doit intégrer Apple Pay et Google Pay (non décrit dans le SFD)",
              "Le composant GiftCardInput est manquant dans le SFD du module réservation",
            ],
            documentsUsed: [
              "CDC — Plateforme de Réservation v2",
              "SFD — Module Réservation en Ligne",
              "SFD — Parcours Carte Cadeau",
              "Documentation API — Service Paiement",
            ],
            apisUsed: [
              "POST /api/reservations",
              "POST /api/checkout/payment-link",
              "POST /api/gift-cards/{id}/redeem",
            ],
            openQuestions: [
              "Quel est le comportement attendu quand le lock créneau expire avant le timeout du panier ?",
              "Le retry de paiement doit-il être transparent pour l'utilisateur ou avec notification ?",
              "Apple Pay et Google Pay nécessitent-ils des composants UI spécifiques ?",
              "Le SFD carte cadeau sera-t-il finalisé avant le sprint de développement ?",
            ],
            risks: [
              "Incohérence des délais de verrouillage pouvant causer des doubles réservations",
              "L'absence de spécification carte cadeau dans le SFD retardera le développement",
              "Les modes de paiement alternatifs non spécifiés risquent d'être développés sans validation UX",
            ],
            suggestedActions: [
              "Organiser une session d'alignement CDC/SFD avec Marie Dupont et Lucas Moreau",
              "Mettre à jour le SFD avec les spécifications du composant GiftCardInput",
              "Clarifier la stratégie de verrouillage créneau vs timeout panier",
              "Ajouter les maquettes Apple Pay et Google Pay au SFD",
            ],
            confidenceScore: 72,
            createdAt: daysAgo(4),
          },
        ],
      },
    },
  })

  // Conversation 3
  await prisma.conversation.create({
    data: {
      title: "APIs concernées par la réservation entreprise",
      projectId: projectBBV.id,
      createdAt: daysAgo(2),
      messages: {
        create: [
          {
            role: "USER",
            content:
              "Quels sont les endpoints API qui seront impactés ou nécessaires pour mettre en place la réservation d'événements entreprise (team building, séminaires) ? Donne-moi le détail avec le contexte métier.",
            createdAt: daysAgo(2),
          },
          {
            role: "ASSISTANT",
            content:
              "Voici l'analyse détaillée des endpoints API impactés par la réservation d'événements entreprise.\n\n**Endpoints existants à modifier :**\n\n1. **GET /api/activities** — Ajouter un filtre `corporateEligible=true` pour ne retourner que les activités disponibles pour les événements entreprise. Les activités doivent inclure un champ `corporatePackages` avec les formules disponibles (team building, séminaire, soirée).\n\n2. **GET /api/slots/availability** — Étendre pour supporter les réservations de créneaux étendus (demi-journée, journée complète) et la privatisation de l'espace. Ajouter les paramètres `duration` (en minutes) et `exclusive` (booléen).\n\n3. **POST /api/reservations** — Adapter le schéma pour accepter les réservations entreprise avec champs additionnels : `companyId`, `eventType`, `participants` (avec détails nominatifs), `cateringOptions`, `invoiceAddress`.\n\n4. **POST /api/checkout/payment-link** — Supporter la facturation entreprise (paiement différé 30 jours) en plus du paiement immédiat. Ajouter le paramètre `paymentMode: 'immediate' | 'invoice'`.\n\n**Nouveaux endpoints à créer :**\n\n5. **POST /api/events/corporate** — Endpoint dédié à la création d'événements entreprise avec orchestration complète (réservation multi-activités, catering, configuration salle). Retourne un `eventId` et un devis automatique.\n\n6. **GET /api/companies/{id}/offers** — Consultation des offres et tarifs spécifiques négociés avec une entreprise. Inclut les remises volume, les formules packages et l'historique des événements passés.\n\n7. **GET /api/pricing/dynamic** — Consultation des tarifs dynamiques en fonction de la date, du nombre de participants et du type d'événement. Intègre l'algorithme de yield management.\n\n**Contexte métier** : L'événementiel entreprise représente 5% du CA actuel avec un objectif de 15% à 12 mois. Le panier moyen est 3x supérieur à une réservation particulier (85€ vs 45€ par personne). La conversion passe par un parcours semi-guidé avec devis automatique et validation humaine pour les événements de plus de 30 personnes.",
            summary:
              "Identification de 7 endpoints API (4 existants à modifier, 3 nouveaux) nécessaires pour la réservation entreprise, avec le contexte métier associé (objectif 15% du CA, panier moyen 85€/personne).",
            backendImpacts: [
              "Modification du modèle de données Reservation pour supporter les champs entreprise",
              "Nouveau module EventCorporate dans le service Réservation",
              "Intégration du système de facturation différée avec l'ERP comptable",
              "Extension de l'algorithme de yield management pour les créneaux privatisés",
              "Mise en place de webhooks pour notifier le service traiteur partenaire",
            ],
            frontendImpacts: [
              "Nouveau parcours de réservation entreprise en 5 étapes (composant CorporateBookingWizard)",
              "Page de consultation des offres entreprise avec tarifs négociés",
              "Composant de génération de devis automatique avec export PDF",
              "Dashboard entreprise pour le suivi des événements passés et à venir",
            ],
            documentsUsed: [
              "CDC — Plateforme de Réservation v2",
              "Documentation API — Service Réservation",
              "Documentation API — Service Paiement",
              "Contexte métier — Boom Boom Villette",
              "Note Technique — Architecture Microservices",
            ],
            apisUsed: [
              "GET /api/activities",
              "GET /api/slots/availability",
              "POST /api/reservations",
              "POST /api/checkout/payment-link",
              "POST /api/events/corporate",
              "GET /api/companies/{id}/offers",
              "GET /api/pricing/dynamic",
            ],
            openQuestions: [
              "Le devis automatique doit-il être validé par un commercial avant envoi au client ?",
              "Quel est le seuil de participants déclenchant une validation manuelle (30 proposé) ?",
              "Les tarifs négociés sont-ils stockés dans notre système ou récupérés depuis l'ERP ?",
              "Les événements multi-activités doivent-ils être facturés en une seule ligne ou détaillés ?",
            ],
            risks: [
              "La facturation différée nécessite une intégration comptable non encore spécifiée",
              "Le yield management sur les créneaux privatisés peut entrer en conflit avec les réservations particulier",
              "Le parcours semi-guidé nécessite une validation UX approfondie",
            ],
            suggestedActions: [
              "Spécifier le schéma de données de l'événement entreprise avec l'équipe métier",
              "Prototyper l'endpoint POST /api/events/corporate avec un test d'intégration",
              "Valider le parcours UX entreprise avec 3 clients pilotes (CSE)",
              "Définir les règles de yield management pour les créneaux privatisés avec le marketing",
              "Planifier l'intégration avec le module comptable de l'ERP",
            ],
            confidenceScore: 91,
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  })

  console.log("✅ 3 conversations créées avec messages\n")

  // ──────────────────────────────────────────
  // 5. Création des endpoints API (projet BBV)
  // ──────────────────────────────────────────
  console.log("🔌 Création des endpoints API...")

  await prisma.apiEndpoint.createMany({
    data: [
      {
        method: "GET",
        route: "/api/activities",
        service: "Service Activités",
        description:
          "Liste toutes les activités du complexe avec pagination et filtres (catégorie, prix, capacité). Retourne les informations essentielles pour l'affichage catalogue.",
        authRequired: false,
        requestPayload: {
          queryParams: {
            limit: "number (défaut: 20)",
            offset: "number (défaut: 0)",
            category: "string? (sport | jeu | détente)",
            minPrice: "number?",
            maxPrice: "number?",
            minCapacity: "number?",
          },
        },
        responsePayload: {
          data: [
            {
              id: "string",
              name: "string",
              description: "string",
              priceFrom: "number",
              rating: "number",
              imageUrl: "string",
              category: "string",
              corporateEligible: "boolean",
            },
          ],
          pagination: { total: "number", limit: "number", offset: "number" },
        },
        businessTags: ["catalogue", "activités", "public"],
        relatedComponents: ["ActivityCard", "ActivityGrid", "ActivityFilters"],
        relatedDocuments: [
          "Documentation API — Service Réservation",
          "SFD — Module Réservation en Ligne",
        ],
        businessRules: [
          "Les activités désactivées par l'administrateur ne sont pas retournées",
          "Le prix affiché est le tarif le plus bas disponible (hors promotion)",
          "La note moyenne est calculée sur les avis des 6 derniers mois",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/activities/{id}",
        service: "Service Activités",
        description:
          "Détail complet d'une activité incluant les créneaux types, les options disponibles, les avis clients et les formules entreprise associées.",
        authRequired: false,
        requestPayload: { pathParams: { id: "string (CUID)" } },
        responsePayload: {
          id: "string",
          name: "string",
          description: "string",
          longDescription: "string",
          priceFrom: "number",
          rating: "number",
          reviewCount: "number",
          imageUrls: ["string"],
          category: "string",
          duration: "number (minutes)",
          minParticipants: "number",
          maxParticipants: "number",
          options: [{ id: "string", name: "string", price: "number" }],
          corporatePackages: [{ name: "string", description: "string", pricePerPerson: "number" }],
        },
        businessTags: ["catalogue", "activités", "détail"],
        relatedComponents: ["ActivityDetail", "ActivityGallery", "ReviewList"],
        relatedDocuments: ["Documentation API — Service Réservation"],
        businessRules: [
          "Les avis sont triés par date décroissante avec possibilité de filtrer par note",
          "Les formules entreprise ne sont affichées que si l'activité est éligible",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/reservations",
        service: "Service Réservation",
        description:
          "Crée une nouvelle réservation pour une ou plusieurs activités. Verrouille les créneaux sélectionnés et retourne un code de confirmation avec QR code.",
        authRequired: true,
        requestPayload: {
          body: {
            activityId: "string",
            slotId: "string",
            participants: "number",
            customerInfo: {
              firstName: "string",
              lastName: "string",
              email: "string",
              phone: "string?",
            },
            paymentMethod: "string (card | apple_pay | google_pay | gift_card)",
            giftCardCode: "string?",
            options: ["string (option IDs)"],
          },
        },
        responsePayload: {
          id: "string",
          confirmationCode: "string (ex: BBV-2026-A7X3K)",
          status: "string (confirmed | pending_payment)",
          qrCodeUrl: "string",
          activity: { name: "string", date: "string", time: "string" },
          totalAmount: "number",
          createdAt: "string (ISO 8601)",
        },
        businessTags: ["réservation", "paiement", "cœur-métier"],
        relatedComponents: ["ReservationForm", "BookingSummary", "ConfirmationPage"],
        relatedDocuments: [
          "CDC — Plateforme de Réservation v2",
          "SFD — Module Réservation en Ligne",
          "Documentation API — Service Réservation",
        ],
        businessRules: [
          "Le créneau est verrouillé pendant 5 minutes à la création de la réservation",
          "Le nombre de participants ne peut pas dépasser la capacité maximale de l'activité",
          "Un email de confirmation avec QR code est envoyé automatiquement",
          "Les réservations avec carte cadeau nécessitent une vérification du solde préalable",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/reservations/{id}",
        service: "Service Réservation",
        description:
          "Récupère le détail d'une réservation par son identifiant. Inclut le statut, les informations de paiement et le QR code.",
        authRequired: true,
        requestPayload: { pathParams: { id: "string (CUID)" } },
        responsePayload: {
          id: "string",
          confirmationCode: "string",
          status: "string",
          activity: { name: "string", date: "string", time: "string", duration: "number" },
          participants: "number",
          totalAmount: "number",
          paymentStatus: "string",
          qrCodeUrl: "string",
          cancellationPolicy: { deadline: "string", refundPercentage: "number" },
        },
        businessTags: ["réservation", "consultation"],
        relatedComponents: ["ReservationDetail", "QRCodeDisplay"],
        relatedDocuments: ["Documentation API — Service Réservation"],
        businessRules: [
          "Seul le créateur de la réservation ou un administrateur peut consulter le détail",
          "La politique d'annulation est calculée dynamiquement selon la date de l'activité",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "PUT",
        route: "/api/reservations/{id}/cancel",
        service: "Service Réservation",
        description:
          "Annule une réservation existante. Le remboursement est calculé automatiquement selon la politique d'annulation en vigueur (>24h: 100%, 24h-2h: 50%, <2h: 0%).",
        authRequired: true,
        requestPayload: {
          pathParams: { id: "string (CUID)" },
          body: { reason: "string?" },
        },
        responsePayload: {
          id: "string",
          status: "cancelled",
          refundAmount: "number",
          refundPercentage: "number",
          refundStatus: "string (pending | processed | refused)",
        },
        businessTags: ["réservation", "annulation", "remboursement"],
        relatedComponents: ["CancellationModal", "RefundStatus"],
        relatedDocuments: [
          "CDC — Plateforme de Réservation v2",
          "Documentation API — Service Paiement",
        ],
        businessRules: [
          "Plus de 24h avant : remboursement intégral",
          "Entre 24h et 2h avant : remboursement de 50%",
          "Moins de 2h avant : aucun remboursement",
          "Le créneau est automatiquement libéré après annulation",
          "Si la réservation a été payée par carte cadeau, le solde est recrédité",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "PUT",
        route: "/api/reservations/{id}/modify",
        service: "Service Réservation",
        description:
          "Modifie une réservation existante (changement de créneau, nombre de participants, options). Soumis à disponibilité et recalcul du prix.",
        authRequired: true,
        requestPayload: {
          pathParams: { id: "string (CUID)" },
          body: {
            newSlotId: "string?",
            participants: "number?",
            options: ["string?"],
          },
        },
        responsePayload: {
          id: "string",
          status: "modified",
          previousAmount: "number",
          newAmount: "number",
          priceDifference: "number",
          refundOrCharge: "string (refund | charge | none)",
        },
        businessTags: ["réservation", "modification"],
        relatedComponents: ["ModifyReservationForm", "PriceDiffDisplay"],
        relatedDocuments: ["CDC — Plateforme de Réservation v2"],
        businessRules: [
          "La modification n'est possible que plus de 2h avant l'activité",
          "Si le nouveau créneau est plus cher, la différence est facturée",
          "Si le nouveau créneau est moins cher, la différence est remboursée",
          "Un seul changement de créneau est autorisé par réservation",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/gift-cards",
        service: "Service Carte Cadeau",
        description:
          "Liste les cartes cadeaux de l'utilisateur connecté ou, pour un administrateur entreprise, les cartes de son organisation. Inclut le solde et le statut.",
        authRequired: true,
        requestPayload: {
          queryParams: {
            status: "string? (active | used | expired)",
            companyId: "string? (pour portail entreprise)",
          },
        },
        responsePayload: {
          data: [
            {
              id: "string",
              code: "string (masqué partiellement : ****-****-A7X3)",
              originalAmount: "number",
              remainingBalance: "number",
              status: "string",
              expiresAt: "string (ISO 8601)",
              purchasedBy: "string?",
            },
          ],
          summary: {
            totalCards: "number",
            activeCards: "number",
            totalBalance: "number",
          },
        },
        businessTags: ["carte-cadeau", "consultation", "B2B"],
        relatedComponents: ["GiftCardList", "GiftCardBalance", "CompanyDashboard"],
        relatedDocuments: [
          "CDC — Module Carte Cadeau Entreprise",
          "SFD — Parcours Carte Cadeau",
        ],
        businessRules: [
          "Les codes sont partiellement masqués pour la sécurité",
          "Les administrateurs entreprise voient toutes les cartes de leur organisation",
          "Les cartes expirées sont conservées dans l'historique pendant 24 mois",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/gift-cards",
        service: "Service Carte Cadeau",
        description:
          "Crée une ou plusieurs cartes cadeaux. Supporte l'achat individuel (B2C) et l'achat en lot (B2B). Génère des codes uniques et envoie les cartes par email.",
        authRequired: true,
        requestPayload: {
          body: {
            amount: "number (15-250€ pour B2C, 25-100€ pour B2B)",
            quantity: "number (1 pour B2C, 10-500 pour B2B)",
            recipientEmail: "string? (B2C uniquement)",
            recipientEmails: ["string? (B2B, un email par carte)"],
            personalMessage: "string? (max 200 caractères)",
            templateId: "string (ID du visuel choisi)",
            scheduledSendDate: "string? (ISO 8601, B2B)",
            companyId: "string? (B2B)",
          },
        },
        responsePayload: {
          cards: [
            {
              id: "string",
              code: "string",
              amount: "number",
              recipientEmail: "string",
              status: "created",
            },
          ],
          totalAmount: "number",
          invoiceUrl: "string? (B2B uniquement)",
        },
        businessTags: ["carte-cadeau", "achat", "B2C", "B2B"],
        relatedComponents: ["GiftCardWizard", "GiftCardTemplateSelector", "BulkOrderForm"],
        relatedDocuments: ["CDC — Module Carte Cadeau Entreprise"],
        businessRules: [
          "Montant B2C entre 15€ et 250€, B2B entre 25€ et 100€ par carte",
          "Commande B2B : minimum 10 cartes, maximum 500 par commande",
          "Remise CSE : 5% à partir de 50 cartes, 10% à partir de 200 cartes",
          "Les cartes sont envoyées par email à la date planifiée ou immédiatement",
          "Validité de 12 mois à compter de la date d'émission",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/gift-cards/{id}/redeem",
        service: "Service Carte Cadeau",
        description:
          "Utilise une carte cadeau pour un paiement. Vérifie la validité et le solde, puis débite le montant demandé. Retourne le solde restant.",
        authRequired: true,
        requestPayload: {
          pathParams: { id: "string (CUID)" },
          body: {
            code: "string (code complet de la carte)",
            amount: "number (montant à débiter)",
            reservationId: "string",
          },
        },
        responsePayload: {
          success: "boolean",
          amountDebited: "number",
          remainingBalance: "number",
          remainingToPay: "number (si solde insuffisant)",
        },
        errors: {
          INVALID_GIFT_CARD: "Code de carte cadeau invalide (422)",
          EXPIRED_GIFT_CARD: "Carte cadeau expirée (422)",
          INSUFFICIENT_BALANCE: "Solde insuffisant, paiement partiel possible (200 avec remainingToPay > 0)",
        },
        businessTags: ["carte-cadeau", "paiement", "utilisation"],
        relatedComponents: ["GiftCardInput", "CheckoutForm", "PaymentSummary"],
        relatedDocuments: [
          "SFD — Parcours Carte Cadeau",
          "Documentation API — Service Paiement",
        ],
        businessRules: [
          "Le temps de réponse doit être inférieur à 200ms",
          "Les cartes entreprise ne sont pas cumulables avec les promotions en cours",
          "Si le solde est insuffisant, le montant disponible est débité et le reste est à payer par CB",
          "La transaction est atomique : en cas d'échec du paiement complémentaire, le solde est restauré",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/companies/{id}/offers",
        service: "Service Entreprise",
        description:
          "Consultation des offres et tarifs négociés spécifiques à une entreprise partenaire. Inclut les packages team building, les remises volume et l'historique.",
        authRequired: true,
        requestPayload: { pathParams: { id: "string (CUID)" } },
        responsePayload: {
          company: { id: "string", name: "string", contractType: "string" },
          offers: [
            {
              id: "string",
              name: "string",
              description: "string",
              pricePerPerson: "number",
              minParticipants: "number",
              activities: ["string"],
              includesCatering: "boolean",
            },
          ],
          volumeDiscounts: [{ threshold: "number", discountPercent: "number" }],
          pastEvents: "number",
        },
        businessTags: ["entreprise", "B2B", "offres", "team-building"],
        relatedComponents: ["CompanyOffers", "PackageCard", "CorporateBookingWizard"],
        relatedDocuments: [
          "CDC — Module Carte Cadeau Entreprise",
          "Contexte métier — Boom Boom Villette",
        ],
        businessRules: [
          "Seuls les administrateurs de l'entreprise peuvent consulter les offres",
          "Les tarifs négociés sont contractuels et non modifiables via l'API",
          "Les remises volume s'appliquent automatiquement au-delà du seuil",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/events/corporate",
        service: "Service Événementiel",
        description:
          "Crée un événement d'entreprise complet (team building, séminaire, soirée). Orchestre la réservation multi-activités, le catering et la configuration des espaces.",
        authRequired: true,
        requestPayload: {
          body: {
            companyId: "string",
            eventType: "string (team_building | seminar | party | custom)",
            date: "string (ISO 8601)",
            duration: "number (heures)",
            participants: "number",
            activities: [{ activityId: "string", slotPreference: "string?" }],
            cateringOptions: {
              type: "string (buffet | cocktail | seated | none)",
              dietaryRestrictions: ["string?"],
            },
            contactPerson: { name: "string", email: "string", phone: "string" },
            specialRequests: "string?",
          },
        },
        responsePayload: {
          eventId: "string",
          status: "string (pending_validation | confirmed)",
          quote: {
            activitiesTotal: "number",
            cateringTotal: "number",
            totalBeforeDiscount: "number",
            discount: "number",
            totalAfterDiscount: "number",
          },
          estimatedValidation: "string (ISO 8601)",
        },
        businessTags: ["entreprise", "événementiel", "team-building", "devis"],
        relatedComponents: ["CorporateBookingWizard", "QuoteDisplay", "EventSummary"],
        relatedDocuments: [
          "Contexte métier — Boom Boom Villette",
          "CDC — Plateforme de Réservation v2",
        ],
        businessRules: [
          "Les événements de plus de 30 personnes nécessitent une validation manuelle par le commercial",
          "Le devis est généré automatiquement avec les tarifs négociés de l'entreprise",
          "La privatisation d'espace est soumise à disponibilité et validée sous 48h",
          "Le paiement est par facture avec délai de 30 jours",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/checkout/payment-link",
        service: "Service Paiement",
        description:
          "Génère un lien de paiement Stripe Checkout pour une réservation. Supporte le paiement immédiat (CB, Apple Pay, Google Pay) et le paiement partiel par carte cadeau.",
        authRequired: true,
        requestPayload: {
          body: {
            reservationId: "string",
            amount: "number (en centimes)",
            currency: "string (défaut: eur)",
            successUrl: "string (URL de redirection)",
            cancelUrl: "string (URL de redirection)",
            giftCardCode: "string?",
            paymentMode: "string (immediate | invoice)",
          },
        },
        responsePayload: {
          paymentLinkUrl: "string",
          sessionId: "string (Stripe session ID)",
          expiresAt: "string (ISO 8601, +30 minutes)",
          giftCardDeduction: "number? (montant déduit de la carte cadeau)",
        },
        businessTags: ["paiement", "checkout", "Stripe"],
        relatedComponents: ["CheckoutForm", "PaymentRedirect", "GiftCardInput"],
        relatedDocuments: [
          "Documentation API — Service Paiement",
          "CDC — Plateforme de Réservation v2",
        ],
        businessRules: [
          "Le lien de paiement expire après 30 minutes",
          "Le montant est vérifié côté serveur avant envoi à Stripe (anti-manipulation)",
          "Aucune donnée de carte bancaire ne transite par nos serveurs (PCI DSS SAQ A)",
          "Le paiement mixte carte cadeau + CB est géré en une seule session Stripe",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/users/me/bookings",
        service: "Service Utilisateurs",
        description:
          "Liste les réservations de l'utilisateur connecté avec pagination. Permet de filtrer par statut (à venir, passées, annulées).",
        authRequired: true,
        requestPayload: {
          queryParams: {
            status: "string? (upcoming | past | cancelled)",
            limit: "number (défaut: 10)",
            offset: "number (défaut: 0)",
          },
        },
        responsePayload: {
          data: [
            {
              id: "string",
              confirmationCode: "string",
              activity: { name: "string", imageUrl: "string" },
              date: "string",
              time: "string",
              participants: "number",
              totalAmount: "number",
              status: "string",
            },
          ],
          pagination: { total: "number", limit: "number", offset: "number" },
        },
        businessTags: ["utilisateur", "réservation", "historique"],
        relatedComponents: ["BookingHistory", "BookingCard", "UserDashboard"],
        relatedDocuments: ["SFD — Module Réservation en Ligne"],
        businessRules: [
          "Seules les réservations de l'utilisateur authentifié sont retournées",
          "Les réservations passées sont conservées dans l'historique pendant 24 mois",
          "Le tri par défaut est par date décroissante",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/users/me",
        service: "Service Utilisateurs",
        description:
          "Récupère le profil complet de l'utilisateur connecté incluant ses informations personnelles, ses préférences et ses statistiques de fidélité.",
        authRequired: true,
        requestPayload: {},
        responsePayload: {
          id: "string",
          firstName: "string",
          lastName: "string",
          email: "string",
          phone: "string?",
          loyaltyPoints: "number",
          totalBookings: "number",
          memberSince: "string (ISO 8601)",
          preferences: {
            favoriteActivities: ["string"],
            newsletterOptIn: "boolean",
            language: "string",
          },
        },
        businessTags: ["utilisateur", "profil", "fidélité"],
        relatedComponents: ["UserProfile", "LoyaltyCard", "PreferencesForm"],
        relatedDocuments: [],
        businessRules: [
          "Les points de fidélité sont calculés automatiquement (1 point par euro dépensé)",
          "Le profil est mis en cache côté client avec une durée de 5 minutes",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/auth/login",
        service: "Service Utilisateurs",
        description:
          "Authentification de l'utilisateur par email et mot de passe. Retourne un JWT avec un refresh token. Supporte aussi le parcours invité.",
        authRequired: false,
        requestPayload: {
          body: {
            email: "string",
            password: "string",
            guestMode: "boolean? (défaut: false)",
          },
        },
        responsePayload: {
          accessToken: "string (JWT, expiration 15 min)",
          refreshToken: "string (expiration 7 jours)",
          user: {
            id: "string",
            firstName: "string",
            lastName: "string",
            email: "string",
            role: "string (customer | corporate_admin | admin)",
          },
        },
        businessTags: ["authentification", "sécurité", "invité"],
        relatedComponents: ["LoginForm", "GuestCheckout", "AuthProvider"],
        relatedDocuments: [
          "ADR — Stack Technique et Choix d'Architecture",
        ],
        businessRules: [
          "Le mode invité crée un compte temporaire avec un email et permet de réserver sans mot de passe",
          "Après 3 tentatives échouées, le compte est verrouillé pendant 15 minutes",
          "Le JWT contient l'identifiant utilisateur, le rôle et les permissions",
          "Le refresh token est stocké en HttpOnly cookie (sécurité XSS)",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/slots/availability",
        service: "Service Activités",
        description:
          "Vérifie les disponibilités des créneaux horaires pour une activité donnée. Retourne les créneaux avec leur statut et leur prix dynamique.",
        authRequired: false,
        requestPayload: {
          queryParams: {
            activityId: "string",
            date: "string (YYYY-MM-DD)",
            participants: "number",
            duration: "number? (minutes, pour événements entreprise)",
            exclusive: "boolean? (privatisation)",
          },
        },
        responsePayload: {
          date: "string",
          activity: { id: "string", name: "string" },
          slots: [
            {
              id: "string",
              startTime: "string (HH:mm)",
              endTime: "string (HH:mm)",
              availableSpots: "number",
              totalCapacity: "number",
              price: "number",
              dynamicPricing: "boolean",
              status: "string (available | almost_full | full)",
            },
          ],
        },
        businessTags: ["disponibilité", "créneaux", "yield-management"],
        relatedComponents: ["TimeSlotPicker", "CalendarView", "PriceTag"],
        relatedDocuments: [
          "CDC — Plateforme de Réservation v2",
          "SFD — Module Réservation en Ligne",
        ],
        businessRules: [
          "Les créneaux sont affichés pour les 14 prochains jours",
          "Le yield management ajuste les prix aux paliers 50%, 75% et 90% de remplissage",
          "Les créneaux verrouillés par une réservation en cours sont exclus des disponibilités",
          "Le temps de réponse cible est inférieur à 100ms (P95)",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "POST",
        route: "/api/reviews",
        service: "Service Activités",
        description:
          "Publie un avis client sur une activité après la visite. L'avis est soumis à modération automatique avant publication.",
        authRequired: true,
        requestPayload: {
          body: {
            activityId: "string",
            reservationId: "string (preuve de visite)",
            rating: "number (1-5)",
            comment: "string (min 10, max 1000 caractères)",
            photos: ["string? (URLs)"],
          },
        },
        responsePayload: {
          id: "string",
          status: "string (pending_moderation | published)",
          estimatedPublicationDate: "string (ISO 8601)",
        },
        businessTags: ["avis", "modération", "activités"],
        relatedComponents: ["ReviewForm", "StarRating", "ReviewConfirmation"],
        relatedDocuments: [],
        businessRules: [
          "Un seul avis par réservation est autorisé",
          "L'avis ne peut être publié que si l'activité a eu lieu (date passée)",
          "La modération automatique filtre les contenus injurieux ou spam",
          "L'utilisateur peut modifier son avis dans les 48h suivant la publication",
        ],
        projectId: projectBBV.id,
      },
      {
        method: "GET",
        route: "/api/pricing/dynamic",
        service: "Service Tarification",
        description:
          "Consultation des tarifs dynamiques en fonction de la date, du type d'activité, du nombre de participants et du taux de remplissage. Utilisé pour l'affichage et la simulation de prix.",
        authRequired: false,
        requestPayload: {
          queryParams: {
            activityId: "string",
            date: "string (YYYY-MM-DD)",
            participants: "number",
            eventType: "string? (individual | corporate)",
          },
        },
        responsePayload: {
          basePrice: "number",
          dynamicPrice: "number",
          priceMultiplier: "number (ex: 1.2)",
          reason: "string (ex: forte demande, créneau premium, heure creuse)",
          discounts: [
            {
              type: "string (group | corporate | loyalty)",
              amount: "number",
              description: "string",
            },
          ],
          finalPrice: "number",
        },
        businessTags: ["tarification", "yield-management", "prix"],
        relatedComponents: ["PriceSimulator", "PriceBreakdown", "DynamicPriceTag"],
        relatedDocuments: [
          "CDC — Plateforme de Réservation v2",
          "Note Technique — Stratégie de Cache et Performance",
        ],
        businessRules: [
          "Le prix dynamique ne peut pas dépasser 150% du prix de base",
          "Les heures creuses (mardi-jeudi avant 17h) bénéficient d'une réduction de 20%",
          "Les groupes de plus de 10 personnes bénéficient d'une remise de 10%",
          "Le tarif affiché est garanti pendant 10 minutes après consultation",
        ],
        projectId: projectBBV.id,
      },
    ],
  })

  console.log("✅ 18 endpoints API créés\n")

  // ──────────────────────────────────────────
  // 6. Création des analyses d'impact (projet BBV)
  // ──────────────────────────────────────────
  console.log("📊 Création des analyses d'impact...")

  await prisma.impactAnalysis.createMany({
    data: [
      {
        title: "Réservation Carte Cadeau Entreprise",
        feature: "Intégration des cartes cadeaux entreprise dans le parcours de réservation",
        complexityScore: 78,
        confidenceScore: 82,
        functionalImpact: {
          summary:
            "Impact fonctionnel majeur : nouveau parcours d'achat B2B, modification du checkout existant, portail de gestion entreprise.",
          items: [
            "Nouveau parcours d'achat de cartes cadeaux en lot pour les entreprises (portail B2B)",
            "Modification du parcours de paiement existant pour accepter les cartes cadeaux",
            "Ajout d'un tableau de bord de suivi des cartes pour les administrateurs CSE",
            "Gestion des remises volume automatiques (5% à 50 cartes, 10% à 200 cartes)",
            "Personnalisation des visuels de carte avec 6 templates thématiques",
          ],
        },
        backendImpact: {
          summary:
            "Création d'un nouveau microservice GiftCard et modification substantielle du service Paiement pour le paiement mixte.",
          items: [
            "Nouveau microservice GiftCard avec base de données dédiée (PostgreSQL)",
            "Endpoints CRUD : création, consultation, utilisation, expiration des cartes",
            "Modification du service Paiement pour le paiement mixte carte cadeau + CB via Stripe",
            "Système de génération de codes uniques cryptographiquement sécurisés",
            "Job CRON quotidien pour l'expiration des cartes et la notification préalable (J-30, J-7)",
          ],
        },
        frontendImpact: {
          summary:
            "Impacts majeurs sur le parcours de paiement et création d'un portail entreprise complet.",
          items: [
            "Composant GiftCardWizard : parcours d'achat en 4 étapes avec prévisualisation",
            "Composant GiftCardInput : saisie et validation en temps réel dans le checkout",
            "Portail entreprise : dashboard, commande en lot, suivi des cartes, export CSV",
            "Modification du composant CheckoutForm pour intégrer le paiement mixte",
            "Page « Mon solde carte cadeau » dans l'espace client avec historique des transactions",
          ],
        },
        dataImpact: {
          summary:
            "Nouvelle table GiftCard avec relations vers les utilisateurs, entreprises et transactions.",
          items: [
            "Nouvelle table gift_cards (id, code, amount, balance, status, expires_at, company_id, purchaser_id)",
            "Nouvelle table gift_card_transactions (id, gift_card_id, amount, type, reservation_id)",
            "Nouvelle table companies (id, name, contact_email, contract_type, discount_rate)",
            "Index sur gift_cards.code pour les recherches rapides (< 200ms)",
            "Politique de rétention des données : 24 mois après expiration",
          ],
        },
        securityImpact: {
          summary:
            "Risques modérés liés à la génération de codes et à la fraude potentielle sur les cartes.",
          items: [
            "Génération de codes avec entropie suffisante (UUID v4 + HMAC) pour prévenir la prédiction",
            "Rate limiting sur l'endpoint de vérification pour contrer le brute force",
            "Vérification côté serveur du solde avant débit (anti-manipulation)",
            "Logs d'audit complets pour toutes les opérations sur les cartes cadeaux",
          ],
        },
        testingImpact: {
          summary:
            "Plan de test étendu nécessaire couvrant les parcours B2C, B2B et les cas limites de paiement mixte.",
          items: [
            "Tests unitaires du service de génération de codes (unicité, format, entropie)",
            "Tests d'intégration du paiement mixte carte cadeau + CB avec Stripe en mode test",
            "Tests E2E du parcours d'achat B2C (achat, envoi, utilisation, expiration)",
            "Tests de charge sur l'endpoint de vérification du solde (objectif : 200ms P95)",
            "Tests de non-régression sur le parcours de réservation existant",
          ],
        },
        risks: {
          summary:
            "Risques principaux liés à la complexité de l'intégration Stripe et aux dépendances comptables.",
          items: [
            "Le paiement mixte avec Stripe ne dispose pas de support natif et nécessite un développement custom",
            "Les questions comptables (TVA, avoir) bloquent la finalisation des spécifications",
            "La fraude sur les codes de carte cadeau pourrait impacter financièrement le client",
            "Le SFD du parcours carte cadeau est encore en statut NEEDS_REVIEW",
          ],
        },
        recommendations: {
          summary:
            "Recommandations pour sécuriser le développement et réduire les risques identifiés.",
          items: [
            "Démarrer par un POC du paiement mixte avec Stripe (1 sprint) pour valider la faisabilité",
            "Organiser une réunion avec l'expert-comptable pour trancher les questions de TVA",
            "Implémenter un système de monitoring en temps réel des transactions carte cadeau",
            "Livrer le portail entreprise en version MVP avec un nombre limité de fonctionnalités",
            "Prévoir un audit de sécurité externe avant la mise en production",
          ],
        },
        sourceDocs: [
          "CDC — Module Carte Cadeau Entreprise",
          "SFD — Parcours Carte Cadeau",
          "Documentation API — Service Paiement",
          "Note Technique — Architecture Microservices",
        ],
        impactedEndpoints: [
          "POST /api/gift-cards",
          "POST /api/gift-cards/{id}/redeem",
          "GET /api/gift-cards",
          "POST /api/checkout/payment-link",
        ],
        impactedComponents: [
          "GiftCardWizard",
          "GiftCardInput",
          "CheckoutForm",
          "CompanyDashboard",
          "PaymentSummary",
        ],
        projectId: projectBBV.id,
      },
      {
        title: "Nouveau Parcours de Paiement",
        feature:
          "Refonte du parcours de paiement avec support multi-méthodes et optimisation du tunnel de conversion",
        complexityScore: 65,
        confidenceScore: 88,
        functionalImpact: {
          summary:
            "Refonte du tunnel de paiement pour améliorer le taux de conversion et supporter les nouveaux moyens de paiement.",
          items: [
            "Nouveau tunnel de paiement en 2 étapes (au lieu de 3) pour réduire l'abandon",
            "Support d'Apple Pay et Google Pay en plus de la CB classique",
            "Intégration native des cartes cadeaux comme moyen de paiement",
            "Paiement en un clic pour les clients récurrents (Stripe Customer)",
            "Affichage dynamique de la politique de remboursement selon la date de l'activité",
          ],
        },
        backendImpact: {
          summary:
            "Modifications concentrées sur le service Paiement avec migration vers Stripe Payment Elements.",
          items: [
            "Migration de Stripe Checkout vers Stripe Payment Elements pour plus de contrôle",
            "Implémentation du paiement en un clic via les Stripe Customers sauvegardés",
            "Ajout de l'endpoint de calcul dynamique de la politique de remboursement",
            "Webhook handler pour les nouveaux événements Payment Elements",
          ],
        },
        frontendImpact: {
          summary:
            "Refonte majeure du composant CheckoutForm et optimisation mobile.",
          items: [
            "Nouveau composant PaymentForm basé sur Stripe Payment Elements",
            "Intégration des boutons Apple Pay et Google Pay avec détection automatique",
            "Composant OneClickPayment pour les clients récurrents",
            "Optimisation mobile du tunnel de paiement (responsive design)",
            "Composant RefundPolicyBanner avec calcul dynamique",
          ],
        },
        dataImpact: {
          summary:
            "Ajout du stockage des méthodes de paiement sauvegardées et des métriques de conversion.",
          items: [
            "Nouvelle table saved_payment_methods (id, user_id, stripe_payment_method_id, last4, brand)",
            "Table de métriques checkout_events (step, duration, abandoned, payment_method)",
            "Migration des sessions Stripe Checkout existantes vers le nouveau format",
          ],
        },
        securityImpact: {
          summary:
            "Sécurité renforcée avec les Payment Elements et la tokenisation côté client.",
          items: [
            "Conformité PCI DSS maintenue (aucune donnée de carte côté serveur)",
            "Authentification 3D Secure 2 automatique pour les paiements à risque",
            "Vérification SCA (Strong Customer Authentication) conforme à la directive européenne",
          ],
        },
        testingImpact: {
          summary:
            "Tests de conversion et tests de paiement avec les différents moyens de paiement.",
          items: [
            "Tests A/B du nouveau tunnel de paiement vs l'ancien",
            "Tests E2E avec cartes de test Stripe pour chaque moyen de paiement",
            "Tests de performance du chargement des Payment Elements (objectif : <1s)",
            "Tests de régression sur les webhooks existants",
          ],
        },
        risks: {
          summary:
            "Risques modérés liés à la migration Stripe et au changement d'habitudes utilisateur.",
          items: [
            "La migration vers Payment Elements peut temporairement affecter le taux de conversion",
            "Apple Pay nécessite un certificat de domaine vérifié (processus de 2-3 jours)",
            "Le paiement en un clic nécessite le consentement explicite de l'utilisateur (RGPD)",
          ],
        },
        recommendations: {
          summary:
            "Déploiement progressif recommandé avec feature flag et monitoring du taux de conversion.",
          items: [
            "Déployer le nouveau tunnel derrière un feature flag avec 10% du trafic initial",
            "Monitorer le taux de conversion et le temps moyen de checkout en temps réel",
            "Préparer un rollback automatique si le taux de conversion baisse de plus de 5%",
            "Former l'équipe support aux nouveaux moyens de paiement et scénarios d'erreur",
          ],
        },
        sourceDocs: [
          "CDC — Plateforme de Réservation v2",
          "Documentation API — Service Paiement",
          "SFD — Module Réservation en Ligne",
        ],
        impactedEndpoints: [
          "POST /api/checkout/payment-link",
          "POST /api/reservations",
          "PUT /api/reservations/{id}/cancel",
        ],
        impactedComponents: [
          "CheckoutForm",
          "PaymentForm",
          "OneClickPayment",
          "RefundPolicyBanner",
        ],
        projectId: projectBBV.id,
      },
      {
        title: "Intégration Tarification Dynamique",
        feature:
          "Mise en place d'un système de yield management pour ajuster les prix en temps réel selon la demande",
        complexityScore: 85,
        confidenceScore: 71,
        functionalImpact: {
          summary:
            "Impact fonctionnel transversal : modification de l'affichage des prix sur toutes les pages et introduction du concept de prix variable pour les utilisateurs.",
          items: [
            "Affichage des prix dynamiques sur le catalogue et le sélecteur de créneaux",
            "Indication visuelle du type de tarif (prix normal, forte demande, heure creuse)",
            "Simulateur de prix pour les événements entreprise avec prise en compte du yield",
            "Garantie de prix pendant 10 minutes après consultation pour éviter les frustrations",
            "Dashboard administrateur pour paramétrer les règles de yield management",
          ],
        },
        backendImpact: {
          summary:
            "Création d'un nouveau service de tarification avec algorithme de yield management et cache Redis optimisé.",
          items: [
            "Nouveau service Tarification indépendant avec API REST",
            "Algorithme de yield management paramétrable (paliers à 50%, 75%, 90% de remplissage)",
            "Cache Redis des prix calculés avec invalidation en temps réel lors de chaque réservation",
            "API d'administration pour configurer les règles (plafond 150%, réductions heures creuses)",
            "Système de garantie de prix (token temporaire valide 10 minutes)",
          ],
        },
        frontendImpact: {
          summary:
            "Modification de tous les composants d'affichage de prix et ajout d'indicateurs visuels.",
          items: [
            "Nouveau composant DynamicPriceTag avec indicateur de tendance (hausse/baisse/stable)",
            "Modification du composant ActivityCard pour afficher « à partir de X€ » dynamiquement",
            "Composant PriceSimulator pour les entreprises avec calcul en temps réel",
            "Timer visuel de garantie de prix dans le panier (compte à rebours 10 minutes)",
            "Dashboard admin de configuration du yield management avec graphiques",
          ],
        },
        dataImpact: {
          summary:
            "Nouveau modèle de données pour les règles de tarification et l'historique des prix.",
          items: [
            "Nouvelle table pricing_rules (id, activity_id, threshold, multiplier, valid_from, valid_to)",
            "Table d'historique pricing_history (id, activity_id, slot_id, computed_price, base_price, timestamp)",
            "Table price_guarantees (id, user_id, slot_id, price, expires_at, token)",
            "Index sur pricing_history pour les requêtes analytiques (date, activity_id)",
          ],
        },
        securityImpact: {
          summary:
            "Risques liés à la manipulation des prix et à la prédiction des algorithmes.",
          items: [
            "Le token de garantie de prix doit être non prédictible et vérifié côté serveur",
            "Les règles de yield ne doivent pas être exposées via l'API publique",
            "Prévention de l'exploitation algorithmique (bots réservant et annulant pour manipuler les prix)",
            "Audit trail de toutes les modifications des règles de tarification",
          ],
        },
        testingImpact: {
          summary:
            "Tests complexes nécessitant la simulation de différents niveaux de remplissage.",
          items: [
            "Tests unitaires de l'algorithme de yield management avec différents scénarios de remplissage",
            "Tests de charge pour valider les performances du cache Redis (objectif : 100ms P95)",
            "Tests de non-régression sur tous les composants affichant des prix",
            "Tests d'intégration avec le service de réservation pour la garantie de prix",
            "Tests exploratoires pour identifier les cas limites (changement de prix pendant le checkout)",
          ],
        },
        risks: {
          summary:
            "Risques élevés liés à la complexité algorithmique et à l'acceptation utilisateur du prix variable.",
          items: [
            "La tarification dynamique peut être mal perçue par les utilisateurs (perception d'injustice)",
            "La complexité de l'algorithme rend le débogage difficile en production",
            "Le cache Redis est un SPOF (Single Point of Failure) pour l'affichage des prix",
            "Le yield management sur les événements entreprise peut entrer en conflit avec les tarifs négociés",
            "La garantie de prix de 10 minutes peut être exploitée pour bloquer les meilleurs tarifs",
          ],
        },
        recommendations: {
          summary:
            "Approche progressive recommandée avec algorithme simple au départ et monitoring renforcé.",
          items: [
            "Commencer avec un algorithme à 3 paliers simples avant d'introduire du machine learning",
            "Mettre en place un cache Redis avec fallback (prix de base) en cas de défaillance",
            "Communiquer clairement la tarification dynamique aux utilisateurs (transparence)",
            "Limiter le yield management à +50% du prix de base dans un premier temps",
            "Prévoir un dashboard de monitoring avec alertes sur les variations anormales de prix",
          ],
        },
        sourceDocs: [
          "CDC — Plateforme de Réservation v2",
          "Note Technique — Stratégie de Cache et Performance",
          "ADR — Stack Technique et Choix d'Architecture",
        ],
        impactedEndpoints: [
          "GET /api/pricing/dynamic",
          "GET /api/slots/availability",
          "GET /api/activities",
          "GET /api/activities/{id}",
          "POST /api/reservations",
        ],
        impactedComponents: [
          "DynamicPriceTag",
          "ActivityCard",
          "TimeSlotPicker",
          "PriceSimulator",
          "PriceBreakdown",
        ],
        projectId: projectBBV.id,
      },
    ],
  })

  console.log("✅ 3 analyses d'impact créées\n")

  // ──────────────────────────────────────────
  // 7. Création des décisions (projet BBV)
  // ──────────────────────────────────────────
  console.log("🔖 Création des décisions...")

  await prisma.decision.createMany({
    data: [
      {
        title: "Le paiement ne sera pas réalisé directement sur le site",
        context:
          "Dans le cadre de la refonte du parcours de réservation, la question du traitement du paiement s'est posée : héberger le formulaire de paiement directement sur le site ou rediriger vers une page Stripe Checkout externe.",
        justification:
          "La redirection vers Stripe Checkout permet de réduire la surface d'attaque PCI DSS (qualification SAQ A au lieu de SAQ D), de bénéficier automatiquement des optimisations de conversion de Stripe (localisation, modes de paiement adaptatifs), et de réduire significativement le temps de développement. Le taux de conversion de Stripe Checkout est supérieur de 10% par rapport aux intégrations custom (source : benchmark Stripe 2025).",
        impact:
          "Le parcours utilisateur inclura une redirection vers la page de paiement Stripe. L'expérience sera fluide mais le design de la page de paiement ne sera pas entièrement personnalisable. Les webhooks Stripe devront être implémentés pour la confirmation de paiement asynchrone.",
        author: "Thomas Bernard",
        status: "APPROVED",
        relatedDocs: [
          "Documentation API — Service Paiement",
          "CDC — Plateforme de Réservation v2",
        ],
        relatedApis: ["POST /api/checkout/payment-link"],
        projectId: projectBBV.id,
        createdAt: daysAgo(35),
      },
      {
        title: "Le parcours invité restera disponible",
        context:
          "La question de l'obligation de créer un compte pour effectuer une réservation a été débattue. Le marketing souhaite collecter les données clients, tandis que l'UX team alerte sur le risque d'abandon du tunnel de conversion.",
        justification:
          "Les benchmarks e-commerce montrent que l'obligation de créer un compte entraîne un abandon de 23% du panier (source : Baymard Institute 2025). Le parcours invité permettra de maintenir un taux de conversion élevé tout en proposant la création de compte optionnelle après la réservation. Les données essentielles (email, nom) sont collectées dans tous les cas pour la confirmation.",
        impact:
          "Le système d'authentification devra supporter les comptes temporaires (guest accounts). L'endpoint POST /api/auth/login acceptera un mode invité. Les données du parcours invité seront conservées 30 jours pour permettre la conversion en compte permanent. Le programme de fidélité ne sera pas accessible aux invités.",
        author: "Marie Dupont",
        status: "APPROVED",
        relatedDocs: [
          "SFD — Module Réservation en Ligne",
          "Contexte métier — Boom Boom Villette",
        ],
        relatedApis: ["POST /api/auth/login", "POST /api/reservations"],
        projectId: projectBBV.id,
        createdAt: daysAgo(30),
      },
      {
        title: "Les modifications de réservation ne seront pas gérées en self-service",
        context:
          "La possibilité pour l'utilisateur de modifier sa réservation directement en ligne (changement de date, de créneau, de nombre de participants) a été envisagée. L'analyse des impacts révèle une complexité élevée liée au recalcul des prix et à la gestion des disponibilités.",
        justification:
          "En attente de validation. Les arguments pour : autonomie du client, réduction de la charge du service client (estimée à 15 appels/jour pour des modifications). Les arguments contre : complexité technique du recalcul de prix avec le yield management, risque de fraude (modifier vers un créneau moins cher), et nécessité de gérer les différences de prix (remboursement ou paiement complémentaire).",
        impact:
          "Si approuvé : l'endpoint PUT /api/reservations/{id}/modify devra être implémenté avec une logique de recalcul de prix complexe. Le composant ModifyReservationForm devra être créé. Si rejeté : les modifications resteront gérées par le service client via un back-office dédié.",
        author: "Lucas Moreau",
        status: "PENDING",
        relatedDocs: [
          "CDC — Plateforme de Réservation v2",
          "SFD — Module Réservation en Ligne",
        ],
        relatedApis: [
          "PUT /api/reservations/{id}/modify",
          "GET /api/slots/availability",
        ],
        projectId: projectBBV.id,
        createdAt: daysAgo(12),
      },
      {
        title: "Le endpoint de génération des liens de paiement sera isolé",
        context:
          "Le service de paiement peut être couplé directement au service de réservation (appel interne) ou exposé comme un service indépendant via un endpoint dédié. La question porte sur le niveau de découplage entre les deux services.",
        justification:
          "L'isolation du endpoint de génération de liens de paiement dans un service dédié permet : (1) de réutiliser la logique de paiement pour d'autres cas d'usage (carte cadeau, événement entreprise, abonnement), (2) de scaler le service de paiement indépendamment en cas de pic, (3) de faciliter les tests d'intégration avec Stripe en isolant les responsabilités. Le surcoût en latence est estimé à +15ms (appel réseau interne), ce qui est acceptable.",
        impact:
          "Le service de paiement est un microservice autonome avec sa propre API REST. Le service de réservation appelle POST /api/checkout/payment-link au lieu d'un appel de méthode interne. Le circuit breaker protège le service de réservation en cas d'indisponibilité du service de paiement. Un mécanisme de retry avec backoff exponentiel est implémenté.",
        author: "Thomas Bernard",
        status: "APPROVED",
        relatedDocs: [
          "Note Technique — Architecture Microservices",
          "Documentation API — Service Paiement",
        ],
        relatedApis: [
          "POST /api/checkout/payment-link",
          "POST /api/reservations",
        ],
        projectId: projectBBV.id,
        createdAt: daysAgo(28),
      },
      {
        title: "Architecture microservices avec API Gateway",
        context:
          "L'architecture de la plateforme pouvait être conçue en monolithe modulaire ou en microservices. Étant donné les objectifs de scalabilité, la diversité des domaines métier (réservation, paiement, carte cadeau, événementiel) et la taille de l'équipe, une décision structurante était nécessaire.",
        justification:
          "L'architecture microservices est retenue pour les raisons suivantes : (1) indépendance des déploiements — chaque service peut être mis à jour sans impacter les autres, (2) scalabilité ciblée — le service de disponibilité peut être scalé indépendamment lors des pics, (3) résilience — un échec du service carte cadeau n'empêche pas les réservations classiques, (4) organisation d'équipe — chaque binôme de développeurs peut se concentrer sur un domaine. L'API Gateway (Kong) centralise l'authentification, le rate limiting et le routage.",
        impact:
          "L'infrastructure repose sur 5 microservices déployés sur Kubernetes (GKE). La communication synchrone passe par l'API Gateway et la communication asynchrone par RabbitMQ. La complexité opérationnelle est plus élevée qu'un monolithe (monitoring distribué, gestion des transactions distribuées via Saga pattern). Le coût d'infrastructure est estimé à 2 500€/mois en production.",
        author: "Thomas Bernard",
        status: "APPROVED",
        relatedDocs: [
          "Note Technique — Architecture Microservices",
          "ADR — Stack Technique et Choix d'Architecture",
        ],
        relatedApis: [],
        projectId: projectBBV.id,
        createdAt: daysAgo(40),
      },
    ],
  })

  console.log("✅ 5 décisions créées\n")

  // ──────────────────────────────────────────
  // 8. Création des chemins d'exploration (projet BBV)
  // ──────────────────────────────────────────
  console.log("🧭 Création des chemins d'exploration...")

  // BUSINESS
  await prisma.explorationPath.create({
    data: {
      category: "BUSINESS",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Quel est le modèle de revenus pour les cartes cadeaux entreprise ? Le client prend-il une commission sur les cartes non utilisées ?",
            priority: "CRITICAL",
            status: "OPEN",
            source: "CDC — Module Carte Cadeau Entreprise",
            relatedDocs: ["CDC — Module Carte Cadeau Entreprise"],
            relatedApis: ["POST /api/gift-cards"],
          },
          {
            question:
              "L'objectif de 70% de réservation en ligne est-il réaliste à 12 mois ? Quels leviers marketing sont prévus pour accompagner cette transition ?",
            priority: "HIGH",
            status: "IN_PROGRESS",
            source: "Contexte métier — Boom Boom Villette",
            relatedDocs: ["Contexte métier — Boom Boom Villette"],
            relatedApis: [],
          },
          {
            question:
              "La tarification dynamique doit-elle s'appliquer également aux événements entreprise ou uniquement aux réservations individuelles ?",
            priority: "HIGH",
            status: "OPEN",
            source: "CDC — Plateforme de Réservation v2",
            relatedDocs: ["CDC — Plateforme de Réservation v2"],
            relatedApis: ["GET /api/pricing/dynamic"],
          },
          {
            question:
              "Le programme de fidélité prévu au S2 aura-t-il un impact sur la mécanique des cartes cadeaux (cumul de points, conversion) ?",
            priority: "MEDIUM",
            status: "OPEN",
            source: "Contexte métier — Boom Boom Villette",
            relatedDocs: [
              "Contexte métier — Boom Boom Villette",
              "CDC — Module Carte Cadeau Entreprise",
            ],
            relatedApis: ["GET /api/users/me"],
          },
        ],
      },
    },
  })

  // FUNCTIONAL
  await prisma.explorationPath.create({
    data: {
      category: "FUNCTIONAL",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Le parcours de réservation doit-il supporter les groupes de plus de 10 personnes avec des règles spécifiques (accompagnateur, formulaire détaillé) ?",
            priority: "HIGH",
            status: "ANSWERED",
            source: "CDC — Plateforme de Réservation v2",
            relatedDocs: [
              "CDC — Plateforme de Réservation v2",
              "SFD — Module Réservation en Ligne",
            ],
            relatedApis: ["POST /api/reservations"],
          },
          {
            question:
              "Les cartes cadeaux doivent-elles être utilisables sur toutes les activités ou certaines peuvent-elles être exclues (ex : restauration) ?",
            priority: "CRITICAL",
            status: "OPEN",
            source: "SFD — Parcours Carte Cadeau",
            relatedDocs: [
              "CDC — Module Carte Cadeau Entreprise",
              "SFD — Parcours Carte Cadeau",
            ],
            relatedApis: ["POST /api/gift-cards/{id}/redeem"],
          },
          {
            question:
              "Le parcours de réservation multi-activités (bowling + escape game) doit-il proposer des créneaux consécutifs automatiquement ?",
            priority: "MEDIUM",
            status: "IN_PROGRESS",
            source: "SFD — Module Réservation en Ligne",
            relatedDocs: ["SFD — Module Réservation en Ligne"],
            relatedApis: [
              "GET /api/slots/availability",
              "POST /api/reservations",
            ],
          },
          {
            question:
              "Comment gérer les réservations pour les mineurs ? Un accompagnateur adulte doit-il être obligatoirement renseigné ?",
            priority: "LOW",
            status: "OPEN",
            source: "CDC — Plateforme de Réservation v2",
            relatedDocs: ["CDC — Plateforme de Réservation v2"],
            relatedApis: ["POST /api/reservations"],
          },
        ],
      },
    },
  })

  // BACKEND
  await prisma.explorationPath.create({
    data: {
      category: "BACKEND",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Faut-il créer un nouvel endpoint dédié ou réutiliser un endpoint existant pour les cartes cadeaux entreprise ? L'endpoint POST /api/gift-cards peut-il gérer les deux cas (B2C et B2B) ?",
            priority: "HIGH",
            status: "ANSWERED",
            source: "Documentation API — Service Paiement",
            relatedDocs: [
              "Documentation API — Service Paiement",
              "CDC — Module Carte Cadeau Entreprise",
            ],
            relatedApis: ["POST /api/gift-cards", "GET /api/companies/{id}/offers"],
          },
          {
            question:
              "Le mécanisme de verrouillage des créneaux (5 minutes) est-il suffisant en cas de forte affluence ? Faut-il un système de file d'attente ?",
            priority: "CRITICAL",
            status: "IN_PROGRESS",
            source: "Note Technique — Architecture Microservices",
            relatedDocs: [
              "Note Technique — Architecture Microservices",
              "CDC — Plateforme de Réservation v2",
            ],
            relatedApis: [
              "GET /api/slots/availability",
              "POST /api/reservations",
            ],
          },
          {
            question:
              "L'API de l'ERP GestionLoisirs est-elle documentée de manière suffisante pour l'intégration ? Des tests de charge ont-ils été réalisés sur cette API ?",
            priority: "HIGH",
            status: "BLOCKED",
            source: "Connaissance entreprise — Groupe BBV",
            relatedDocs: ["Connaissance entreprise — Groupe BBV"],
            relatedApis: [],
          },
          {
            question:
              "Quel est le SLA cible pour le service de disponibilité ? Le cache Redis suffit-il ou faut-il envisager un CDN edge pour les données de disponibilité ?",
            priority: "MEDIUM",
            status: "OPEN",
            source: "Note Technique — Stratégie de Cache et Performance",
            relatedDocs: [
              "Note Technique — Stratégie de Cache et Performance",
              "Note Technique — Architecture Microservices",
            ],
            relatedApis: ["GET /api/slots/availability"],
          },
          {
            question:
              "Le pattern Saga pour les transactions distribuées (réservation → paiement → confirmation) nécessite-t-il un orchestrateur dédié ou un approche chorégraphique suffit-elle ?",
            priority: "MEDIUM",
            status: "OPEN",
            source: "Note Technique — Architecture Microservices",
            relatedDocs: ["Note Technique — Architecture Microservices"],
            relatedApis: [
              "POST /api/reservations",
              "POST /api/checkout/payment-link",
            ],
          },
        ],
      },
    },
  })

  // FRONTEND
  await prisma.explorationPath.create({
    data: {
      category: "FRONTEND",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Quels écrans existants du site actuel sont réutilisables pour le nouveau parcours de réservation ? Le design system est-il déjà défini ?",
            priority: "HIGH",
            status: "ANSWERED",
            source: "SFD — Module Réservation en Ligne",
            relatedDocs: ["SFD — Module Réservation en Ligne"],
            relatedApis: [],
          },
          {
            question:
              "Le composant TimeSlotPicker doit-il supporter l'accessibilité clavier complète (WCAG 2.1 AA) dès la v1 ou est-ce prévu pour une itération ultérieure ?",
            priority: "MEDIUM",
            status: "OPEN",
            source: "SFD — Module Réservation en Ligne",
            relatedDocs: ["SFD — Module Réservation en Ligne"],
            relatedApis: ["GET /api/slots/availability"],
          },
          {
            question:
              "Le portail entreprise (carte cadeau B2B) est-il une application séparée ou une section du site principal avec un routage conditionnel ?",
            priority: "HIGH",
            status: "IN_PROGRESS",
            source: "CDC — Module Carte Cadeau Entreprise",
            relatedDocs: ["CDC — Module Carte Cadeau Entreprise"],
            relatedApis: ["GET /api/companies/{id}/offers"],
          },
        ],
      },
    },
  })

  // DATA
  await prisma.explorationPath.create({
    data: {
      category: "DATA",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Quelle est la source de vérité pour les statuts de paiement ? La base de données interne ou Stripe ? Comment gérer les divergences ?",
            priority: "CRITICAL",
            status: "ANSWERED",
            source: "Documentation API — Service Paiement",
            relatedDocs: [
              "Documentation API — Service Paiement",
              "Note Technique — Architecture Microservices",
            ],
            relatedApis: ["POST /api/checkout/payment-link"],
          },
          {
            question:
              "La politique de rétention des données clients (RGPD) a-t-elle été définie ? Quel est le délai de suppression des comptes invités inactifs ?",
            priority: "HIGH",
            status: "OPEN",
            source: "Connaissance entreprise — Groupe BBV",
            relatedDocs: ["Connaissance entreprise — Groupe BBV"],
            relatedApis: ["GET /api/users/me"],
          },
          {
            question:
              "Les données de l'ERP GestionLoisirs doivent-elles être répliquées dans notre base ou interrogées en temps réel ? Quel est le volume de données concerné ?",
            priority: "HIGH",
            status: "BLOCKED",
            source: "Connaissance entreprise — Groupe BBV",
            relatedDocs: [
              "Connaissance entreprise — Groupe BBV",
              "Note Technique — Architecture Microservices",
            ],
            relatedApis: [],
          },
        ],
      },
    },
  })

  // SECURITY
  await prisma.explorationPath.create({
    data: {
      category: "SECURITY",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Comment gérer l'authentification pour le parcours invité ? Un token temporaire est-il suffisant ou faut-il un mécanisme plus robuste ?",
            priority: "CRITICAL",
            status: "IN_PROGRESS",
            source: "ADR — Stack Technique et Choix d'Architecture",
            relatedDocs: [
              "ADR — Stack Technique et Choix d'Architecture",
              "SFD — Module Réservation en Ligne",
            ],
            relatedApis: ["POST /api/auth/login"],
          },
          {
            question:
              "Le rate limiting de l'API Gateway est-il suffisant pour prévenir les attaques DDoS sur le service de disponibilité ? Faut-il un WAF ?",
            priority: "HIGH",
            status: "OPEN",
            source: "Note Technique — Architecture Microservices",
            relatedDocs: ["Note Technique — Architecture Microservices"],
            relatedApis: ["GET /api/slots/availability"],
          },
          {
            question:
              "Les codes de carte cadeau doivent-ils être hashés en base de données ou stockés en clair ? Quel algorithme de génération est recommandé ?",
            priority: "HIGH",
            status: "OPEN",
            source: "CDC — Module Carte Cadeau Entreprise",
            relatedDocs: ["CDC — Module Carte Cadeau Entreprise"],
            relatedApis: [
              "POST /api/gift-cards",
              "POST /api/gift-cards/{id}/redeem",
            ],
          },
          {
            question:
              "Un audit de sécurité externe est-il prévu avant la mise en production ? Quel est le périmètre prévu (pentest, revue de code, OWASP) ?",
            priority: "MEDIUM",
            status: "OPEN",
            source: "Connaissance entreprise — Groupe BBV",
            relatedDocs: ["Connaissance entreprise — Groupe BBV"],
            relatedApis: [],
          },
        ],
      },
    },
  })

  // TESTING
  await prisma.explorationPath.create({
    data: {
      category: "TESTING",
      projectId: projectBBV.id,
      questions: {
        create: [
          {
            question:
              "Quels scénarios de test sont critiques pour le paiement ? Les cartes de test Stripe couvrent-elles tous les cas d'erreur identifiés (3DS, refus, timeout) ?",
            priority: "CRITICAL",
            status: "IN_PROGRESS",
            source: "Documentation API — Service Paiement",
            relatedDocs: [
              "Documentation API — Service Paiement",
              "Questions ouvertes — Intégration Paiement",
            ],
            relatedApis: ["POST /api/checkout/payment-link"],
          },
          {
            question:
              "Les tests E2E du parcours de réservation doivent-ils couvrir les navigateurs mobiles (Safari iOS, Chrome Android) en plus du desktop ?",
            priority: "HIGH",
            status: "ANSWERED",
            source: "SFD — Module Réservation en Ligne",
            relatedDocs: ["SFD — Module Réservation en Ligne"],
            relatedApis: [],
          },
          {
            question:
              "Un environnement de staging avec des données réalistes est-il prévu pour les tests de charge ? Quel est le volume de données cible ?",
            priority: "MEDIUM",
            status: "OPEN",
            source: "Note Technique — Stratégie de Cache et Performance",
            relatedDocs: [
              "Note Technique — Stratégie de Cache et Performance",
              "Note Technique — Architecture Microservices",
            ],
            relatedApis: [],
          },
        ],
      },
    },
  })

  console.log("✅ 7 chemins d'exploration créés avec 26 questions\n")

  // ──────────────────────────────────────────
  // 9. Création des activités (projet BBV)
  // ──────────────────────────────────────────
  console.log("📋 Création des activités récentes...")

  await prisma.activity.createMany({
    data: [
      {
        type: "document_added",
        description:
          'Le document "Note Technique — Stratégie de Cache et Performance" a été ajouté au projet par Lucas Moreau.',
        metadata: {
          documentTitle: "Note Technique — Stratégie de Cache et Performance",
          author: "Lucas Moreau",
          category: "TECHNICAL_NOTES",
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(5),
      },
      {
        type: "document_indexed",
        description:
          'Le document "Documentation API — Service Paiement" a été indexé avec succès dans le système RAG. 3 sections traitées.',
        metadata: {
          documentTitle: "Documentation API — Service Paiement",
          sectionsIndexed: 3,
          indexDuration: "4.2s",
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(4),
      },
      {
        type: "question_asked",
        description:
          'Nouvelle question posée : "Cohérence CDC et SFD sur les paiements". Analyse en cours.',
        metadata: {
          conversationTitle: "Cohérence CDC et SFD sur les paiements",
          documentsAnalyzed: 4,
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(4),
      },
      {
        type: "analysis_generated",
        description:
          'Analyse d\'impact générée pour la feature "Réservation Carte Cadeau Entreprise". Score de complexité : 78/100.',
        metadata: {
          analysisTitle: "Réservation Carte Cadeau Entreprise",
          complexityScore: 78,
          confidenceScore: 82,
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(3),
      },
      {
        type: "decision_made",
        description:
          'Décision approuvée : "Le endpoint de génération des liens de paiement sera isolé". Validée par Thomas Bernard.',
        metadata: {
          decisionTitle:
            "Le endpoint de génération des liens de paiement sera isolé",
          status: "APPROVED",
          author: "Thomas Bernard",
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(3),
      },
      {
        type: "rag_sync",
        description:
          "Synchronisation RAG terminée. 8 documents indexés sur 12 (4 en attente : 1 DRAFT, 1 NEEDS_REVIEW, 2 PENDING).",
        metadata: {
          totalDocuments: 12,
          indexedDocuments: 8,
          pendingDocuments: 4,
          syncDuration: "12.7s",
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(2),
      },
      {
        type: "question_asked",
        description:
          'Nouvelle question posée : "APIs concernées par la réservation entreprise". 5 documents analysés.',
        metadata: {
          conversationTitle: "APIs concernées par la réservation entreprise",
          documentsAnalyzed: 5,
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(2),
      },
      {
        type: "api_documented",
        description:
          "18 endpoints API ont été documentés pour le projet. Couverture : 100% des endpoints identifiés.",
        metadata: {
          endpointsCount: 18,
          services: [
            "Service Activités",
            "Service Réservation",
            "Service Paiement",
            "Service Carte Cadeau",
            "Service Entreprise",
            "Service Utilisateurs",
            "Service Événementiel",
            "Service Tarification",
          ],
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(2),
      },
      {
        type: "ring_update",
        description:
          "Mise à jour de l'anneau de connaissances (Ring). 4 documents intégrés dans le contexte permanent : Contexte métier, CDC Réservation, SFD Réservation, ADR Stack.",
        metadata: {
          documentsInRing: 4,
          ringDocuments: [
            "Contexte métier — Boom Boom Villette",
            "CDC — Plateforme de Réservation v2",
            "SFD — Module Réservation en Ligne",
            "ADR — Stack Technique et Choix d'Architecture",
          ],
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(1),
      },
      {
        type: "analysis_generated",
        description:
          'Analyse d\'impact générée pour la feature "Nouveau Parcours de Paiement". Score de complexité : 65/100, confiance : 88/100.',
        metadata: {
          analysisTitle: "Nouveau Parcours de Paiement",
          complexityScore: 65,
          confidenceScore: 88,
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(1),
      },
      {
        type: "document_indexed",
        description:
          'Le document "CDC — Module Carte Cadeau Entreprise" a été indexé. 3 sections traitées, 5 tags associés.',
        metadata: {
          documentTitle: "CDC — Module Carte Cadeau Entreprise",
          sectionsIndexed: 3,
          tags: ["carte-cadeau", "B2B", "entreprise", "CDC", "personnalisation"],
        },
        projectId: projectBBV.id,
        createdAt: daysAgo(1),
      },
      {
        type: "decision_made",
        description:
          'Décision en attente : "Les modifications de réservation ne seront pas gérées en self-service". En cours de discussion au COPIL.',
        metadata: {
          decisionTitle:
            "Les modifications de réservation ne seront pas gérées en self-service",
          status: "PENDING",
          author: "Lucas Moreau",
        },
        projectId: projectBBV.id,
        createdAt: hoursAgo(18),
      },
      {
        type: "analysis_generated",
        description:
          'Analyse d\'impact générée pour "Intégration Tarification Dynamique". Complexité élevée (85/100) avec confiance modérée (71/100).',
        metadata: {
          analysisTitle: "Intégration Tarification Dynamique",
          complexityScore: 85,
          confidenceScore: 71,
        },
        projectId: projectBBV.id,
        createdAt: hoursAgo(8),
      },
      {
        type: "rag_sync",
        description:
          "Synchronisation RAG incrémentale. 1 nouveau document traité. Temps de traitement : 2.1s.",
        metadata: {
          newDocuments: 1,
          syncDuration: "2.1s",
          documentTitle: "Documentation API — Service Réservation",
        },
        projectId: projectBBV.id,
        createdAt: hoursAgo(4),
      },
      {
        type: "document_added",
        description:
          'Le document "Questions ouvertes — Intégration Paiement" a été mis à jour par Emma Laurent. 2 nouvelles questions ajoutées.',
        metadata: {
          documentTitle: "Questions ouvertes — Intégration Paiement",
          author: "Emma Laurent",
          questionsAdded: 2,
        },
        projectId: projectBBV.id,
        createdAt: hoursAgo(2),
      },
    ],
  })

  console.log("✅ 15 activités créées\n")

  // ──────────────────────────────────────────
  // 10. Création des intégrations
  // ──────────────────────────────────────────
  console.log("🔗 Création des intégrations...")

  await prisma.integration.createMany({
    data: [
      {
        name: "Notion",
        type: "documentation",
        status: "CONNECTED",
        config: {
          workspaceId: "ws_bbv_2026",
          syncFrequency: "every_6_hours",
          lastSync: daysAgo(0).toISOString(),
          pagesImported: 24,
          autoSync: true,
        },
      },
      {
        name: "Google Drive",
        type: "storage",
        status: "PENDING",
        config: {
          folderId: "1a2b3c4d5e6f",
          scopes: ["drive.readonly"],
          pendingAuthorization: true,
          requestedBy: "Marie Dupont",
          requestedAt: daysAgo(3).toISOString(),
        },
      },
      {
        name: "Confluence",
        type: "documentation",
        status: "AVAILABLE",
        config: {
          description:
            "Importation des espaces Confluence pour enrichir la base de connaissances. Supporte les pages, les commentaires et les pièces jointes.",
          supportedFeatures: [
            "import_pages",
            "import_attachments",
            "bidirectional_sync",
          ],
        },
      },
      {
        name: "Slack",
        type: "communication",
        status: "CONNECTED",
        config: {
          workspaceName: "FrogWorks Team",
          channelId: "C06BBV_PROJECT",
          channelName: "#projet-bbv",
          notificationsEnabled: true,
          notifyOn: [
            "document_added",
            "analysis_generated",
            "decision_made",
          ],
          connectedAt: daysAgo(20).toISOString(),
        },
      },
      {
        name: "GitHub",
        type: "development",
        status: "CONNECTED",
        config: {
          organization: "frogworks-studio",
          repository: "bbv-platform",
          branch: "main",
          syncPullRequests: true,
          syncIssues: true,
          lastSync: daysAgo(0).toISOString(),
          webhookActive: true,
        },
      },
      {
        name: "Jira",
        type: "project_management",
        status: "AVAILABLE",
        config: {
          description:
            "Synchronisation des tickets Jira pour tracer le lien entre les décisions d'architecture, les analyses d'impact et les tâches de développement.",
          supportedFeatures: [
            "import_issues",
            "link_decisions",
            "sync_status",
            "bidirectional",
          ],
        },
      },
    ],
  })

  console.log("✅ 6 intégrations créées\n")

  // ──────────────────────────────────────────
  // Résumé final
  // ──────────────────────────────────────────
  console.log("========================================")
  console.log("🐸 Seed terminé avec succès !")
  console.log("========================================")
  console.log("Récapitulatif :")
  console.log("  - 4 projets")
  console.log("  - 12 documents avec 37 sections")
  console.log("  - 3 conversations avec 6 messages")
  console.log("  - 18 endpoints API")
  console.log("  - 3 analyses d'impact")
  console.log("  - 5 décisions")
  console.log("  - 7 chemins d'exploration avec 26 questions")
  console.log("  - 15 activités")
  console.log("  - 6 intégrations")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Erreur lors du seed :", e)
    await prisma.$disconnect()
    process.exit(1)
  })
