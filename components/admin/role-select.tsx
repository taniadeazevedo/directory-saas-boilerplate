"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setUserRole } from "@/lib/actions";
import { toast } from "sonner";
import type { UserRole } from "@/types/next-auth";

export function RoleSelect({ userId, role }: { userId: string; role: UserRole }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      await setUserRole(userId, value as UserRole);
      toast.success(t("roleUpdated"));
      router.refresh();
    });
  }

  return (
    <Select defaultValue={role} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">USER</SelectItem>
        <SelectItem value="LISTER">LISTER</SelectItem>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
      </SelectContent>
    </Select>
  );
}
