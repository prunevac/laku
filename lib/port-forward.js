const cp = require('child_process');
const {selectContext, selectNamespace, selectPod, selectPort} = require('./misc');
const {input} = require('./cli');



const portForward = async () => {
    console.log('interactive kubectl port forward');
    const context = await selectContext();
    const namespace = await selectNamespace(context);
    const pod = await selectPod(context, namespace);
    const port = await selectPort('local port');
    const remotePort = await selectPort('remote port');
    while (true) {
        const command = `kubectl port-forward ${pod} ${port}:${remotePort} --namespace ${namespace} --context ${context}`;
        console.log(command);
        cp.execSync(command, {stdio: 'inherit'});
    }
};

module.exports = {portForward};