---
title: Making Kubernetes devops less painful
date: '2019-03-18T19:44:37.121Z'
cover: header.jpeg
---

![Photo by Cameron Venti on Unsplash](./header.jpeg)

Today, Kubernetes is the de facto container orchestration solution. Together with the devops culture, developers have to get familiarised to its tools, such as kubectl.

After some point though, using kubectl for everything can get quite verbose, specially if you use many namespaces and contexts. The following tips try to minimise the pain of doing operations solely through it, sometimes even using other tools besides it.

## kubectx: context and namespaces management

The operations done in kubectl usually require two params: context and namespace. Any operation will result in something as `kubectl --context dev --namespace hello-world exec -it hello-world-app-0 sh`. For a one time operation, probably it is fine, but after some point it can get cumbersome. One way to avoid these long command strings is by using [ `kubectx` ](https://github.com/ahmetb/kubectx).

After installing it, the context can be set simply using `kubectx dev` and the namespace as `kubens hello-world`. To list the available contexts and namespaces, just run it without arguments. This will make the above operation to be as `kubectl exec -it hello-world-app-0 sh`.

## Terminal aliases

Seasoned unix developers are quite used to terminal aliases. Some are quite popular that are even grouped in packs, such as [oh-my-zsh git aliases](https://github.com/robbyrussell/oh-my-zsh/blob/master/plugins/git/git.plugin.zsh). With Kubernetes is not that different.

Usually, having `alias k="kubectl "` already make operations shorter. Using the same example, it would give us `k exec -it hello-world-app-0 sh`. But, most likely, one alias will not be enough. There are some options for this.

The first one can be set-up in any terminal emulator (zsh, bash...). Get the `.kubectl_aliases` file from [`ahmetb/kubectl-aliases`](https://github.com/ahmetb/kubectl-aliases) and place it in your home directory. After sourcing it on `.zshrc` or `.bashrc`, 600 aliases will be available out-of-box.

```bash
# insert it in your .zshrc or .bashrc file
[ -f ~/.kubectl_aliases ] && source ~/.kubectl_aliases
```

If [`zsh`](http://zsh.sourceforge.net/) and [`oh-my-zsh`](https://ohmyz.sh/) are already set-up, an easier option would be using the pre-installed `kubectl` plugin. To enable it, edit your `.zshrc` and add it to the `plugins` variable ([more details about oh-my-zsh plugins here](https://github.com/robbyrussell/oh-my-zsh#plugins)).

```bash
# .zshrc configs...
plugins=(git kubectl ...)
```

There are fewer aliases compared to `ahmetb/kubectl-aliases`, making it easier to learn and faster to load. The list of `oh-my-zsh/kubectl` aliases is [ available here ](https://github.com/robbyrussell/oh-my-zsh/tree/master/plugins/kubectl)

`kubectx` and `kubens` do not have aliases by default. To allow shorter calls for it, place the following on `.zshrc` or `.bashrc`.

```bash
# .zshrc/.bashrc configs...
alias kns="kubens"
alias kcx="kubectx"
```

After all these aliases been set-up, the `hello-world-app-0 sh` can be accessed using a simple `keti hello-world-app-0 sh`. As games, it will be as learning combar combos, although it will not be as close as a Hadouken combo.

## Easy namespace and context indicator in the terminal

Developers are humans (in case you didn't know) and humans do not have bulletproof memory. One can forget that kubernetes context is set to production and then run `kubectl apply` against production (instead of dev).

To avoid this, an indicator can be used in the terminal to show what is the actual context and namespace. The easiest way to do it is by using [`kube-ps1`](https://github.com/jonmosco/kube-ps1). After installed, it will show on the left side of your terminal input (known as PS1), something as the following.

It already comes with `oh-my-zsh`, just requiring it to be enabled on `.zshrc`.

```bash
# .zshrc configs...
plugins=(git kubectl kube-ps1 ...)
```

If required, it can be toggled using `kubeon` or `kubeoff`. Using a `-g` flag will toggle it in all active terminal sessions.

## Investigating logs: the sane way

## Automatic deployments (advanced)

## Conclusion

## References

- Header image: Photo by [Cameron Venti](https://unsplash.com/photos/QtETdXXR7gs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on Unsplash
