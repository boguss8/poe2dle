import CookieSettingsButton from "@/components/consent/CookieSettingsButton";

const REPO_URL = "https://github.com/boguss8/poe2dle";

export default function Footer() {
  return (
    <footer className="mt-4 px-4 pb-10 pt-6 text-center text-sm leading-relaxed text-muted">
      <nav
        aria-label="Project links"
        className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-bold text-foreground"
      >
        <a href={REPO_URL} className="link" target="_blank" rel="noreferrer">
          Source code on GitHub
        </a>
        <span aria-hidden="true">-</span>
        <a href={`${REPO_URL}/issues`} className="link" target="_blank" rel="noreferrer">
          Report a problem
        </a>
        <span aria-hidden="true">-</span>
        <CookieSettingsButton />
      </nav>

      <p className="mx-auto max-w-3xl">
        PoE2dle is an unofficial, non-commercial fan project. It is not
        affiliated with, endorsed by or sponsored by Grinding Gear Games.
      </p>
      <p className="mx-auto mt-2 max-w-3xl">
        Path of Exile and Path of Exile 2, their names, logos, skill names and
        game artwork (including the skill icons shown here) are trademarks and
        copyright of &copy; Grinding Gear Games Limited, and remain the property
        of their owners.
      </p>
      <p className="mx-auto mt-2 max-w-3xl">
        Game data from the{" "}
        <a href="https://repoe-fork.github.io/poe2/" className="link" target="_blank" rel="noreferrer">
          RePoE fork
        </a>
        , icons via{" "}
        <a href="https://image.ggpk.exposed/" className="link" target="_blank" rel="noreferrer">
          ggpk.exposed
        </a>
        , in-game text set in Fontin, a font by{" "}
        <a href="https://www.exljbris.com" className="link" target="_blank" rel="noreferrer">
          Jos Buivenga (exljbris)
        </a>
        .
      </p>
    </footer>
  );
}
