import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { getArtist } from "./artists";
import { normalizeRequest, type FeedResponse } from "./feed";

const emptySections = () => ({ official: [], bias: [], cp: [], buzz: [] });

export const getPersonalizedFeed = createServerFn({ method: "GET" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<FeedResponse> => {
    const artist = getArtist((data as { group?: string } | null)?.group);
    if (!artist) throw new Error("Unknown group");
    const req = normalizeRequest(data, artist);
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) {
      return {
        status: "not_configured",
        group_id: artist.group_id,
        days: req.days,
        support: artist.demo_support_status,
        sections: emptySections(),
        queries: [],
        notices: ["YouTube isn't configured yet: set GOOGLE_API_KEY on the server."],
        updated_at: null,
        served_from_cache: false,
      };
    }
    const { buildFeed } = await import("./youtube.server");
    const feed = await buildFeed(artist, req, key);
    // The server-side cache already dedupes API calls; a browser cache would make Refresh a no-op.
    setResponseHeader("Cache-Control", "no-store");
    return feed;
  });

export const getGroupImages = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string | null>> => {
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) return {};
    const { fetchGroupImages } = await import("./youtube.server");
    try {
      return await fetchGroupImages(key);
    } catch {
      return {};
    }
  },
);
