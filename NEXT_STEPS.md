# Prochaines Étapes - Infrastructure Oldevops

## Configuration DNS

1. **Chez votre fournisseur DNS (OVH, Cloudflare, etc.)** :
   - Créez un enregistrement A pointant `proxy.oldevops.fr` vers l'IP publique de votre serveur Proxmox
   - Créez un enregistrement CNAME `*.oldevops.fr` pointant vers `proxy.oldevops.fr`
   - Vérifiez la propagation DNS avec :
     ```bash
     dig +short proxy.oldevops.fr
     dig +short status.oldevops.fr
     ```

## Configuration du Reverse Proxy

1. **Accéder à Nginx Proxy Manager** :
   - URL : https://proxy.oldevops.fr
   - Identifiants par défaut :
     - Email: admin@oldevops.fr
     - Mot de passe: changeme (à modifier immédiatement)

2. **Configurer les hôtes virtuels** pour chaque service :
   - Uptime Kuma: https://status.oldevops.fr
   - Snipe-IT: https://inventory.oldevops.fr
   - Vaultwarden: https://vault.oldevops.fr
   - Zabbix: https://monitoring.oldevops.fr

3. **Configurer Let's Encrypt** :
   - Dans Nginx Proxy Manager, allez dans "SSL Certificates"
   - Ajoutez un nouveau certificat avec l'email admin@oldevops.fr
   - Activez "Force SSL" et "HTTP/2" pour chaque hôte

## Configuration de la Sécurité

1. **Pare-feu** :
   ```bash
   # Autoriser uniquement les ports nécessaires
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 8006/tcp  # Proxmox Web UI
   ufw enable
   ```

2. **Mots de passe** :
   - Changez tous les mots de passe par défaut
   - Utilisez un gestionnaire de mots de passe (comme Vaultwarden)
   - Activez l'authentification à deux facteurs partout où c'est possible

3. **Sauvegardes** :
   - Configurez des sauvegardes quotidiennes dans Proxmox
   - Testez la restauration d'une sauvegarde
   - Stockez une copie hors site

## Déploiement des Services

1. **Uptime Kuma** :
   - Configurer la surveillance de tous les services
   - Configurer les notifications (Email, Telegram, etc.)

2. **Snipe-IT** :
   - Configurer les catégories d'équipements
   - Importer les actifs existants
   - Configurer les règles d'amortissement

3. **Vaultwarden** :
   - Créer un compte administrateur
   - Importer les identifiants existants
   - Configurer les politiques de sécurité

4. **Zabbix** :
   - Configurer la surveillance des hôtes
   - Configurer les alertes
   - Configurer les tableaux de bord

## Surveillance et Maintenance

1. **Monitoring** :
   - Vérifiez régulièrement les tableaux de bord
   - Configurez des alertes pour les problèmes critiques
   - Vérifiez l'espace disque et l'utilisation de la mémoire

2. **Mises à jour** :
   - Mettez à jour régulièrement les conteneurs et le système hôte
   - Testez les mises à jour dans un environnement de test avant la production
   - Ayez un plan de retour arrière

3. **Documentation** :
   - Mettez à jour la documentation lors des changements
   - Documentez les procédures de dépannage courantes
   - Gardez une liste des modifications importantes

## Support et Dépannage

- Consultez les journaux avec : `journalctl -u nom-du-service -f`
- Vérifiez la connectivité réseau : `ping`, `traceroute`, `telnet`
- Consultez la documentation des services pour les problèmes spécifiques
