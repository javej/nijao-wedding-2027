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
      description:
        "The year this chapter represents (2017–2027). Leave empty only for the proposal chapter.",
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
      description: "Short caption shown under the chapter image (1–2 sentences).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Drag to reposition focal point after upload — the crop adjusts automatically across screen sizes.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Describe the image for screen readers and SEO (e.g., \"Jave and Nianne on their first date, 2017\").",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "Informational timestamp — does not control visibility (use Publish/Unpublish).",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Manual sort order for the frontend (ascending). Lower numbers appear first. Drag-and-drop in the Studio list also updates ordering automatically.",
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
