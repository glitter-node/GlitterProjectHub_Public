import type { ActionDefinition, ActionContext } from "../../../../../resources/js/core/template-engine/ActionDispatcher";

export async function stopPropagationHandler(
  _action: ActionDefinition,
  context: ActionContext
): Promise<void> {
  context.event?.stopPropagation?.();
}
