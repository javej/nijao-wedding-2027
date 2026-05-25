"use client";

import Image from "next/image";
import { useRef } from "react";
import { DressCodeLightbox, type DressCodeLightboxHandle } from "./DressCodeLightbox";

interface DressCodeCategoryCardProps {
  label: string;
  attire: string;
  imageSrc: string;
  imageAlt: string;
  /** Native intrinsic size of the source image; required for next/image. */
  imageWidth: number;
  imageHeight: number;
}

/**
 * DressCodeCategoryCard — Client Component
 *
 * One category cell in the dress-code stack: small uppercase label above
 * (category · attire type), watercolor illustration below. Tapping the
 * illustration opens a lightbox modal at full size.
 */
export function DressCodeCategoryCard({
  label,
  attire,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
}: DressCodeCategoryCardProps) {
  const lightboxRef = useRef<DressCodeLightboxHandle>(null);

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-body text-body-sm text-deep-matcha tracking-widest uppercase text-center">
        <span>{label}</span>
        <span aria-hidden="true" className="mx-1.5 opacity-60">·</span>
        <span className="opacity-80">{attire}</span>
      </p>
      <button
        type="button"
        onClick={() => lightboxRef.current?.open()}
        aria-label={`View ${label} dress code at full size`}
        className="block w-full rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-deep-matcha/40 cursor-zoom-in"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full h-auto"
        />
      </button>
      <DressCodeLightbox
        ref={lightboxRef}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        label={label}
      />
    </div>
  );
}
