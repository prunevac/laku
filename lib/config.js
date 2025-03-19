const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')

const configPath = path.join(os.homedir(), '.laku')

const lastCommandKey = 'lastCommand'
const customCommandsKey = 'custom'

const getConfig = () => {
    const exist = fs.existsSync(configPath);
    if (!exist) {
        return {}
    }
    let rawContent
    try {
        rawContent = fs.readFileSync(configPath, 'utf8');
    } catch {
        console.log('cannot read config file', configPath);
        return {}
    }
    try {
        return JSON.parse(rawContent);
    } catch {
        console.log('corrupted config file', configPath);
        return {}
    }
}

const writeConfig = (config) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch {
        console.log('error writing to config file', configPath);
    }
}

let config = getConfig();
const configuration = {
    get: () => config,
    put: (update) => {
        const currentConfig = getConfig();
        const mergedConfig = {...currentConfig, ...update}
        writeConfig(mergedConfig);
        config = getConfig();
    }
}

module.exports = {configuration, lastCommandKey, customCommandsKey};