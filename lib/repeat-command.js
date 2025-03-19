const {configuration, lastCommandKey} = require("./config");
const cp = require('node:child_process');

const repeatCommand = () => {
    const command = configuration.get()?.[lastCommandKey]
    if (!command) {
        console.log('no command to repeat')
        return
    }
    console.log('repeating last executed command');
    console.log(command);
    cp.execSync(command, {stdio: 'inherit'});
}

module.exports = {repeatCommand};