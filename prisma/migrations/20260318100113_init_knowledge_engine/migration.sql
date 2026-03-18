-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('BUSINESS_CONTEXT', 'COMPANY_KNOWLEDGE', 'CAHIER_DES_CHARGES', 'SFD', 'API_DOCUMENTATION', 'TECHNICAL_NOTES', 'ARCHITECTURE_DECISIONS', 'OPEN_QUESTIONS');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('INDEXED', 'PENDING', 'NEEDS_REVIEW', 'DRAFT');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "QuestionPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('OPEN', 'ANSWERED', 'IN_PROGRESS', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "ExplorationCategory" AS ENUM ('BUSINESS', 'FUNCTIONAL', 'BACKEND', 'FRONTEND', 'DATA', 'SECURITY', 'TESTING');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'PENDING', 'AVAILABLE', 'DISABLED');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "industry" TEXT NOT NULL,
    "completion_score" INTEGER NOT NULL DEFAULT 0,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "content" TEXT,
    "author" TEXT NOT NULL,
    "tags" TEXT[],
    "rag_indexed" BOOLEAN NOT NULL DEFAULT false,
    "ring_used" BOOLEAN NOT NULL DEFAULT false,
    "needs_clarification" BOOLEAN NOT NULL DEFAULT false,
    "sections_count" INTEGER NOT NULL DEFAULT 0,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "document_id" TEXT NOT NULL,

    CONSTRAINT "document_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "backend_impacts" TEXT[],
    "frontend_impacts" TEXT[],
    "documents_used" TEXT[],
    "apis_used" TEXT[],
    "open_questions" TEXT[],
    "risks" TEXT[],
    "suggested_actions" TEXT[],
    "confidence_score" INTEGER,
    "conversation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_endpoints" (
    "id" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL,
    "route" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "auth_required" BOOLEAN NOT NULL DEFAULT true,
    "request_payload" JSONB,
    "response_payload" JSONB,
    "errors" JSONB,
    "business_tags" TEXT[],
    "related_components" TEXT[],
    "related_documents" TEXT[],
    "business_rules" TEXT[],
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impact_analyses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "complexity_score" INTEGER NOT NULL DEFAULT 0,
    "confidence_score" INTEGER NOT NULL DEFAULT 0,
    "functional_impact" JSONB,
    "backend_impact" JSONB,
    "frontend_impact" JSONB,
    "data_impact" JSONB,
    "security_impact" JSONB,
    "testing_impact" JSONB,
    "risks" JSONB,
    "recommendations" JSONB,
    "source_docs" TEXT[],
    "impacted_endpoints" TEXT[],
    "impacted_components" TEXT[],
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "related_docs" TEXT[],
    "related_apis" TEXT[],
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploration_paths" (
    "id" TEXT NOT NULL,
    "category" "ExplorationCategory" NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exploration_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploration_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "priority" "QuestionPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "QuestionStatus" NOT NULL DEFAULT 'OPEN',
    "source" TEXT,
    "related_docs" TEXT[],
    "related_apis" TEXT[],
    "exploration_id" TEXT NOT NULL,

    CONSTRAINT "exploration_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'AVAILABLE',
    "config" JSONB,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_sections" ADD CONSTRAINT "document_sections_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_analyses" ADD CONSTRAINT "impact_analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploration_paths" ADD CONSTRAINT "exploration_paths_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploration_questions" ADD CONSTRAINT "exploration_questions_exploration_id_fkey" FOREIGN KEY ("exploration_id") REFERENCES "exploration_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
