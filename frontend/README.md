# Crazy Downloader — Frontend

React 19 + Vite 6 + TypeScript + Tailwind CSS 3 single-page app for pasting YouTube URLs, browsing available formats, and downloading with a real-time progress bar.

---

## Tech Stack

| Component  | Technology              |
| ---------- | ----------------------- |
| Framework  | React 19                |
| Build tool | Vite 6                   |
| Language   | TypeScript 7            |
| Styling    | Tailwind CSS 3           |
| Runtime    | Node.js 24              |


## Local Development

### Prerequisites

- Node.js 24

### Run directly

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on port 5173 and proxies `/api` requests to the backend at `http://localhost:8000` (configured in `vite.config.ts`).


## Key Features

### Real-Time Download Progress

The `FormatList` component uses the Fetch API's streaming reader to track bytes received in real time:

- **Phase-aware status**: Connecting → Downloading → Merging (for DASH) → Finalizing
- **Live progress bar**: Percentage, bytes transferred, and file size
- **Speed indicator**: Uses exponential moving average (EMA) for smooth-but-responsive speed display
- **ETA**: Estimated time remaining based on current speed
- **Cancel support**: AbortController lets users cancel mid-download

### Sponsor / Ad System

Ads are configured in `src/config/sponsors.ts`. The ad section:

- Shows on the home page when no search is active
- Hides automatically when a user searches for a video
- Reappears when the user returns to the home state
- Displays a professional placeholder when no sponsor is configured

### Cookie Support

Cookies for age-restricted or private content are stored in the browser's localStorage only — never sent to the server for persistence. They're attached to API requests via the `X-Cookies` header (Base64-encoded).

## Configuration

| Variable       | Description                          | Default       |
| -------------- | ------------------------------------ | ------------- |
| `VITE_API_URL` | Backend API base URL (empty = same-origin) | `""`     |

## Testing

```bash
cd frontend
npm install
npm test
```

## Building for Production

```bash
cd frontend
npm run build
```

Outputs to `dist/`. In the single-image Docker setup, this is copied into the backend container and served as static files.
