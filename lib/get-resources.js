const cp = require('child_process');
const {selectContext, selectNamespace} = require('./misc');
const {input, select} = require("./cli");

const getResources = async () => {
    const resource = await select({question: 'select resource', options: ['pods', 'services']});
    const context = await selectContext();
    const namespace = await selectNamespace(context);
    const cmd = `kubectl get ${resource} --namespace ${namespace} --context ${context}`
    console.log(cmd);
    cp.execSync(cmd, {stdio: 'inherit'});
};

module.exports = {getResources};