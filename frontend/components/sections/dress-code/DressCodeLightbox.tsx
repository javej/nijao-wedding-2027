"use client";

import Image from "next/image";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface DressCodeLightboxHandle {
  open: () => void;
}

interface DressCodeLightboxProps {
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /** Used to compose the aria label on the modal. */
  label: string;
}

/**
 * DressCodeLightbox — Client Component
 *
 * Native <dialog> modal that displays a single watercolor illustration at
 * full screen. Opened imperatively via the ref handle (so the trigger lives
 * on the CategoryCard, but the modal sits beside it without prop-drilling).
 *
 * Dialogs handle the Esc-to-close and focus-trap behaviour natively. We
 * close on any click of the backdrop or the inline close button.
 */
export const DressCodeLightbox = forwardRef<DressCodeLightboxHandle, DressCodeLightboxProps>(
  function DressCodeLightbox(
    { imageSrc, imageAlt, imageWidth, imageHeight, label },
    ref,
  ) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.showModal(),
    }));

    const close = () => dialogRef.current?.close();

    // Backdrop click closes the modal — but only when the click landed on
    // the dialog element itself, not on a child. Without this guard, taps
    // on the image content would close the modal.
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) close();
    };

    return (
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-label={`${label} dress code — full size`}
        className="m-0 max-w-none max-h-none w-screen h-screen bg-black/80 p-0 overflow-hidden"
      >
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            sizes="100vw"
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close dress code preview"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-text-on-light flex items-center justify-center text-xl leading-none focus:outline-none focus:ring-2 focus:ring-white"
          >
            {/* Visual glyph only — screen readers get the aria-label above. */}
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </dialog>
    );
  },
);
