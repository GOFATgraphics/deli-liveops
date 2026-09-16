import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InstallApp } from "@/components/install-app";
import { PartnerPhoto } from "@/components/ops/partner-photo";
import { useSenderSession } from "@/components/send/sender-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { fileToImageDataUrl } from "@/lib/image";
import { saveMySender } from "@/lib/sender-data";

export function AccountPanel() {
  const user = useCurrentUser();
  const { profile, refresh } = useSenderSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [logo, setLogo] = useState(profile?.logo ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setLogo(profile?.logo ?? "");
  }, [profile?.name, profile?.phone, profile?.logo]);

  async function onLogo(file: File | undefined) {
    if (!file) return;
    try {
      setLogo(await fileToImageDataUrl(file, 512));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read logo");
    }
  }

  async function save() {
    setBusy(true);
    try {
      await saveMySender({ data: { name, phone, logo } });
      toast.success("Account saved");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 md:p-6">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Account</p>
          <h1 className="font-display mt-1 text-2xl tracking-tight">Your business</h1>
          <p className="mt-1 text-sm text-muted">Name, phone, and logo on the job. Sign out from the avatar.</p>
        </div>
        <div className="rounded-xl bg-raised p-5 shadow-[var(--shadow-hairline)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <PartnerPhoto src={logo} alt={name || "Business logo"} className="size-16 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Label>Business logo</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => void onLogo(event.target.files?.[0])}
                />
                <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => fileRef.current?.click()}>
                  <ImagePlus />
                  Upload logo
                </Button>
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <Label>Business name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 …" inputMode="tel" />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input value={user?.primaryEmail ?? ""} readOnly className="text-muted" />
            </label>
            <Button type="button" disabled={busy || name.trim().length < 2 || phone.trim().length < 7} onClick={() => void save()}>
              Save
            </Button>
          </div>
        </div>
        <InstallApp />
      </div>
    </div>
  );
}
