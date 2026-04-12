import { defineField, defineType } from "sanity";
import { BookOpen } from "lucide-react";
import { orderRankField } from "@sanity/orderable-document-list";

export default defineType({
  name: "storyChapter",
  title: "Story Chapter",
  type: "document",
  icon: BookOpen,
  fields: [
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.required().min(2017).max(2027),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
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
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Manual sort order for frontend GROQ queries. orderRank (below) handles Studio drag-and-drop only.",
    }),
    orderRankField({ type: "storyChapter" }),
  ],
  preview: {
    select: {
      year: "year",
      media: "image",
    },
    prepare({ year, media }) {
      return {
        title: year ? `Chapter ${year}` : "New Chapter",
        media,
      };
    },
  },
});
