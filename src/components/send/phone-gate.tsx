import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMySender } from "@/lib/sender-data";

export function PhoneGate({
  initialName,
  initialPhone = "",
  onSaved,
}: {
  initialName: string;
  initialPhone?: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await saveMySender({ data: { name, phone } });
      toast.success("Phone saved");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl bg-raised p-5 shadow-[var(--shadow-hairline)]">
      <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Your number</p>
      <h2 className="font-display mt-1 text-xl tracking-tight">How do we reach you?</h2>
      <p className="mt-2 text-sm text-muted">
        The fleet only gets this after you pay. Add the WhatsApp or line you actually answer.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <Label>Business name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 …" inputMode="tel" />
        </label>
        <Button type="button" disabled={busy || name.trim().length < 2 || phone.trim().length < 7} onClick={() => void save()}>
          Save and continue
        </Button>
      </div>
    </div>
  );
}
