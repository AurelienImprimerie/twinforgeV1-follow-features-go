/*
  # Système de Gestion des Listes de Courses

  1. Nouvelles Tables
    - `shopping_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `meal_plan_id` (uuid, nullable, reference to meal plans)
      - `generation_mode` (text: 'user_only' or 'user_and_family')
      - `total_items` (integer)
      - `total_estimated_cost` (numeric)
      - `budget_estimation` (jsonb, nullable)
      - `suggestions` (jsonb, nullable)
      - `advice` (jsonb, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shopping_list_items`
      - `id` (uuid, primary key)
      - `shopping_list_id` (uuid, foreign key to shopping_lists)
      - `category_name` (text)
      - `category_icon` (text)
      - `category_color` (text)
      - `item_name` (text)
      - `quantity` (text)
      - `estimated_price` (numeric)
      - `priority` (text: 'low', 'medium', 'high')
      - `is_checked` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own shopping lists
    - Users can only access their own shopping lists and items

  3. Indexes
    - Index on user_id for fast user queries
    - Index on shopping_list_id for fast item queries
    - Index on created_at for sorting
*/

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Liste de Courses',
  meal_plan_id uuid,
  generation_mode text NOT NULL CHECK (generation_mode IN ('user_only', 'user_and_family')),
  total_items integer NOT NULL DEFAULT 0,
  total_estimated_cost numeric(10, 2) NOT NULL DEFAULT 0.00,
  budget_estimation jsonb,
  suggestions jsonb,
  advice jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id uuid NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  category_icon text NOT NULL DEFAULT 'Package',
  category_color text NOT NULL DEFAULT '#fb923c',
  item_name text NOT NULL,
  quantity text NOT NULL DEFAULT '1',
  estimated_price numeric(10, 2) NOT NULL DEFAULT 0.00,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_checked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for shopping_lists
CREATE POLICY "Users can view own shopping lists"
  ON shopping_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists"
  ON shopping_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
  ON shopping_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
  ON shopping_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for shopping_list_items
CREATE POLICY "Users can view own shopping list items"
  ON shopping_list_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own shopping list items"
  ON shopping_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shopping list items"
  ON shopping_list_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shopping list items"
  ON shopping_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS shopping_lists_user_id_idx ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS shopping_lists_created_at_idx ON shopping_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS shopping_list_items_shopping_list_id_idx ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS shopping_list_items_is_checked_idx ON shopping_list_items(is_checked);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_shopping_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shopping_list_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS shopping_lists_updated_at_trigger ON shopping_lists;
CREATE TRIGGER shopping_lists_updated_at_trigger
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_lists_updated_at();

DROP TRIGGER IF EXISTS shopping_list_items_updated_at_trigger ON shopping_list_items;
CREATE TRIGGER shopping_list_items_updated_at_trigger
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_items_updated_at();
