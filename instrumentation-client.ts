import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/chat", method: "POST" },
    { path: "/api/transcribe", method: "POST" },
    { path: "/api/ingest-job", method: "POST" },
    { path: "/api/leads", method: "POST" },
  ],
});
