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
        if (!editor) {return false;}
        const fileName = editor.document.fileName;
        return fileName.endsWith('.log');
    }

    function parseTimeFilter(input: string): { since?: string; until?: string } {
			const sinceMatch = /-S\s*(\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3,6})?([+-]\d{4})?)/.exec(input);
			const untilMatch = /-U\s*(\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3,6})?([+-]\d{4})?)/.exec(input);
	
			return {
					since: sinceMatch ? sinceMatch[1] : undefined,
					until: untilMatch ? untilMatch[1] : undefined,
			};
	}	

	function isInTimeRange(line: string, since?: string, until?: string): boolean {
    const timeMatch = /\b(\d{2}:\d{2}:\d{2})\b/.exec(line) || /\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\b/.exec(line);
    if (!timeMatch) return true; // Si pas d'heure trouvée, inclure la ligne par défaut

    let time: string;
    if (timeMatch[1].includes("T")) {
        // Si on a un format ISO 8601, on extrait HH:mm:ss
        time = timeMatch[1].slice(11, 19); // ISO 8601 "YYYY-MM-DDTHH:mm:ss"
    } else {
        // Si on a déjà un format HH:mm:ss, on l'utilise directement
        time = timeMatch[1];
    }

    // Comparaison avec 'since' et 'until'
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
	const highlightRanges: vscode.Range[] = [];
	const dimRanges: vscode.Range[] = [];

	if (!searchTerm) return;

	// Étape 1: Extraire toutes les expressions régulières (qui sont entourées par /~ et ~/)
	const regexPattern = /\/~(.*?)~\//g;
	const regexKeywords: RegExp[] = [];
	let match: RegExpExecArray | null;
	let remainingSearchTerm = searchTerm;

	// Chercher et extraire toutes les expressions régulières
	while ((match = regexPattern.exec(searchTerm)) !== null) {
			try {
					// Créer un RegExp à partir de l'expression extraite
					regexKeywords.push(new RegExp(match[1], 'gi'));
					// Supprimer l'expression régulière de la chaîne d'origine
					remainingSearchTerm = remainingSearchTerm.replace(match[0], '');  // On remplace l'expression par un espace
			} catch (e) {
					vscode.window.showWarningMessage(`Invalid regular expression: ${match[1]}`);
			}
	}

	// Étape 2: Découper les mots-clés restants en les séparant par un espace
	const plainKeywords = remainingSearchTerm.split(' ').filter((kw) => kw.trim() !== '');

	for (let line = 0; line < document.lineCount; line++) {
			const lineText = document.lineAt(line).text;
			const lineRange = document.lineAt(line).range;

			// Filtrage des lignes en fonction du temps
			if (!isInTimeRange(lineText, timeFilter.since, timeFilter.until)) {
					dimRanges.push(lineRange);
					continue;
			}

			let matchFound = false;

			// Recherche avec des expressions régulières
			regexKeywords.forEach((regex) => {
					let regexMatch;
					while ((regexMatch = regex.exec(lineText))) {
							const startPos = new vscode.Position(line, regexMatch.index);
							const endPos = new vscode.Position(line, regexMatch.index + regexMatch[0].length);
							highlightRanges.push(new vscode.Range(startPos, endPos));
							matchFound = true;
					}
			});

			// Recherche avec des mots-clés simples
			plainKeywords.forEach((keyword) => {
					const regex = new RegExp(keyword, 'gi');
					let plainMatch;
					while ((plainMatch = regex.exec(lineText))) {
							const startPos = new vscode.Position(line, plainMatch.index);
							const endPos = new vscode.Position(line, plainMatch.index + plainMatch[0].length);
							highlightRanges.push(new vscode.Range(startPos, endPos));
							matchFound = true;
					}
			});

			if (!matchFound && (regexKeywords.length > 0 || plainKeywords.length > 0)) {
					dimRanges.push(lineRange);
			}
	}

	// Appliquer les décorations (highlight et dim)
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
