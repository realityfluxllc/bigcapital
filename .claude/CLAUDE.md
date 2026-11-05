# Claude Code Settings for Bigcapital

## Node.js Version

Use the Node.js version pinned in `.nvmrc` (currently Node 24 LTS). Before running any npm/pnpm/node commands:

```bash
nvm use
```

Node 22+ is supported (`engines` in `package.json`); CI and the Docker images run Node 24. Node 26 is not usable yet (see AGENTS.md).

## Package Manager

Use `pnpm` for this project.
