import { getLocale, getTranslations } from "next-intl/server";
import { getAllUsers } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleSelect } from "@/components/admin/role-select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Download } from "lucide-react";

export default async function AdminUsersPage() {
  const [users, t, locale] = await Promise.all([getAllUsers(), getTranslations("admin"), getLocale()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("usersTitle")}</h1>
        <Button asChild variant="outline" size="sm">
          <a href="/api/admin/export/users">
            <Download className="mr-1.5 h-4 w-4" /> {t("exportCsv")}
          </a>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("user")}</TableHead>
            <TableHead className="max-sm:hidden">{t("listingsCount")}</TableHead>
            <TableHead className="max-md:hidden">{t("registered")}</TableHead>
            <TableHead>{t("role")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="max-w-[160px] whitespace-normal break-words sm:max-w-none sm:whitespace-nowrap">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </TableCell>
              <TableCell className="max-sm:hidden">{user._count.listings}</TableCell>
              <TableCell className="max-md:hidden text-sm text-muted-foreground">{formatDate(user.createdAt, locale)}</TableCell>
              <TableCell>
                <RoleSelect userId={user.id} role={user.role} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
