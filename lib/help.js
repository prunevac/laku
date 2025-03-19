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

        if (Array.isArray(description)) {
            description.forEach((item, i) => {
                if (i === 0) {
                    console.log(option.padEnd(5), item);
                    return;
                }
                console.log(''.padEnd(5), item);
            })
            return;
        }

        console.log(option.padEnd(5), optionMap[option]);
    });
    console.groupEnd();
};

module.exports = {printHelp};