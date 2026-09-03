# (01/15/2026) EmployeeOne / User-Terminal


(08/20/2026) - *Hindsight* I should have named this section: User-Terminal, or Testing-Terminal (tt.md | TT.py | TestTerminal.c (examples))
I mean, this container is basically a user terminal within a container built to isolate the `terminal's` signal while using web tools.  
My naming convention... ugh...  

- EmployeeOne  / **Testing-Terminal**  

What is the purpose of this portion of the lab? Well...?...  
A while back I read a cybersecurity-type article that told about an engineer who was working for some tech company. The engineer noticed that (If I am saying this correctly) some small- I imagine we're talking about hundredths of milliseconds- during their attempts to log into their respective company via `SSH`. So, long story short, the engineer noticed this "blip and bloop", did some things, and discovered what the actual cause was. I do not want to recreate the hack. After I initially read the article, I thought about how incredible the engineer's recognition was, and then I got curious. I'm not curious about disrupting the `SSH` connection process. So, for this `SSH Lab`'s container, it should behave as a normal terminal `SSH`ing into the `Web-https` container.  This container is represented as a known local computing device that `SSH`es into. The purpose is to isolate the user / Testing-Terminal's tool/activity signal. Not sure if my description about why it made me curious was accurate...   
   


## Higher View - `Web-https`  

Receives a connection request:  
    - Employee `SSH`es into the `Web-https` container...  
        - `Web-https` logs the employee connection named: `EmployeeOne`  w/ Timestamp.  
        - `Web-https` logs that the employee disconnected (timestamped).  

## `EmployeeOne`  

The Employee:  
    - `EmployeeOne` creates the `SSH` connection...  
    - Receives a terminal notification that they are connected to their company's resources, this being the `Web-https` server.  
    -  Must enter the `RUN` command: `RUN`  
        - To start the `EmployeeOne` simulation  
    - `EmployeeOne` is connected for a set period of time  
    - `EmployeeOne` is automated to do something simple  
    - `EmployeeOne` disconnects the `SSH` connection after a set period of time...  
    Once the employee disconnects their connection...  
        - Manually with `ctrl+c`  
        - Else, `EmployeeOne` completes that segment of the employee work cycle and loops the same process again after a set period of time.  

`Packet Capture`: Records the network interaction...  


### Mini-Terminal: mini-term

`EmployeeOne`'s `Terminal`  


### Terminal Widget (08/25/2026.1045NMT)

- **Reduild**:  

    - Because the Lab Console image copies the HTML/CSS/JS static files into nginx, rebuild/recreate only that service:  


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
    Currently, it is too messy - visually and functionally.
    I am attempting to get the web-based terminal to function correctly.


- Then inspect ssh1:

    `docker logs lab_ssh1 --tail=100`  

***Still Yikes!***  

I have things there, but things are not rebuilding correctly.
Rebuilt `ssh1` is still using the old, malformed `ttyd` launcher.
The startup log still showed:  
  
```start command: # Port for ttyd to listen on...
The --writable option is not set```  

- What this means is that the `-w` patch did not make it into the running container.  
The patch was applied to the `services\ttyd` -> `run` file:  

```
exec ttyd \
    -W \   The "w" patch
    -p 7681 \
    -i 0.0.0.0 \
    -t disableLeaveAlert=true \
    -t fontSize=12 \
    -t titleFixed="EmployeeOne - SSH Lab" \
    /usr/local/bin/employee-terminal```

## Terminal in `C` (employee_terminal.c) (08/31/2026.1400)

This is a constrained lab terminal, not a general Linux shell.
It represents EmployeeOne interacting with simulated company
resources with the `Terminal Widget`.  

### Current behavior  

- `RUN` starts a controlled automated session.  
- `HELP` displays available commands.  
- `Exit` closes the terminal.  
- **Commands** are whitespace-tolerant and case-insensitive.  
- `RUN` creates a session/correlation ID.  
- **Employee-side** activity is logged to /timeSheet/timesheet.csv.  
- **HTTPS** health checks originate from ssh1.  
- `Ctrl+C` stops an active `RUN` session without closing the terminal.  
- `SIGHUP` / `SIGTERM` cleanly stop the active session before exiting.  
  
Possible improvements:  
  
- "Company" -side logging is prepped through the optional
EMPLOYEE_COMPANY_LOG_URL environment variable.  

  
***NOTE***: This is a lab simulation, not a real timesheet system.  

***To Rebuild***  

We want to prepare to rebuild...  

**NOTE** Withing the Main Container.  
  
`docker compose build --no-cache ssh1`  
  
Move on to the next step ***IF*** you receive the `"✔ Image Whatever_itsNamed Built"`...  

- Recreate only that `ssh1` instance. (I don't like my naming convention. Next time bust open a thesaurse - maybe choose something other than what got me to that page...)  

`docker compose up -d --force-recreate ssh1`  

*IF* you get the `[+]` up & checkmark `✔`,
now the container for `this_lab` / `lab_ssh1` has started.  

- Next, verify `ttyd`'s launch was resolved with `--tail=80`

`docker logs lab_ssh1 --tail=80`

It started, but to test I have to have atleast the:  
  
- `lab_console`  
- `lab_ssh1`  
- `lab_web_https`  

***Next***  

`***Spin It Up***``  

`docker compose up -d`  

Should recieve `Started`  

***Next***  

`docker compose ps`  

- After a *gasp* or two. We should receive something like this in the terminal.  

```
NAME            IMAGE                      COMMAND                  SERVICE       CREATED          STATUS              PORTS
lab_console     sandbox-lab_console        "The Command…"           lab_console   9 days ago       Up About a minute   IP & Port-> Port numb/tcp
lab_this        nicolaka/netshoot:latest   "How much sleep"         smellsthings  11 days ago      Up About   
lab_that        sandbox-ssh1               "/init"                  TestTerminal  47 minutes ago   Up 47 minutes       numb/tcp, numb/tcp
lab_boxofthings nicolaka/netshoot:latest   "How much sleep"         box           11 days ago      Up About   
lab_http        sandbox-web-http           "Website…"               web-http      11 days ago      Up                  80/tcp
lab_https       sandbox-web-https          "Website…"               web-https     11 days ago      Up                  80/tcp, 443/tcp 
```  

**IF**! Everthing is fine, 
check the published dashbord port:  

`docker ps --format "table {{.Names}}\t{{.Ports}}"`

This will display the `NAMES` & `PORTS`.  
Also, from the previous command that generated the previous table data, that tells you what the name of the ports we want to test.  

### Test Dashboard Uno!

Start with the `lab_console` = `127.0.0.1:8088->8088/tcp`  

- Test command:  

`curl -I http://127.0.0.1:8088/`  

**After Testing**  

Something like this should display:  

```
HTTP/1.1 200 OK
Server: Whatever_Server
Date: Thu, 03 Sep 2026 22:21:24 NMT
```

**Next**

- Test the destinations `RUN` command that is used, from inside the shell.  

Navigate or Drill down...
I navigated through four directories.  

Destination Test:  

```
docker exec lab_ssh1 sh -lc '
wget -q0- \
    --no-check-certificate \
    --timeout=3 \
    --tries=1 \
    https://lab_web_https/health
    '
```

![Lab Console](../../../Sandbox_images/lab_console.png)

![HELP](<../../../Sandbox_images/TerminalTest_Set(1of1) (3).png>)
![HELP](<../../../Sandbox_images/TerminalTest_Set(1of1) (4).png>)
![RUN](<../../../Sandbox_images/TerminalTest_Set(1of1) (5).png>)
![RUN](<../../../Sandbox_images/TerminalTest_Set(1of1) (6).png>)




