const vscode = require('vscode');
const faker = require('faker');

const fakerGenerators = [
	'address.zipCode',
	'address.city',
	'address.cityPrefix',
	'address.citySuffix',
	'address.streetName',
	'address.streetAddress',
	'address.streetSuffix',
	'address.streetPrefix',
	'address.secondaryAddress',
	'address.county',
	'address.country',
	'address.countryCode',
	'address.state',
	'address.stateAbbr',
	'address.latitude',
	'address.longitude',
	'commerce.color',
	'commerce.department',
	'commerce.productName',
	'commerce.price',
	'commerce.productAdjective',
	'commerce.productMaterial',
	'commerce.product',
	'company.suffixes',
	'company.companyName',
	'company.companySuffix',
	'company.catchPhrase',
	'company.bs',
	'company.catchPhraseAdjective',
	'company.catchPhraseDescriptor',
	'company.catchPhraseNoun',
	'company.bsAdjective',
	'company.bsBuzz',
	'company.bsNoun',
	'database.column',
	'database.type',
	'database.collation',
	'database.engine',
	'date.past',
	'date.future',
	'date.between',
	'date.recent',
	'date.month',
	'date.weekday',
	'finance.account',
	'finance.accountName',
	'finance.mask',
	'finance.amount',
	'finance.transactionType',
	'finance.currencyCode',
	'finance.currencyName',
	'finance.currencySymbol',
	'finance.bitcoinAddress',
	'finance.iban',
	'finance.bic',
	'hacker.abbreviation',
	'hacker.adjective',
	'hacker.noun',
	'hacker.verb',
	'hacker.ingverb',
	'hacker.phrase',
	// 'helpers.randomize',
	// 'helpers.slugify',
	// 'helpers.replaceSymbolWithNumber',
	// 'helpers.replaceSymbols',
	// 'helpers.shuffle',
	// 'helpers.mustache',
	// 'helpers.createCard',
	// 'helpers.contextualCard',
	// 'helpers.userCard',
	// 'helpers.createTransaction',
	'image.image',
	'image.avatar',
	'image.imageUrl',
	'image.abstract',
	'image.animals',
	'image.business',
	'image.cats',
	'image.city',
	'image.food',
	'image.nightlife',
	'image.fashion',
	'image.people',
	'image.nature',
	'image.sports',
	'image.technics',
	'image.transport',
	'image.dataUri',
	'internet.avatar',
	'internet.email',
	'internet.exampleEmail',
	'internet.userName',
	'internet.protocol',
	'internet.url',
	'internet.domainName',
	'internet.domainSuffix',
	'internet.domainWord',
	'internet.ip',
	'internet.ipv6',
	'internet.userAgent',
	'internet.color',
	'internet.mac',
	'internet.password',
	'lorem.word',
	'lorem.words',
	'lorem.sentence',
	'lorem.slug',
	'lorem.sentences',
	'lorem.paragraph',
	'lorem.paragraphs',
	'lorem.text',
	'lorem.lines',
	'name.firstName',
	'name.lastName',
	'name.findName',
	'name.jobTitle',
	'name.prefix',
	'name.suffix',
	'name.title',
	'name.jobDescriptor',
	'name.jobArea',
	'name.jobType',
	'phone.phoneNumber',
	'phone.phoneNumberFormat',
	'phone.phoneFormats',
	'random.number',
	'random.arrayElement',
	'random.objectElement',
	'random.uuid',
	'random.boolean',
	'random.word',
	'random.words',
	'random.image',
	'random.locale',
	'random.alphaNumeric',
	'system.fileName',
	'system.commonFileName',
	'system.mimeType',
	'system.commonFileType',
	'system.commonFileExt',
	'system.fileType',
	'system.fileExt',
	// 'system.directoryPath',
	// 'system.filePath',
	'system.semver'
];

faker.locale = vscode.workspace.getConfiguration("generateData").get("localisation", "en");

const generators = fakerGenerators.map((fg => {
	var fakerCommand = "{{" + fg + "}}";
	return {
		name: fg,
		func(options) {
			return faker.fake(fakerCommand);
		}
	}
}));

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('extension.generateData', listGenerators);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.generateDataMultiple', function () {
		listGenerators('multiple');
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('extension.generateDataReplace', function () {
		replaceAllPlaceholder();
	});
	context.subscriptions.push(disposable);
}
exports.activate = activate;

/**
 * Insert generator result to current cursor position 
 */
function insertData(config) {
	var editor = vscode.window.activeTextEditor;
	editor.edit(
		edit => editor.selections.forEach(
			selection => {
				edit.delete(selection);
				for (let i = 0; i < config.count; i++) {
					edit.insert(selection.start, (i > 0 ? '\n' : '') + generators.find((item) => config.generatorName === item.name).func(config));
				}
			}
		)
	);
}

/**
 * Show list of generators to select  
 */
function listGenerators(type) {
	const options = {
		matchOnDescription: true,
		matchOnDetail: false,
		placeHolder: "Select generator type"
	};

	function onRejectListGenerators(reason) {
		vscode.commands.executeCommand("setContext", "inDataGeneratorList", false);
		vscode.window.showInformationMessage(`Error loading generators: ${reason}`);
	}

	function onResolve(selected) {
		vscode.commands.executeCommand("setContext", "inDataGeneratorList", false);
		if (!selected) {
			return;
		}

		getInterationCount(type).then((count) => {
			insertData({
				count: count,
				generatorName: selected
			});
		});
	}

	if (generators.length === 0) {
		vscode.window.showInformationMessage("No generators available!");
		return;
	} else {
		vscode.commands.executeCommand("setContext", "inDataGeneratorList", true);
		vscode.window.showQuickPick(generators.map((item) => item.name), options)
			.then(onResolve, onRejectListGenerators);
	}
}

/**
 * Ask user how many elements should be generated
 */
function getInterationCount(type) {
	return new Promise(
		function (resolve) {
			if (type === 'multiple') {


				const options = {
					placeHolder: "How many generations you need?",
					value: "1"
				};

				function onRejectListGenerators(reason) {
					vscode.commands.executeCommand("setContext", "inGeneratorCount", false);
					vscode.window.showInformationMessage(`Error loading generators: ${reason}`);
				}

				function onResolve(selected) {
					vscode.commands.executeCommand("setContext", "inGeneratorCount", false);
					if (!selected) {
						return;
					}

					resolve(selected)
				}
				vscode.commands.executeCommand("setContext", "inGeneratorCount", true);
				vscode.window.showInputBox(options)
					.then(onResolve, onRejectListGenerators);

			} else {
				resolve(1)
			}
		});
}

function nextLoopTag(content) {
	var nextLoopStart = content.match(/<<gd.loop\|\d+(\|.+)?>>/);
	var nextLoopEnd = content.match(/<<\/gd.loop>>/);

	var type = "none";
	var preContent = content;
	var afterContent = "";
	var separator = "";
	var loopCount = 0;

	if ((nextLoopStart && nextLoopEnd && nextLoopStart.index < nextLoopEnd.index) || (nextLoopStart && !nextLoopEnd)) {
		type = "start";
		loopCount = parseInt(nextLoopStart[0].match(/\d+/));
		separator = nextLoopStart[0].replace(/^<<gd.loop\|\d+/, '').replace(/^\|/, '').replace(/>>$/, '');
		preContent = content.substr(0, nextLoopStart.index);
		afterContent = content.substr(nextLoopStart.index + nextLoopStart[0].length);
	} else if ((nextLoopStart && nextLoopEnd && nextLoopStart.index > nextLoopEnd.index) || (!nextLoopStart && nextLoopEnd)) {
		type = "end"
		try {
			preContent = content.substr(0, nextLoopEnd.index);
		} catch (e) {
			console.log("test" + e);
		}
		afterContent = content.substr(nextLoopEnd.index + nextLoopEnd[0].length);
	}

	preContent = preContent.replace(/ *$/, '');

	afterContent = afterContent.replace(/^ *\r\n/, '');

	return {
		type: type,
		loopCount: loopCount,
		preContent: preContent,
		afterContent: afterContent,
		separator: separator
	}
}

function removeLoops(notParsedContent) {

	var level = 0;

	var levelContent = [
		""
	];
	var levelLoopCount = [];
	var levelLoopSeparator = [];
	var current;

	do {
		current = nextLoopTag(notParsedContent);

		levelContent[level] = (levelContent[level] || "") + current.preContent;

		if (current.type === "start") {
			level++;
			notParsedContent = current.afterContent;
			levelLoopCount[level] = current.loopCount;
			levelLoopSeparator[level] = current.separator;
		} else if (current.type === "end") {

			var newlineFix = /\n$/.test(levelContent[level]);
			if (newlineFix) {
				levelContent[level] = levelContent[level].replace(/\r\n$/, '').replace(/\n$/, '').replace(/\r$/, '');
				levelLoopSeparator[level] += '\r\n';
			}

			levelContent[level - 1] = (levelContent[level - 1] || "") + Array(levelLoopCount[level]).fill(levelContent[level]).join(levelLoopSeparator[level]);

			if (newlineFix) {
				levelContent[level - 1] += '\r\n';
			}

			levelContent[level] = "";
			levelLoopCount[level] = 0;
			levelLoopSeparator[level] = "";
			level--;
			notParsedContent = current.afterContent;
			if (level < 0) {
				// Error: Missing generate data loop tag.
				vscode.window.showInformationMessage("Error: Missing generate data loop-start-tag.");
				return null;
			}
		}
	} while (current.type !== "none")

	if (level != 0) {
		// Error: Missing generate data loop tag.
		vscode.window.showInformationMessage("Error: Missing generate data loop-end-tag.");
		return null;
	}

	return levelContent[0];
}

function removePlaceholderTags(notParsedContent) {


	var parsedContent = "";
	var current;

	do {
		current = notParsedContent.match(/<<gd\..+?>>/);
		if (current) {
			parsedContent += notParsedContent.substr(0, current.index);
			parsedContent += generators.find((item) => current[0].replace(/^<<gd\./, '').replace(/>>$/, '') === item.name).func({});
			notParsedContent = notParsedContent.substr(current.index + current[0].length)
		}
	} while (current)

	parsedContent += notParsedContent;

	return parsedContent;
}

function replaceAllPlaceholder() {

	const textEditor = vscode.window.activeTextEditor;

	if (!textEditor) {
		return; // No open text editor
	}

	var contentWithoutLoops = removeLoops(textEditor.document.getText());

	if (contentWithoutLoops === null) {
		return;
	}

	var contentWithoutPlaceholders = removePlaceholderTags(contentWithoutLoops);

	var lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
	var textRange = new vscode.Range(0, 0, textEditor.document.lineCount - 1, lastLine.range.end.character);

	textEditor.edit(function (editBuilder) {
		editBuilder.replace(textRange, contentWithoutPlaceholders);
	}).then(success => {
		if (success) {
			var postion = textEditor.selection.end;
			textEditor.selection = new vscode.Selection(postion, postion);
		}
	})
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}