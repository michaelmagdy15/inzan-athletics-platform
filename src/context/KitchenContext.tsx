import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/firebase";
import { KitchenItem, KitchenOrder } from "../types";
import { useAuth } from "./AuthContext";

interface KitchenContextType {
    kitchenItems: KitchenItem[];
    orders: KitchenOrder[];
    loading: boolean;
    placeOrder: (items: any, totalPrice: number) => Promise<void>;
    updateOrderStatus: (orderId: string, status: KitchenOrder["status"]) => Promise<void>;
    refreshKitchen: () => Promise<void>;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export function KitchenProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useAuth();
    const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshKitchen = async () => {
        try {
            const [inventoryRes, ordersRes] = await Promise.all([
                supabase.from("kitchen_inventory").select("*"),
                supabase.from("kitchen_orders").select("*").order("created_at", { ascending: false })
            ]);

            if (inventoryRes.data) {
                setKitchenItems(inventoryRes.data.map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    quantity: i.quantity,
                    reorder_threshold: i.reorder_threshold,
                    unit: i.unit,
                    category: i.category,
                    price: Number(i.price) || 0,
                    description: i.description,
                    image_url: i.image_url,
                })));
            }

            if (ordersRes.data) {
                setOrders(ordersRes.data.map((o: any) => ({
                    id: o.id,
                    member_id: o.member_id,
                    items: o.items,
                    total_price: Number(o.total_price),
                    status: o.status,
                    created_at: o.created_at,
                })));
            }
        } catch (err) {
            console.error("Error refreshing kitchen data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshKitchen();
    }, []);

    const placeOrder = async (items: any, totalPrice: number) => {
        if (!currentUser) throw new Error("Authentication required to place an order.");

        const { error } = await supabase.from("kitchen_orders").insert({
            member_id: currentUser.id,
            items,
            total_price: totalPrice,
            status: "pending",
        });

        if (error) throw error;
        await refreshKitchen();
    };

    const updateOrderStatus = async (orderId: string, status: KitchenOrder["status"]) => {
        const { error } = await supabase
            .from("kitchen_orders")
            .update({ status })
            .eq("id", orderId);

        if (error) throw error;
        await refreshKitchen();
    };

    return (
        <KitchenContext.Provider value={{
            kitchenItems,
            orders,
            loading,
            placeOrder,
            updateOrderStatus,
            refreshKitchen
        }}>
            {children}
        </KitchenContext.Provider>
    );
}

export const useKitchen = () => {
    const context = useContext(KitchenContext);
    if (context === undefined) {
        throw new Error("useKitchen must be used within a KitchenProvider");
    }
    return context;
};
