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
	'system.directoryPath',
	'system.filePath',
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

	disposable = vscode.commands.registerCommand('extension.generateDataMultiple', function() {
		listGenerators('multiple');
	});
	context.subscriptions.push(disposable);
}
exports.activate = activate;

function insertData(config) {
	var editor = vscode.window.activeTextEditor;
	editor.edit(
	  edit => editor.selections.forEach(
		selection => {
		  edit.delete(selection);
		  for(let i=0; i<config.count; i++) {
			edit.insert(selection.start, (i > 0 ? '\n' : '') + generators.find((item) => config.generatorName === item.name).func(config));
		  }
		}
	  )
	);
  }

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

	function getInterationCount(type) {
		return new Promise(
			function(resolve, reject) {
				if(type === 'multiple') {
					

					const options = {
						placeHolder: "How many generations you need?"
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

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
