import { queryOptions } from "@tanstack/react-query";
import type { FeedWindow } from "./feed";
import type { Prefs } from "./data";
import { getGroupImages, getPersonalizedFeed } from "./youtube.functions";

export const feedQueryOptions = (prefs: Prefs, days: FeedWindow) => {
  const data = {
    group: prefs.group,
    members: [...prefs.members].sort(),
    cps: [...prefs.cps].sort(),
    stanType: prefs.stanType,
    interests: [...prefs.interests].sort(),
    days,
  };
  return queryOptions({
    queryKey: ["youtube-feed", data],
    queryFn: () => getPersonalizedFeed({ data }),
    staleTime: 300_000,
    retry: false,
  });
};

export const groupImagesQueryOptions = queryOptions({
  queryKey: ["group-images"],
  queryFn: () => getGroupImages(),
  staleTime: 3_600_000,
  retry: false,
});
