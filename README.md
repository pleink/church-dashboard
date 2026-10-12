# ChurchDashboard API Notes

## Docker deployment

The GitHub Actions workflow builds and smoke-tests the production image on pull
requests. Pushes to `main` publish `ghcr.io/pleink/church-dashboard:latest` and a
`sha-…` tag. Version tags such as `v1.2.3` also publish the image as `1.2.3`.
Published images support Linux AMD64 and ARM64. Publishing uses the built-in
`GITHUB_TOKEN`; no registry secret needs to be added. The first image is available
after this workflow is pushed to GitHub and runs successfully.

On the deployment host, copy `compose.yaml`, `config.json`, and `.env.example`:

```bash
cp .env.example .env
# Edit .env with your ChurchTools URL and API token.
# Edit config.json with your calendar IDs and display settings.
mkdir -p Slides_Dashboard
docker compose pull
docker compose up -d
```

Open `http://localhost:5000` (or your host's address). Change the left side of
`5000:5000` in `compose.yaml` to use a different host port. Optional
`BASIC_AUTH_USER` and `BASIC_AUTH_PASS` variables enable HTTP basic authentication.
Use HTTPS through your hosting platform or reverse proxy when exposing it online.

If the GitHub package is private, log in to `ghcr.io` on the deployment host using
a GitHub token with `read:packages`, or change the package visibility to public
in GitHub's package settings. Use a version or SHA tag instead of `latest` to pin
a deployment. To update, run `docker compose pull && docker compose up -d`.

The image runs as the unprivileged `node` user and reads configuration at startup
from `/app/config.json`. Compose mounts your configuration and flyer directory
read-only; ensure these files are readable by the container user. Restart the
container after changing configuration. Add flyer images to `Slides_Dashboard`
or adjust the mount and `flyers.folders` together. Credentials and local flyer
files are excluded from the Docker build context.

To build and run locally without the registry:

```bash
docker build -t church-dashboard:local .
docker run --rm -p 5000:5000 --env-file .env church-dashboard:local
```

## Quick API probes (using `.env` token)

```bash
# Load env
source .env

# List calendars
curl -H "Authorization: Login $CHURCHTOOLS_API_TOKEN" \
  "$CHURCHTOOLS_API_BASE/calendars"

# Next 7 days across configured calendars (update ids as needed)
FROM=$(date -u +"%Y-%m-%d")
TO=$(date -u -d "$FROM +6 days" +"%Y-%m-%d")

curl -H "Authorization: Login $CHURCHTOOLS_API_TOKEN" \
  "$CHURCHTOOLS_API_BASE/calendars/appointments?from=$FROM&to=$TO&calendar_ids[]=2&calendar_ids[]=28&calendar_ids[]=22&calendar_ids[]=25&calendar_ids[]=43&calendar_ids[]=61&calendar_ids[]=58&calendar_ids[]=54&calendar_ids[]=63&calendar_ids[]=55&calendar_ids[]=49&calendar_ids[]=42&calendar_ids[]=35&include[]=event&include[]=group&include[]=bookings"

# Next sermon (Gottesdienst) comes from calendar 2 via `/api/signage/sermon` (frontend hook `useSignageSermon`)
```

## Config-driven calendar mapping
- `config.json` controls which calendars are used and how they are displayed:
  - `calendars.sermons`: IDs shown as “Gottesdienst” in the dedicated hero card.
  - `calendars.churchEvents`: Church-wide events (e.g., Gemeindeanlässe).
  - `calendars.groupEvents`: Group calendars shown in “Nächste Veranstaltungen”.
  - `calendars.titleOverrides`: Rename calendar-specific items (e.g., `55` → “Kleingruppe Frauen”).
  - `calendars.descriptionOverrides`: Override descriptions (e.g., `35` → “Bei Fragen ...”).
  - `resources.roomTypeIds`: Resource type IDs that count as rooms; only these are displayed on cards.
