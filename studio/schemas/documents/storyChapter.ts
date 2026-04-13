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
      name: "isProposal",
      title: "Proposal Chapter",
      type: "boolean",
      description:
        "Toggle on for the Mt. Fuji proposal chapter. Only one chapter should have this enabled.",
      initialValue: false,
      validation: (rule) =>
        rule.custom(async (value, context) => {
          if (!value) return true;
          const client = context.getClient({ apiVersion: "2024-01-01" });
          const rawId = (context.document?._id ?? "").replace(/^drafts\./, "");
          const count = await client.fetch(
            `count(*[_type == "storyChapter" && isProposal == true && !(_id in [$id, "drafts." + $id])])`,
            { id: rawId },
          );
          return count > 0
            ? "Another chapter is already marked as the proposal"
            : true;
        }),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { isProposal?: boolean } | undefined;
          if (doc?.isProposal) return true;
          if (!value) return "Year is required for non-proposal chapters";
          if (value < 2017 || value > 2027) return "Year must be between 2017 and 2027";
          return true;
        }),
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
      isProposal: "isProposal",
    },
    prepare({ year, media, isProposal }) {
      return {
        title: isProposal
          ? "💍 The Proposal"
          : year
            ? `Chapter ${year}`
            : "New Chapter",
        media,
      };
    },
  },
});
