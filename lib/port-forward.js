const cp = require('child_process');
const {selectContext} = require('./context');
const {input, select} = require('./cli');

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
    console.log('PORT FORWARD');

    // context
    const context = await selectContext('context:'.toUpperCase());

    // namespace
    const nsRaw = cp.execSync(`kubectl get ns --context=${context}`, {encoding: 'utf-8'});
    const nsSplit = nsRaw.trim().split('\n');
    nsSplit.shift();
    const namespaces = nsSplit.map(s => s.trim().split(/\s/).shift());
    const namespace = await select('namespace:'.toUpperCase(), namespaces);

    // pod
    const podsRaw = cp.execSync(`kubectl get pods -n ${namespace} --context=${context}`, {encoding: 'utf-8'});
    const podSplit = podsRaw.trim().split('\n');
    podSplit.shift();
    const pods = podSplit.map(s => s.trim().split(/\s/).shift());
    const pod = await select('pod:'.toUpperCase(), pods);

    // muj port
    const port = await selectPort('local port'.toUpperCase());

    // kubernetojc port
    const remotePort = await selectPort('remote port'.toUpperCase());


    while (true) {
        const command = `kubectl port-forward ${pod} ${port}:${remotePort} -n ${namespace} --context ${context}`;
        console.log(command);
        cp.execSync(command, {stdio: 'inherit'});
    }
};

module.exports = {portForward};