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
      description: "Short headline shown at the top of the announcement.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "block-content",
      description: "Rich text body of the announcement.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description:
        "Ordering timestamp — announcements sort newest first on the site.",
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "scheduledAt",
      title: "Schedule for later",
      type: "datetime",
      description:
        "Leave empty to publish immediately. If set, the announcement is hidden on the site until this date/time passes — no need to come back and click Publish again.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      publishedAt: "publishedAt",
      scheduledAt: "scheduledAt",
    },
    prepare({ title, publishedAt, scheduledAt }) {
      // Pin display to Asia/Manila so admins anywhere see wedding-local time.
      const formatDate = (iso: string) =>
        new Date(iso).toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        });

      let subtitle = "No publish date";
      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        subtitle = `⏰ Scheduled for ${formatDate(scheduledAt)}`;
      } else if (publishedAt) {
        subtitle = formatDate(publishedAt);
      }

      return {
        title: title || "Untitled Announcement",
        subtitle,
      };
    },
  },
});
