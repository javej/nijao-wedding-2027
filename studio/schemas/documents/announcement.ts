import { defineField, defineType } from "sanity";
import { Megaphone } from "lucide-react";

export default defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  icon: Megaphone,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "block-content",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "scheduledAt",
      title: "Scheduled At",
      type: "datetime",
      description:
        "If set, this announcement will be visible on the site only after this date/time",
    }),
  ],
  preview: {
    select: {
      title: "title",
      publishedAt: "publishedAt",
    },
    prepare({ title, publishedAt }) {
      return {
        title: title || "Untitled Announcement",
        subtitle: publishedAt
          ? new Date(publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "No publish date",
      };
    },
  },
});
