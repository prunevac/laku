const {useContext, showCurrentContext, showAllContexts} = require('./context');
const {printHelp} = require('./help');
const {portForward} = require('./port-forward')


const main = async () => {

    const cmdArgs = process.argv.slice(2);
    if (cmdArgs.length === 0) {
        printHelp();
        return;
    }
    if (cmdArgs.length > 1) {
        console.log('can\'t handle more than one cmd line argument');
        printHelp();
        return;
    }
    const arg = cmdArgs[0];
    switch (arg) {
        case 'c':
            await useContext();
            break;
        case 'cs':
            showCurrentContext();
            break;
        case 'csa':
            showAllContexts();
            break;
        case 'pf':
            await portForward()
            break;
        case 'gp':
            console.log('don\'t have yet..')
            break;
        default:
            console.log('unsupported cmd line agrument:', arg);
            printHelp();
    }
};

main().catch((e) => console.log(e));