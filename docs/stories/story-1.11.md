# Story 1.11 : Backup et Disaster Recovery Automation

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 📝 Todo
**Priorité** : P2 (Moyenne)
**Points d'effort** : 8
**Dépendances** : Aucune

---

## User Story

**En tant que** Ingénieur DevOps,
**Je veux** un système de backup automatisé et testé,
**Afin de** pouvoir restaurer l'infrastructure complète en cas de désastre.

## Critères d'Acceptation

### CA11.1 : Rôle Ansible Backup
- Rôle `ansible/roles/backup/` créé
- Déploie script de backup sur host Proxmox
- Configuration via variables Ansible

### CA11.2 : Script de Backup Quotidien
- Script s'exécute quotidiennement via cron (3h du matin)
- Backup inclut :
  - Snapshots Proxmox des 4 containers
  - Export Terraform state depuis OVH S3
  - Dump PostgreSQL/MySQL de toutes les bases
  - Backup Ansible Vault files
- Durée d'exécution <10 minutes

### CA11.3 : Stockage des Backups
- **Local** : `/var/backups/infra-oldevops/` sur host Proxmox
- Rétention locale : 7 jours (rotation automatique)
- **Offsite** : Synchronisation vers bucket OVH S3 dédié
- Rétention offsite : 30 jours
- Structure organisée : `YYYY-MM-DD/type-backup/`

### CA11.4 : Script de Restoration
- Script `scripts/restore.sh` créé
- Automatise la procédure de restoration :
  1. Restoration containers depuis snapshots
  2. Déploiement via Terraform/Ansible
  3. Import des données (bases, configs)
- Mode interactif et non-interactif supportés
- Documentation claire dans le script

### CA11.5 : Runbook Disaster Recovery
- Document `docs/runbooks/disaster-recovery.md` créé
- Contenu :
  - Scénarios de panne (host down, corruption state, perte données)
  - Procédures de restoration étape par étape
  - RTO : <30 minutes (Recovery Time Objective)
  - RPO : <24 heures (Recovery Point Objective)
  - Contacts et escalade
- Checklist de validation post-recovery

### CA11.6 : Test de Restoration
- Test de restoration complet effectué
- Documentation du test avec :
  - Date du test
  - Scénario testé
  - Durée de restoration
  - Problèmes rencontrés et résolutions
- Preuve que le backup fonctionne (screenshots, logs)

## Vérifications d'Intégration

### VI1 : Impact Minimal des Snapshots
- Snapshots Proxmox ne causent pas d'interruption >5 secondes
- Services restent accessibles pendant backup
- Pas de dégradation de performance notable

### VI2 : Performance du Script
- Script de backup s'exécute en <10 minutes
- Utilisation CPU/RAM acceptable (<30% CPU)
- Logs de backup disponibles pour troubleshooting

### VI3 : Test de Restoration Partielle
- Test de restoration d'un seul container réussi
- Pas d'impact sur les autres containers
- Données restaurées intègres et à jour

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] Script de backup déployé et testé
- [ ] Cron configuré et fonctionnel
- [ ] Test de restoration complet réussi
- [ ] Runbook DR créé et validé
- [ ] Documentation backup/restore complète

---

**Créé le** : 2026-01-07
