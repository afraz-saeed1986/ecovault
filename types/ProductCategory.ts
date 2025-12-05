export type ProductCategory = {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  slug?: string;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
};