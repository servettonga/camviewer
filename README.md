# CamViewer

A lightweight, offline-capable camera stream viewer for monitoring security cameras, traffic feeds, and other video streams directly in your browser.

<img width="1445" height="519" alt="Screenshot 2025-12-04 at 23 53 26" src="https://github.com/user-attachments/assets/14816b4c-aad0-4c0e-958e-f624912f0cda" />

## Features

- **Multiple Stream Types** - Supports HLS (.m3u8), HTTP video (MP4/WebM), and MJPEG streams
- **Drag & Drop Reordering** - Organize your camera grid by dragging cards
- **Expandable Cameras** - Expand any camera to 2x2 size for a larger view
- **Fullscreen Mode** - View any stream in fullscreen
- **Import/Export Config** - Backup and restore your camera setup as JSON
- **Dark/Light/System Theme** - Choose your preferred appearance
- **Offline Storage** - All configuration stored locally in IndexedDB
- **No Backend Required** - Runs entirely in the browser, no server-side storage

<img height="960" alt="Screenshot" src="https://github.com/user-attachments/assets/1b5947e7-b8ff-4882-bf24-831a94924658" />

## Supported Stream Types

| Type  | Format      | Example URL                 |
| ----- | ----------- | --------------------------- |
| HLS   | `.m3u8`     | `http://server/stream.m3u8` |
| HTTP  | MP4/WebM    | `http://server/video.mp4`   |
| MJPEG | Motion JPEG | `http://camera/mjpeg`       |

### RTSP Cameras

Browsers cannot play RTSP streams directly. Use a media server to convert RTSP to HLS:

**Recommended: [go2rtc](https://github.com/AlexxIT/go2rtc)**

1. Install go2rtc on your local network
2. Add your RTSP streams to go2rtc config
3. Use the HLS URL in CamViewer:
   ```txt
   http://[go2rtc-ip]:1984/api/stream.m3u8?src=[stream-name]
   ```

Other options: MediaMTX, Frigate, or Scrypted.

## Running Locally

### Prerequisites

- Node.js 18+ or Bun

### Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

### Using Pre-built Image

```bash
docker run -d -p 8080:80 ghcr.io/servettonga/camviewer:latest
```

Access at `http://localhost:8080`

### Building the Image

```bash
# Build the image
docker build -t camviewer .

# Run the container
docker run -d -p 8080:80 camviewer
```

### Docker Compose

```yaml
version: '3.8'
services:
  camviewer:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## Configuration

All configuration is stored in your browser's IndexedDB. No server-side database is needed.

### Export/Import

1. Go to **Settings** → **Export Configuration** to download your setup
2. Go to **Settings** → **Import Configuration** to restore from a JSON file

### Grid Layout

- Choose between 2 or 4 columns in Settings
- Expanded cameras take 2x2 grid space

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- HLS.js for HLS playback
- IndexedDB for local storage
- Nginx (Docker container)

## License

MIT
