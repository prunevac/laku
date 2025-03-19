# laku (lazy kubectl)
**laku** is a zero dependency node.js based interactive wrapper of (very few) kubectl commands. Its main goal is to shorten the verbosity of frequently used kubectl commands and to avoid mundane copy pasting.

## install
Installing the package globally gives you access to **laku** command line keyword.  
```npm install laku -g```  
You can also use npx, e.g. `npx laku gp`

## capabilities

### select context
Without **laku**:
1. `kubectl config get-contexts`
2. `kubectl config use-context <CONTEXT_NAME>`  

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

### custom commands
There is support to setup "custom" kubectl commands with interactive context, namespace and pod/service (depending on configuration) selection. To do so:
1. Locate `.laku` configuration file in your home folder. If it's not there, create it.
2. It's a json file, manually add root level attribute `custom` - it's an array of user defined kubectl commands that can be run via laku.
3. Add your own definition with following attributes, all of them mandatory  

| attribute   | description                                                                                                                                    | type                |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| name        | command name, this is the laku subcommand to run the command                                                                                   | string              |
| description | command description. It will be printed when `laku h` is executed. If array is set,<br/> then each array element will be printed on a new line | string, string[]    |
| repeatable  | true - command can be repeated via `laku r` <br/>false - command cannot be repeated via `laku r`                                               | boolean             |
| resource    | whether to run the command on service or pod                                                                                                   | enum (service, pod) |
| command     | the kubectl command itself                                                                                                                     | string              | 
| flags       | additional flags to add to kubectl command (empty string of no flags are needed)                                                               | string              |    

example of `.laku` configuration file with custom command definition.
```json
{
  "lastCommand": "you shouldn't touch this",
  "custom": [
    {
      "name": "exec",
      "repeatable": true,
      "resource": "pod",
      "command": "exec",
      "flags": "-it /bin/sh",
      "description": "runs sh inside pod"
    },
    {
      "name": "logs",
      "repeatable": true,
      "resource": "service",
      "command": "logs",
      "flags": "-f",
      "description": ["streams log from a service", "also i like celery and kohlrabi" ]
    }
  ]
}
```

When running `laku h` with such config file, it prints
``` bash
laku (lazy kubectl) is a command line (semi)interactive tool for easier usage of some kubectl commands
options:
  c     select context
  cs    show name of an active context
  csa   show all contexts
  pf    port forward
  pfs   port backward (service)
  get   get resources (pods / services)
  r     repeat last executed kubectl command
        only for commands run via laku pf, laku pfs, laku get
  h     help
  
  --- custom commands ---
  exec  runs sh inside pod
  logs  streams log from a service
        also i like celery and kohlrabi
```

When running e.g. `laku exec`, it prompts context, then namespace and then pod selection and the runs `kubectl exec pod/selected-pod --namespace selected-namespace --context selected-context -it /bin/sh`.

It's important to note that adding custom command definition that doesn't adhere to described format will cause no custom commands to register.
Also, malforming the `.laku` config file (it has to be parseable JSON) can cause some other commands not to run at all (`laku r`), if that happens just fix the file or delete it altogether :).  
If already existing command is defined this way (either laku native or custom defined), the topmost one in `laku h` will be selected when executing.


### get
`laku get` is an interactive wrapper of `kubectl get <RESOURCES> --namespace <NAMESPACE_NAME> --contexts <CONTEXT_NAME>`, where available `<RESOURCES>` are `pods` and `services`