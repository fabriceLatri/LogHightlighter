import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('logHighlighter');

    let inactiveOpacity = config.get<number>('inactiveOpacity', 0.3);
    let highlightColor = config.get<string>('highlightColor', 'yellow');
		let isHighlightDisabled = config.get<boolean>('disableHighlight', false);

		const highlightDecorationType = vscode.window.createTextEditorDecorationType({
				backgroundColor: !isHighlightDisabled ? highlightColor : undefined,
		});

    const dimDecorationType = vscode.window.createTextEditorDecorationType({
        opacity: `${inactiveOpacity}`,
    });

    function isLogFile(editor: vscode.TextEditor | undefined): boolean {
        if (!editor) return false;
        const fileName = editor.document.fileName;
        return fileName.endsWith('.log');
    }

    function parseTimeFilter(input: string): { since?: string; until?: string } {
        const sinceMatch = /-S\s*(\d{2}:\d{2}:\d{2})/.exec(input);
        const untilMatch = /-U\s*(\d{2}:\d{2}:\d{2})/.exec(input);

        return {
            since: sinceMatch ? sinceMatch[1] : undefined,
            until: untilMatch ? untilMatch[1] : undefined,
        };
    }

    function isInTimeRange(line: string, since?: string, until?: string): boolean {
        const timeMatch = /\b(\d{2}:\d{2}:\d{2})\b/.exec(line);
        if (!timeMatch) return true; // No time found, include the line by default

        const time = timeMatch[1];
        if (since && time < since) return false;
        if (until && time > until) return false;

        return true;
    }

		function updateDecorations(searchTerm: string | undefined, timeFilter: { since?: string; until?: string }) {
			const editor = vscode.window.activeTextEditor;
			if (!editor || !isLogFile(editor)) {
					vscode.window.showInformationMessage('This command works only on .log files.');
					return;
			}
	
			const document = editor.document;
			const keywords = searchTerm ? searchTerm.split(' ').filter((kw) => kw.trim() !== '') : [];
			const highlightRanges: vscode.Range[] = [];
			const dimRanges: vscode.Range[] = [];
	
			for (let line = 0; line < document.lineCount; line++) {
					const lineText = document.lineAt(line).text;
					const lineRange = document.lineAt(line).range;
	
					// Vérifie si la ligne est dans la plage horaire
					if (!isInTimeRange(lineText, timeFilter.since, timeFilter.until)) {
							dimRanges.push(lineRange); // Ajoute la ligne à "dimRanges" si elle est hors de la plage horaire
							continue; // Ne fais rien d'autre pour cette ligne
					}
	
					let matchFound = false;
					keywords.forEach((keyword) => {
							const regex = new RegExp(keyword, 'gi');
							let match;
							while ((match = regex.exec(lineText))) {
									const startPos = new vscode.Position(line, match.index);
									const endPos = new vscode.Position(line, match.index + match[0].length);
									highlightRanges.push(new vscode.Range(startPos, endPos));
									matchFound = true;
							}
					});
	
					// Si aucun mot-clé n'est trouvé mais qu'il y a des mots-clés, dimme la ligne
					if (!matchFound && keywords.length > 0) {
							dimRanges.push(lineRange);
					}
			}
	
			// Applique les décorations pour les lignes qui doivent être surlignées et celles qui doivent être estompées
			editor.setDecorations(highlightDecorationType, highlightRanges);
			editor.setDecorations(dimDecorationType, dimRanges);
	}
	

    const searchCommand = vscode.commands.registerCommand('logHighlighter.search', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !isLogFile(editor)) {
            vscode.window.showInformationMessage('This command works only on .log files.');
            return;
        }
const userInput = await vscode.window.showInputBox({
            placeHolder: 'Enter keywords and/or time filters (e.g., "error -S 10:00:00 -U 12:00:00")',
            prompt: 'Highlight logs based on keywords and/or time range',
        });

        if (!userInput) {
            vscode.window.showInformationMessage('No input provided.');
            return;
        }

        const { since, until } = parseTimeFilter(userInput);
        const keywords = userInput.replace(/-S\s*\d{2}:\d{2}:\d{2}/, '').replace(/-U\s*\d{2}:\d{2}:\d{2}/, '').trim();

        updateDecorations(keywords, { since, until });
    });

    const clearCommand = vscode.commands.registerCommand('logHighlighter.clearHighlights', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(highlightDecorationType, []);
            editor.setDecorations(dimDecorationType, []);
        }
    });

    vscode.workspace.onDidChangeConfiguration(() => {
        inactiveOpacity = config.get<number>('inactiveOpacity', 0.3);
        highlightColor = config.get<string>('highlightColor', 'yellow');
    });

    context.subscriptions.push(searchCommand, clearCommand);
}

export function deactivate() {}
