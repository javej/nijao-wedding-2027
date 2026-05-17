import { definePlugin } from "sanity";
import { ClipboardList } from "lucide-react";
import { RsvpDashboardTool } from "./RsvpDashboardTool";

/**
 * Studio tool that shows a live RSVP headcount, the full response list, and a
 * CSV export button — reading from Google Sheets via a backend API route.
 * Keeps guest personal data out of Sanity (NFR-S7).
 */
export const rsvpDashboard = definePlugin({
  name: "rsvp-dashboard",
  tools: [
    {
      name: "rsvp-dashboard",
      title: "RSVP Dashboard",
      icon: ClipboardList,
      component: RsvpDashboardTool,
    },
  ],
});
