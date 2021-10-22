const cp = require('child_process');
const {selectContext, selectNamespace} = require('./misc');

const getPods = async () => {
    console.log('lazy kubectl get pods');
    const context = await selectContext();
    const namespace = await selectNamespace(context);
    const cmd = `kubectl get pods --namespace ${namespace} --context ${context}`
    console.log(cmd);
    cp.execSync(cmd, {stdio: 'inherit'});
};

module.exports = {getPods};