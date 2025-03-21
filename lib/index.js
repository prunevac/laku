#!/usr/bin/env node

const {useContext, showCurrentContext, showAllContexts} = require('./context');
const {printHelp} = require('./help');
const {portForward} = require('./port-forward');
const {getResources} = require('./get-resources');
const {repeatCommand} = require("./repeat-command");
const {isCustomCommand, runCustomCommand} = require("./custom");

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
            await portForward('pod');
            break;
        case 'get':
            await getResources();
            break;
        case 'pfs':
            await portForward('service');
            break
        case 'r':
            repeatCommand()
            break;
        case 'h':
            printHelp();
            break;
        default:
            if(isCustomCommand(arg)) {
                await runCustomCommand(arg)
                return
            }
            console.log('unsupported cmd line agrument:', arg);
            printHelp();
    }
};

main().catch((e) => console.log(e));