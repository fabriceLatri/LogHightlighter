import type { ExtensionContext } from 'vscode'
import { logHighlighterApplication } from "./app/LogHighlighterApplication";

export function activate(context: ExtensionContext) {
	const { searchCommand, clearCommand } = logHighlighterApplication.bootstrap();
	context.subscriptions.push(searchCommand, clearCommand);
}

export function deactivate() {}
