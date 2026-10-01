# Codex App Server development visual

- User-requested custom illustration generated for slide 8; not an official SAP asset.
- Reference: https://github.com/openai/codex/blob/rust-v0.100.0/codex-rs/app-server/README.md
- Protocol: bidirectional JSON-RPC messages; connection handshake is `initialize`, followed by `initialized` (the artwork abbreviates initialization).
- Conversation: `thread/start` or `thread/resume`; work: `turn/start`.
- Progress: `item/*` events; terminal turn status: `turn/completed` (can include failure or interruption).
- Approvals are conditional on configured policies; the client returns an approval response when requested.
- Workspace/Sandbox depicts the configured execution environment, not a mandatory separate network server.
- Testing and release are application workflow stages. A completed turn does not itself guarantee successful testing, review or deployment.
- SAP Build / Joule Studio / AI Foundation remain the broader deck development foundations. The illustration is an App Builder implementation example, not a built-in SAP integration claim.

## Concept illustration revision

User requested the isometric illustration style of slide 27 and business-level concepts instead of server internals. The visible diagram now uses Business Request, AI Development, Validation, Business Application and central App Builder. Thread, Turn, protocol and server implementation labels are omitted. The existing four lifecycle cards retain Define, Build, Validate and Deploy roles. The artwork is custom generated, not an official SAP asset.
