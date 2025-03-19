const cp = require('child_process');
const {selectContext, selectNamespace, selectService, selectPort} = require("./misc");


const portForwardService = async () => {
    console.log('interactive kubectl port forward (service)');
    const context = await selectContext();
    const namespace = await selectNamespace(context);
    const service = await selectService(context, namespace);
    const port = await selectPort('local port');
    const remotePort = await selectPort('remote port');
    while (true) {
        const command = `kubectl port-forward service/${service} ${port}:${remotePort} --namespace ${namespace} --context ${context}`;
        console.log(command);
        cp.execSync(command, {stdio: 'inherit'});
    }
};

module.exports = {portForwardService};