const {configuration, customCommandsKey} = require("./config");
const {isCustomConfigValid} = require("./custom");


const optionMap = {
    'c': 'select context',
    'cs': 'show name of an active context',
    'csa': 'show all contexts',
    'pf': 'port forward',
    'pfs': 'port backward (service)',
    'get': 'get resources (pods / services)',
    'r': ['repeat last executed kubectl command', 'only for commands run via laku pf, laku pfs, laku get'],
    'h': 'help',
};

const validArgs = Object.keys(optionMap);

const printHelp = () => {
    console.log('laku (lazy kubectl) is a command line (semi)interactive tool for easier usage of some kubectl commands');
    console.group('options:');
    validArgs.forEach(option => {
        const description = optionMap[option];
        printOne(option, description);
    });
    printCustomCommands()
    console.groupEnd();
};

const printCustomCommands = () => {
    if(!isCustomConfigValid) {
        return
    }
    const customCommands = configuration.get()[customCommandsKey]
    console.log()
    console.log('--- custom commands ---')
    customCommands.forEach(({name, description}) => {
        printOne(name, description);
    })
}

const printOne = (commandName, description) => {
    if (Array.isArray(description)) {
        description.forEach((item, i) => {
            if (i === 0) {
                console.log(commandName.padEnd(5), item);
                return;
            }
            console.log(''.padEnd(5), item);
        })
        return;
    }

    console.log(commandName.padEnd(5), description);
}

module.exports = {printHelp};