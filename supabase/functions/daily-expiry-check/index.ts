import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Missing Supabase environment variables");
        }

        // Use Service Role Key to bypass RLS for this backend job
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const today = new Date().toISOString().split("T")[0];

        // 1. Expire PT Packages
        const { data: expiredPackages, error: pkgError } = await supabase
            .from("pt_packages")
            .update({ status: "expired" })
            .lt("expires_at", today)
            .in("status", ["active"]);

        if (pkgError) throw pkgError;

        // 2. Expire Memberships
        // We update profiles directly where their membership_expires_at has passed
        const { data: expiredMemberships, error: memError } = await supabase
            .from("profiles")
            .update({ status: "inactive" })
            .lt("membership_expires_at", today)
            .eq("status", "active")
            .eq("role", "member");

        if (memError) throw memError;

        return new Response(
            JSON.stringify({
                message: "Successfully processed daily expiries.",
                packagesExpiredCount: expiredPackages?.length || 0,
                membershipsExpiredCount: expiredMemberships?.length || 0,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
