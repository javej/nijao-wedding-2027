import { defineField, defineType } from "sanity";
import { Users } from "lucide-react";
import { orderRankField } from "@sanity/orderable-document-list";

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
        'e.g., "Ninong", "Ninang", "Best Man", "Maid of Honor", "Groomsman", "Bridesmaid"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "colorAssignment",
      title: "Color Assignment",
      type: "string",
      description:
        "Accent color used for this member's card on the site. Rotate through the palette so adjacent cards look distinct.",
      options: {
        list: [
          { title: "Deep Matcha", value: "deep-matcha" },
          { title: "Raspberry", value: "raspberry" },
          { title: "Golden Matcha", value: "golden-matcha" },
          { title: "Strawberry Jam", value: "strawberry-jam" },
          { title: "Matcha Chiffon", value: "matcha-chiffon" },
          { title: "Berry Meringue", value: "berry-meringue" },
          { title: "Matcha Latte", value: "matcha-latte" },
          { title: "Strawberry Milk", value: "strawberry-milk" },
        ],
      },
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      description:
        "Square-ish headshot works best. Drag to reposition the focal point so the face stays centered when cropped to a circle.",
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
    defineField({
      name: "isPadrino",
      title: "Is Padrino",
      type: "boolean",
      description:
        "Enable for Ninongs and Ninangs — they will appear in the Digital Padrino Wall. Leave off for the wedding party (best man, maid of honor, groomsmen, bridesmaids).",
      initialValue: false,
    }),
    orderRankField({ type: "entourageMember" }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
});
