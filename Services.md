# Lab Tool Box (01/07/2026)

Starting with `Nmap`, each additional *"tool"* should have it's *own* container.  

## Service Container:

- `Nmap`  to show what is running inside the container
-  `My`, or `User` terminal (employee_terminal)
-  

## Nmap: Live Host Discovery

## Nmap

What is `Nmap` or `Zenmap`? From a simple google search you can see the following: 

`Nmap` is used through the terminal/command line.  
`Zenmap` is a `Graphical User Interface` (GUI) that provides the user with a visual interface to interact with.  

- `Host Discovery`: Identifies which devices (hosts, servers, routers, switches) are online and reachable on a network.
- `Port Scanning`: Determines the state of ports on a target device (open, closed, or filtered by a firewall), which helps identify potential entry points for attackers.
- `Service` and `Version` Detection: Probes open ports to identify the application and specific software version of the service running on them. This helps in detecting outdated or vulnerable software.
- `Operating System` (OS) Detection: Analyzes network responses using TCP/IP stack fingerprinting to determine the OS (e.g., Linux, Windows, macOS) and hardware characteristics of the remote host.
- `Vulnerability` Detection: The Nmap Scripting Engine (NSE) allows users to run scripts to automate various tasks, including checking for specific known vulnerabilities, misconfigurations, and backdoors.
- `Network Inventory` and `Monitoring`: Network administrators use Nmap for routine tasks like asset management, monitoring server uptime, and ensuring security compliance.
Usage
- `Nmap` is primarily a `command-line interface` (CLI) tool available for **Linux**, **Windows**, and **macOS**. A graphical user interface (GUI) version called `Zenmap` is also available to help beginners visualize and interact with scan results.

`Nmap` is a powerful tool used by security professionals and ethical hackers for defensive purposes, ***BUT*** it can also be used by *malicious actors* for `reconnaissance`. `Unauthorized scanning` of networks may be **illegal**, so it should ***only*** be used on `your own network` or with **explicit permission** from the network owner (In writing).  


***Noted Sorces***  

Nmap: `https://nmap.org/`  
    - Reference Guide: `https://nmap.org/book/man.html`  


## # (01/15/2026) EmployeeOne / User-Terminal

(08/20/2026)*Hindsight* I should have named this section: User-Terminal, or Testing-Terminal (tt.md | TT.py | TestTerminal.c (examples))
I mean, this container is basically a user terminal within a container built to isolate the `terminal's` signal while using web-tools.  
my naming convention... ugh...  

- EmployeeOne  / **Testing-Terminal**  

What is the purpose of this portion of the lab? Well...?...  
A while back I read a cybersecurity-type article that told about an engineer who was working for some tech company. The engineer noticed that (If I am saying this correctly) some small, I imagine we're talking about hundredths of milliseconds, during their attempts to log into their respective company via `SSH`. So, long story short, the engineer noticed this "blip and bloop", did some things, and discovered what the actual cause was. I do not want to recreate the hack. After I initially read the article, I thought about how incredible the engineer's recognition was, and then I got curious. I'm not curious about disrupting the `SSH` connection process. So, for this `SSH Lab`'s container, it should behave as a normal terminal `SSH`ing into the `Web-https` container.  This container is represented as a known local computing device that `SSH`es into. The purpose is to isolate the user / Testing-Terminal's tool/activity signal.   


## Higer View - `Web-https`  

Receives a connection request:  
    - Employee `SSH`es into the `Web-https` container...  
        - `Web-https` logs the employee connection named: `EmployeeOne`  w/ Timestamp.  
        - `Web-https` logs that the employee disconnected (timestamped).  

## `EmployeeOne`:  

The Employee:  
    - `EmployeeOne` creates the `SSH` connection...  
    - Receives terminal notification that they are connected to their companies resources this being the `Web-https` server.  
    -  Must enter the `RUN` command: ` RUN `
        - To start the `EmployeeOne` simulation  
    - `EmployeeOne` is connected for a set period of time  
    - `EmployeeOne` is automated to do something simple  
    - `EmployeeOne` disconnects the `SSH` connection after set period of time...  
    Once the employee disconnects their connection...  
        - Manually with `ctrl+c`  
        - Else `EmployeeOne` completes that segment of the employee work cycle and loops the same process again after a set period of time.

`Packet Capture`: Records the network interaction...  


### Mini-Terminal: mini-term

`EmployeeOne`'s `Terminal`


### Terminal Widget (08/25/2026.1045NMT)

- **Reduild**:

    - Because, the Lab Console image copies the HTML/CSS/JS static files into nginx, rebuild/recreate only that service:  


```docker compose up -d --build --force-recreate lab_console```
  


```
up 4/4
 ✔ Image nmap-sandbox-lab_console      Built
 ✔ Image nmap-sandbox-ssh1             Built
 ✔ Container lab_ssh1                  Started
 ✔ Container lab_console               Started 
```

- **Verify** the actual served JavaScript

```curl -sS http://127.0.0.1:8088/terminal-widget.js | sed -n '1,260p'```  
  

- Then **Open**, or **Render** the terminal widget source at: `http://127.0.0.1:8088/`  

    ***Yikes*** the JS Terminal is... oh yeah! Yikes!!  
    Currently it is too messy - visually, and funcation.
    I am attempting to get the web-based terminal to function correctly.


- Then Inspect ssh1:

    `docker logs lab_ssh1 --tail=100`  

***Still Yikes!***  

I have things there, but things are not rebuilding correctly.
Rebuilt `ssh1` is still using the old malformed `ttyd` launcher.
The startup log still showed:  
  
```start command:  # Port for ttyd to listen on
The --writable option is not set```  

- What this means, is the `-w` patch did not make it into the running container.  
The patch was applied to `services\ttyd` -> `run` file:  

```
exec ttyd \
    -W \   The "w" patch
    -p 7681 \
    -i 0.0.0.0 \
    -t disableLeaveAlert=true \
    -t fontSize=12 \
    -t titleFixed="EmployeeOne - SSH Lab" \
    /usr/local/bin/employee-terminal
```

#### ***Noted Sources***  

- Microsoft Engineer Discovered Supply Chain Attack:  
    - `NPR`: `https://www.npr.org/2024/04/11/1244174104/one-engineer-may-have-saved-the-world-from-a-massive-cyber-attack`  
    - `Wiki`: `https://en.wikipedia.org/wiki/XZ_Utils_backdoor`  
- Linux Server Hub: `https://hub.docker.com/r/linuxserver`  
  
