import { prisma } from "@/lib/prisma";

export interface AIWorkspace {
  id: string;
  orgId: string;
  name: string;
  organizationName: string;
  organizationSlug: string;
}

export async function getUserWorkspaces(
  userId: string,
): Promise<AIWorkspace[]> {
  const rows =
    await prisma.$queryRaw<AIWorkspace[]>`
      SELECT
        w.id,
        w.org_id AS "orgId",
        w.name,
        o.name AS "organizationName",
        o.slug AS "organizationSlug"
      FROM public.workspaces w
      INNER JOIN public.organizations o
        ON o.id = w.org_id
      INNER JOIN public.organization_members om
        ON om.org_id = o.id
      WHERE om.user_id = ${userId}::uuid
      ORDER BY
        o.created_at ASC,
        w.created_at ASC
    `;

  return rows;
}

export async function getWorkspaceForUser(
  userId: string,
  workspaceId: string,
) {
  const rows =
    await prisma.$queryRaw<AIWorkspace[]>`
      SELECT
        w.id,
        w.org_id AS "orgId",
        w.name,
        o.name AS "organizationName",
        o.slug AS "organizationSlug"
      FROM public.workspaces w
      INNER JOIN public.organizations o
        ON o.id = w.org_id
      INNER JOIN public.organization_members om
        ON om.org_id = o.id
      WHERE
        w.id = ${workspaceId}::uuid
        AND om.user_id = ${userId}::uuid
      LIMIT 1
    `;

  return rows[0] ?? null;
}

export async function getDefaultWorkspaceForUser(
  userId: string,
) {
  const workspaces =
    await getUserWorkspaces(userId);

  return workspaces[0] ?? null;
}

export async function getConversationWorkspace(
  conversationId: string,
  userId: string,
) {
  const rows =
    await prisma.$queryRaw<
      { workspaceId: string }[]
    >`
      SELECT
        cw.workspace_id AS "workspaceId"
      FROM public.ai_conversation_workspaces cw
      INNER JOIN public.ai_conversations c
        ON c.id = cw.conversation_id
      INNER JOIN public.workspaces w
        ON w.id = cw.workspace_id
      INNER JOIN public.organization_members om
        ON om.org_id = w.org_id
      WHERE
        cw.conversation_id =
          ${conversationId}::uuid
        AND c.user_id =
          ${userId}::uuid
        AND om.user_id =
          ${userId}::uuid
      LIMIT 1
    `;

  return rows[0]?.workspaceId ?? null;
}

export async function assertConversationAccess(
  conversationId: string,
  userId: string,
  workspaceId?: string,
) {
  if (workspaceId) {
    const rows =
      await prisma.$queryRaw<
        {
          conversationId: string;
          workspaceId: string;
        }[]
      >`
        SELECT
          cw.conversation_id AS "conversationId",
          cw.workspace_id AS "workspaceId"
        FROM public.ai_conversation_workspaces cw
        INNER JOIN public.ai_conversations c
          ON c.id = cw.conversation_id
        INNER JOIN public.workspaces w
          ON w.id = cw.workspace_id
        INNER JOIN public.organization_members om
          ON om.org_id = w.org_id
        WHERE
          cw.conversation_id = ${conversationId}::uuid
          AND cw.workspace_id = ${workspaceId}::uuid
          AND c.user_id = ${userId}::uuid
          AND om.user_id = ${userId}::uuid
        LIMIT 1
      `;

    return rows[0] ?? null;
  }

  const rows =
    await prisma.$queryRaw<
      {
        conversationId: string;
        workspaceId: string;
      }[]
    >`
      SELECT
        cw.conversation_id AS "conversationId",
        cw.workspace_id AS "workspaceId"
      FROM public.ai_conversation_workspaces cw
      INNER JOIN public.ai_conversations c
        ON c.id = cw.conversation_id
      INNER JOIN public.workspaces w
        ON w.id = cw.workspace_id
      INNER JOIN public.organization_members om
        ON om.org_id = w.org_id
      WHERE
        cw.conversation_id = ${conversationId}::uuid
        AND c.user_id = ${userId}::uuid
        AND om.user_id = ${userId}::uuid
      LIMIT 1
    `;

  return rows[0] ?? null;
}
