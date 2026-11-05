import "server-only";
import { getServiceClient } from "@/lib/supabase/admin";

/** Catat tindakan administratif. Jangan masukkan password, token, atau kode plaintext ke metadata. */
export async function logAudit(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await getServiceClient().from("audit_logs").insert({
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}
