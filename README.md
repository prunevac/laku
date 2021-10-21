# laku (lazy kubectl)
When you are tired of reusing long kubectl commands, then **laku** is for you. It is an interactive command line tool trying to lessen:
1. the number of keys required to execute some common kubectl commands
2. the usage of copy paste
## install
Installing the package globally gives you access to **laku** command line keyword.  
```npm install laku -g```
## current capabilitis
+ selecting context  
  Selecting context is in kubectl world done by calling `kubectl config use-context <CONTEXT_NAME>`, where you have to know the *<CONTEXTN_NAME>* beforehand (usually by calling `kubectl config get-contexts`). That seemed like a lot of worlds to me, so calling `laku c` does the same and the available contexts are chosen interactively (by arrows keys and enter).
+ getting current context  
  Normally done by calling `kubectl config get-contexts` and searching for an asterisk. It can now be done by valling `laku cs`.
+ showing all contexts  
  `kubectl config get-contexts` is aliased as `laku csa`, because 8 characters < more than 20 characters.
+ port forward  
  The sequence is usually  
  1. get desired context
  1. choose a namespace
  1. call `get pods` and pick one
  1. writing it all into `kubectl port-forward` command  
  With **laku** all you have to do is to call `laku pf` and the process will be made as easy as possible - choose your desired interactively, no typos, no copy pasting (if you have a lot of pods, then yes, it could have been done probably better).
+ get pods  
  `kubectl get pods -n <NAMESPACE> --context <CONTEXT>` is aliased as `laku gp` and selecting *<NAMESPACE>* and *<CONTEXT>* is yet again interactive.
+ really short description of these commands can be obtained straight from command line by calling `laku h` or simply `laku`

## disclaimer
This project came to be only because I was lazy. It was tested only on windows, because I don't have any other operating systems (even though I am fairly confident it will work anywhere node.js runs). It was made on kubectl version 1.20.0 and if kubectl changes some of its outputs or syntax of calls, then it will obviously stop working.