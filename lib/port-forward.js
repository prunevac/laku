const cp = require('child_process');
const {selectContext, selectNamespace, selectPod} = require('./misc');
const {input} = require('./cli');

const validatePort = (value) => {
    const numVal = Number(value);
    return isNaN(numVal) || numVal >= 0 && numVal <= 65535;
};

const selectPort = (question) => input({
    question,
    defaultValue: 8080,
    invalidWarning: 'valid ports are numbers in range [0,65535]',
    validationCallback: validatePort,
});

const portForward = async () => {
    console.log('lazy kubectl get pods');
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