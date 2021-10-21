const cp = require('child_process');
const {select} = require('./cli');

const SELECTED_CONTEXT_REGEX = /^\s*\*/;

/**
 * @returns {Array<{name:string, current:boolean}>}
 */
const getContexts = () => {
    const namespacesRaw = cp.execSync('kubectl config get-contexts', {encoding: 'utf-8'});
    const split = namespacesRaw.trim().split('\n');
    split.shift();
    return split.map(line=>{
        const current = SELECTED_CONTEXT_REGEX.test(line);
        const lineSplit = current ? line.split(SELECTED_CONTEXT_REGEX)[1].trim().split(/\s/) : line.trim().split(/\s/);
        return {name: lineSplit[0], current};
    })
}

const selectContext = (question) => {
    const contexts = getContexts();
    const selectedContext = contexts.findIndex(c=>c.current);
    const contextNames = contexts.map(c=>c.name);
    return select({question, options:contextNames, pointer:selectedContext});
}

const useContext = async () => {
    const contexts = getContexts();
    const selectedContext = contexts.findIndex(c=>c.current);
    const contextNames = contexts.map(c=>c.name);
    const selection = await selectContext('select context:')
    cp.execSync(`kubectl config use-context ${selection}`);
    showCurrentContext()
}

const showCurrentContext = () => {
    const contexts = getContexts();
    const current = contexts.find(c=>c.current);
    console.log('current context:', current.name);
}

const showAllContexts = () => {
    cp.execSync('kubectl config get-contexts', {stdio: 'inherit'});
}

module.exports = {useContext, showCurrentContext, showAllContexts, selectContext};