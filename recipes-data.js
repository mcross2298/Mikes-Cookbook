/* ==========================================================================
   recipes-data.js  —  Phase 1
   --------------------------------------------------------------------------
   Recipe data for Mike's Cookbook. Each entry conforms to the official JSON
   schema (see App Specification §1.3). Kept in its own file so the data layer
   is cleanly decoupled from the rendering layer (cookbook.js) and portable.

   Serving-ladder rule (per spec §1.2): every recipe supports a 2-serving and a
   4-serving tier. We AUTHOR both tiers explicitly:
     • the tier native to the source recipe is transcribed verbatim,
     • the other tier is pre-computed (here: 2-serving native → 4-serving = 2×)
       with sensible ingredient rounding (whole eggs, teaspoons, etc.).
   macro_profiles are TOTALS for the selected tier (matching the book's
   "Total calories" listing and the schema), not per single serving.

   Ingredient categories drive the grouped grocery list:
     Meat · Dairy · Produce · Pantry
   Add future recipes by appending to RECIPES — no rendering changes required.
   ========================================================================== */
const RECIPES = [
  {
    recipe_id: "jalapeno-chicken-bake",
    title: "Jalapeño Chicken Bake",
    category: "Primal",
    tags: ["Spicy", "One-Dish", "High-Protein"],
    description:
      "This adds a new dimension of flavor to an old favorite with the creative combination of chicken thighs, bacon, vegetables, and cream cheese. If you want the poppers to be less spicy, simply use jarred pickled jalapeños instead of fresh.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#C87A53",

    macro_profiles: {
      serving_2: { calories: 643, protein_g: 70, fat_g: 35, carbs_g: 12 },
      serving_4: { calories: 1286, protein_g: 140, fat_g: 70, carbs_g: 24 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Fresh spinach leaves", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Boneless, skinless chicken thighs, cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Fresh mushrooms, diced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Zucchini, diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Uncured bacon, cooked and chopped", quantity: "8", unit: "oz", category: "Meat" },
        { item: "Salt", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Full-fat cream cheese, softened", quantity: "4", unit: "oz", category: "Dairy" },
        { item: "Goat cheese, crumbled", quantity: "4", unit: "oz", category: "Dairy" },
        { item: "Jalapeño peppers, seeded and minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Minced garlic", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Scallions, thinly sliced", quantity: "2", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Fresh spinach leaves", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Boneless, skinless chicken thighs, cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Fresh mushrooms, diced", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Zucchini, diced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Uncured bacon, cooked and chopped", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Salt", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Full-fat cream cheese, softened", quantity: "8", unit: "oz", category: "Dairy" },
        { item: "Goat cheese, crumbled", quantity: "8", unit: "oz", category: "Dairy" },
        { item: "Jalapeño peppers, seeded and minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Minced garlic", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Scallions, thinly sliced", quantity: "4", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat the oven",
        detail: "Preheat the oven to 425°F."
      },
      {
        step_number: 2,
        title: "Layer the baking dish",
        detail:
          "In an 8 × 8-inch baking dish, layer the spinach, followed by the chicken, mushrooms, zucchini, and bacon. Season with salt and pepper."
      },
      {
        step_number: 3,
        title: "Make the cheese topping & bake",
        detail:
          "In a medium bowl, combine the cream cheese, goat cheese, jalapeños, garlic, and scallions. Drop the cheese mixture in small dollops over the chicken and vegetables and bake for 20 minutes, or until lightly browned. Serve hot."
      }
    ]
  }
];

/* Expose for both classic <script> include and any future module bundling. */
if (typeof window !== "undefined") window.RECIPES = RECIPES;
