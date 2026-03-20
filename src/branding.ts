export interface BrandingConfig {
    name: string;
    shortName: string;
    tagline: string;
    logo: string;
    favicon: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        social: {
            instagram?: string;
            facebook?: string;
            twitter?: string;
            whatsapp?: string;
        };
    };
}

export const branding: BrandingConfig = {
    name: "INZAN Athletics",
    shortName: "INZAN",
    tagline: "Premium Excellence",
    logo: "/logo.png", // Assuming this is the current logo path
    favicon: "/favicon.ico",
    colors: {
        primary: "#ca8a04", // Gold
        secondary: "#050505", // Dark BG
        accent: "#FFB800", // Bright Gold
    },
    contact: {
        email: "info@inzanathletics.com",
        phone: "+20 123 456 789", // Placeholder
        address: "Cairo, Egypt", // Placeholder
        social: {
            instagram: "https://instagram.com/inzanathletics",
            whatsapp: "https://wa.me/20123456789",
        },
    },
};
