const cp = require('child_process');
const {select, input} = require('./cli');

const SELECTED_CONTEXT_REGEX = /^\s*\*/;

/**
 * @returns {Array<{name:string, current:boolean}>}
 */
const getContexts = () => {
    const namespacesRaw = cp.execSync('kubectl config get-contexts', {encoding: 'utf-8'});
    const split = namespacesRaw.trim().split('\n');
    split.shift();
    return split.map(line => {
        const current = SELECTED_CONTEXT_REGEX.test(line);
        const lineSplit = current ? line.split(SELECTED_CONTEXT_REGEX)[1].trim().split(/\s/) : line.trim().split(/\s/);
        return {name: lineSplit[0], current};
    });
};

/**
 * @return {Promise<string>}
 */
const selectContext = () => {
    const contexts = getContexts();
    const selectedContext = contexts.findIndex(c => c.current);
    const contextNames = contexts.map(c => c.name);
    return select({question: 'select context', options: contextNames, pointer: selectedContext});
};

/**
 * @param {string} context
 * @return {Promise<string>}
 */
const selectNamespace = (context) => {
    const nsRaw = cp.execSync(`kubectl get ns --context ${context}`, {encoding: 'utf-8'});
    const nsSplit = nsRaw.trim().split('\n');
    nsSplit.shift();
    const namespaces = nsSplit.map(s => s.trim().split(/\s/).shift());
    return select({question: 'select namespace', options: namespaces, autocomplete: true});
};

/**
 * @param {string} resource
 * @param {string} context
 * @param {string} namespace
 * @return {Promise<string>}
 */
const selectResource = (resource, context, namespace) => {
    const podsRaw = cp.execSync(`kubectl get ${resource}s --namespace ${namespace} --context ${context}`, {encoding: 'utf-8'});
    const resourceSplit = podsRaw.trim().split('\n');
    resourceSplit.shift();
    const resources = resourceSplit.map(s => s.trim().split(/\s/).shift());
    return select({question: `select ${resource}`, options: resources, autocomplete: true});
};

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


module.exports = {getContexts, selectContext, selectNamespace, selectResource, selectPort};