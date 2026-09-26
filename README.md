# Dr. Odin Partner Dashboard (Angular)

Angular frontend integrating **`@dr-odin/web-sdk`** for BLE medical devices.

## Setup

```bash
npm install
```

Configure `src/environments/environment.ts` and `proxy.conf.json` (Docker PC IP, no `/api`).

## Run

```bash
npm run dev
# or
npm start
```

Open **http://127.0.0.1:5180/live** in Chrome (Web Bluetooth).

## Verify SDK

```bash
npm ls @dr-odin/web-sdk
# @dr-odin/web-sdk@1.0.0 -> ./web-sdk
```

## Pages

- `/` Overview (demo device network)
- `/live` DrOdin SDK: initialize → session → connect → measure
- `/devices` Demo device list + scan
- `/integrate` Integration snippets
