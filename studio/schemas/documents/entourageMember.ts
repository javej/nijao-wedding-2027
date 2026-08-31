import { defineField, defineType } from "sanity";
import { Users } from "lucide-react";
import { orderRankField } from "@sanity/orderable-document-list";

/**
 * Canonical role list, in cultural display order. The dropdown `value`s are
 * the exact title-case strings stored on the documents themselves, so the
 * frontend can match on them directly.
 *
 * Renaming a value here orphans the documents still holding the old string
 * (the frontend drops them into an "unknown role" bucket), so every rename
 * needs a paired remap script — see `migrations/0002-bearer-roles.ts` for
 * the Ring Bearer / Bible & Coin Bearer split.
 *
 * The frontend derives BOTH the section (Ninong/Ninang → Padrino Wall,
 * everything else → Wedding Party) and the within-section group order from
 * this same order, so there is no separate `isPadrino` toggle to drift.
 */
const ROLE_OPTIONS = [
  { title: "Ninong", value: "Ninong" },
  { title: "Ninang", value: "Ninang" },
  { title: "Best Man", value: "Best Man" },
  { title: "Maid of Honor", value: "Maid of Honor" },
  { title: "Groomsman", value: "Groomsman" },
  { title: "Bridesmaid", value: "Bridesmaid" },
  { title: "Candle Sponsor", value: "Candle Sponsor" },
  { title: "Veil Sponsor", value: "Veil Sponsor" },
  { title: "Cord Sponsor", value: "Cord Sponsor" },
  { title: "Coin & Ring Bearer", value: "Coin & Ring Bearer" },
  { title: "Bible Bearer", value: "Bible Bearer" },
  { title: "Flower Girl", value: "Flower Girl" },
] as const;

export default defineType({
  name: "entourageMember",
  title: "Entourage Member",
  type: "document",
  icon: Users,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description:
        "Ninongs and Ninangs appear in the Padrino Wall; every other role appears in the Wedding Party. Names are grouped under their role on the site.",
      options: {
        list: [...ROLE_OPTIONS],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo (deprecated)",
      type: "image",
      description:
        "No longer shown on the site — the entourage now displays names only. Kept so previously uploaded photos are not lost.",
      // Hidden from the Studio form (the site never renders it), but the field
      // stays in the schema so existing photo data is preserved without
      // triggering "unknown field" warnings.
      hidden: true,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Optional. Describe the photo for screen readers. Leave empty to use \"Photo of <name>\" automatically.",
        }),
      ],
    }),
    orderRankField({ type: "entourageMember" }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
    },
  },
});
