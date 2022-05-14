# luctus' LiveLog

See your gmod logs and write rcon commands via your browser

If you need help with this don't be afraid to contact me or open an issue.


## Install

This requires you to have NodeJS installed.  
This only works for gmod servers that were installed with LinuxGSM! ([https://linuxgsm.com/servers/gmodserver/](https://linuxgsm.com/servers/gmodserver/))


```bash
wget https://github.com/OverlordAkise/gmod-rcon-web-interface/archive/refs/heads/main.zip -O livelog.zip
unzip livelog.zip
cd gmod-rcon-web-interface-main
npm install
# edit the config values:
nano main.js
# start the server:
node main.js
```

## Securing your logs

I highly recommend you to not expose this application to the public via the 3001 port!  

Instead create a reverse proxy with nginx / apache2 and secure it with basic authentication. Close the port 3001 via your firewall.  

For nginx my configuration looks as follows:

```
# Forward and secure the requests to the log
location /log {
    proxy_pass http://localhost:3001/;
    auth_basic "Unauthorized access is prohibited!";
    auth_basic_user_file /etc/nginx/.htpasswd;
}

# Forward the socket io requests aswell
location ~* \.io {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $http_host;
    proxy_set_header X-NginX-Proxy false;

    proxy_pass http://localhost:3001;
    proxy_redirect off;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

After this don't forget to create your .htpasswd file with your basic auth login credentials.  
Create them with:

```bash
htpasswd -c /etc/nginx/.htpasswd <user>
```

## Known Problems

The "restart gmodserver" button doesn't work if you run this node server via screen.  

Sometimes the rcon doesn't work anymore, which is why the "fix rcon" button exists.  
