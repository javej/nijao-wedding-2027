import NotFoundMessage from "@/components/404";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFoundPage() {
  return <NotFoundMessage />;
}
