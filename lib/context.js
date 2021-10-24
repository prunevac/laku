const cp = require('child_process');
const {getContexts, selectContext} = require('./misc');

const useContext = async () => {
    const selection = await selectContext()
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

module.exports = {useContext, showCurrentContext, showAllContexts};