const cp = require('child_process');
const {selectContext, selectNamespace, selectResource, selectPort} = require('./misc');



const portForward = async (resource) => {
    console.log(`interactive kubectl port forward for ${resource}s`);
    const context = await selectContext();
    const namespace = await selectNamespace(context);
    const selectedResource = await selectResource(resource, context, namespace);
    const port = await selectPort('local port');
    const remotePort = await selectPort('remote port');
    while (true) {
        const command = `kubectl port-forward ${resource}/${selectedResource} ${port}:${remotePort} --namespace ${namespace} --context ${context}`;
        console.log(command);
        cp.execSync(command, {stdio: 'inherit'});
    }
};

module.exports = {portForward};