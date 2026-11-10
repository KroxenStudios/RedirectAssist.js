# RedirectAssist.js

RedirectAssist.js is a client-side JavaScript tool for configured redirects and basic session-based traffic counting. It loads `RedirectAssist.txt` from the website, redirects visitors to the configured destination, and can send an event to a public HTTPS worker.

## Installation

Place `RedirectAssist.txt` in your website’s root directory and include the script:

```html
<script
  src="https://raw.githubusercontent.com/KroxenStudios/RedirectAssist.js/main/redirectassist.js"
  defer>
</script>
```

If the configuration file is in a different location, set its path with `data-config`:

```html
<script
  src="https://raw.githubusercontent.com/KroxenStudios/RedirectAssist.js/main/redirectassist.js"
  data-config="/config/RedirectAssist.txt"
  defer>
</script>
```

The path is resolved relative to the website. `data-config` can also be a complete URL.

## Configuration

Example `RedirectAssist.txt`:

```text
# RedirectAssist configuration
project=project-123
target=https://example.com/desktop
target_mobile=https://example.com/mobile
worker=https://my-worker.example.workers.dev/collect
delay=300
```

| Key | Required | Description |
|---|---:|---|
| `project` | Yes | Project identifier used for the session counter and worker event. |
| `target` | Yes | Default redirect destination. HTTP and HTTPS destinations are supported. |
| `target_mobile` | No | Destination for devices with a viewport width of 768 pixels or less. Falls back to `target` if omitted. |
| `worker` | No | HTTPS URL of the worker that accepts redirect events. |
| `delay` | No | Redirect delay in milliseconds. Defaults to `300`; values are limited to `0–10000`. |

Blank lines and lines beginning with `#` are ignored. Each setting must use the format `key=value`.

## Script Options

Disable RedirectAssist on a page with `data-disabled="true"`:

```html
<script
  src="https://raw.githubusercontent.com/KroxenStudios/RedirectAssist.js/main/redirectassist.js"
  data-disabled="true"
  defer>
</script>
```

## Traffic Events

When `worker` is configured, RedirectAssist sends a `POST` request with a JSON body similar to:

```json
{
  "project": "project-123",
  "event": "redirect",
  "sessionCount": 1,
  "deviceCategory": "desktop"
}
```

The worker must accept cross-origin `POST` requests from the website and respond to CORS preflight requests. Worker errors do not prevent the redirect.

The session counter is stored in the browser’s `sessionStorage`. It is local to the current browser tab and project; it is not a unique visitor identifier. The script does not send a name, email address, IP address, or persistent visitor ID.

## Security Notes

- `RedirectAssist.txt` is publicly accessible when served with the website. Do not put passwords, API keys, or database credentials in it.
- The `worker` value should point to an HTTPS worker endpoint, not directly to a database.
- Redirect destinations may use any domain, but must use HTTP or HTTPS.
- The worker endpoint is public and should validate incoming request data.

## Troubleshooting

- **No redirect:** Check that `project` and `target` are present and valid in `RedirectAssist.txt`.
- **Configuration does not load:** Check the `data-config` path and ensure the file is publicly accessible.
- **Worker does not receive events:** Check the worker URL and its CORS configuration.
- **Mobile destination is not used:** The script selects it only when the viewport width is 768 pixels or less.
