import {
  getAllAnnouncementsForDebug,
  getAnnouncements,
  type AnnouncementSummary,
} from "@/sanity/queries/announcements";

export const revalidate = 60;

function fmt(iso: string | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function classify(row: AnnouncementSummary): "visible" | "scheduled" {
  if (!row.scheduledAt) return "visible";
  return new Date(row.scheduledAt) > new Date() ? "scheduled" : "visible";
}

export default async function AnnouncementsDebugPage() {
  const [visible, all] = await Promise.all([
    getAnnouncements(),
    getAllAnnouncementsForDebug(),
  ]);

  const visibleIds = new Set(visible.map((a) => a._id));
  const hiddenByScheduling = all.filter(
    (a) => !visibleIds.has(a._id) && classify(a) === "scheduled",
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl mb-2">Announcements — Debug</h1>
      <p className="text-sm text-text-on-light/70 mb-8">
        Dev-only. Dataset snapshot (Asia/Manila time). ISR revalidate = 60s, so
        scheduled items appear up to 60s after their <code>scheduledAt</code>.
      </p>

      <section className="mb-10">
        <h2 className="font-display text-2xl mb-3">
          Visible now ({visible.length})
        </h2>
        {visible.length === 0 ? (
          <p className="text-sm text-text-on-light/60">
            No announcements currently visible.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded border border-black/10">
            {visible.map((a) => (
              <li key={a._id} className="p-4">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-text-on-light/60 mt-1">
                  publishedAt: {fmt(a.publishedAt)}
                  {a.scheduledAt ? ` · scheduledAt: ${fmt(a.scheduledAt)}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl mb-3">
          Scheduled — hidden until their time ({hiddenByScheduling.length})
        </h2>
        {hiddenByScheduling.length === 0 ? (
          <p className="text-sm text-text-on-light/60">
            No announcements are waiting on a future <code>scheduledAt</code>.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded border border-black/10">
            {hiddenByScheduling.map((a) => (
              <li key={a._id} className="p-4">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-text-on-light/60 mt-1">
                  scheduledAt: {fmt(a.scheduledAt)} · publishedAt:{" "}
                  {fmt(a.publishedAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl mb-3">All ({all.length})</h2>
        {all.length === 0 ? (
          <p className="text-sm text-text-on-light/60">
            No announcement documents in Sanity yet.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded border border-black/10">
            {all.map((a) => (
              <li key={a._id} className="p-4 flex items-baseline gap-3">
                <span
                  className={
                    classify(a) === "visible"
                      ? "text-green-700 text-xs font-mono"
                      : "text-amber-700 text-xs font-mono"
                  }
                >
                  {classify(a) === "visible" ? "VISIBLE " : "SCHEDULED"}
                </span>
                <span className="font-semibold">{a.title}</span>
                <span className="ml-auto text-xs text-text-on-light/60">
                  {a.scheduledAt ? fmt(a.scheduledAt) : fmt(a.publishedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
