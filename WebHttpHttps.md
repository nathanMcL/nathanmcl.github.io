# Lab Simulated Devices (01/08/2026)


- `Web-http`  
- `Web-https`  
- `EmployeeOne`  

***Let's Create!***  

## Web-http

The `Web-http` container is intended to represent a very basic `HTTP` server. The frontend index page is currently (01/13/2026) and intentionally configured to be an `HTTP` only website. The `Web-https` container is configured to behave like a basic `HTTPS` Website. I can add search bars and or other features to a different version of `Web-https`, that allows other things to be tested...  

On the network it:  
    - Listens on TCP port 80  
    - Responds to any hostname  
    - Serves static content  
    - Logs all requests in a clean, analyzable format  
    - Exposes a known /health endpoint  

### NGINX Configuration

With the `HTTP` container, we want to:  
- Have `events {}`: empty on purpose to keep the configuration minimal and behave how a `HTTP` server might.  
- The `http {}` protocol defines everything related to the `HTTP` behavior:  
    - logging  
    - headers  
    - servers
    - locations
- `log_format` defines what the `HTTP` server will log.  
- `access_log` can help in determining the `3-www`s:  
    - `When` the `(CD)` was requested to view the `HTTP` website.  
    - `Who` made the request.  
    - `What` resource(s) were requested.  
- `error_log` will show:  
    - config issues  
    - request issues  
    - runtime issues  
- The `/health` check is an endpoint that when probed should always return:  
    - HTTP `200`  
    - In plain text `ok`  
    This Simulates a device *ping* at the `Application` layer (7)  
- This will make the `Web-http` container easy to detect in logs and with `PCAP`s.  


### HTTP Index.html

Currently (01/13/2026), the `index.html` page **does not** have any `Content Security Policy` instructions. It "simply" serves the index.html file over an less secure connection.  

## Web-https

Similar with the basic `Web-http` container with it behaving *like* an `HTTP` server, the `Web-https` container requires a different configuration, or maybe a higher standard of logging and protocol standards that are required to create the `HTTPS` server. What excites me about this idea is I can create another `Web-https` container to clone a version of my server used with `Azure`...  


### The Docker File

The differences between *these* `HTTP` and `HTTPS` are:  
- Now we have to generate `TLS certs` in the image:
    
    ```
    --- HTTPS ---     ||  --- HTTP ---
    
    - nginx:alpine        - nginx:alpine
    - apk add openssl     - Does not
    - cert directory      - Does not
    - openssl req         - Does not 
    - listen 443 ssl;     - listen 80; 
    ```
        
  - 1. Both use the `alpine` image (could use another...).  
  - 2. Next the `cert directory` gets created:  
      - `mkdir` `-p` `/etc/nginx/certs`...  
  - 3. HTTPS uses `openssl req...O=MacN-Lab/OU=Training/...`, this will generate the required certification key. 
  - 4. We `COPY` these configurations when it goes into its runtime state (?)...  
  - 5. Lastly, we `Expose` the server port on `443`.  

These two `containers` do share:  
    - logging:  
        - `access_log` / `error_log`
        - `server_name _;` log all  
        - `location /` serving the static `index.html`, `CSS` files.  
        - `location = /health` returning `"OK\n"`.  

#### Front-End Web-https container 

(01/14/2026) After the containers are all spun-up and the servers are live, the `front-end` can be viewed. For this `Web-https` container I want to create a base-line for a *secured* front-facing web-app. I incorperated my other used `CSP` instructions. An actual static webpage can be viewed via terminal link. From this base line I can then create addtional variations if needed.

The Lab `HTTPS` `CSP` baseline goals:  
    - Allow only same-origin resources  
    - No inline scripts (none used)  
    - No inline styles  
    - No external fonts/CDNs  
    - Block object/embed  
    - restrict form actions  
    - No sniff  
    - No referrer  


## (01/15/2026) EmployeeOne / User-Terminal


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

***Noted Sorces***  

- Computer Networking || A Top-Down Approach 8th Edition  
    By: James Kurose and Keith Ross  
- OSI model: `https://en.wikipedia.org/wiki/OSI_model`  




