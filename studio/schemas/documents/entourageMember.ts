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
      options: { hotspot: true },
    }),
    defineField({
      name: "isPadrino",
      title: "Is Padrino",
      type: "boolean",
      description:
        "Used to filter for the Digital Padrino Wall vs. full entourage list",
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
