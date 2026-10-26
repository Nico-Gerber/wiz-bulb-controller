# Wiz Bulb Control Panel

A desktop app for controlling [WiZ](https://www.wizconnected.com/) smart bulbs on your local network. It finds bulbs by UDP discovery, saves them, and lets you control them individually, in groups, or all at once. No cloud account is needed.

> **Status:** work in progress. Global keyboard macros are partly built and still being worked on.

## Features

- **Bulb discovery**: scan the local network and save the bulbs you want to control.
- **Per-bulb controls**: power, brightness, colour temperature and RGB colour (RGB bulbs only).
- **Scenes**: apply built-in WiZ light scenes such as Ocean, Sunset and Cozy. Custom scenes are planned.
- **Groups**: create, rename and delete groups, and assign bulbs to them.
- **Drag-and-drop ordering**: reorder your bulbs, and the order is saved.
- **Keyboard macros** (in progress): bind global shortcuts (`Alt+Shift+<key>`) that turn all bulbs, a group or a single bulb on or off, even when the app isn't focused.

## How it works

The app has three parts:

```
┌──────────────┐  IPC (port)   ┌────────────────┐   HTTP   ┌───────────────────┐  UDP :38899  ┌──────────┐
│ React UI     │ ◄───────────► │ Electron main  │ ───────► │ FastAPI backend   │ ───────────► │ WiZ bulbs│
│ (Vite + MUI) │               │ process        │          │ (Python, SQLite)  │              └──────────┘
└──────────────┘               └────────────────┘          └───────────────────┘
```

- **Electron** (`electron/`) opens the window and starts the backend as a child process on a free port. It gives the UI that port through a preload script. It also registers the global macro shortcuts and calls the backend when one fires.
- **Backend** (`backend/`) is a FastAPI app. It talks to the bulbs with [pywizlight](https://github.com/sbidy/pywizlight) and keeps bulbs, groups and macros in a local SQLite database (`bulbs.db`, created on first run).
- **Frontend** (`src/`) is React with Material UI. It talks to the backend through `apiFetch` in `src/api/config.js`.

## Project layout

```
backend/
  main.py                 FastAPI app, CORS, router registration
  database.py             SQLModel models (Bulb, LightGroup, Macro) and DB helpers
  crudBulbs.py            /find: discover, add, list, rename, delete, reorder, set group
  singleBulbEndPoint.py   /bulb: on/off, brightness, temperature, colour, scenes, group/all control
  groups.py               /group: create, list, rename, delete
  macros.py               /macros: set, get, delete, per-target lookup
electron/
  main.cjs                window, backend launcher, global shortcuts
  preload.cjs             exposes the backend port and events to the UI
src/
  App.jsx                 sidebar and routes
  pages/bulbs.jsx         main bulbs page
  components/             modals, light controls, group selector, sortable bulb card
  api/config.js           backend URL helper
```

## Requirements

- macOS, with a recent Node.js. The Electron launcher currently expects a Unix-style venv path (`backend/venv/bin/uvicorn`).
- Python 3.13, which is what the venv was built with.
- A computer on the same network as your WiZ bulbs, with **local communication enabled** in the WiZ app.

## Setup

```bash
# Frontend and Electron
npm install

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

## Running (development)

Use two terminals from the project root:

```bash
npm run dev        # Vite dev server on http://localhost:5173
npm run electron   # starts the backend, then opens the app window
```

Electron currently loads the Vite dev server, so `npm run dev` has to be running first. A packaged standalone build isn't set up yet.

Other scripts:

```bash
npm run build      # production build of the frontend into dist/
npm run lint       # oxlint
```

You can also run the backend on its own. This is handy for exploring the API at `http://localhost:8000/docs`:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --port 8000
```

Note that the UI gets its backend port from Electron, so run the backend by hand only to test the API directly.

## API overview

| Prefix | Purpose |
| --- | --- |
| `POST /find`, `POST /find/add`, `GET /find/saved` | Discover, save and list bulbs |
| `POST /find/updateName`, `/find/delete`, `/find/reorder`, `/find/update_group` | Manage saved bulbs |
| `POST /bulb/On`, `/Off`, `/Brightness`, `/Temp`, `/Color`, `/scene` | Control bulbs |
| `POST /bulb/turn_all_on`, `/turn_off_all`, `/turn_group_on`, `/turn_group_off`, `/on_with_mac`, `/off_with_mac` | Bulk and targeted power control |
| `POST /group/create`, `/update_name`, `/delete`, `GET /group/get` | Groups |
| `POST /macros/set`, `/macros/delete`, `GET /macros/get`, `/macros/for_target` | Keyboard macros |

## Roadmap

- Finish keyboard macros.
- Custom scenes: create and save your own scenes, alongside the built-in WiZ ones.
- Package as a standalone macOS app (bundled backend, `dist/` loaded by Electron).
- Windows and Linux support.
