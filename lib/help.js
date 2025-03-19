const optionMap = {
    'c': 'select context',
    'cs': 'show name of an active context',
    'csa': 'show all contexts',
    'pf': 'port forward',
    'pfs': 'port backward (service)',
    'get': 'get resources (pods / services)',
    'h': 'help',
};

const validArgs = Object.keys(optionMap);

const printHelp = () => {
    console.log('laku (lazy kubectl) is a command line (semi)interactive tool for easier usage of some kubectl commands');
    console.group('options:');
    validArgs.forEach(option => {
        console.log(option.padEnd(5), optionMap[option]);
    });
    console.groupEnd();
};

module.exports = {printHelp};