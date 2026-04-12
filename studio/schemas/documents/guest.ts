import { defineField, defineType } from "sanity";
import { User } from "lucide-react";

export default defineType({
  name: "guest",
  title: "Guest",
  type: "document",
  icon: User,
  fields: [
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used for personalized URLs (/[guest-slug])",
      options: {
        source: "firstName",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "plusOneEligible",
      title: "Plus-One Eligible",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "plusOneType",
      title: "Plus-One Type",
      type: "string",
      options: {
        list: [
          { title: "Linked", value: "linked" },
          { title: "Open", value: "open" },
        ],
        layout: "radio",
      },
      hidden: ({ document }) => !document?.plusOneEligible,
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.plusOneEligible && !value)
            return "Required when plus-one is eligible";
          if (!context.document?.plusOneEligible && value)
            return "Clear this field — plus-one is not eligible";
          return true;
        }),
    }),
    defineField({
      name: "plusOneLinkedGuest",
      title: "Plus-One Linked Guest",
      type: "reference",
      to: [{ type: "guest" }],
      hidden: ({ document }) => document?.plusOneType !== "linked",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.plusOneType === "linked" && !value)
            return "Required for linked plus-one";
          if (context.document?.plusOneType !== "linked" && value)
            return "Clear this field — plus-one type is not linked";
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "firstName",
      subtitle: "slug.current",
    },
  },
});
