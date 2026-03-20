import React, { createContext, useContext, useState, useEffect } from "react";
import { branding as defaultBranding, BrandingConfig } from "../branding";
import { supabase } from "../lib/firebase";

interface BrandingContextType {
    config: BrandingConfig;
    updateConfig: (updates: Partial<BrandingConfig>) => void;
    isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<BrandingConfig>(defaultBranding);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Dynamic SEO / Head Updates
        document.title = config.name;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", `${config.name} — ${config.tagline}`);
        }
    }, [config]);

    useEffect(() => {
        async function fetchBranding() {
            try {
                const { data, error } = await supabase
                    .from("system_settings")
                    .select("*")
                    .single();

                if (data && !error) {
                    setConfig((prev) => ({
                        ...prev,
                        name: data.brand_name || prev.name,
                        shortName: data.brand_name ? data.brand_name.split(" ")[0].toUpperCase() : prev.shortName,
                        tagline: data.tagline || prev.tagline,
                    }));
                }
            } catch (err) {
                console.error("Error fetching branding:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBranding();
    }, []);

    const updateConfig = (updates: Partial<BrandingConfig>) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    };

    return (
        <BrandingContext.Provider value={{ config, updateConfig, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
}

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
};
