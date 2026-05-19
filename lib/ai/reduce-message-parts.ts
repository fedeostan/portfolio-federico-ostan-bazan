import type { UIMessage } from "ai";

type AnyPart = UIMessage["parts"][number];

export type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

export type RenderablePart =
  | { kind: "text"; key: number; text: string }
  | {
      kind: "tool-show_project_card";
      key: number;
      state: ToolPartState;
      output?: unknown;
    };

export type RenderModel = {
  reasoningText: string;
  activeTool: string | null;
  inOrderParts: RenderablePart[];
};

const SILENT_TOOL_TYPES = new Set<string>([
  "tool-search_projects",
  "tool-get_project_detail",
]);

// AnyPart is the unparameterised UIMessage part union; tool-part variants do not
// surface `state` on the base type, so we narrow via a structural cast.
function readState(part: AnyPart): ToolPartState | undefined {
  const candidate = (part as { state?: unknown }).state;
  if (
    candidate === "input-streaming" ||
    candidate === "input-available" ||
    candidate === "approval-requested" ||
    candidate === "approval-responded" ||
    candidate === "output-available" ||
    candidate === "output-error" ||
    candidate === "output-denied"
  ) {
    return candidate;
  }
  return undefined;
}

function isSilentToolActiveState(state: ToolPartState): boolean {
  return (
    state === "input-streaming" ||
    state === "input-available" ||
    state === "approval-requested" ||
    state === "approval-responded"
  );
}

function isSilentToolTerminalState(state: ToolPartState): boolean {
  return (
    state === "output-available" ||
    state === "output-error" ||
    state === "output-denied"
  );
}

export function reduceMessageParts(
  parts: ReadonlyArray<AnyPart>,
): RenderModel {
  let reasoningText = "";
  let activeTool: string | null = null;
  const inOrderParts: RenderablePart[] = [];

  parts.forEach((part, index) => {
    if (part.type === "reasoning") {
      reasoningText = reasoningText
        ? `${reasoningText}\n\n${part.text}`
        : part.text;
      return;
    }

    if (part.type === "text") {
      inOrderParts.push({ kind: "text", key: index, text: part.text });
      return;
    }

    if (part.type === "tool-show_project_card") {
      const state = readState(part);
      if (!state) return;
      const output = (part as { output?: unknown }).output;
      inOrderParts.push({
        kind: "tool-show_project_card",
        key: index,
        state,
        output,
      });
      return;
    }

    if (SILENT_TOOL_TYPES.has(part.type)) {
      const state = readState(part);
      if (!state) return;
      if (isSilentToolActiveState(state)) {
        activeTool = part.type;
      } else if (
        isSilentToolTerminalState(state) &&
        activeTool === part.type
      ) {
        activeTool = null;
      }
    }
  });

  return { reasoningText, activeTool, inOrderParts };
}
