"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function GalleryLightbox({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("gallery");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function close() {
    setOpenIndex(null);
  }

  function next() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  function prev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="card-hover block overflow-hidden rounded-xl border"
          >
            <Image
              src={src}
              alt={t("screenshotAlt", { alt, index: i + 1 })}
              width={300}
              height={200}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent
          className="fixed top-0 right-0 bottom-0 left-0 flex! w-auto! max-w-none! translate-none! items-center justify-center border-none bg-transparent p-4 shadow-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{t("galleryOf", { alt })}</DialogTitle>
          <div className="relative flex w-full max-w-4xl items-center justify-center">
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-10 rounded-full shadow-lg"
              onClick={close}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("close")}</span>
            </Button>

            <AnimatePresence mode="wait">
              {openIndex !== null && (
                <motion.div
                  key={openIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
                >
                  <Image
                    src={images[openIndex]}
                    alt={t("screenshotAlt", { alt, index: openIndex + 1 })}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 64rem, 92vw"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={prev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={next}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
