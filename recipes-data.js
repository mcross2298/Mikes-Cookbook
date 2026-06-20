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

   Each ingredient separates WHAT YOU BUY from WHAT YOU DO WITH IT:
     • item  — the clean shopping-list name (drives the Grocery tab)
     • prep  — the prep instruction, e.g. "cooked and chopped" (shown only on
               the Recipe tab's mise en place list, never on the grocery list)
   This keeps the grocery list a pure shopping list while preserving prep
   detail where it matters — alongside the cooking steps.

   Home-screen (Phase 2) recipe-card fields:
     • source — origin cookbook / collection, used to group recipes on the
                home screen (e.g. "Two Meals a Day").
     • icon   — emoji shown on the card's accent band.
     • accent — per-recipe accent color (also themes the detail screen).

   Add future recipes by appending to RECIPES — no rendering changes required.
   ========================================================================== */
const RECIPES = [
  {
    recipe_id: "jalapeno-chicken-bake",
    title: "Jalapeño Chicken Bake",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🌶️",
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
        { item: "Fresh spinach leaves", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Zucchini", prep: "diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Uncured bacon", prep: "cooked and chopped", quantity: "8", unit: "oz", category: "Meat" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Full-fat cream cheese", prep: "softened", quantity: "4", unit: "oz", category: "Dairy" },
        { item: "Goat cheese", prep: "crumbled", quantity: "4", unit: "oz", category: "Dairy" },
        { item: "Jalapeño peppers", prep: "seeded and minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Minced garlic", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Fresh spinach leaves", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Zucchini", prep: "diced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Uncured bacon", prep: "cooked and chopped", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Full-fat cream cheese", prep: "softened", quantity: "8", unit: "oz", category: "Dairy" },
        { item: "Goat cheese", prep: "crumbled", quantity: "8", unit: "oz", category: "Dairy" },
        { item: "Jalapeño peppers", prep: "seeded and minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Minced garlic", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "4", unit: "", category: "Produce" }
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
  },

  {
    recipe_id: "broccoli-bacon-slaw",
    title: "Broccoli and Bacon Slaw",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥦",
    tags: ["Make-Ahead", "Crunchy", "High-Fat"],
    description:
      "Slaw doesn't have to mean just cabbage. This recipe uses broccoli and packs a big nutritional punch. Combined with fatty, salty bacon and bright lemon and apple cider vinegar, this dish is a flavor odyssey in your mouth.",
    prep_time_mins: 5,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#7D8C77",

    macro_profiles: {
      serving_2: { calories: 1270, protein_g: 24, fat_g: 122, carbs_g: 19 },
      serving_4: { calories: 2540, protein_g: 48, fat_g: 244, carbs_g: 38 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Red onion", prep: "minced", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Lemon", prep: "zest and juice", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Apple cider vinegar", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Fresh broccoli florets", prep: "cut into bite-size pieces", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Uncured bacon", prep: "cooked and chopped", quantity: "8", unit: "slices", category: "Meat" },
        { item: "Roasted pepitas", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" }
      ],
      serving_4: [
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Red onion", prep: "minced", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lemon", prep: "zest and juice", quantity: "1", unit: "", category: "Produce" },
        { item: "Apple cider vinegar", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Fresh broccoli florets", prep: "cut into bite-size pieces", quantity: "8", unit: "cups", category: "Produce" },
        { item: "Uncured bacon", prep: "cooked and chopped", quantity: "16", unit: "slices", category: "Meat" },
        { item: "Roasted pepitas", prep: "", quantity: "1", unit: "cup", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Whisk the dressing",
        detail:
          "In a large bowl, whisk together the mayonnaise, onion, lemon zest and juice, vinegar, salt, and pepper."
      },
      {
        step_number: 2,
        title: "Fold in & chill",
        detail:
          "Add the broccoli, chopped bacon, and pepitas and combine thoroughly. Chill or serve at room temperature."
      }
    ]
  },

  {
    recipe_id: "sesame-ginger-chicken-stir-fry",
    title: "Sesame-Ginger Chicken and Vegetable Stir-Fry",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥢",
    tags: ["Quick", "Asian-Inspired", "High-Protein"],
    description:
      "Want a super-satisfying meal super fast? Try this stir-fry with a bunch of green vegetables, fatty chicken thighs, and Asian-inspired seasonings. This is wonderful enjoyed on its own as well as on a bed of cauliflower rice.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#C8894F",

    macro_profiles: {
      serving_2: { calories: 682, protein_g: 44, fat_g: 42, carbs_g: 32 },
      serving_4: { calories: 1364, protein_g: 88, fat_g: 84, carbs_g: 64 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter or ghee", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Avocado oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Fresh ginger", prep: "grated", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Fresh broccoli florets", prep: "cut into bite-size pieces", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Carrot", prep: "cut into 1/4-inch slices", quantity: "1", unit: "", category: "Produce" },
        { item: "Celery", prep: "cut into bite-size pieces", quantity: "2", unit: "stalks", category: "Produce" },
        { item: "Green cabbage", prep: "chopped", quantity: "1/2", unit: "small head", category: "Produce" },
        { item: "Coconut aminos", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Toasted sesame oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Yai's Thai Chili Garlic Hot Sauce", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Sesame seeds", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1/2", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Butter or ghee", prep: "", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Avocado oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Fresh ginger", prep: "grated", quantity: "4", unit: "tsp", category: "Produce" },
        { item: "Fresh broccoli florets", prep: "cut into bite-size pieces", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Carrot", prep: "cut into 1/4-inch slices", quantity: "2", unit: "", category: "Produce" },
        { item: "Celery", prep: "cut into bite-size pieces", quantity: "4", unit: "stalks", category: "Produce" },
        { item: "Green cabbage", prep: "chopped", quantity: "1", unit: "small head", category: "Produce" },
        { item: "Coconut aminos", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Toasted sesame oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Yai's Thai Chili Garlic Hot Sauce", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Sesame seeds", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Sear the chicken",
        detail:
          "In a large skillet over medium heat, melt the butter. Sauté the chicken until cooked through. Transfer to a plate and set aside."
      },
      {
        step_number: 2,
        title: "Stir-fry the vegetables",
        detail:
          "In the same skillet, heat the avocado oil over medium-high heat. Add the onion, garlic, ginger, broccoli, carrot, celery, and cabbage and cook for 4 minutes, stirring occasionally."
      },
      {
        step_number: 3,
        title: "Combine & finish",
        detail:
          "Return the chicken to the skillet, then add the coconut aminos, sesame oil, chili garlic sauce, and sesame seeds. Toss to coat and cook 2 more minutes. Serve garnished with cilantro and scallions, with additional spice on the side if desired."
      }
    ]
  },

  {
    recipe_id: "cauliflower-fried-rice-eggs",
    title: "Cauliflower Fried Rice with Eggs",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍳",
    tags: ["Quick", "One-Pan", "Meatless"],
    description:
      "As you experience the bold flavors of fresh ginger, sesame oil, coconut aminos, and cilantro, you won't be missing regular old rice (and its blood-sugar spike!) for one second.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#9AA06B",

    macro_profiles: {
      serving_2: { calories: 540, protein_g: 19, fat_g: 40, carbs_g: 26 },
      serving_4: { calories: 1080, protein_g: 38, fat_g: 80, carbs_g: 52 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter", prep: "divided", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "2", unit: "oz", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Carrot", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh broccoli florets", prep: "cut into small pieces", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Large pastured eggs", prep: "beaten", quantity: "4", unit: "", category: "Dairy" },
        { item: "Frozen cauliflower rice", prep: "", quantity: "1", unit: "(16-oz) bag", category: "Produce" },
        { item: "Toasted sesame oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Everything bagel seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Chili garlic sauce", prep: "for serving", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Butter", prep: "divided", quantity: "8", unit: "tbsp", category: "Dairy" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Carrot", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh broccoli florets", prep: "cut into small pieces", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Large pastured eggs", prep: "beaten", quantity: "8", unit: "", category: "Dairy" },
        { item: "Frozen cauliflower rice", prep: "", quantity: "2", unit: "(16-oz) bags", category: "Produce" },
        { item: "Toasted sesame oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Everything bagel seasoning", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Chili garlic sauce", prep: "for serving", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the mushrooms & vegetables",
        detail:
          "In a large skillet, melt 2 tablespoons of the butter over medium heat until golden brown. Add the mushrooms and cook over medium heat until golden brown. Add the onion, garlic, ginger, carrot, and broccoli. Increase the heat to medium-high and sauté until the vegetables are crisp-tender, about 4 minutes."
      },
      {
        step_number: 2,
        title: "Scramble the eggs",
        detail:
          "Make a well in the middle of the vegetables and add the remaining 2 tablespoons butter. Pour the eggs into the well, season with salt and pepper, and cook until the eggs are scrambled, stirring occasionally."
      },
      {
        step_number: 3,
        title: "Add cauliflower rice & finish",
        detail:
          "Add the cauliflower rice, sesame oil, coconut aminos, and bagel seasoning. Toss to combine. Taste and adjust seasoning, then garnish with the cilantro and scallions and serve with chili garlic sauce."
      }
    ]
  },

  {
    recipe_id: "meat-lovers-pizza-skillet",
    title: "Meat Lover's Pizza Skillet",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍕",
    tags: ["Pizza-Inspired", "Comfort", "High-Fat"],
    description:
      "The big, bold flavors of Italian sausage and pepperoni are topped with sweet and creamy mozzarella cheese and vegetables. Enjoy the distinct flavors of your favorite veggie pizza, but without the bloating and sugar crash!",
    prep_time_mins: 8,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#B5503F",

    macro_profiles: {
      serving_2: { calories: 1367, protein_g: 62, fat_g: 111, carbs_g: 30 },
      serving_4: { calories: 2734, protein_g: 124, fat_g: 222, carbs_g: 60 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Bulk Italian sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Fresh cauliflower florets", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Green bell pepper", prep: "seeded and cut into large dice", quantity: "1", unit: "", category: "Produce" },
        { item: "Tomato paste", prep: "", quantity: "8", unit: "tbsp", category: "Pantry" },
        { item: "Fresh mushrooms", prep: "sliced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Red onion", prep: "thinly sliced", quantity: "1/2", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Uncured pepperoni", prep: "", quantity: "4", unit: "oz", category: "Meat" },
        { item: "Shredded mozzarella cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Grated Parmesan cheese", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Fresh basil", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Bulk Italian sausage", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Fresh cauliflower florets", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Green bell pepper", prep: "seeded and cut into large dice", quantity: "2", unit: "", category: "Produce" },
        { item: "Tomato paste", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Fresh mushrooms", prep: "sliced", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Red onion", prep: "thinly sliced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Italian seasoning", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Uncured pepperoni", prep: "", quantity: "8", unit: "oz", category: "Meat" },
        { item: "Shredded mozzarella cheese", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Grated Parmesan cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh basil", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat the broiler",
        detail: "Preheat the broiler to its highest setting."
      },
      {
        step_number: 2,
        title: "Brown the sausage",
        detail:
          "In a large ovenproof skillet over medium-high heat, sauté the sausage until cooked through, then transfer to a bowl."
      },
      {
        step_number: 3,
        title: "Cook the vegetables",
        detail:
          "In the same skillet, heat the olive oil over medium-high heat, then add the cauliflower, bell pepper, tomato paste, mushrooms, red onion, garlic, Italian seasoning, salt, and pepper. Cook for 6 minutes, then add the cooked sausage and pepperoni. Top with the mozzarella and Parmesan."
      },
      {
        step_number: 4,
        title: "Broil & garnish",
        detail:
          "Transfer the skillet to the middle rack of the oven and broil until the cheese is bubbly and golden, about 5 minutes. Remove from the oven, garnish with the basil, and serve hot."
      }
    ]
  }
];

/* Expose for both classic <script> include and any future module bundling. */
if (typeof window !== "undefined") window.RECIPES = RECIPES;
