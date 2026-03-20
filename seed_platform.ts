// @ts-nocheck
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Import firebase AFTER dotenv.config()
const { firebase } = await import('./src/lib/firebase.js');

const today = new Date().toLocaleDateString();

const SEED_DATA = {
    profiles: [
        { id: 'admin-1', name: 'Michael Admin', email: 'admin@inzan.com', role: 'admin', membershipStatus: 'active', strain: 'High', recovery: 85, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150' },
        { id: 'coach-1', name: 'Coach Alex', email: 'alex@inzan.com', role: 'coach', membershipStatus: 'active', strain: 'Medium', recovery: 92, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150' },
        { id: 'member-1', name: 'Sarah Member', email: 'sarah@inzan.com', role: 'member', membershipStatus: 'active', strain: 'Optimal', recovery: 78, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150' }
    ],
    membership_tiers: [
        { id: 'tier-1', name: 'Standard', price: 1500, features: ['Gym Access', 'Locker Room'] },
        { id: 'tier-2', name: 'Premium', price: 2500, features: ['Gym Access', 'All Classes', 'Pool'] },
        { id: 'tier-3', name: 'Elite', price: 4500, features: ['All Access', 'Personal Training', 'Nutrition'] }
    ],
    classes: [
        { title: 'Morning HIIT', trainer: 'Coach Alex', time: '08:00 AM', total_spots: 20, spots_left: 8, category: 'hiit', date: today },
        { title: 'Powerlifting', trainer: 'Coach Sarah', time: '10:00 AM', total_spots: 12, spots_left: 4, category: 'strength', date: today },
        { title: 'Vinyasa Yoga', trainer: 'Coach Maya', time: '05:00 PM', total_spots: 15, spots_left: 15, category: 'yoga', date: today },
        { title: 'Combat Pro', trainer: 'Coach Victor', time: '07:00 PM', total_spots: 10, spots_left: 2, category: 'combat', date: today }
    ],
    kitchen_inventory: [
        { name: "Grilled Chicken & Quinoa", quantity: 15, reorder_threshold: 5, unit: "portion", category: "meal", price: 250, description: "High protein meal with grilled chicken breast, organic quinoa, and steamed broccoli.", image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop" },
        { name: "Electrolyte Blast", quantity: 50, reorder_threshold: 10, unit: "bottle", category: "drink", price: 45, description: "Hydration with essential minerals.", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop" }
    ],
    operating_goals: [
        { metric_name: 'New Members', target_value: 50, current_value: 32, period: 'monthly' },
        { metric_name: 'Revenue', target_value: 250000, current_value: 185000, period: 'monthly' }
    ],
    broadcast_alerts: [
        { message: 'New Combat Pro session added for tonight!', type: 'info', active: true, created_at: new Date().toISOString() },
        { message: 'Maintenance in Zone A between 2PM-4PM.', type: 'warning', active: true, created_at: new Date().toISOString() }
    ],
    system_settings: [
        { id: 'global_config', brand_name: 'INZAN ATHLETICS', theme: 'dark', currency: 'EGP' }
    ]
};

async function seed() {
    console.log("🚀 Starting Global Seeding Protocol...");

    for (const [table, items] of Object.entries(SEED_DATA)) {
        console.log(`\n📦 Seeding table: ${table}...`);
        for (const item of items) {
            console.log(`  Adding item: ${item.name || item.title || item.message || item.id}...`);
            const { error } = await firebase.from(table).insert(item);
            if (error) {
                console.error(`  ❌ Error adding to ${table}:`, error.message || error);
            }
        }
    }

    console.log("\n✅ Seeding Complete. The platform is now ALIVE.");
}

seed();
