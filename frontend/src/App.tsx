import { useEffect, useState } from "react";
import { captureTokenFromUrl, isAuthed, signIn, signOut } from "./auth";
import { AuthError, fetchConfig, fetchManifest, fetchSeries } from "./api";
import { toggleTheme, useTheme } from "./theme";
import type { AppConfig, Manifest } from "./types";
import { renderComponent } from "./components";
import { SeriesProvider } from "./series";

captureTokenFromUrl();

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { dark } = useTheme();

  useEffect(() => {
    if (!authed) return;
    Promise.all([fetchConfig(), fetchManifest()])
      .then(([c, m]) => {
        setCfg(c);
        setManifest(m);
      })
      .catch((e) => {
        if (e instanceof AuthError) setAuthed(false);
        else setErr((e as Error)?.message || "Failed to load");
      });
  }, [authed]);

  if (!authed) {
    return (
      <div className="gate">
        <div className="gate-card">
          <div className="logo">A</div>
          <h1>Sign in</h1>
          <p>This app runs on Aditum&apos;s governed data platform. Sign in with your Aditum account to continue.</p>
          <button className="btn" onClick={signIn}>Sign in with Aditum</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-head">
        <div>
          <h1>{cfg?.app_name || "Aditum App"}</h1>
          <p>{cfg?.description}</p>
        </div>
        <div className="app-head-right">
          {cfg && (
            <span className="prov" title="Where this app's data comes from">
              {cfg.connectors.length
                ? `Live from ${cfg.connectors.map((c) => c.name).join(", ")} · governed`
                : "governed Aditum data"}
            </span>
          )}
          <button className="btn-ghost" onClick={toggleTheme} title="Toggle light / dark" aria-label="Toggle theme">
            {dark ? "☀" : "☾"}
          </button>
          <button className="btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {err && <div className="banner">{err}</div>}

      <SeriesProvider value={fetchSeries}>
        <main className="grid aditum-render">
          {manifest?.components.map((c) => (
            <section className={`card card-${c.type}`} key={c.id}>
              <h3>{c.title}</h3>
              {renderComponent(c)}
            </section>
          ))}
        </main>
      </SeriesProvider>

      <footer className="foot">
        Read-only · RBAC inherited from Aditum · no credentials in the browser · reference architecture{" "}
        {manifest?.reference_architecture}
      </footer>
    </div>
  );
}
