import { Supplier } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function fetchSuppliers() {
    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

    if (error) throw new Error(error.message);
    return data;
}

export async function createSupplier(
    supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">
) {
    const {
        name,
        email,
        phone,
        address,
        categories,
        isPreferred,
        status,
        logo,
        rating
    } = supplierData;

    const { data, error } = await supabase
        .from("suppliers")
        .insert([{
            name,
            email,
            phone,
            address,
            categories,
            is_preferred: isPreferred,
            status,
            logo,
            rating
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function updateSupplier(
    id: string,
    supplierData: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>
) {
    const { isPreferred, ...rest } = supplierData;
    const dataToUpdate = {
        ...rest,
        ...(isPreferred !== undefined && { is_preferred: isPreferred }),
    };

    const { data, error } = await supabase
        .from("suppliers")
        .update(dataToUpdate)
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteSupplier(id: string) {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
}

export async function bulkDeleteSuppliers(ids: string[]) {
    const { error } = await supabase.from("suppliers").delete().in("id", ids);
    if (error) throw new Error(error.message);
    return true;
} 