"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import PortableTextRenderer from "@/components/portable-text-renderer";
import type { FaqResult } from "@/sanity/queries/faqs";

interface FAQAccordionProps {
  items: FaqResult[];
}

/**
 * Multiple-open accordion of FAQ questions, all collapsed on load. Themed to
 * the chapter's paper-white bg: question text uses the bg-aware
 * `text-text-on-light` token, while the chevron and dividers carry the AA-safe
 * `deep-matcha` accent (`berry-meringue` — the section stripe — fails contrast
 * as text, so it never appears here). Answers render the full portable-text
 * body via the shared renderer.
 */
export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <AccordionPrimitive.Root type="multiple" className="w-full">
      {items.map((faq) => (
        <AccordionPrimitive.Item
          key={faq._id}
          value={faq._id}
          className="border-b border-deep-matcha/15 last:border-b-0"
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="group flex flex-1 items-start justify-between gap-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-deep-matcha/40 rounded-sm">
              <span className="font-display font-normal text-xl md:text-2xl leading-snug text-text-on-light">
                {faq.title}
              </span>
              <ChevronDownIcon
                aria-hidden
                className="mt-1 size-5 shrink-0 text-deep-matcha transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pb-5 font-body text-body-md text-text-on-light/80">
              {faq.body ? (
                <PortableTextRenderer value={faq.body} />
              ) : null}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
