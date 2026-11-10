(() => {
  const script = document.currentScript;
  if (!script || script.dataset.disabled === "true") return;

  const configUrl = new URL(
    script.dataset.config || "RedirectAssist.txt",
    document.baseURI
  );

  const safeWebUrl = (value) => {
    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };

  const parseConfig = (text) => {
    const config = {};

    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator < 1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      config[key] = value;
    }

    return config;
  };

  const start = async () => {
    let config;

    try {
      const response = await fetch(configUrl.href, {
        cache: "no-store",
        mode: "cors"
      });

      if (!response.ok) return;
      config = parseConfig(await response.text());
    } catch {
      return;
    }

    if (!config.project || !config.target) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const targetValue =
      isMobile && config.target_mobile
        ? config.target_mobile
        : config.target;
    const target = safeWebUrl(targetValue);

    if (!target) return;

    let sessionCount = null;

    try {
      const key = `redirectassist:${config.project}`;
      sessionCount = Number(sessionStorage.getItem(key) || 0) + 1;
      sessionStorage.setItem(key, String(sessionCount));
    } catch {
      // Weiterleitung funktioniert auch ohne Sitzungsspeicher.
    }

    if (config.worker) {
      try {
        const workerUrl = new URL(config.worker);

        if (workerUrl.protocol === "https:") {
          fetch(workerUrl.href, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project: config.project,
              event: "redirect",
              sessionCount,
              deviceCategory: isMobile ? "mobile" : "desktop"
            }),
            mode: "cors",
            keepalive: true
          }).catch(() => {
            // Worker-Fehler verhindern den Redirect nicht.
          });
        }
      } catch {
        // Bei ungültiger Worker-URL wird kein Ereignis gesendet.
      }
    }

    const parsedDelay = Number(config.delay || 300);
    const delay = Number.isFinite(parsedDelay)
      ? Math.min(Math.max(parsedDelay, 0), 10000)
      : 300;

    window.setTimeout(() => {
      window.location.replace(target);
    }, delay);
  };

  start();
})();
