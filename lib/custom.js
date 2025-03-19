const cp = require('node:child_process');
const {configuration, customCommandsKey, lastCommandKey} = require("./config");
const {selectContext, selectNamespace, selectResource, selectPort} = require("./misc");

const isBoolean = (val) => val === true || val === false

const isCustomConfigValid = (() => {
    const commands = configuration.get()?.[customCommandsKey]
    if (!commands) {
        return false
    }
    if (!Array.isArray(commands) || !commands.length) {
        return false
    }

    for (const {name, repeatable, resource, command, flags, description} of commands) {
        const valid = typeof name === 'string' && isBoolean(repeatable) &&
            (resource === 'pod' || resource === 'service') && typeof command === 'string' && typeof flags === 'string' &&
            (typeof description === 'string' || (Array.isArray(description) && description.every(el => typeof el === 'string')));
        if (!valid) {
            console.log('invalid custom command definition (skipping all custom commands)')
            return false
        }
    }
    return true

})()

const isCustomCommand = (commandName) => {
    if (!isCustomConfigValid) {
        return false
    }
    const commands = configuration.get()?.[customCommandsKey]
    return commands.some(c => c.name === commandName)
}

const runCustomCommand = async (commandName) => {
    if (!isCustomConfigValid) {
        console.log(`cannot run command ${commandName}, configuration is invalid`)
        return
    }
    const commands = configuration.get()?.[customCommandsKey]
    const commandDefinition = commands.find(c => c.name === commandName)
    if (!commandDefinition) {
        console.log(`cannot run command ${commandName}, command does not exist`)
        return
    }

    const {repeatable, resource, command, flags, description} = commandDefinition
    console.log(description);
    const context = await selectContext();
    const namespace = await selectNamespace(context);
    const selectedResource = await selectResource(resource, context, namespace);
    const cmd = `kubectl ${command} ${resource}/${selectedResource} --namespace ${namespace} --context ${context} ${flags}`;
    if (repeatable) {
        configuration.put({[lastCommandKey]: cmd});
    }
    console.log(cmd);
    cp.execSync(cmd, {stdio: 'inherit'});
}

module.exports = {isCustomConfigValid, isCustomCommand, runCustomCommand}