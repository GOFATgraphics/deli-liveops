import { createFileRoute } from "@tanstack/react-router";
import { AccountPanel } from "@/components/send/account-panel";
import { SenderLayout } from "@/components/send/sender-shell";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [{ title: "Deli — Account" }],
  }),
});

function AccountPage() {
  return (
    <SenderLayout>
      <AccountPanel />
    </SenderLayout>
  );
}
