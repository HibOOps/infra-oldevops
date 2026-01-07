# Story 1.5 : Container Application - Configuration Ansible

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P1 (Haute)
**Points d'effort** : 5
**Dépendances** : Story 1.4 (Container créé)

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** provisionner automatiquement le container application avec Docker et dépendances,
**Afin de** préparer l'environnement pour déployer l'application de démonstration.

## Critères d'Acceptation

### CA5.1 : Rôle Ansible app-demo
- Structure standard de rôle créée dans `ansible/roles/app-demo/`
- Sous-dossiers : `tasks/`, `templates/`, `vars/`, `handlers/`, `files/`
- Fichier `meta/main.yml` avec description et dépendances

### CA5.2 : Installation Docker
- Docker CE installé via APT (dernière version stable)
- Docker Compose Plugin installé
- Service Docker activé et démarré (`systemctl enable --now docker`)
- Test : `docker --version` et `docker compose version` fonctionnent

### CA5.3 : Variables d'Environnement
- Variables applicatives définies dans `ansible/roles/app-demo/vars/main.yml`
- Secrets sensibles stockés dans Ansible Vault
- Variables incluent : DB credentials, API keys, JWT secret
- Template `.env` déployé dans `/opt/app-demo/.env`

### CA5.4 : Docker Compose Déployé
- Template `docker-compose.yml` dans `ansible/roles/app-demo/templates/`
- Fichier déployé dans `/opt/app-demo/docker-compose.yml`
- Services définis : frontend, backend, postgresql
- Volumes et réseaux configurés

### CA5.5 : Playbook app-demo
- Nouveau playbook `ansible/playbooks/app-demo.yml`
- Cible le host `192.168.1.210`
- Applique le rôle `app-demo`
- Idempotent (peut être rejoué sans effet secondaire)

### CA5.6 : Intégration dans deploy.sh
- Le playbook est appelé dans `scripts/deploy.sh`
- Exécuté après le playbook Traefik
- Ordre : traefik → utilities → monitoring → **app-demo**

## Vérifications d'Intégration

### VI1 : Playbooks Existants Préservés
- Les playbooks existants fonctionnent toujours sans modification
- Aucune régression sur les rôles `traefik`, `common`, `monitoring`

### VI2 : Accès SSH Fonctionnel
- Le container 192.168.1.210 est accessible via SSH
- Clés Ed25519 existantes fonctionnent

### VI3 : Docker Opérationnel
- Docker fonctionne dans le container : `docker run hello-world` réussit
- Nesting LXC activé et fonctionnel

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] Docker installé et fonctionnel dans le container
- [ ] Playbook exécutable sans erreur
- [ ] Code Ansible validé par ansible-lint
- [ ] Documentation mise à jour

---

**Créé le** : 2026-01-07
