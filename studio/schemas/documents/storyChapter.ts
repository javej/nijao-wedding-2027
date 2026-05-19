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
        "Marks this chapter as the proposal. The chapter renders with the scrapbook gallery layout using `images` instead of `image`. Only one chapter should have this enabled.",
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
        "The year this chapter represents (2017–2027). Required for every chapter, including the proposal.",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (value === undefined || value === null) return true;
          if (value < 2017 || value > 2027)
            return "Year must be between 2017 and 2027";
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
      hidden: ({ parent }) => parent?.isProposal === true,
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
      name: "images",
      title: "Gallery Images",
      type: "array",
      description:
        "Gallery photos for the proposal scrapbook layout. Used only when this chapter is marked as the proposal — other chapters should leave this empty and use the single `image` field above.",
      hidden: ({ parent }) => parent?.isProposal !== true,
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description:
                "Describe the image for screen readers (e.g., \"The ring against the Mt. Fuji view\").",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { isProposal?: boolean } | undefined;
          if (!doc?.isProposal) return true;
          if (!value || value.length === 0)
            return "The proposal chapter needs at least one gallery image";
          return true;
        }),
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
      galleryMedia: "images.0",
      isProposal: "isProposal",
    },
    prepare({ year, media, galleryMedia, isProposal }) {
      return {
        title: isProposal
          ? year
            ? `💍 Chapter ${year} — The Proposal`
            : "💍 The Proposal"
          : year
            ? `Chapter ${year}`
            : "New Chapter",
        media: isProposal ? galleryMedia ?? media : media,
      };
    },
  },
});
