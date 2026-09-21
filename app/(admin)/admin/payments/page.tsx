import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export default async function AdminPaymentsPage() {
  const [subscriptions, t, locale] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { user: { select: { name: true, email: true } } },
    }),
    getTranslations("admin"),
    getLocale(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">{t("paymentsTitle")}</h1>
      <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("user")}</TableHead>
            <TableHead className="max-sm:hidden">{t("plan")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="max-md:hidden">{t("renews")}</TableHead>
            <TableHead className="max-md:hidden">{t("since")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="max-w-[160px] whitespace-normal break-words sm:max-w-none sm:whitespace-nowrap">
                <p className="font-medium">{sub.user.name}</p>
                <p className="text-xs text-muted-foreground">{sub.user.email}</p>
              </TableCell>
              <TableCell className="max-sm:hidden text-sm">{sub.plan}</TableCell>
              <TableCell>
                <Badge variant={sub.status === "ACTIVE" ? "default" : "outline"}>{sub.status}</Badge>
              </TableCell>
              <TableCell className="max-md:hidden text-sm text-muted-foreground">
                {sub.renewsAt ? formatDate(sub.renewsAt, locale) : "—"}
              </TableCell>
              <TableCell className="max-md:hidden text-sm text-muted-foreground">{formatDate(sub.createdAt, locale)}</TableCell>
            </TableRow>
          ))}
          {subscriptions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                {t("noSubscriptions")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
