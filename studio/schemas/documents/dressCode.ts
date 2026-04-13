import { defineField, defineType } from "sanity";
import { Shirt } from "lucide-react";

export default defineType({
  name: "dressCode",
  title: "Dress Code",
  type: "document",
  icon: Shirt,
  fields: [
    defineField({
      name: "label",
      title: "Dress Code Label",
      type: "string",
      description: 'e.g., "Semi-Formal" or "Formal Filipiniana"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "block-content",
      description: "Dress code guidance and notes for guests",
    }),
    defineField({
      name: "paletteColors",
      title: "Palette Colors",
      type: "array",
      description: "Wedding palette colors guests should incorporate",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "colorKey",
              title: "Color Key",
              type: "string",
              description: "One of the 8 wedding palette keys",
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
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "colorLabel",
              title: "Color Label",
              type: "string",
              description:
                'Human-readable description (e.g., "Deep Matcha — a dark green")',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              colorKey: "colorKey",
              colorLabel: "colorLabel",
            },
            prepare({ colorKey, colorLabel }) {
              return {
                title: colorLabel || colorKey,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "inspirationImages",
      title: "Inspiration Images",
      type: "array",
      description: "Optional curated dress inspiration photos",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "additionalNotes",
      title: "Additional Notes",
      type: "text",
      description: "Optional additional guidance for guests",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      label: "label",
    },
    prepare({ label }) {
      return {
        title: "Dress Code",
        subtitle: label || "No label set",
      };
    },
  },
});
