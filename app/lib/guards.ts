// app/lib/guards.ts
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { getBillingStatus, isAccessActive, type BillingStatus } from "@/app/lib/plan"

const TEST_ALWAYS_UNLOCK_ALL = true

export type AccessCheck =
  | { ok: true; userDoc: any; billingStatus: BillingStatus }
  | { ok: false; reason: "no_user" | "inactive"; billingStatus: BillingStatus }

export async function assertActiveAccess(uid: string): Promise<AccessCheck> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  const userDoc = snap.exists() ? snap.data() : null

  const billingStatus = getBillingStatus(userDoc)

  if (!userDoc) return { ok: false, reason: "no_user", billingStatus }
  if (TEST_ALWAYS_UNLOCK_ALL) return { ok: true, userDoc, billingStatus: "active" }
  if (!isAccessActive(userDoc)) return { ok: false, reason: "inactive", billingStatus }

  return { ok: true, userDoc, billingStatus }
}
