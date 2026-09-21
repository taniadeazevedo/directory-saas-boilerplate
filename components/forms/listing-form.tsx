"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing-components";
import { listingSchema, type ListingInput } from "@/lib/validations";
import { createListing, updateListing } from "@/lib/actions";
import { Check, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Category = { id: string; name: string };

export function ListingForm({
  categories,
  listingId,
  defaultValues,
}: {
  categories: Category[];
  listingId?: string;
  defaultValues?: Partial<ListingInput>;
}) {
  const t = useTranslations("listingForm");
  const router = useRouter();
  const isEditing = !!listingId;
  const STEPS = isEditing
    ? ([t("steps.info"), t("steps.media")] as const)
    : ([t("steps.info"), t("steps.media"), t("steps.plan")] as const);

  const PLAN_OPTIONS = [
    { value: "BASIC", label: t("plans.basic.label"), price: t("plans.basic.price") },
    { value: "FEATURED", label: t("plans.featured.label"), price: t("plans.featured.price") },
    { value: "SPONSOR", label: t("plans.sponsor.label"), price: t("plans.sponsor.price") },
  ] as const;

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      tags: [],
      websiteUrl: "",
      description: "",
      logoUrl: "",
      images: [],
      plan: "BASIC",
      ...defaultValues,
    },
  });

  const tags = watch("tags");
  const images = watch("images");
  const logoUrl = watch("logoUrl");

  async function goNext() {
    const fieldsByStep: (keyof ListingInput)[][] = [
      ["title", "categoryId", "tags", "websiteUrl"],
      ["description", "logoUrl", "images"],
      ["plan"],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function addTag() {
    const value = tagInput.trim().toLowerCase();
    if (!value || tags.includes(value) || tags.length >= 6) return;
    setValue("tags", [...tags, value]);
    setTagInput("");
  }

  async function onSubmit(data: ListingInput) {
    setIsSubmitting(true);
    const result = isEditing ? await updateListing(listingId!, data) : await createListing(data);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    const checkoutUrl = (result as { checkoutUrl?: string }).checkoutUrl;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    toast.success(isEditing ? t("updatedSuccess") : t("createdSuccess"));
    router.push("/dashboard");
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium",
                i === step && "border-foreground bg-foreground text-background",
                i < step && "border-emerald-500 bg-emerald-500 text-white",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="max-sm:hidden text-sm sm:inline">{label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label>{t("title")}</Label>
                <Input {...register("title")} placeholder={t("titlePlaceholder")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t("category")}</Label>
                <Select value={watch("categoryId")} onValueChange={(v) => setValue("categoryId", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t("tags")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={t("tagsPlaceholder")}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    {t("addTag")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "tags",
                            tags.filter((t) => t !== tag),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("websiteUrl")}</Label>
                <Input {...register("websiteUrl")} placeholder="https://" />
                {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label>{t("description")}</Label>
                <Textarea {...register("description")} rows={6} placeholder={t("descriptionPlaceholder")} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>{t("logo")}</Label>
                {logoUrl ? (
                  <div className="flex items-center gap-3">
                    <Image src={logoUrl} alt={t("logoAlt")} width={48} height={48} className="rounded-lg border" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setValue("logoUrl", "")}>
                      {t("remove")}
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="listingImage"
                    onClientUploadComplete={(res) => setValue("logoUrl", res[0]?.url ?? "")}
                    onUploadError={(e) => {
                      toast.error(e.message);
                    }}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t("gallery")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src) => (
                    <div key={src} className="relative aspect-video overflow-hidden rounded-lg border">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                        onClick={() =>
                          setValue(
                            "images",
                            images.filter((i) => i !== src),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <UploadButton
                      endpoint="listingImage"
                      appearance={{ button: "h-full w-full" }}
                      content={{ button: <ImagePlus className="h-5 w-5" /> }}
                      onClientUploadComplete={(res) => {
                        const urls = res.map((f) => f.url);
                        setValue("images", [...images, ...urls].slice(0, 6));
                      }}
                      onUploadError={(e) => {
                        toast.error(e.message);
                      }}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              {PLAN_OPTIONS.map((plan) => (
                <button
                  type="button"
                  key={plan.value}
                  onClick={() => setValue("plan", plan.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors",
                    watch("plan") === plan.value && "border-foreground bg-muted",
                  )}
                >
                  <div>
                    <p className="font-medium">{plan.label}</p>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                  </div>
                  {watch("plan") === plan.value && <Check className="h-5 w-5" />}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            {t("back")}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              {t("next")}
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("sending") : t("publish")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
