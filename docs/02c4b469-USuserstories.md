# User Stories — Portfolio Tracker MVP

**Date** : 2026-05-01  
**Priorisation** : MoSCoW  
**Persona** : Investisseur individuel (FIRE, dividendes, multi-enveloppes)

---

## Epic 1 — Gestion du portefeuille

### US-101 · Créer un portefeuille `[Must]`
> En tant qu'investisseur, je veux créer un portefeuille nommé (ex: "PEA Boursorama") afin d'organiser mes positions par enveloppe ou broker.

**Critères d'acceptation :**
- Je peux saisir un nom, une description optionnelle, une devise de référence
- Le portefeuille apparaît dans la liste dès sa création
- Je peux avoir plusieurs portefeuilles simultanément

---

### US-102 · Saisir une transaction d'achat `[Must]`
> En tant qu'investisseur, je veux enregistrer un achat (ticker, date, quantité, prix, frais, enveloppe) afin que mon PRU et ma position soient calculés automatiquement.

**Critères d'acceptation :**
- Champs obligatoires : ticker, date, quantité, prix unitaire, enveloppe
- Frais optionnels (défaut 0)
- Le ticker est validé (instrument connu ou créé à la volée)
- Le PRU se recalcule immédiatement après saisie

---

### US-103 · Saisir une transaction de vente `[Must]`
> En tant qu'investisseur, je veux enregistrer une vente afin de calculer la plus-value réalisée nette de frais.

**Critères d'acceptation :**
- La quantité vendue ne peut pas dépasser la quantité détenue à cette date
- La PV réalisée (brute et nette fiscalité) est affichée immédiatement
- La position se met à jour (quantité résiduelle, PRU inchangé)

---

### US-104 · Importer des transactions CSV `[Should]`
> En tant qu'investisseur, je veux importer un export CSV de mon broker afin d'initialiser mon historique sans ressaisie manuelle.

**Critères d'acceptation :**
- Format CSV configurable (mapping colonnes)
- Prévisualisation avant import avec détection d'erreurs
- Import idempotent (pas de doublon si même fichier importé deux fois)

---

### US-105 · Corriger/supprimer une transaction `[Must]`
> En tant qu'investisseur, je veux pouvoir corriger une transaction erronée afin que tous les calculs dérivés (PRU, YoC, PV) restent exacts.

**Critères d'acceptation :**
- Toute transaction est éditable ou supprimable
- Les agrégats se recalculent après modification
- Un log d'audit conserve l'historique des corrections

---

## Epic 2 — Suivi des positions

### US-201 · Voir le dashboard global `[Must]`
> En tant qu'investisseur, je veux voir en un coup d'œil la valeur totale, les PV latentes et la répartition sectorielle de mon portefeuille.

**Critères d'acceptation :**
- Valeur totale du portefeuille au cours actuel
- PV latente globale (montant + %)
- Répartition par enveloppe (camembert)
- Répartition sectorielle (barres)
- Dernière mise à jour des cours visible

---

### US-202 · Voir le détail d'une position `[Must]`
> En tant qu'investisseur, je veux voir pour chaque ligne : PRU, cours actuel, PV latente, quantité, poids dans le portefeuille, YoC.

**Critères d'acceptation :**
- Tableau tri-able par colonne
- Indicateur visuel PV positive (vert) / négative (rouge)
- YoC affiché si des dividendes ont été perçus
- Lien vers l'historique de transactions de la ligne

---

### US-203 · Voir l'évolution de la valeur dans le temps `[Should]`
> En tant qu'investisseur, je veux voir un graphique de la valeur de mon portefeuille sur 1 mois / 1 an / depuis le début afin de mesurer ma performance réelle.

**Critères d'acceptation :**
- Graphique courbe (Recharts) avec sélecteur de période
- Comparaison optionnelle avec un benchmark (CAC40, MSCI World)
- TWR (Time-Weighted Return) affiché pour neutraliser les apports

---

## Epic 3 — Dividendes & revenus passifs

### US-301 · Enregistrer un dividende reçu `[Must]`
> En tant qu'investisseur, je veux enregistrer un dividende perçu (brut, retenue à la source, net) afin de suivre mes revenus passifs réels.

**Critères d'acceptation :**
- Saisie : date ex-dividende, date paiement, montant brut/action, retenue fiscale
- Le montant net est calculé automatiquement
- La ligne s'ajoute au tableau des revenus du mois

---

### US-302 · Voir le revenu passif mensuel et annuel `[Must]`
> En tant qu'investisseur, je veux voir mes dividendes perçus par mois et par an afin de suivre ma progression vers mon objectif FIRE.

**Critères d'acceptation :**
- Graphique barres : dividendes nets par mois (12 derniers mois)
- Total annuel glissant
- Projection annuelle basée sur les dividendes déclarés connus

---

### US-303 · Calculer le Yield-on-Cost par ligne `[Must]`
> En tant qu'investisseur, je veux voir le YoC de chaque position afin de comparer le rendement réel sur mon prix d'achat.

**Critères d'acceptation :**
- YoC = dividende annuel par action / PRU × 100
- Affiché dans le tableau de positions
- Tri possible par YoC décroissant

---

### US-304 · Projection dividendes sur 10/20 ans `[Should]`
> En tant qu'investisseur, je veux simuler la croissance de mes dividendes avec un taux de croissance annuel (DGR) afin d'estimer mes revenus futurs.

**Critères d'acceptation :**
- Saisie du DGR par ligne (ou DGR global par défaut)
- Tableau et graphique sur horizon paramétrable (5 / 10 / 20 ans)
- Affichage du dividende annuel projeté et du YoC projeté

---

## Epic 4 — Fiscalité & simulation

### US-401 · Simuler la fiscalité d'une vente `[Must]`
> En tant qu'investisseur, je veux simuler le gain net après impôts d'une vente afin de décider si je vends maintenant ou j'attends.

**Critères d'acceptation :**
- Calcul automatique selon l'enveloppe (PEA exonéré IR, CTO flat tax 30%, AV abattement)
- Scénarios comparatifs : vendre maintenant vs dans N ans
- Disclaimer "estimation non contractuelle" visible

---

### US-402 · Voir le récapitulatif fiscal annuel `[Could]`
> En tant qu'investisseur, je veux un récapitulatif des PV réalisées et dividendes perçus dans l'année afin de préparer ma déclaration d'impôts.

**Critères d'acceptation :**
- Export PDF ou CSV par année fiscale
- Détail par ligne et par enveloppe
- Distinction PV court terme / long terme

---

## Epic 5 — Alertes

### US-501 · Créer une alerte de prix `[Should]`
> En tant qu'investisseur, je veux définir un seuil de prix (ex: Air Liquide < 155€) afin d'être notifié quand le cours atteint ma zone de renforcement.

**Critères d'acceptation :**
- Saisie : ticker, direction (au-dessus / en-dessous), prix cible
- Notification in-app (badge + toast)
- Alerte désactivée automatiquement après déclenchement (réactivable)

---

## Récapitulatif MoSCoW

| Priorité | US |
|---|---|
| **Must** | 101, 102, 103, 105, 201, 202, 301, 302, 303, 401 |
| **Should** | 104, 203, 304, 501 |
| **Could** | 402 |
| **Won't (v1)** | Multi-utilisateurs, open banking, mobile natif |
