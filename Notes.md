**23.05**

_Interface réseau_

il est necessaire de creer manuellement l'interface vmbr1 dans ```/etc/network/interfaces```

```
auto lo
iface lo inet loopback

iface enp87s0 inet manual

#iface wlp86s0 inet manual

auto vmbr0
iface vmbr0 inet static
        address 192.168.20.3/24
        gateway 192.168.20.1
        bridge-ports enp87s0
        bridge-stp off
        bridge-fd 0

auto vmbr1
iface vmbr1 inet static
  address 10.0.0.1/24
  bridge-ports none
  bridge-stp off
  bridge-fd 0
  post-up echo 1 >/proc/sys/net/ipv4/ip_forward
  post-up iptables -t nat -A POSTROUTING -s '10.0.0.0/24' -o vmbr0 -j MASQUERADE
  post-down iptables -t nat -D POSTROUTING -s '10.0.0.0/8' -o vmbr0 -j MASQUERADE```
recharger les interfaces ```ifreload -a``` et verifier ip ```ip a show vmbr1```

---

**21.07.2025**

_Backend Terraform S3 & profil AWS_

Pour que Terraform utilise des credentials AWS spécifiques à ce projet (et non le profil `default`), il est indispensable d'ajouter la ligne suivante dans le bloc backend S3 du fichier `backup.tf` :

```hcl
profile = "oldevops"
```

Cela permet de référencer la section `[oldevops]` du fichier `~/.aws/credentials`.

---


