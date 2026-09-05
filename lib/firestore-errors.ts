import { auth } from "@/lib/firebase-client";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const rawMsg = error instanceof Error ? error.message : String(error);

  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.warn(`[Firestore ${operationType.toUpperCase()}] Error at ${path}:`, rawMsg, {
    uid: auth.currentUser?.uid,
    email: auth.currentUser?.email,
  });

  if (rawMsg.includes("offline") || rawMsg.includes("unavailable") || rawMsg.includes("network")) {
    throw new Error("Unable to connect to database. The client appears to be offline or network is unreachable.");
  }

  if (rawMsg.includes("permission-denied") || rawMsg.includes("Unauthorized")) {
    throw new Error("Access Denied: You do not have permission to access this document.");
  }

  throw new Error(rawMsg || `Database operation failed during ${operationType}.`);
}
