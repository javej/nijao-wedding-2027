import { definePlugin } from "sanity";
import { Link2 } from "lucide-react";
import { GuestLinksTool } from "./GuestLinksTool";

/**
 * Studio tool that lists every guest with their personalized URL and a copy button.
 * Guest slugs are opaque random tokens, so this is the only place to look up a
 * shareable link before sending it out via Viber/WhatsApp.
 */
export const guestLinkGenerator = definePlugin({
  name: "guest-link-generator",
  tools: [
    {
      name: "guest-links",
      title: "Guest Links",
      icon: Link2,
      component: GuestLinksTool,
    },
  ],
});
