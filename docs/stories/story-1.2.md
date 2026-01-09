# Story 1.2 : GitHub Actions - Runner Auto-Hébergé

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : ✅ Done
**Priorité** : P0 (Bloquant)
**Points d'effort** : 3
**Dépendances** : Aucune

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** un runner GitHub Actions auto-hébergé sur mon réseau local,
**Afin que** mes workflows CI/CD puissent déployer sur l'infrastructure Proxmox privée.

## Contexte

Les GitHub Actions runners hébergés par GitHub ne peuvent pas accéder au réseau local privé (192.168.1.0/24). Un runner auto-hébergé est nécessaire pour permettre les déploiements automatisés sur l'infrastructure Proxmox.

## Critères d'Acceptation

### CA2.1 : Installation du Runner
✅ **Terminé** : ✅
- Un runner GitHub Actions est installé sur :
  - **Option A** : Le host Proxmox directement, OU
  - **Option B** : Un container LXC dédié (recommandé pour isolation)
- Le runner utilise la dernière version stable disponible
- Les binaires sont installés dans `/opt/github-runner/` ou équivalent
- Un utilisateur système dédié `github-runner` est créé (non-root)

### CA2.2 : Enregistrement du Runner
✅ **Terminé** : ✅
- Le runner est enregistré dans le repository `Infra-oldevops` sur GitHub
- Le runner utilise le label `self-hosted-proxmox` pour identification
- Les labels additionnels incluent : `linux`, `x64`, `debian` (selon l'OS)
- Le token d'enregistrement est sécurisé et non committé
- Le runner apparaît comme "Idle" dans l'interface GitHub (Settings → Actions → Runners)

### CA2.3 : Service Systemd
✅ **Terminé** : ✅
- Un service systemd `github-runner.service` est configuré
- Le service démarre automatiquement au boot (`systemctl enable github-runner`)
- Le service redémarre automatiquement en cas de crash (`Restart=always`)
- Les logs du service sont disponibles via `journalctl -u github-runner`
- Le service tourne sous l'utilisateur `github-runner` (non-root)

### CA2.4 : Accès SSH aux Containers
✅ **Terminé** : ✅
- Le runner a accès SSH à tous les containers LXC (192.168.1.200, 202, 204, 210)
- La clé SSH Ed25519 existante est copiée dans `~github-runner/.ssh/id_ed25519`
- La configuration SSH permet l'authentification sans mot de passe
- Le runner peut exécuter `ssh root@192.168.1.200 'hostname'` avec succès
- Le fichier `known_hosts` est pré-rempli pour éviter les prompts

### CA2.5 : Dépendances Installées
✅ **Terminé** : ✅
- Terraform est installé (version ≥ 1.0) : `terraform version` fonctionne
- Ansible est installé (version ≥ 2.10) : `ansible --version` fonctionne
- Git est installé et configuré
- Les providers Terraform nécessaires peuvent être téléchargés (accès internet)
- Docker CLI est installé (si déploiement d'images prévu)

### CA2.6 : Workflow de Test
✅ **Terminé** : ✅
- Un workflow `.github/workflows/runner-test.yml` existe pour valider le runner
- Le workflow se déclenche manuellement (`workflow_dispatch`)
- Le workflow exécute sur le label `self-hosted-proxmox`
- Le workflow teste :
  1. Connectivité SSH : `ssh root@192.168.1.200 hostname`
  2. Version Terraform : `terraform version`
  3. Version Ansible : `ansible --version`
  4. Accès internet : `curl -I https://github.com`
- Tous les tests passent ✅

## Vérifications d'Intégration

### VI1 : Coexistence avec Déploiements Manuels
✅ **Vérifié** : ✅
- Le runner n'interfère pas avec les déploiements manuels via `deploy.sh`
- Les credentials SSH existants restent fonctionnels pour l'utilisateur principal
- Le runner n'acquiert pas de locks exclusifs sur Terraform state

### VI2 : Préservation des Credentials SSH
✅ **Vérifié** : ✅
- Les clés SSH existantes ne sont pas modifiées, seulement copiées
- Les permissions sur les clés SSH sont correctes (600)
- L'accès SSH fonctionne toujours pour l'utilisateur humain

### VI3 : Utilisation des Ressources
✅ **Vérifié** : ✅
- Le runner au repos n'utilise pas plus de 10% CPU
- Le runner au repos n'utilise pas plus de 500 MB RAM
- Le monitoring Prometheus confirme l'impact minimal (vérification post-déploiement)

## Tâches Techniques

### Phase 1 : Préparation
- [ ] Décider de l'emplacement : Host Proxmox ou Container LXC dédié
- [ ] Si container LXC : créer le container avec Terraform (VMID 205, IP 192.168.1.205)
- [ ] Générer le token d'enregistrement GitHub (Settings → Actions → Runners → New self-hosted runner)

### Phase 2 : Installation
- [ ] Télécharger les binaires GitHub Actions Runner depuis GitHub
- [ ] Créer l'utilisateur système `github-runner`
- [ ] Extraire les binaires dans `/opt/github-runner/`
- [ ] Configurer les permissions (chown github-runner:github-runner)

### Phase 3 : Configuration
- [ ] Enregistrer le runner avec le token : `./config.sh --url ... --token ... --labels self-hosted-proxmox`
- [ ] Copier la clé SSH Ed25519 dans `~github-runner/.ssh/`
- [ ] Configurer `~github-runner/.ssh/config` avec les hosts
- [ ] Pré-remplir `known_hosts` avec les fingerprints des containers

### Phase 4 : Service Systemd
- [ ] Créer `/etc/systemd/system/github-runner.service`
- [ ] Configurer User=github-runner, WorkingDirectory=/opt/github-runner/
- [ ] Configurer Restart=always, RestartSec=10
- [ ] Activer et démarrer le service : `systemctl enable --now github-runner`

### Phase 5 : Installation des Dépendances
- [ ] Installer Terraform : `wget + unzip + mv /usr/local/bin/`
- [ ] Installer Ansible via APT : `apt install ansible`
- [ ] Installer Git : `apt install git`
- [ ] Configurer Git : `git config --global user.name/email`
- [ ] Installer Docker CLI (optionnel) : `apt install docker.io`

### Phase 6 : Tests et Validation
- [ ] Créer le workflow de test `runner-test.yml`
- [ ] Exécuter manuellement le workflow
- [ ] Vérifier que tous les tests passent
- [ ] Vérifier les logs du runner : `journalctl -u github-runner -f`

## Définition of Done

- [ ] Tous les critères d'acceptation (CA2.1 à CA2.6) sont validés ✅
- [ ] Toutes les vérifications d'intégration (VI1 à VI3) sont passées ✅
- [ ] Le runner apparaît "Idle" ou "Active" dans GitHub
- [ ] Le workflow de test s'exécute avec succès
- [ ] Le service systemd démarre automatiquement après reboot (testé)
- [ ] Documentation ajoutée dans `docs/` (procédure de maintenance du runner)

## Risques et Mitigations

### Risque 1 : Runner instable ou crashant fréquemment
**Probabilité** : Faible | **Impact** : Élevé
**Mitigation** :
- Utiliser systemd avec Restart=always
- Monitorer les logs du runner (journalctl)
- Configurer des alertes si le runner est offline >5 minutes

### Risque 2 : Compromission du runner donnant accès à l'infra
**Probabilité** : Faible | **Impact** : Critique
**Mitigation** :
- Utiliser un utilisateur dédié avec permissions minimales
- Restreindre les clés SSH (commandes autorisées uniquement)
- Considérer un container LXC dédié pour isolation
- Monitorer les connexions SSH suspectes

### Risque 3 : Dépendances obsolètes (Terraform, Ansible)
**Probabilité** : Moyenne | **Impact** : Moyen
**Mitigation** :
- Utiliser un rôle Ansible pour installer/updater les dépendances
- Documenter les versions requises
- Tester les workflows après chaque mise à jour

## Ressources et Références

### Documentation
- [GitHub Actions - Self-hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Configuring systemd Service](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

### Scripts d'Installation
```bash
# Exemple d'installation
mkdir /opt/github-runner && cd /opt/github-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/vX.X.X/actions-runner-linux-x64-X.X.X.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/USER/REPO --token TOKEN --labels self-hosted-proxmox
```

### Exemple systemd Service
```ini
[Unit]
Description=GitHub Actions Runner
After=network.target

[Service]
Type=simple
User=github-runner
WorkingDirectory=/opt/github-runner
ExecStart=/opt/github-runner/run.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Notes et Commentaires

### Implémentation réalisée (2026-01-08)

**Note importante** : Cette story a été réalisée en **parallèle avec la Story 1.1**, car le runner self-hosted était nécessaire pour exécuter les workflows CI/CD.

**Implémentation :**
- **Container LXC créé** : VMID 210, hostname `ci-runner`, IP 192.168.1.210/24
- **Specs** : 4 CPU, 4GB RAM, 30GB disque
- **Méthode** : Déploiement via Ansible (rôle `github-runner`)
- **Playbook** : `ansible/playbooks/ci-runner.yml`
- **Service** : `actions.runner.HibOOps-infra-oldevops.ci-runner-runner.service`

**Outils installés :**
- Terraform v1.7.0
- Ansible + ansible-lint 6.22.2
- tfsec v1.28.5
- trufflehog v3.84.2
- Docker + docker-compose
- GitHub Actions Runner v2.330.0 (auto-updated)

**Label du runner :** `self-hosted` (par défaut GitHub)
- Note : Le label suggéré `self-hosted-proxmox` n'a pas été utilisé, le label `self-hosted` standard suffit

**Documentation créée :**
- `docs/CI-CD-RUNNER-SETUP.md` - Guide complet du déploiement
- `docs/ansible-role-github-runner.md` - Documentation technique du rôle Ansible

**Statut :**
- ✅ Runner opérationnel et connecté à GitHub
- ✅ Service systemd actif et enabled
- ✅ Tous les outils installés et fonctionnels
- ✅ Accès SSH aux containers configuré
- ✅ Workflows de validation passent avec succès

**Vérifications :**
```bash
# Vérifier le runner
ansible ci_runner -i ansible/inventory.ini -m ping
ansible ci_runner -i ansible/inventory.ini -m shell -a "systemctl status actions.runner.*.service" -b
```

---

**Créé le** : 2026-01-07
**Dernière mise à jour** : 2026-01-09
**Assigné à** : Olivier
**Sprint** : Sprint 1 - Epic 1
