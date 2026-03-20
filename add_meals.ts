// @ts-nocheck
import { firebase } from './src/lib/firebase';

// Mocking some initial meals for the kitchen...
const newMeals = [
    {
        name: "Grilled Chicken & Quinoa",
        quantity: 15,
        reorder_threshold: 5,
        unit: "portion",
        category: "meal",
        price: 250,
        description: "High protein meal with grilled chicken breast, organic quinoa, and steamed broccoli.",
        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
    },
    {
        name: "Steak and Sweet Potato",
        quantity: 10,
        reorder_threshold: 2,
        unit: "portion",
        category: "meal",
        price: 320,
        description: "Premium lean steak cut served with roasted sweet potatoes and asparagus.",
        image_url: "https://images.unsplash.com/photo-1558401391-7899b4bd5bbf?q=80&w=400&auto=format&fit=crop"
    },
    {
        name: "Salmon Power Bowl",
        quantity: 8,
        reorder_threshold: 2,
        unit: "portion",
        category: "meal",
        price: 350,
        description: "Fresh Norwegian salmon with wild rice, avocado, and a light citrus dressing.",
        image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop"
    },
    {
        name: "Vegan Tofu Scramble",
        quantity: 12,
        reorder_threshold: 3,
        unit: "portion",
        category: "meal",
        price: 210,
        description: "Scrambled organic tofu with spinach, mushrooms, and cherry tomatoes.",
        image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop"
    }
];

async function addMeals() {
    console.log("🚀 Initializing Kitchen Inventory Seeding...");

    for (const meal of newMeals) {
        console.log(`Adding ${meal.name}...`);
        const { error } = await firebase.from('kitchen_inventory').insert(meal);
        if (error) {
            console.error(`❌ Failed to add ${meal.name}:`, error);
        }
    }

    console.log("✅ Kitchen Inventory Seeded Successfully!");
}

addMeals();
