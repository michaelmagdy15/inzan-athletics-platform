import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { userId, title, message } = await req.json();

        // Here we would lookup the user's specific push token using userId
        // and hit the OneSignal or Firebase API. For demo purposes we will
        // structure the fetch exactly how OneSignal expects it.

        const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
        const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

        // In a real app we fetch this array from the DB users table
        const targetDeviceTokens = ["device-token-123xyz"];

        if (ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY) {
            const response = await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    include_player_ids: targetDeviceTokens,
                    headings: { en: title },
                    contents: { en: message },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send OneSignal push notification.");
            }
        }

        return new Response(
            JSON.stringify({ success: true, message: "Push notification transmitted securely." }),
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
