*tldr;*  
To ssh to a remote server and execute commands there use the following syntax:

```bash
ssh -A me 'bash -ic "<remote cmd>"'
```

Lets analyze the example by creating a deploy command for **dailytip**.

### 1. ssh aliases

Typing a remote server's ip-address each time you connect to it is inconvenient. A good rule here is to create a ssh alias by adding a few lines to `~/.ssh/config`:

```
host me
HostName ***.***.***.***
User ********
ForwardAgent no
```

Now you can type `ssh me` instead of `ssh <ip.address>`.

### 2. ssh remote commands

We can execute commands on a remote machine by passing a string to **ssh** command:

```bash
ssh me 'lsb_release -a'
```

This will execute the command `lsb_release -a` on a remote machine and pipe an output to the local stdout:

```
Distributor ID:	Ubuntu
Description:	Ubuntu 16.04.2 LTS
Release:	16.04
Codename:	xenial
No LSB modules are available.
```

### 3. ssh authorization agent

As we are going to deploy `dailytip` in this tutorial, the first thing to do is to pull updates from the repository:

```bash
ssh me 'cd ./dailytip && git pull'
```

However this doesn't work:

```
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

This is usually an authorization issue. After searching a bit we've come to the following option:

```
-A      Enables forwarding of the authentication agent connection.  This can also be specified on a per-host basis in a configuration file.
```

Lets try again:

```bash
 ssh -A me 'cd ./dailytip && git pull'
```

```
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

Ugh.. still failing. A good news here is that we've forgotten to check if any identity have been added to the ssh authorization agent. If there are no identities then nothing could be forwarded to a remote machine, so this might be a fail reason.

To check if there are any identities added to the ssh-agent type the following command:


```bash
> ssh-add -L
The agent has no identities.
```

No identities added. Not a problem! Lets add one:

```bash
> ssh-add ~/.ssh/id_rsa
Identity added: /Users/jakwuh/.ssh/id_rsa (/Users/jakwuh/.ssh/id_rsa)
```

And check again:

```bash
> ssh-add -L
ssh-rsa BGFE77ED... /Users/jakwuh/.ssh/id_rsa
```

Looks nice. At this point we could try our `git pull` command again:

```bash
> ssh -A me 'cd ./dailytip && git pull'
Already up-to-date.
```

Yay! It works.

> Beyond the scope of this tutorial, [deploy keys](https://developer.github.com/v3/guides/managing-deploy-keys/) are usually used for setting up CI/CD as a safer alternative to directly passing your identity with a `ssh -A` option.

### 4. ssh .bashrc

Our next step is to update package dependencies. We do this w/ `yarn`:

```bash
> ssh -A me 'cd ./dailytip && git pull && cd web && yarn'
Already up-to-date.
bash: yarn: command not found
```

But... we definitely have `yarn` on the remote machine, we could check it by simply `ssh me` and then typing `yarn`, right? So, what's going wrong here?

The reason here is that aliases are not initialized because neither [`.bashrc` nor `.bash_profile`](https://apple.stackexchange.com/a/51038) are loaded once we execute a `ssh` command. In order to `source` `.bashrc` config on a remote machine during `ssh` command execution we need to make it interactive. Actually we could do it with `bash -i` and this is the last step we need:

```bash
ssh -A me 'bash -ic "cd dailytip && git pull && cd web && yarn && npm run webpack && pm2 restart dailytip"'
```

Now we know how to `ssh` properly!
