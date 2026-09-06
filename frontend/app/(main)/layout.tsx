import { DisableDraftMode } from "@/components/disable-draft-mode";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { SanityLive } from "@/sanity/lib/live";
import { revalidateSanityTags } from "@/app/actions/revalidate-sanity";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>{children}</main>
      {/* `revalidateSanityTags` expires the changed tags and then asks the
          client to `router.refresh()`, so a publish in Studio lands in an
          already-open tab without the guest reloading. */}
      <SanityLive revalidateSyncTags={revalidateSanityTags} />
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </>
  );
}
