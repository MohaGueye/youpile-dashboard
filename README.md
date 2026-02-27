# Youpile Admin Panel

Le panel d'administration web de Youpile, la marketplace C2C de mode d'occasion.

## Stack Technique
- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** + **shadcn/ui** (interfaces)
- **TanStack Table v8** (tableaux avec tri/filtres)
- **Recharts** (dashboard & KPI graphiques)
- **Supabase SSR** (Authentification et base de données commune au mobile)

---

## 🚀 Déploiement sur Vercel

1. **Commit & Push** votre projet sur un dépôt GitHub/GitLab (privé recommandé).
2. Rendez-vous sur [Vercel](https://vercel.com/) et cliquez sur **Add New... > Project**.
3. Importez votre dépôt. Le Framework Preset s'ajustera automatiquement sur *Next.js*.
4. **Configuration des variables d'environnement**. Ajoutez exactement ces clés :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<votre-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   NEXT_PUBLIC_FUNCTIONS_URL=https://<votre-id>.supabase.co/functions/v1
   BICTORYS_SECRET_KEY=bict_live_...
   ```
5. Cliquez sur **Deploy**.
6. Dans l'onglet *Domains* de Vercel, assignez votre sous-domaine custom (ex: `admin.youpile.com`).

---

## 🔒 Création du Super-Administrateur Initial

Pour des raisons de sécurité, aucun utilisateur ne figure dans la table `admins` (protégeant les routes `/dashboard`).

Pour attribuer l'accès à un email nouvellement inscrit, exécutez cette requête SQL manuelle depuis le Dashboard Supabase (SQL Editor) :

```sql
-- Remplacez <user_id> par l'UUID de l'utilisateur (visible dans Auth > Users)
INSERT INTO public.admins (id, role) 
VALUES ('<user_id>', 'super_admin');
```

Désormais, lors de la connexion via `/login` de l'UI Web, le middleware autorisera l'accès complet au backend et rejettera automatiquement les connexions issues d'un compte mobile standard.

---

## 💸 Notes Financières (Escrow, Bictorys, Wallet)
Le panel intègre une gestion sécurisée de la libération d'Ecrow et des virements bancaires (via RPC `increment_wallet` et `decrement_wallet` pour éviter les failles de fraude d'état et assurer une base atomique).
L'API Route interne `/api/admin/approve-payout` intercepte l'approbation du virement, génère la trace, débite le wallet et appelle le service de l'edge.
