# Story 1.15 : PriceSync — Optimisation UX/UI Mobile & Navigation Smartphone

**Epic** : [EPIC 1 - Transformation Portfolio Infrastructure Professionnelle](EPIC.md)
**Statut** : 🔄 In Progress
**Priorité** : P3 (Basse - Polish)
**Points d'effort** : 5
**Dépendances** : Story 1.6 (Application PriceSync développée), Story 1.7 (Traefik + HTTPS)

---

## Contexte Produit

L'application **PriceSync** (Story 1.6) a été développée avec un CSS responsive de base, mais des problèmes UX/UI concrets ont été identifiés lors de l'utilisation sur smartphone :

- La **Navbar** horizontale dépasse l'écran sur mobile (5 liens non tronqués)
- Les **tableaux croisés** (Prix × Canal, Historique) nécessitent un scroll horizontal non guidé et peu intuitif
- Les **formulaires** (création règle, création produit) ont des champs trop petits pour une saisie tactile confortable
- L'**édition inline** du tableau Prix × Canal (double-clic) est difficilement déclenchable au toucher
- Les **KPI cards** du Dashboard ne s'empilent pas correctement sur petits écrans (< 375px)
- Les **boutons d'action** (Synchroniser, Supprimer, Activer) sont trop proches les uns des autres pour une utilisation au doigt

Cette story vise à corriger ces points et à rendre PriceSync réellement utilisable sur smartphone, améliorant ainsi la qualité perçue lors de démonstrations.

---

## User Story

**En tant que** Utilisateur de PriceSync sur smartphone,
**Je veux** une navigation et une interface adaptées aux écrans mobiles,
**Afin de** pouvoir utiliser toutes les fonctionnalités de l'application confortablement depuis mon téléphone.

---

## Critères d'Acceptation

### CA15.1 : Navigation Mobile (Hamburger Menu)

- La Navbar affiche un **menu hamburger** (icône ≡) sur les écrans < 768px à la place des liens horizontaux
- Le menu hamburger s'ouvre en un **panneau slide-in latéral** (ou dropdown) avec les 5 liens de navigation
- Le panneau se ferme automatiquement après la sélection d'un lien
- Le panneau se ferme via un clic/tap en dehors de la zone de menu
- L'info utilisateur (nom + bouton Logout) est accessible dans le menu mobile
- La transition d'ouverture/fermeture est fluide (CSS transition ≤ 300ms)

### CA15.2 : Tableaux Responsives

- Les tableaux larges (Tableau Prix × Canal, Historique, Catalogue Produits) sont wrappés dans un conteneur `overflow-x: auto` avec **indicateur visuel de scroll** (ombre ou gradient latéral)
- Sur mobile, une **bannière contextuelle** indique "Faites glisser pour voir plus →" lors du premier affichage (disparaît après interaction)
- Le tableau croisé **Produit × Canal** affiche en priorité : Produit + 1 colonne Canal sur 320px, et les autres canaux via scroll
- Les colonnes non essentielles (ex. description longue) sont masquées sur < 640px via `display: none` responsive
- Les en-têtes de tableau restent **sticky** lors du scroll horizontal

### CA15.3 : Formulaires Tactiles

- Tous les champs `<input>`, `<select>`, `<textarea>` ont une hauteur minimale de **44px** (recommandation Apple HIG / Material Design)
- Les labels sont affichés **au-dessus** des champs (pas inline) sur mobile
- Le formulaire de création de règle (RuleForm) passe en layout **colonne unique** sur < 640px
- Le formulaire de création de produit (ProductsPage modal) passe en layout **colonne unique** sur < 640px
- Les boutons de soumission sont **pleine largeur** sur mobile
- Les champs de type `number` (prix) déclenchent le clavier numérique (`inputmode="decimal"`)

### CA15.4 : Édition Inline Mobile-Friendly

- Dans le tableau Prix × Canal, l'édition inline au **double-clic** est remplacée/complétée par un bouton **icône crayon** toujours visible (tap-friendly) sur mobile
- L'input d'édition inline a une largeur minimale de **80px** et hauteur **44px**
- Sur mobile (< 768px), l'édition inline ouvre un **dialog/modal compact** centré plutôt qu'un input en place (évite les problèmes de zoom clavier)
- La confirmation de l'édition est possible via touche "Entrée" ou bouton ✓ visible

### CA15.5 : Dashboard & KPI Cards

- Les 4 KPI cards s'affichent en **2 colonnes** sur 320px–639px (grille `grid-template-columns: 1fr 1fr`)
- Le tableau des **"Produits en désynchronisation"** affiche uniquement : Produit, Delta, Statut sur mobile (les colonnes Prix par canal sont masquées)
- Le bouton **"Synchroniser tout"** est positionné en haut de page sur mobile et a une hauteur minimale de 48px
- Le résultat de sync (toast ou bannière) est lisible sur mobile (taille de police ≥ 14px, contraste suffisant)

### CA15.6 : Espacements & Taille des Zones Tactiles

- Tous les boutons d'action (Supprimer, Activer/Désactiver, Éditer) ont une zone tactile minimale de **44×44px** (padding compensatoire si l'icône est plus petite)
- Les boutons groupés (ex. actions d'une ligne) sont séparés d'au moins **8px** sur mobile
- Les marges/paddings de page sont réduits sur mobile (`px-4` → `px-3` ou équivalent) pour maximiser l'espace utile
- Pas de texte tronqué involontairement (overflow hidden sans ellipsis) sur les noms de produits et règles

### CA15.7 : Viewport & Meta Tags

- La balise `<meta name="viewport" content="width=device-width, initial-scale=1">` est présente et correcte dans `index.html`
- Aucun élément ne provoque de **zoom automatique** lors du focus sur un champ input (font-size ≥ 16px sur les inputs)
- L'application est utilisable sans zoom manuel sur les écrans 320px, 375px, 390px (iPhone SE, iPhone 14, iPhone 15 Pro)
- Pas de scroll horizontal non voulu au niveau de la page principale

### CA15.8 : Page de Login (Frontpage demo.oldevops.fr)

La page de login (`LoginPage.jsx`) est la **première page visible** à l'adresse `https://demo.oldevops.fr`. Elle doit être irréprochable sur mobile :

- Le formulaire de login est centré et occupe 90% de la largeur sur mobile (max-width: 400px)
- Les champs email/password ont une hauteur minimale de 44px et `font-size ≥ 16px` (no zoom iOS)
- La section "Comptes de démonstration" (admin/manager/viewer) est lisible et les boutons de remplissage automatique sont tactiles (≥ 44px)
- Le logo/titre PriceSync est visible sans scroll sur un écran 375px (iPhone SE)
- Le bouton "Se connecter" est pleine largeur sur mobile
- La page ne déclenche pas de scroll horizontal

### CA15.9 : Tests Responsive

- Tests Vitest/RTL ajoutés ou mis à jour pour les composants modifiés :
  - `LoginPage.test.jsx` : vérifier le rendu du formulaire + section comptes démo
  - `Navbar.test.jsx` : vérifier le rendu hamburger vs desktop
  - `PriceMatrix.test.jsx` : vérifier le comportement scroll + bouton crayon
  - `RuleForm.test.jsx` : vérifier le layout colonne unique sur mobile (mock viewport)
- Les tests existants ne doivent pas être cassés par les modifications
- Vérification manuelle documentée sur au moins 2 résolutions mobiles (375px et 768px)

---

## Vérifications d'Intégration

### VI1 : Compatibilité Desktop Préservée

- L'interface desktop (≥ 1024px) n'est pas dégradée par les modifications mobile
- Les 5 liens de navigation restent visibles horizontalement sur desktop
- Le tableau Prix × Canal reste pleinement fonctionnel en édition inline sur desktop

### VI2 : Performance Mobile

- Le bundle JS frontend n'augmente pas de plus de **50KB** (gzip) par rapport à la Story 1.6
- Les transitions CSS utilisent `transform` et `opacity` uniquement (pas de `width`/`height` animés — performant sur mobile)
- Pas de régression sur le Lighthouse Performance Score mobile (cible ≥ 70)

### VI4 : Déploiement sur demo.oldevops.fr

- Les modifications frontend sont committées et pushées sur la branche principale
- Le pipeline CI/CD (Story 1.8) déploie automatiquement la nouvelle version sur `https://demo.oldevops.fr`
- Vérification post-déploiement sur le site réel depuis un smartphone (pas seulement DevTools) :
  - La page de login (`https://demo.oldevops.fr`) s'affiche correctement sans zoom ni scroll horizontal
  - La navigation hamburger fonctionne après login
  - Le Dashboard et le tableau Prix × Canal sont utilisables au doigt
- Si le pipeline CI/CD échoue, le déploiement peut être effectué manuellement via `ansible-playbook` (voir Story 1.3)

### VI3 : Accessibilité de Base

- Le menu hamburger a un `aria-label="Menu de navigation"` et `aria-expanded` correct
- Les boutons icône ont un `aria-label` ou `title` descriptif
- Les dialogs d'édition mobile ont le focus piégé (`focus trap`) pendant l'ouverture

---

## Définition of Done

- [ ] Tous les CA validés ✅
- [ ] Navbar hamburger fonctionnelle sur mobile
- [ ] Tableaux scrollables avec indicateur visuel
- [ ] Formulaires passent en layout colonne unique sur < 640px
- [ ] Édition inline accessible au toucher (bouton crayon)
- [ ] KPI cards en 2 colonnes sur petits écrans
- [ ] Zones tactiles ≥ 44px sur tous les boutons d'action
- [ ] Viewport correct, pas de zoom automatique sur inputs
- [ ] Tests mis à jour et passants
- [ ] Vérification manuelle sur 375px (iPhone SE) et 768px (tablette)
- [ ] Interface desktop non dégradée
- [ ] Déploiement automatique via CI/CD sur demo.oldevops.fr confirmé
- [ ] Vérification sur appareil réel sur https://demo.oldevops.fr (login page + navigation post-login)
- [ ] Code review effectué

---

## Notes pour le Dev Agent

### Fichiers à Modifier (Frontend uniquement)

Cette story n'impacte que le **frontend** (`app-demo/frontend/`). Aucune modification backend ou infrastructure nécessaire.

Fichiers principaux à modifier :
- `app-demo/frontend/index.html` — Vérifier/corriger la meta viewport
- `app-demo/frontend/src/styles/index.css` — Variables breakpoints + utilitaires responsive
- `app-demo/frontend/src/pages/LoginPage.jsx` — **Frontpage demo.oldevops.fr** : formulaire centré, comptes démo tactiles, no zoom iOS
- `app-demo/frontend/src/components/Navbar.jsx` — Hamburger menu + slide-in panel
- `app-demo/frontend/src/components/PriceMatrix.jsx` — Scroll wrapper + bouton crayon + dialog mobile
- `app-demo/frontend/src/components/RuleForm.jsx` — Layout colonne unique mobile
- `app-demo/frontend/src/pages/DashboardPage.jsx` — KPI grid + tableau désync responsive
- `app-demo/frontend/src/pages/ProductsPage.jsx` — Tableau responsive + modal formulaire
- `app-demo/frontend/src/pages/HistoryPage.jsx` — Tableau responsive + filtres
- `app-demo/frontend/src/pages/RulesPage.jsx` — Boutons actions espacés

### Approche CSS Recommandée

Le projet utilise du CSS vanilla (pas Tailwind). Approche recommandée :
- Utiliser les **CSS custom properties** existantes dans `index.css`
- Ajouter des **media queries** `@media (max-width: 767px)` et `@media (max-width: 639px)` en fin de chaque fichier CSS concerné
- Pour le hamburger menu : état géré en **React state** (`useState(false)`) dans Navbar.jsx
- Pour le dialog mobile édition : conditionner avec `window.innerWidth < 768` ou un **hook `useMediaQuery`** à créer dans `src/hooks/`

### Breakpoints à Respecter

| Breakpoint | Largeur | Usage |
|-----------|---------|-------|
| mobile-sm | < 640px | Colonne unique, 2-col KPI, masquage colonnes |
| mobile | < 768px | Hamburger menu, dialog édition inline |
| tablet | 768px–1023px | Transition, nav visible mais compactée |
| desktop | ≥ 1024px | Interface complète inchangée |

### Contrainte : Pas de Librairie UI Supplémentaire

Ne pas ajouter de librairie CSS (Bootstrap, Tailwind, Material UI, etc.). Utiliser uniquement le CSS vanilla déjà en place et les composants React existants.

---

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References
- `aria-label` button lookup via `getByRole` failed in JSDOM for PortfolioPage — switched to `data-testid="port-hamburger"`. Root cause: JSDOM doesn't compute `.port-nav-hamburger { display: none }` from `<style>` tag, but the aria accessible name resolution behaved unexpectedly.
- `<a href="#fragment">` click in JSDOM unreliable for testing state-update on close — replaced with hamburger toggle test.

### Completion Notes List
- **CA15.1 partiel** : Hamburger menu implémenté sur 2 navs :
  - **Navbar.jsx** (PriceSync auth) : hamburger `< 768px`, slide-in dropdown avec 5 liens + user + logout, click-outside close, transition ≤300ms CSS
  - **PortfolioPage.jsx** nav : hamburger `< 768px`, dropdown avec 6 liens sections + GitHub, click-outside close
  - `index.css` : classes `.navbar-desktop-links`, `.navbar-desktop-user`, `.navbar-hamburger`, `.navbar-mobile-panel`, `.navbar-mobile-link`, `.navbar-mobile-user`
- **CA15.2 implémenté** :
  - `index.css` : classe `.table-scroll-wrap` (overflow-x:auto + CSS scroll-shadow left/right via `background-attachment: local/scroll`), `.table-scroll-hint` (masqué sur desktop, flex sur ≤767px), `.table-col-hide-mobile` (display:none sur ≤639px), `.table-sticky-col` (position:sticky left:0 sur ≤639px)
  - `PriceMatrix.jsx` : scroll wrapper + hint dismissable onScroll, colonnes Catégorie/Réf. masquées mobile, SKU sticky, `inputMode="decimal"` sur input inline, `minHeight: 44px` sur input
  - `HistoryPage.jsx` : scroll wrapper + hint, colonnes Ancien prix/Modifié par/Source masquées mobile
  - `ProductsPage.jsx` : scroll wrapper + hint, colonne Catégorie masquée mobile
- **CA15.3 implémenté** :
  - `index.css` : `.form-row-2col` (flex → column sur ≤639px), `.form-grid-2col` (2col → 1col sur ≤639px), `.form-actions` (flex-end → column-reverse + buttons 100% sur ≤639px)
  - `RuleForm.jsx` : `inputStyle` minHeight:44px + fontSize:1rem, row Type+Valeur → `form-row-2col`, boutons → `form-actions`, `inputMode="decimal"` sur champ Valeur
  - `ProductsPage.jsx` : `inputStyle` minHeight:44px + fontSize:1rem, form → `form-grid-2col`, boutons → `form-actions`, `inputMode="decimal"` sur Prix de référence
- **CA15.5 implémenté** :
  - `index.css` : classe `.kpi-grid` (grid auto-fill minmax 160px → 2 colonnes forcées sur ≤639px)
  - `DashboardPage.jsx` : KPI section → `className="kpi-grid"`, sync button → `minHeight: 48px`, désync table wrappée dans `.table-scroll-wrap`, colonnes Catégorie/Prix de référence/canaux → `table-col-hide-mobile`, colonne Delta ajoutée (max % écart absolu vs prix de référence), affichée sur mobile
- **CA15.6 implémenté** :
  - `index.css` : classes `.btn-action` (min-height:44px, inline-flex), `.btn-group` (gap:8px, flex-wrap:wrap sur ≤767px), `.page-pad` (padding:28px 32px → 16px sur ≤767px)
  - `RulesPage.jsx` : page → `page-pad`, boutons Désactiver/Éditer/Supprimer → `btn-action`, groupe → `btn-group`
  - `ProductsPage.jsx` : page → `page-pad`, boutons Éditer/Supprimer → `btn-action` dans `btn-group`
  - `DashboardPage.jsx` : page → `page-pad`
  - `HistoryPage.jsx` : page → `page-pad`
- **CA15.7 implémenté** :
  - `index.html` : balise `<meta name="viewport" content="width=device-width, initial-scale=1.0">` déjà correcte (pas de modification)
  - `index.css` : `html, body { overflow-x: hidden }`, `#root { max-width: 100%; overflow-x: hidden }`, `input, select, textarea { font-size: 1rem }` (anti-zoom iOS)
  - `LoginPage.jsx` : inputs email/password → `fontSize: '1rem'`, `minHeight: '44px'`
  - `HistoryPage.jsx` : inputStyle → `fontSize: '1rem'`, `minHeight: '44px'`
  - `PriceMatrix.jsx` : inline edit input → `fontSize: '1rem'`
- CA15.4, CA15.8 : non démarrés

### File List
- `app-demo/frontend/src/styles/index.css` — Modifié : classes responsive Navbar
- `app-demo/frontend/src/components/Navbar.jsx` — Modifié : hamburger menu + mobile panel + click-outside
- `app-demo/frontend/src/pages/PortfolioPage.jsx` — Modifié : hamburger nav + navOpen state + click-outside + padding responsive
- `app-demo/frontend/src/__tests__/Navbar.test.jsx` — Créé : 11 tests hamburger menu
- `app-demo/frontend/src/__tests__/PortfolioPage.test.jsx` — Modifié : 4 tests hamburger ajoutés
- `app-demo/frontend/src/components/PriceMatrix.jsx` — Modifié : scroll wrapper, hint, sticky col, col-hide
- `app-demo/frontend/src/pages/HistoryPage.jsx` — Modifié : scroll wrapper, hint, col-hide
- `app-demo/frontend/src/pages/ProductsPage.jsx` — Modifié : scroll wrapper, hint, col-hide
- `app-demo/frontend/src/__tests__/PriceMatrix.test.jsx` — Modifié : 5 tests scroll/sticky/hint
- `app-demo/frontend/src/__tests__/HistoryPage.test.jsx` — Modifié : 2 tests scroll/col-hide
- `app-demo/frontend/src/__tests__/ProductsPage.test.jsx` — Modifié : 5 tests scroll/col-hide/form
- `app-demo/frontend/src/__tests__/RuleForm.test.jsx` — Modifié : 5 tests form-row/actions/inputMode/minHeight
- `app-demo/frontend/src/pages/DashboardPage.jsx` — Modifié : kpi-grid class, sync button minHeight 48px, désync table scroll wrapper + col-hide + delta column
- `app-demo/frontend/src/__tests__/DashboardPage.test.jsx` — Modifié : 4 tests kpi-grid/minHeight/col-hide/delta
- `app-demo/frontend/src/pages/RulesPage.jsx` — Modifié : page-pad + btn-action/btn-group sur boutons d'action
- `app-demo/frontend/src/pages/HistoryPage.jsx` — Modifié : page-pad
- `app-demo/frontend/src/__tests__/RulesPage.test.jsx` — Modifié : 3 tests btn-action/btn-group/page-pad
- `app-demo/frontend/src/pages/LoginPage.jsx` — Modifié : inputs fontSize 1rem + minHeight 44px
- `app-demo/frontend/src/pages/HistoryPage.jsx` — Modifié : inputStyle fontSize 1rem + minHeight 44px
- `app-demo/frontend/src/components/PriceMatrix.jsx` — Modifié : inline edit fontSize 1rem
- `app-demo/frontend/src/__tests__/LoginPage.test.jsx` — Modifié : 2 tests font-size/minHeight

---

## QA Results
_À compléter lors de la revue QA_

---

**Créé le** : 2026-03-09
**Dernière mise à jour** : 2026-03-09
