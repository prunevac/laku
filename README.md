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

### pf (port forward for pods)
![](https://github.com/prunevac/laku/blob/master/pf.gif)

### pfs (port forward for services)
The same as `laku pf`, the only difference is it port-forwards services and not pods.

### r
Repeats last kubectl command executed via `laku pf`, `laku pfs` or `laku get`

### get
`laku get` is an interactive wrapper of `kubectl get <RESOURCES> --namespace <NAMESPACE_NAME> --contexts <CONTEXT_NAME>`, where available `<RESOURCES>` are `pods` and `services`