# Babblr UI

Babblr UI is a React and TypeScript chat frontend. Users can create an account, create named chats, and exchange text messages with live updates from a separate backend.

This repository contains the browser application only. The backend, database, and any database migrations must be provided separately.

## Features

- Sign up with an email, username, and password; log in and log out.
- Authentication-aware navigation and protected chat content.
- Create chats and browse a paginated chat list with latest-message previews.
- Send text messages using Enter or the send button.
- View sender names and timestamps, with separate alignment for your own messages.
- Load older messages by scrolling upward while preserving the scroll position.
- Receive new messages through GraphQL subscriptions for the loaded chats.
- Responsive layout and navigation with a Material UI dark theme.

## Tech stack

| Area | Technologies |
| --- | --- |
| Application | TypeScript, React 19, React Router 7 |
| UI | Material UI 9, Material icons, Emotion |
| Data | Apollo Client 4, GraphQL, `graphql-ws`, Apollo in-memory cache |
| Pagination | `react-infinite-scroller` for chats; scroll handling for message history |
| Development | Create React App (`react-scripts` 5), GraphQL Code Generator, concurrently, Yarn |
| Testing | Jest through `react-scripts`, React Testing Library, jest-dom |

## Architecture and project structure

`App.tsx` supplies Apollo and theme providers, the header, authentication guard, and chat layout. Components call hooks for GraphQL operations and REST requests. Apollo sends queries and mutations over HTTP and subscriptions over WebSocket. Cache helpers update message history and latest-message previews after mutations and subscription events; pagination uses `skip` and `limit` with a page size of 15.

```text
public/                  HTML template, icons, and manifest
src/
  App.tsx                Application providers and layout
  index.tsx              React entry point
  components/
    Routes.tsx           Browser routes
    auth/                Login, signup, and authentication guard
    chat/                Message history and composer
    chat-list/           Chat list, previews, and creation modal
    header/              Desktop/mobile navigation and logout menu
    home/                Home view
    snackbar/            Notification component
  hooks/                 API operations and routing hooks
  cache/                 Apollo cache updates
  constants/             API URLs, Apollo configuration, and shared state
  fragments/             Reusable GraphQL selections
  gql/                   Generated GraphQL types and documents
  interfaces/            Shared UI types
  utils/                 Error handling and logout helpers
  setupTests.ts          jest-dom setup
.env.example             Docker and local environment example
codegen.ts               Schema source and generation settings
package.json             Dependencies and scripts
tsconfig.json            Strict TypeScript configuration
.yarnrc.yml              Yarn node-modules linker configuration
yarn.lock                Dependency lockfile
```

Browser routes are `/login`, `/sign-up`, `/` (home and chat list), and `/chats/:_id` (selected chat).

## Getting started

### Prerequisites

- Node.js 22 or newer, as required by the installed `concurrently` 10 dependency. The project does not pin a Node version.
- Modern Yarn. The repository uses a modern Yarn lockfile and `.yarnrc.yml`; the `start` script also invokes Yarn internally. No exact Yarn version is pinned.
- A compatible backend running at `http://localhost:3001`, exposing the interfaces described below, including GraphQL schema introspection for code generation.

### Install and configure

From the repository root, install dependencies:

```sh
yarn install
```

Create `.env` in the repository root with these local development values:

```dotenv
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=localhost:3001
```

The tracked `.env.example` defaults to Docker networking. If you copy it for `yarn start`, change `REACT_APP_WS_URL` to `localhost:3001`; `BACKEND_URL` is used only by Docker.

The HTTP URL deliberately points to the frontend development server. The `proxy` setting in `package.json` forwards API requests to `http://localhost:3001`, keeping browser HTTP requests on the frontend origin. WebSocket subscriptions connect directly to the backend on port 3001.

### Run locally

Start the separate backend, then run:

```sh
yarn start
```

Open [http://localhost:3000](http://localhost:3000). This command runs the React development server and GraphQL Code Generator in watch mode concurrently.

Code generation reads the schema from `http://localhost:3001/graphql`, hardcoded in `codegen.ts`. Changing `.env` does not change that schema URL. Update `codegen.ts` if your backend uses a different address.

### Environment variables

| Variable | Purpose | Local example |
| --- | --- | --- |
| `REACT_APP_API_URL` | HTTP base URL for GraphQL, authentication, and count requests; omit the trailing slash. | `http://localhost:3000` |
| `REACT_APP_WS_URL` | WebSocket host and optional port. The client adds `ws://` and `/graphql`; do not include either in the value. | `localhost:3001` |

Both variables are read in `src/constants/urls.ts` and have no application defaults. They are embedded in the frontend build, so they must not contain secrets. Restart the development server after changes; rebuild for production changes.

### Production build

```sh
yarn build
```

The static application is written to `build/`. Configure the hosting server to serve `index.html` for browser routes such as `/chats/:_id`.

Set the API variables for the deployment before building. The development proxy does not ship with the static build; configure API routing on the hosting infrastructure. HTTP calls do not explicitly enable cross-origin credentials, so a separate API origin may require changes to the client and backend authentication configuration.

The WebSocket URL currently hardcodes `ws://` in `src/constants/apollo-client.ts`. An HTTPS deployment needs a code change to support `wss://`, plus a backend or proxy that accepts secure WebSocket connections.

## Running with Docker

### Prerequisites and configuration

Install Docker Engine with the Compose plugin, or Docker Desktop, and start its Linux container engine. No host Node.js or Yarn installation is needed.

This is a single-package frontend, not a monorepo. The `pnpm-workspace.yaml` only contains dependency build allowances; Yarn and `yarn.lock` are used for the image. The build stage uses Node.js 24 and Yarn 4.18.0 with an immutable install. It includes development dependencies for compilation and uses the committed `src/gql/` files, so no running backend or code generation is required to build. There are no additional application system packages to install. The final image contains the compiled `build/` assets and official Alpine Nginx, running as its non-root `nginx` user on port 8080. Node.js and dependencies stay in the build stage.

A compatible backend is **required for login, chats, and messaging**. Start it separately on host port 3001 with the interfaces in [Backend integration](#backend-integration). This repository supplies no backend image, database definition, migrations, or seed commands; follow the backend project's setup instructions. On Linux, the backend must listen on an interface reachable from Docker (not only `127.0.0.1`).

Create your local configuration, unless `.env` already exists:

```sh
cp .env.example .env
```

PowerShell equivalent: `Copy-Item .env.example .env`. For an existing `.env`, compare and update these values:

| Variable | Docker default/example | When to change it |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://localhost:3000` in the example; empty when omitted in Compose | Public frontend HTTP origin, without trailing slash. Empty uses the current browser origin. |
| `REACT_APP_WS_URL` | `localhost:3000` | Public frontend host and port, without scheme or path. For Docker, use port 3000 so subscriptions pass through Nginx. |
| `BACKEND_URL` | `http://host.docker.internal:3001` | Backend origin reachable **from the container**, without path or trailing slash. Do not use `localhost` for a backend on the host. |

All values have Docker defaults, so `.env` is optional for the default local setup. No credentials are required by the image. `REACT_APP_*` values are public, compiled into JavaScript, and must never contain secrets. Compose reads them from `.env` as **build arguments**; changing them requires rebuilding. `BACKEND_URL` is a runtime Nginx setting and must not contain credentials. Local `.env` files are excluded from the build context.

### Start and stop with Compose (recommended)

After starting the separate backend:

```sh
docker compose up --build -d
docker compose ps
docker compose logs -f ui
```

Open [http://localhost:3000](http://localhost:3000). Host port 3000 maps to container port 8080. Nginx serves browser routes and forwards `/graphql` (including WebSocket upgrades), `/auth/*`, `/chats/count`, and `/messages/count/:chatId` to `BACKEND_URL`, keeping cookie-based HTTP authentication on the same origin. The static UI can start without the backend, but API requests will fail until it is reachable. The `/healthz` health check verifies Nginx only, not backend availability.

Stop and remove the frontend container and Compose network:

```sh
docker compose down
```

There are no persistent frontend volumes or initialization commands. Backend data and persistence are managed by the separate backend. Compose does not start or delete any database.

After dependency, source, or public configuration changes, run `docker compose up --build -d` again. For only a `BACKEND_URL` change, run `docker compose up -d` to recreate the service with the new value. Use `docker compose build --pull` to refresh base images, followed by `docker compose up -d`.

### Standalone container

The same defaults work without Compose:

```sh
docker build -t babblr-ui:local .
docker run -d --name babblr-ui --env-file .env --add-host host.docker.internal:host-gateway -p 3000:8080 babblr-ui:local
docker logs -f babblr-ui
docker stop babblr-ui
docker rm babblr-ui
```

Create `.env` first for the `--env-file` command, or omit that option to use the default backend. Unlike Compose, `docker build` does not read `.env`. Supplying `REACT_APP_*` with `docker run --env-file` cannot change compiled browser settings. To change those settings, pass explicit build arguments, then recreate the container:

```sh
docker build -t babblr-ui:local --build-arg REACT_APP_API_URL=http://localhost:3000 --build-arg REACT_APP_WS_URL=localhost:3000 .
```

For access from another machine, use the frontend's browser-accessible hostname instead of `localhost` in the public build values. Docker service names belong only in `BACKEND_URL` and require a shared Docker network. The backend hostname must resolve when Nginx starts; restart the UI if the backend's IP changes. The current client hardcodes `ws://`; an HTTPS deployment still requires the `wss://` client change described above and TLS termination. This setup serves HTTP locally.

## Backend integration

These are interfaces consumed by this frontend, not server implementations supplied by this repository.

### GraphQL

Queries and mutations use `${REACT_APP_API_URL}/graphql`. The client operations are:

| Type | Field | Input / purpose |
| --- | --- | --- |
| Query | `me` | Current user's ID and email |
| Query | `chats` | `skip`, `limit`; chat list and latest messages |
| Query | `chat` | `_id`; selected chat |
| Query | `messages` | `chatId`, `skip`, `limit`; message history |
| Mutation | `createUser` | `createUserInput`: email, username, password |
| Mutation | `createChat` | `createChatInput`: name |
| Mutation | `createMessage` | `createMessageInput`: chatId, content |
| Subscription | `messageCreated` | `chatIds`; newly created messages for subscribed chats |

Subscriptions use `graphql-ws` at `ws://${REACT_APP_WS_URL}/graphql`. Message selections include the ID, chat ID, content, creation timestamp, and sender ID, username, and email.

### REST

All paths below are relative to `REACT_APP_API_URL`.

| Method | Path | Client expectation |
| --- | --- | --- |
| `POST` | `/auth/login` | JSON body `{ "email": "...", "password": "..." }`; HTTP 401 displays an invalid-credentials message |
| `POST` | `/auth/logout` | Ends the session; no request body |
| `GET` | `/chats/count` | Total chat count as text parseable as an integer |
| `GET` | `/messages/count/:chatId` | JSON object with a numeric `messages` property |

The client refetches active Apollo queries after login. Logout resets authentication state and the Apollo store and navigates to `/login`. GraphQL errors with `extensions.originalError.statusCode === 401` also trigger this reset outside the public authentication routes.

## Development commands

| Command | Purpose |
| --- | --- |
| `yarn start` | Start the development server and GraphQL generation watcher |
| `yarn build` | Produce the static production build in `build/` |
| `yarn codegen` | Regenerate `src/gql/` from the backend schema and source operations |
| `yarn codegen --watch` | Watch GraphQL source documents and regenerate output |
| `yarn test` | Run Jest in interactive watch mode |
| `yarn test --watchAll=false` | Run Jest once |
| `yarn eject` | Irreversibly expose Create React App build configuration |

Edit GraphQL operations in `src/hooks/` and fragments in `src/fragments/`, then regenerate `src/gql/`. Generated files are committed; `yarn build` does not run code generation automatically.

## Testing

Jest and React Testing Library are configured, and `src/setupTests.ts` loads jest-dom matchers. There are currently no committed test suites or integration/E2E test configurations. A one-shot Jest run will report no tests until suites are added.

Place tests alongside components or hooks using `.test.ts` or `.test.tsx`, then run:

```sh
yarn test
```

## Contributing

Create a branch, make a focused change, and add tests for behavior changes. Regenerate GraphQL artifacts when operations change, run relevant tests and `yarn build`, and open a pull request describing the change and how it was verified. Keep local configuration and credentials out of commits.
