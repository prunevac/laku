# laku (lazy kubectl)
**laku** is a zero dependency node.js based interactive wrapper of (very few) kubectl commands. Its main goal is to shorten the verbosity of frequently used kubectl commands and to avoid mundane copy pasting.
## install
Installing the package globally gives you access to **laku** command line keyword.  
```npm install laku -g```
## capabilities
### select context
Without **laku**:
1. `kubectl config get-contexts`
1. `kubectl config use-context <CONTEXT_NAME>`  

With **laku**:  
`laku c`  
It will prompt an interactive selection from available contexts.
### show currently selected context
`laku cs`
### show all contexts
`laku csa` is just a less verbose alias to `kubectl config get-contexts`
### port forward
![](pf.gif)
### get pods
`laku gp` is an interactive wrapper of `kubectl get pods --namespace <NAMESPACE_NAME> --contexts <CONTEXT_NAME>`
## disclaimer
**laku** was made as a hobby project. It works on win10 with node.js 14.17.1 and kubectl 1.20.0. It should most likely work on other operating systems with newer node.js version. It depends on parsing of kubectl command outputs, when format of those outputs change then it will not work anymore.