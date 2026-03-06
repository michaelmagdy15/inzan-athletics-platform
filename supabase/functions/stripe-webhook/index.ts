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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
        apiVersion: "2023-10-16",
        httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("Stripe-Signature");
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    try {
        const body = await req.text();
        let event;

        try {
            event = stripe.webhooks.constructEvent(body, signature!, endpointSecret!);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return new Response(JSON.stringify({ error: err.message }), { status: 400 });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const { type, customerId, itemId } = session.metadata || {};

            if (type === "membership") {
                // Unlock membership in database
                const { data: tier } = await supabase.from("membership_tiers").select("*").eq("id", itemId).single();

                let days = 30;
                if (tier.billing_cycle === 'annual') days = 365;
                if (tier.billing_cycle === 'semi-annual') days = 180;
                if (tier.billing_cycle === 'quarterly') days = 90;

                const expiry = new Date();
                expiry.setDate(expiry.getDate() + days);

                await supabase.from("profiles").update({
                    membership_tier_id: itemId,
                    membership_status: "active",
                    membership_expires_at: expiry.toISOString()
                }).eq("id", customerId);

                // Send email receipt via Resend
                const { data: userProfile } = await supabase.from("profiles").select("email").eq("id", customerId).single();
                if (userProfile?.email) {
                    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-receipt`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
                        },
                        body: JSON.stringify({
                            to: userProfile.email,
                            subject: "INZAN Athletics - Digital Receipt",
                            html: `<h1>Membership Activated</h1><p>Your ${tier.name} tier is now active until ${expiry.toDateString()}. Welcome to the Zone.</p>`
                        })
                    });
                }

            } else if (type === "package") {
                // Unlock PT package in database
                await supabase.from("pt_packages").update({
                    payment_confirmed: true
                }).eq("id", itemId);
            }
        }

        return new Response(JSON.stringify({ received: true }), {
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
