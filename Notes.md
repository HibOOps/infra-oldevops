**23.05**
_Interface réseau_
il est necessaire de creer manuellement l'interface vmbr1 dans ```/etc/network/interfaces```

```
auto vmbr1
iface vmbr1 inet static
    address 172.20.0.1
    netmask 255.255.255.0
    bridge_ports none
    bridge_stp off
    bridge_fd 0
```
recharger les interfaces ```ifreload -a``` et verifier ip ```ip a show vmbr1```


