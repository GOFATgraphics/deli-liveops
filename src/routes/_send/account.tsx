import { createFileRoute } from "@tanstack/react-router";
import { AccountPanel } from "@/components/send/account-panel";

export const Route = createFileRoute("/_send/account")({
  component: AccountPage,
  head: () => ({
    meta: [{ title: "Deli — Account" }],
  }),
});

function AccountPage() {
  return <AccountPanel />;
}
