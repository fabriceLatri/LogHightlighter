import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	let currentMatchIndex = 0;
	let matches: vscode.Range[] = [];
	let originalContent: string | null = null;
	let filteredContent: string | null = null;

	const config = vscode.workspace.getConfiguration('logHighlighter');
	let inactiveOpacity = config.get<number>('inactiveOpacity', 0.3);
	let highlightColor = config.get<string>('highlightColor', 'yellow');
	let isHighlightDisabled = config.get<boolean>('disableHighlight', false);
	let hideNonMatchingLines = config.get<boolean>('hideNonMatchingLines', false);

		const highlightDecorationType = vscode.window.createTextEditorDecorationType({
				backgroundColor: !isHighlightDisabled ? highlightColor : undefined,
		});

    const dimDecorationType = vscode.window.createTextEditorDecorationType({
        opacity: `${inactiveOpacity}`,
    });

		const hiddenDecorationType = vscode.window.createTextEditorDecorationType({
			textDecoration: 'none; opacity: 0; display: none;', // Masque le texte
	});

	const borderDecorationType = vscode.window.createTextEditorDecorationType({
		fontWeight: 'bold',
		borderWidth: '1px',      
		borderStyle: 'solid',
		...(!isHighlightDisabled ? { 
				borderColor: highlightColor,   
				backgroundColor: 'rgba(0, 0, 0, 1)'
			} : {})     
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

	function createDateFromTime(timeStr: string) {
    // Suppose que timeStr est une chaîne de la forme "HH:mm:ss"
    const today = new Date(); // Créer un objet Date avec la date actuelle
    const [hours, minutes, seconds] = timeStr.split(":").map(Number); // Extraire les heures, minutes, secondes

    // Créer un nouvel objet Date avec l'heure, les minutes et les secondes
    today.setHours(hours, minutes, seconds, 0); // Mettre à jour l'heure, minute et seconde de la date actuelle

    return today; // Retourner la date avec les heures, minutes et secondes modifiées
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
    if (since && createDateFromTime(time) < createDateFromTime(since)) return false;
    if (until && createDateFromTime(time) > createDateFromTime(until)) return false;

    return true;
}


function updateDecorations(searchTerm: string | undefined, timeFilter: { since?: string; until?: string }) {
	if (!searchTerm) {
		restoreOriginalContent();
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if (!editor || !isLogFile(editor)) {
			vscode.window.showInformationMessage('This command works only on .log files.');
			return;
	}

	const document = editor.document;

	if (!originalContent) {
		originalContent = document.getText();
	}

	const lines = originalContent.split('\n');
		const filteredLines = lines.filter(line => line.includes(searchTerm));
		filteredContent = filteredLines.join('\n');


		replaceEditorContent(filteredContent);


	// const highlightRanges: vscode.Range[] = [];
	// const dimRanges: vscode.Range[] = [];
	// matches = [];

	// if (!searchTerm && !timeFilter.until && !timeFilter.until) {
	// 	// Reinit decorators and states
	// 	editor.setDecorations(highlightDecorationType, []);
	// 	editor.setDecorations(hiddenDecorationType, []);
	// 	editor.setDecorations(dimDecorationType, []);
	// 	matches = [];
	// 	currentMatchIndex = 0;
	// 	return
	// };

	// // TODO: Modify next line to allow -S ans -U everywhere in search term.
	// if (/^-[SU]\s?$/.test(searchTerm ?? '')) return

	// // Step 1: Extract all regexp
	// const regexPattern =  /\/~(.*?)~\//g;
	// const regexKeywords: RegExp[] = [];
	// let match: RegExpExecArray | null;
	// let remainingSearchTerm = searchTerm ?? '';

	// // Search and Extract all regexp
	// while ((match = regexPattern.exec(searchTerm ?? '')) !== null) {
	// 		try {
	// 				regexKeywords.push(new RegExp(match[1], 'gi'));
	// 				remainingSearchTerm = remainingSearchTerm.replace(match[0], '');
	// 		} catch (e) {
	// 				vscode.window.showWarningMessage(`Invalid regular expression: ${match[1]}`);
	// 		}
	// }

	// // Step 2: Split rest keywords
	// const plainKeywords = remainingSearchTerm.split(' ').filter((kw) => kw.trim() !== '');

	// for (let line = 0; line < document.lineCount; line++) {
	// 		const lineText = document.lineAt(line).text;
	// 		const lineRange = document.lineAt(line).range;

	// 		if (!isInTimeRange(lineText, timeFilter.since, timeFilter.until)) {
	// 				dimRanges.push(lineRange);
	// 				continue;
	// 		}

	// 		let matchFound = false;

	// 		regexKeywords.forEach((regex) => {
	// 				let regexMatch;
	// 				while ((regexMatch = regex.exec(lineText))) {
	// 						const startPos = new vscode.Position(line, regexMatch.index);
	// 						const endPos = new vscode.Position(line, regexMatch.index + regexMatch[0].length);
	// 						const wordFound = new vscode.Range(startPos, endPos);
	// 						highlightRanges.push(wordFound);
	// 						matches.push(wordFound);
	// 						matchFound = true;
	// 				}
	// 		});

	// 		plainKeywords.forEach((keyword) => {
	// 				const regex = new RegExp(keyword, 'gi');
	// 				let plainMatch;
	// 				while ((plainMatch = regex.exec(lineText))) {
	// 						const startPos = new vscode.Position(line, plainMatch.index);
	// 						const endPos = new vscode.Position(line, plainMatch.index + plainMatch[0].length);
	// 						const wordFound = new vscode.Range(startPos, endPos);
	// 						highlightRanges.push(wordFound);
	// 						matches.push(wordFound);
	// 						matchFound = true;
	// 				}
	// 		});

	// 		if (!matchFound && (regexKeywords.length > 0 || plainKeywords.length > 0)) {
	// 				dimRanges.push(lineRange);
	// 		}
	// }

	// editor.setDecorations(highlightDecorationType, highlightRanges);
	// editor.setDecorations(hideNonMatchingLines ? hiddenDecorationType : dimDecorationType, dimRanges);

	// if (matches.length > 0) {
	// 	currentMatchIndex = 0;
	// 	goToMatch(editor, matches[currentMatchIndex]);
	// }
}

function replaceEditorContent(content: string) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) return;

	const edit = new vscode.WorkspaceEdit();
	const fullRange = new vscode.Range(
		editor.document.positionAt(0),
		editor.document.positionAt(editor.document.getText().length)
	);
	edit.replace(editor.document.uri, fullRange, content);
	vscode.workspace.applyEdit(edit);
}

function restoreOriginalContent() {
	if (originalContent) {
		replaceEditorContent(originalContent);
		originalContent = null;
		filteredContent = null;
	}
}


function goToMatch(editor: vscode.TextEditor, range: vscode.Range) {
	editor.setDecorations(borderDecorationType, [range]);
	editor.selection = new vscode.Selection(range.start, range.end);
	editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
}

    const searchCommand = vscode.commands.registerCommand('logHighlighter.search', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !isLogFile(editor)) {
            vscode.window.showInformationMessage('This command works only on .log files.');
            return;
        }
				const userInput = vscode.window.createInputBox()
				userInput.placeholder = 'Enter keywords and/or time filters (e.g., "error -S 10:00:00 -U 12:00:00")';
				userInput.prompt = 'Highlight logs based on keywords and/or time range';
				userInput.ignoreFocusOut = true;

				userInput.onDidChangeValue((searchTerm) => {
					const { since, until } = parseTimeFilter(searchTerm);
					const keywords = searchTerm.replace(/-S\s*\d{2}:\d{2}:\d{2}/, '').replace(/-U\s*\d{2}:\d{2}:\d{2}/, '').trim();

					updateDecorations(keywords, { since, until });
				});

				userInput.onDidAccept(() => {
					if (matches.length > 0) {
							currentMatchIndex = (currentMatchIndex + 1) % matches.length;
							goToMatch(editor, matches[currentMatchIndex]);
					}
			});

				userInput.onDidHide(() => {
					editor.setDecorations(highlightDecorationType, []);
					editor.setDecorations(dimDecorationType, []);
					editor.setDecorations(hiddenDecorationType, []);
					matches = [];
					currentMatchIndex = 0;
			});

				userInput.show();
    });

    const clearCommand = vscode.commands.registerCommand('logHighlighter.clearHighlights', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
					editor.setDecorations(highlightDecorationType, []);
					editor.setDecorations(dimDecorationType, []);
					editor.setDecorations(hiddenDecorationType, []);
					matches = [];
					currentMatchIndex = 0;
        }
    });

    vscode.workspace.onDidChangeConfiguration(() => {
        inactiveOpacity = config.get<number>('inactiveOpacity', 0.3);
        highlightColor = config.get<string>('highlightColor', 'yellow');
				isHighlightDisabled = config.get<boolean>('disableHighlight', false);
				hideNonMatchingLines = config.get<boolean>('hideNonMatchingLines', false);
    });

    context.subscriptions.push(searchCommand, clearCommand);
}

export function deactivate() {}
