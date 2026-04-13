import { defineField, defineType } from "sanity";
import { CalendarHeart } from "lucide-react";

export default defineType({
  name: "weddingDetails",
  title: "Wedding Details",
  type: "document",
  icon: CalendarHeart,
  fields: [
    // Ceremony
    defineField({
      name: "ceremonyVenue",
      title: "Ceremony Venue",
      type: "string",
      description: 'e.g., "St. Therese Parish"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ceremonyDate",
      title: "Ceremony Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ceremonyTime",
      title: "Ceremony Time",
      type: "string",
      description: 'e.g., "2:00 PM"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ceremonyAddress",
      title: "Ceremony Address",
      type: "text",
      description: "Full address of the ceremony venue",
    }),
    defineField({
      name: "ceremonyMapUrl",
      title: "Ceremony Map URL",
      type: "url",
      description: "Optional Google Maps link for the ceremony venue",
    }),

    // Reception
    defineField({
      name: "receptionVenue",
      title: "Reception Venue",
      type: "string",
      description: 'e.g., "Casa 10 22"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "receptionDate",
      title: "Reception Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "receptionTime",
      title: "Reception Time",
      type: "string",
      description: 'e.g., "6:00 PM"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "receptionAddress",
      title: "Reception Address",
      type: "text",
      description: "Full address including city (e.g., Lipa, Batangas)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "receptionMapUrl",
      title: "Reception Map URL",
      type: "url",
      description: "Optional Google Maps link for the reception venue",
    }),

    // General
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      ceremonyVenue: "ceremonyVenue",
      receptionVenue: "receptionVenue",
    },
    prepare({ ceremonyVenue, receptionVenue }) {
      return {
        title: "Wedding Details",
        subtitle: [ceremonyVenue, receptionVenue].filter(Boolean).join(" → "),
      };
    },
  },
});
