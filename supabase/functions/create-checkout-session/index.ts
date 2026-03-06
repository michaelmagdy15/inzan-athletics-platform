import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { itemId, itemType, customerId, customerName, customerEmail } = await req.json();

        // In a real app we fetch price from DB to prevent client-side spoofing.
        // For this demo, let's look it up or pass it in. If it's a membership tier:
        let itemName = "";
        let itemPrice = 0;
        let metadata: any = { type: itemType, customerId, itemId };

        if (itemType === "membership") {
            const { data: tier } = await supabase.from("membership_tiers").select("*").eq("id", itemId).single();
            if (!tier) throw new Error("Tier not found");
            itemName = tier.name;
            itemPrice = tier.price;
        } else if (itemType === "package") {
            // You could have a separate packages prices table, for simplicity we assume client passes some data but really we should lookup the standard price
            itemName = "PT Package";
            itemPrice = 1000; // placeholder, look up from real DB
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "egp", // Payment in Egyptian Pounds
                        product_data: {
                            name: itemName,
                        },
                        unit_amount: itemPrice * 100, // Stripe expects amounts in cents/piastres
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${req.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get("origin")}/payment/cancel`,
            customer_email: customerEmail,
            metadata,
        });

        return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
