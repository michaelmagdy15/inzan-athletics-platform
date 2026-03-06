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

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Calculate tomorrow's date format (YYYY-MM-DD)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        // Find all scheduled sessions for tomorrow
        const { data: sessions, error: fetchError } = await supabase
            .from("pt_sessions")
            .select("*, coach:profiles!pt_sessions_coach_id_fkey(name)")
            .eq("scheduled_date", tomorrowStr)
            .eq("status", "scheduled");

        if (fetchError) throw fetchError;

        let notificationsSent = 0;

        // Send a notification to each member regarding their session tomorrow
        if (sessions && sessions.length > 0) {
            for (const session of sessions) {
                const title = "Reminder: Upcoming Session";
                const message = `You have a session tomorrow at ${session.scheduled_time.slice(0, 5)} with Coach ${session.coach?.name || "your coach"}.`;

                const { error: notifError } = await supabase.from("notifications").insert({
                    user_id: session.member_id,
                    title,
                    message,
                    type: "session_reminder",
                    link: "/sessions",
                });

                if (!notifError) {
                    notificationsSent++;
                }
            }
        }

        return new Response(
            JSON.stringify({
                message: "Successfully processed hourly session reminders.",
                notificationsSent,
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
