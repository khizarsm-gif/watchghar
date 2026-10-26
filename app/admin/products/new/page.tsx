import { requireAdminPage } from "@/lib/admin-auth";
import { adminListCategories, adminListColourGroups } from "@/lib/admin-data";
import PageHeader from "../../_components/PageHeader";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await requireAdminPage();
  const [categories, groups] = await Promise.all([
    adminListCategories(supabase),
    adminListColourGroups(supabase),
  ]);

  return (
    <div>
      <PageHeader title="Add product" description="New products appear on the store as soon as you save." />
      <ProductForm categories={categories} groups={groups} mode="create" />
    </div>
  );
}
