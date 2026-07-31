import { createContext, useContext, useEffect, useState } from "react";
import type { Point } from "./types";

// The renderer's data source is INJECTED, so the exact same components render in
// the deployed app (fetching its FastAPI backend) and in the builder preview
// (fetching the governed proxy). This is the seam that guarantees preview ==
// deployed: one renderer, two data sources.
export type SeriesFetcher = (tag: string, windowDays: number) => Promise<Point[]>;

const SeriesContext = createContext<SeriesFetcher>(async () => []);
export const SeriesProvider = SeriesContext.Provider;

export function useMultiSeries(tags: string[], windowDays: number) {
  const fetchSeries = useContext(SeriesContext);
  const [data, setData] = useState<Record<string, Point[]>>({});
  const [loading, setLoading] = useState(true);
  const key = tags.join(",") + "|" + windowDays;
  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all(tags.map((t) => fetchSeries(t, windowDays).then((p) => [t, p] as const))).then((pairs) => {
      if (!alive) return;
      const m: Record<string, Point[]> = {};
      for (const [t, p] of pairs) m[t] = p;
      setData(m);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // fetchSeries is stable per app; key encodes tags + window
  }, [key]);
  return { data, loading };
}
