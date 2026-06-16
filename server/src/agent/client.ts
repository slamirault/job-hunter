import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization — we don't create the client at import time
// because dotenv hasn't loaded yet when imports run.
// Instead, we create it on first use.
let _client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}
