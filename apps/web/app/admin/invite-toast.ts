import type { InviteResult } from "@darbha/types";
import type { useToast } from "./toast";

/** One wording for invite outcomes, whether from approval or the Sites page. */
export function toastInviteOutcome(
  toast: ReturnType<typeof useToast>,
  email: string,
  invite: InviteResult,
  { siteCreated = false }: { siteCreated?: boolean } = {},
) {
  if (invite.sent) {
    if (invite.reason) toast.error(`Invite email sent to ${email}, but ${invite.reason}.`);
    else toast.success(`Invite email sent to ${email} — they set their own password.`);
  } else if (invite.alreadyRegistered) {
    if (invite.reason) toast.error(`Heads up: ${invite.reason}.`);
    else toast.success(`${email} already has a login — linked it to the site.`);
  } else {
    toast.error(
      `${siteCreated ? "Site created, but the" : "The"} invite email didn't go out: ${
        invite.reason ?? "unknown error"
      }. Onboard them manually.`,
    );
  }
}
