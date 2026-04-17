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
      description: "Guest's first name — used in the personalized arrival greeting.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Personalized URL Slug",
      type: "slug",
      description:
        "Non-guessable random token for the guest's personalized URL. Click Generate once — the slug is locked after creation to prevent breaking already-shared links.",
      options: {
        source: "firstName",
        maxLength: 10,
        slugify: () => {
          const array = new Uint8Array(8);
          crypto.getRandomValues(array);
          const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
          return Array.from(array, (b) => chars[b % 36]).join("");
        },
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      // Lock the slug only once the guest is published (i.e. invitations may have
      // been shared). Drafts stay editable so typos can be regenerated before send.
      readOnly: ({ document }) =>
        Boolean(
          document?._id &&
            !(document._id as string).startsWith("drafts.") &&
            document?.slug,
        ),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "plusOneEligible",
      title: "Plus-One Eligible",
      type: "boolean",
      description:
        "Allow this guest to bring a plus-one when they RSVP. Leave off for single invites.",
      initialValue: false,
    }),
    defineField({
      name: "plusOneType",
      title: "Plus-One Type",
      type: "string",
      description:
        "Linked: partner is a known guest with their own invite. Open: guest can bring anyone and enter a name during RSVP.",
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
          return true;
        }),
    }),
    defineField({
      name: "plusOneLinkedGuest",
      title: "Plus-One Linked Guest",
      type: "reference",
      to: [{ type: "guest" }],
      description:
        "The partner guest whose name will appear in the RSVP prompt (e.g., \"Will [partner] be joining you?\").",
      hidden: ({ document }) =>
        !document?.plusOneEligible || document?.plusOneType !== "linked",
      validation: (rule) =>
        rule.custom((value: { _ref?: string } | undefined, context) => {
          const eligible = context.document?.plusOneEligible;
          const type = context.document?.plusOneType;
          if (eligible && type === "linked" && !value)
            return "Required for linked plus-one";
          if (value?._ref && context.document?._id) {
            const selfId = (context.document._id as string).replace(
              /^drafts\./,
              "",
            );
            if (value._ref === selfId)
              return "A guest can't be linked as their own plus-one.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      firstName: "firstName",
      slug: "slug.current",
      plusOneEligible: "plusOneEligible",
      plusOneType: "plusOneType",
      linkedFirstName: "plusOneLinkedGuest.firstName",
    },
    prepare({ firstName, slug, plusOneEligible, plusOneType, linkedFirstName }) {
      let subtitle = slug ? `/${slug}` : "(no slug yet)";
      if (plusOneEligible) {
        if (plusOneType === "linked" && linkedFirstName) {
          subtitle += `  •  +1 linked: ${linkedFirstName}`;
        } else if (plusOneType === "open") {
          subtitle += "  •  +1 open";
        } else {
          subtitle += "  •  +1 eligible";
        }
      }
      return {
        title: firstName || "(no name)",
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "First name, A–Z",
      name: "firstNameAsc",
      by: [{ field: "firstName", direction: "asc" }],
    },
    {
      title: "First name, Z–A",
      name: "firstNameDesc",
      by: [{ field: "firstName", direction: "desc" }],
    },
  ],
});
