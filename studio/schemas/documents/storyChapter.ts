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
      rows: 3,
      description:
        "Short caption shown under the chapter image. A few sentences, 280 characters max — the album page reserves a fixed caption zone so the photo stays the same size in every chapter (see ADR-0007).",
      validation: (rule) =>
        rule
          .required()
          .max(280)
          .error("Keep the caption to 280 characters so it fits the album page without crowding the photo."),
    }),
    defineField({
      name: "image",
      title: "Image (legacy — single photo)",
      type: "image",
      description:
        "Single-photo fallback. Used only when 'Gallery Images' below is empty. Prefer Gallery Images for new chapters — they support the cinematic crossfade with 2–3 photos per year.",
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
      name: "images",
      title: "Gallery Images",
      type: "array",
      description:
        "Photos shown in this chapter. Year chapters use the first 5 in an auto-cycle crossfade with Ken Burns zoom. The proposal chapter uses up to 5 in the scroll-pinned stacking sequence. Leave empty to fall back to the legacy single 'Image' above.",
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
          const doc = context.document as
            | { isProposal?: boolean; image?: unknown }
            | undefined;
          // Proposal must have at least one gallery image — the stacking
          // mechanic has no single-image fallback rendering path.
          if (doc?.isProposal) {
            if (!value || value.length === 0)
              return "The proposal chapter needs at least one gallery image";
          }
          // For year chapters, EITHER images OR the legacy single image
          // must be populated — otherwise the chapter renders empty.
          if (!doc?.isProposal) {
            const hasGallery = value && value.length > 0;
            const hasLegacy = !!doc?.image;
            if (!hasGallery && !hasLegacy)
              return "Add at least one Gallery Image or fill in the legacy single Image above";
          }
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
