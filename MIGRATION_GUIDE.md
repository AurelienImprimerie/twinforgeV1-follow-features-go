# Guide: Appliquer la Migration Supabase

## Problème Actuel

Les listes de courses s'affichent mais **les articles ne sont pas visibles**. Cela vient du fait que la migration de schéma `20251105215505_fix_shopping_list_items_schema_final.sql` n'a pas encore été appliquée à la base de données Supabase distante.

## Solution: Appliquer la Migration

### Option 1: Via le Dashboard Supabase (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **SQL Editor**
4. Créer une **New Query**
5. Copier-coller le contenu du fichier:
   ```
   supabase/migrations/20251105215505_fix_shopping_list_items_schema_final.sql
   ```
6. Cliquer sur **Run** pour exécuter la migration

### Option 2: Via Supabase CLI (Alternative)

```bash
# Se connecter à Supabase
npx supabase login

# Lier le projet local au projet distant
npx supabase link --project-ref YOUR_PROJECT_REF

# Appliquer toutes les migrations en attente
npx supabase db push
```

## Vérification

Après avoir appliqué la migration, vérifiez que:

1. La table `shopping_list_items` a les colonnes suivantes:
   - `id` (uuid)
   - `shopping_list_id` (uuid)
   - `category_name` (text)
   - `category_icon` (text)
   - `category_color` (text)
   - `item_name` (text)
   - `quantity` (text)
   - `estimated_price_cents` (integer) ← **Important!**
   - `priority` (text)
   - `is_checked` (boolean)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. La table `shopping_lists` a la colonne:
   - `completed_items` (integer)

## Test

1. Générer une nouvelle liste de courses
2. La sauvegarder
3. Aller dans l'onglet "Courses"
4. Les articles devraient maintenant être visibles et cochables

## En Cas de Problème

Si vous avez déjà des listes sauvegardées AVANT la migration, elles ne s'afficheront pas correctement car elles utilisent l'ancien schéma. Solution:

- Supprimer les anciennes listes depuis le dashboard Supabase
- Générer de nouvelles listes après la migration

## Logs Utiles

Ouvrez la console du navigateur et cherchez les logs qui commencent par:
- `[SHOPPING_LIST_LIBRARY]` - Pour le chargement des listes
- `[SHOPPING_LIST_PIPELINE]` - Pour la génération et sauvegarde

Ces logs vous indiqueront exactement ce qui se passe.
