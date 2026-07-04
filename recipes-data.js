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
   macro_profiles are PER SINGLE SERVING and identical across both tiers:
   the book's printed macro set describes one portion, and the serving size
   only changes how much the recipe makes — not the macros. (serving_2 and
   serving_4 are kept as equal copies so the schema/rendering stays intact.)

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
    dish_category: "Casseroles & Bakes",
    description:
      "This adds a new dimension of flavor to an old favorite with the creative combination of chicken thighs, bacon, vegetables, and cream cheese. If you want the poppers to be less spicy, simply use jarred pickled jalapeños instead of fresh.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#C87A53",

    macro_profiles: {
      serving_2: { calories: 643, protein_g: 70, fat_g: 35, carbs_g: 12 },
      serving_4: { calories: 643, protein_g: 70, fat_g: 35, carbs_g: 12 }
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
    dish_category: "Salads & Slaws",
    description:
      "Slaw doesn't have to mean just cabbage. This recipe uses broccoli and packs a big nutritional punch. Combined with fatty, salty bacon and bright lemon and apple cider vinegar, this dish is a flavor odyssey in your mouth.",
    prep_time_mins: 5,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#7D8C77",

    macro_profiles: {
      serving_2: { calories: 1270, protein_g: 24, fat_g: 122, carbs_g: 19 },
      serving_4: { calories: 1270, protein_g: 24, fat_g: 122, carbs_g: 19 }
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
    dish_category: "Skillets & Stir-Fries",
    description:
      "Want a super-satisfying meal super fast? Try this stir-fry with a bunch of green vegetables, fatty chicken thighs, and Asian-inspired seasonings. This is wonderful enjoyed on its own as well as on a bed of cauliflower rice.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#C8894F",

    macro_profiles: {
      serving_2: { calories: 682, protein_g: 44, fat_g: 42, carbs_g: 32 },
      serving_4: { calories: 682, protein_g: 44, fat_g: 42, carbs_g: 32 }
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
    dish_category: "Skillets & Stir-Fries",
    description:
      "As you experience the bold flavors of fresh ginger, sesame oil, coconut aminos, and cilantro, you won't be missing regular old rice (and its blood-sugar spike!) for one second.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#9AA06B",

    macro_profiles: {
      serving_2: { calories: 540, protein_g: 19, fat_g: 40, carbs_g: 26 },
      serving_4: { calories: 540, protein_g: 19, fat_g: 40, carbs_g: 26 }
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
    dish_category: "Skillets & Stir-Fries",
    description:
      "The big, bold flavors of Italian sausage and pepperoni are topped with sweet and creamy mozzarella cheese and vegetables. Enjoy the distinct flavors of your favorite veggie pizza, but without the bloating and sugar crash!",
    prep_time_mins: 8,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#B5503F",

    macro_profiles: {
      serving_2: { calories: 1367, protein_g: 62, fat_g: 111, carbs_g: 30 },
      serving_4: { calories: 1367, protein_g: 62, fat_g: 111, carbs_g: 30 }
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
  },

  {
    recipe_id: "dry-rubbed-chicken-thighs-zucchini",
    title: "Dry-Rubbed Chicken Thighs with Broiled Zucchini",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍗",
    tags: ["Sheet-Pan", "High-Protein", "Summer"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Summer, when zucchini is at its best, is the perfect time to put this recipe on repeat. A little Parmesan cheese goes a long way, heightening this dish's naturally sweet and salty flavors.",
    prep_time_mins: 5,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#B86B3D",

    macro_profiles: {
      serving_2: { calories: 756, protein_g: 88, fat_g: 36, carbs_g: 20 },
      serving_4: { calories: 756, protein_g: 88, fat_g: 36, carbs_g: 20 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Boneless, skinless chicken thighs", prep: "", quantity: "4", unit: "", category: "Meat" },
        { item: "Zucchini", prep: "cut in half lengthwise", quantity: "4", unit: "small", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Italian seasoning", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Extra-virgin olive oil or avocado oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Grated Parmesan cheese", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" }
      ],
      serving_4: [
        { item: "Boneless, skinless chicken thighs", prep: "", quantity: "8", unit: "", category: "Meat" },
        { item: "Zucchini", prep: "cut in half lengthwise", quantity: "8", unit: "small", category: "Produce" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Extra-virgin olive oil or avocado oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Grated Parmesan cheese", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat & prep the pans",
        detail:
          "Preheat the oven to 425°F. Line two baking sheets with parchment paper. Arrange the chicken thighs on one and the zucchini halves on the other."
      },
      {
        step_number: 2,
        title: "Season & bake the chicken",
        detail:
          "In a small bowl, combine the salt, garlic powder, onion powder, paprika, Italian seasoning, and ½ teaspoon of the pepper. Rub the seasoning mixture into the chicken thighs with your fingers. Put the chicken in the oven and bake for 20 minutes."
      },
      {
        step_number: 3,
        title: "Dress the zucchini",
        detail:
          "Meanwhile, drizzle the zucchini halves with the olive oil and sprinkle with the Parmesan and the remaining ½ teaspoon pepper."
      },
      {
        step_number: 4,
        title: "Broil the zucchini",
        detail:
          "Turn the oven to its lowest broiler setting and move the chicken to the bottom rack. Place the zucchini pan in the top third of the oven and broil for about 5 minutes, or until the zucchini is fork-tender and the cheese is bubbly."
      },
      {
        step_number: 5,
        title: "Check & serve",
        detail:
          "Once the chicken thighs reach an internal temperature of 160°F, remove them from the oven and serve with the zucchini immediately."
      }
    ]
  },

  {
    recipe_id: "broiled-salmon-asparagus",
    title: "Broiled Salmon and Asparagus",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🐟",
    tags: ["Sheet-Pan", "Quick", "High-Protein"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Freshly broiled salmon served with seasonal vegetables is one of the greatest culinary pairings known to humankind. Keep a supply of frozen wild-caught salmon fillets in your freezer so you can whip up this dish anytime, along with the freshest vegetables of the season.",
    prep_time_mins: 5,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#D27E5E",

    macro_profiles: {
      serving_2: { calories: 1009, protein_g: 121, fat_g: 53, carbs_g: 12 },
      serving_4: { calories: 1009, protein_g: 121, fat_g: 53, carbs_g: 12 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh rosemary", prep: "minced", quantity: "1/2", unit: "tsp", category: "Produce" },
        { item: "Fresh thyme", prep: "minced", quantity: "1/2", unit: "tsp", category: "Produce" },
        { item: "Prepared whole grain mustard", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Extra-virgin olive oil", prep: "divided", quantity: "1/4 cup + 1 tbsp", unit: "", category: "Pantry" },
        { item: "Salt", prep: "plus more to taste", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "plus more to taste", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Lemon", prep: "zest of 1, juice of ½", quantity: "1", unit: "", category: "Produce" },
        { item: "Salmon fillets (about 8 oz each)", prep: "", quantity: "2", unit: "", category: "Meat" },
        { item: "Fresh asparagus", prep: "ends trimmed", quantity: "1", unit: "bunch", category: "Produce" }
      ],
      serving_4: [
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Fresh rosemary", prep: "minced", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Fresh thyme", prep: "minced", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Prepared whole grain mustard", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Extra-virgin olive oil", prep: "divided", quantity: "1/2 cup + 2 tbsp", unit: "", category: "Pantry" },
        { item: "Salt", prep: "plus more to taste", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "plus more to taste", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lemon", prep: "zest of 2, juice of 1", quantity: "2", unit: "", category: "Produce" },
        { item: "Salmon fillets (about 8 oz each)", prep: "", quantity: "4", unit: "", category: "Meat" },
        { item: "Fresh asparagus", prep: "ends trimmed", quantity: "2", unit: "bunches", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat the broiler",
        detail:
          "Preheat the broiler to its highest setting. Line a sheet pan with parchment paper."
      },
      {
        step_number: 2,
        title: "Make the mustard-herb sauce",
        detail:
          "In a small bowl, combine the garlic, rosemary, thyme, mustard, ¼ cup of the olive oil, 1 teaspoon salt, ½ teaspoon pepper, and the lemon zest and juice."
      },
      {
        step_number: 3,
        title: "Arrange & broil",
        detail:
          "Arrange the salmon fillets and asparagus on the prepared sheet pan. Drizzle the asparagus with the remaining 1 tablespoon olive oil and season with salt and pepper. Broil on the middle rack of the oven for 2 minutes, then cover the salmon fillets with the mustard-herb sauce and broil until flaky and just cooked through, about 5 minutes. Remove from the oven and serve immediately."
      }
    ]
  },

  {
    recipe_id: "asian-turkey-meatballs-spaghetti-squash",
    title: "Asian Turkey Meatballs with Roasted Spaghetti Squash",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🧆",
    tags: ["Asian-Inspired", "Sheet-Pan", "High-Protein"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Anyone who takes the leap and replaces grain-based pasta with spaghetti squash knows the truth: not only is spaghetti squash much more healthful, it also tastes much better! If you have an Instant Pot, your squash cooking time will be reduced dramatically, giving you more time to play outside.",
    prep_time_mins: 10,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#C7913F",

    macro_profiles: {
      serving_2: { calories: 746, protein_g: 63, fat_g: 46, carbs_g: 20 },
      serving_4: { calories: 746, protein_g: 63, fat_g: 46, carbs_g: 20 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Spaghetti squash", prep: "", quantity: "1", unit: "small", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Ground turkey", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Fresh cilantro leaves", prep: "chopped, divided", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Scallions", prep: "chopped, divided", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Yai's Thai Chili Garlic Hot Sauce", prep: "plus more for serving if desired", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Large egg", prep: "", quantity: "1", unit: "", category: "Dairy" },
        { item: "Sesame oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Sesame seeds (raw or roasted)", prep: "", quantity: "1", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Spaghetti squash", prep: "", quantity: "2", unit: "small", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Ground turkey", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Fresh cilantro leaves", prep: "chopped, divided", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Scallions", prep: "chopped, divided", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Yai's Thai Chili Garlic Hot Sauce", prep: "plus more for serving if desired", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Large egg", prep: "", quantity: "2", unit: "", category: "Dairy" },
        { item: "Sesame oil", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Sesame seeds (raw or roasted)", prep: "", quantity: "2", unit: "tsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat & prep the pans",
        detail:
          "Preheat the oven to 450°F. Line two baking sheets with parchment paper."
      },
      {
        step_number: 2,
        title: "Roast the spaghetti squash",
        detail:
          "Cut the spaghetti squash in half lengthwise. Scoop out the seeds, then season the inside of both halves with the olive oil, salt, and pepper. Place the halves cut side down on one of the sheet pans and bake for 25 minutes."
      },
      {
        step_number: 3,
        title: "Mix & roll the meatballs",
        detail:
          "Meanwhile, combine the turkey, ½ cup of the cilantro, ½ cup of the scallions, 1 tablespoon chili garlic sauce, the coconut aminos, garlic, ginger, egg, and sesame oil in a medium bowl. Roll into balls about 2 inches in diameter and arrange them on the second sheet pan."
      },
      {
        step_number: 4,
        title: "Broil the meatballs",
        detail:
          "When the squash is done, set it aside to cool, then preheat the broiler to its highest setting. Place the meatballs in the bottom third of the oven and broil for 13 minutes."
      },
      {
        step_number: 5,
        title: "Assemble & serve",
        detail:
          "While the meatballs cook, scoop out the spaghetti squash flesh with a large fork and divide it between two serving plates. Serve the hot meatballs over the spaghetti squash and garnish with the remaining cilantro and scallions, the sesame seeds, and additional chili sauce if desired."
      }
    ]
  },

  {
    recipe_id: "cilantro-lime-flank-steak-green-beans",
    title: "Grilled Cilantro-Lime Flank Steak with Spiced Sesame Green Beans",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥩",
    tags: ["Grilled", "Make-Ahead", "High-Fat"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "The fresh flavor of lime pairs with the warm and grounding flavors of coconut aminos and sesame oil for a delicious and memorable combination. Flank steak marinates in just thirty minutes, making this recipe a great choice when you're pressed for time.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 4,
    accent: "#A05A45",

    macro_profiles: {
      serving_2: { calories: 1176, protein_g: 75, fat_g: 84, carbs_g: 30 },
      serving_4: { calories: 1176, protein_g: 75, fat_g: 84, carbs_g: 30 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Fresh cilantro leaves", prep: "", quantity: "1", unit: "bunch", category: "Produce" },
        { item: "Scallions (white and tender green parts only)", prep: "", quantity: "1", unit: "bunch", category: "Produce" },
        { item: "Garlic cloves", prep: "", quantity: "4", unit: "", category: "Produce" },
        { item: "Limes", prep: "zest and juice", quantity: "3", unit: "", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Flank steak", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Butter", prep: "", quantity: "1", unit: "tbsp", category: "Dairy" },
        { item: "Sesame oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Yai's Thai Chili Garlic Hot Sauce", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Fresh green beans", prep: "", quantity: "1", unit: "lb", category: "Produce" },
        { item: "Water", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Extra-virgin olive oil", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Fresh cilantro leaves", prep: "", quantity: "2", unit: "bunches", category: "Produce" },
        { item: "Scallions (white and tender green parts only)", prep: "", quantity: "2", unit: "bunches", category: "Produce" },
        { item: "Garlic cloves", prep: "", quantity: "8", unit: "", category: "Produce" },
        { item: "Limes", prep: "zest and juice", quantity: "6", unit: "", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Flank steak", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Butter", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Sesame oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Yai's Thai Chili Garlic Hot Sauce", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Fresh green beans", prep: "", quantity: "2", unit: "lb", category: "Produce" },
        { item: "Water", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the marinade",
        detail:
          "In a blender, combine the olive oil, cilantro, scallions, garlic, lime zest and juice, salt, and pepper. Blend until smooth. Pour half the sauce into a large nonreactive baking dish or a resealable plastic bag. Add the flank steak and massage to coat. Marinate at least 30 minutes or overnight."
      },
      {
        step_number: 2,
        title: "Grill the steak",
        detail:
          "Heat a grill to medium-high. Place the marinated flank steak on the grill and cook for about 5 minutes per side. Remove when the internal temperature reaches 125°F. Place the meat on a cutting board and tent with foil to finish the cooking process."
      },
      {
        step_number: 3,
        title: "Cook the green beans",
        detail:
          "In a large pan, melt the butter over medium-high heat. Add the sesame oil, coconut aminos, and chili garlic sauce. Stir together, then add the green beans, tossing to coat. Cook, stirring occasionally, for 5 minutes. Add the water and continue to cook, stirring, until the liquid evaporates and the beans are tender."
      },
      {
        step_number: 4,
        title: "Slice & serve",
        detail:
          "Slice the steak against the grain and serve it alongside the green beans, drizzled with the remaining herb sauce."
      }
    ]
  },

  {
    recipe_id: "chicken-divan",
    title: "Chicken Divan",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🧀",
    tags: ["Casserole", "Comfort", "High-Fat"],
    dish_category: "Casseroles & Bakes",
    description:
      "Creamy chicken with broccoli and mushrooms gets even more comforting and pleasurable with the addition of shredded Cheddar cheese.",
    prep_time_mins: 15,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#C99A4E",

    macro_profiles: {
      serving_2: { calories: 714, protein_g: 45, fat_g: 54, carbs_g: 12 },
      serving_4: { calories: 714, protein_g: 45, fat_g: 54, carbs_g: 12 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter", prep: "divided", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Salt", prep: "divided", quantity: "1 3/4", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "7/8", unit: "tsp", category: "Pantry" },
        { item: "Broccoli florets", prep: "cut into bite-size pieces", quantity: "1 1/2", unit: "cups", category: "Produce" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Shredded Cheddar cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" }
      ],
      serving_4: [
        { item: "Butter", prep: "divided", quantity: "1", unit: "stick", category: "Dairy" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Salt", prep: "divided", quantity: "3 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "1 3/4", unit: "tsp", category: "Pantry" },
        { item: "Broccoli florets", prep: "cut into bite-size pieces", quantity: "3", unit: "cups", category: "Produce" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Shredded Cheddar cheese", prep: "", quantity: "2", unit: "cups", category: "Dairy" }
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
        title: "Brown the chicken",
        detail:
          "In a large skillet over medium heat, melt 4 tablespoons butter. Add the chicken pieces, season with 1 teaspoon salt and ½ teaspoon pepper, and sauté until cooked through, about 5 minutes. Transfer to the bottom of a 9- × 13-inch casserole dish and set aside."
      },
      {
        step_number: 3,
        title: "Sauté the broccoli",
        detail:
          "Increase the heat under the skillet to medium-high and melt the remaining butter. Add the broccoli, season with ½ teaspoon salt and ¼ teaspoon pepper, and cook until crisp-tender, about 5 minutes. Layer the broccoli over the chicken."
      },
      {
        step_number: 4,
        title: "Make the cream sauce",
        detail:
          "Add the mushrooms, onion, and garlic to the skillet and sauté for 5 minutes. Add the heavy cream, parsley, 2 teaspoons salt, and 1 teaspoon pepper and stir to combine. Pour the cream mixture over the chicken and broccoli, then top with the shredded cheese."
      },
      {
        step_number: 5,
        title: "Bake & serve",
        detail:
          "Bake on the middle rack of the oven until the cheese is bubbly and golden, about 15 minutes. Serve immediately."
      }
    ]
  },

  {
    recipe_id: "skillet-reuben",
    title: "Skillet Reuben",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥪",
    tags: ["Skillet", "Comfort", "High-Fat"],
    dish_category: "Sandwiches",
    description:
      "Salty corned beef broiled with sweet Swiss cheese captures the heart's every single time, so make this when you need a little extra self-love or when you're wanting to share that love with a friend.",
    prep_time_mins: 5,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#B5654D",

    macro_profiles: {
      serving_2: { calories: 1245, protein_g: 88, fat_g: 77, carbs_g: 50 },
      serving_4: { calories: 1245, protein_g: 88, fat_g: 77, carbs_g: 50 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter", prep: "", quantity: "3", unit: "tbsp", category: "Dairy" },
        { item: "Corned beef", prep: "coarsely chopped", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Coleslaw mix", prep: "about 4 cups total", quantity: "1", unit: "(11-oz) bag", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1", unit: "bunch", category: "Produce" },
        { item: "Swiss cheese", prep: "", quantity: "4", unit: "slices", category: "Dairy" },
        { item: "Sauerkraut", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Tomato paste", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Prepared horseradish", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Apple cider vinegar", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Butter", prep: "", quantity: "6", unit: "tbsp", category: "Dairy" },
        { item: "Corned beef", prep: "coarsely chopped", quantity: "3", unit: "lb", category: "Meat" },
        { item: "Coleslaw mix", prep: "about 8 cups total", quantity: "2", unit: "(11-oz) bags", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "2", unit: "bunches", category: "Produce" },
        { item: "Swiss cheese", prep: "", quantity: "8", unit: "slices", category: "Dairy" },
        { item: "Sauerkraut", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Tomato paste", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Prepared horseradish", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Apple cider vinegar", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" }
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
        title: "Sauté & broil",
        detail:
          "In a large ovenproof skillet over medium-high heat, melt the butter. Add the corned beef and sauté for 3 minutes. Add the coleslaw mix and sauté for 5 minutes, stirring occasionally. Top with scallions, then the cheese slices, and place under the broiler for 2 to 3 minutes, or until the cheese is bubbly and golden."
      },
      {
        step_number: 3,
        title: "Whisk the dressing",
        detail:
          "In a small bowl, whisk together the mayonnaise, tomato paste, horseradish, vinegar, salt, and pepper."
      },
      {
        step_number: 4,
        title: "Serve",
        detail:
          "Remove the skillet from the broiler and serve with the sauce drizzled over the top and the sauerkraut on the side."
      }
    ]
  },

  {
    recipe_id: "lemon-herb-pork-tenderloins-broccoli",
    title: "Lemon and Herb Pork Tenderloins with Broiled Broccoli",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍋",
    tags: ["Grilled", "Make-Ahead", "High-Protein"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Adding lemon zest to a warm recipe like this gives it a special burst of flavor, so try to keep fresh lemons in your kitchen at all times. Get comfortable using your broiler by watching the pan carefully and pulling it out when the meat and vegetables are perfectly bronze and crispy but not burned. Adjust the cooking times based on your experience, because ovens can vary a bit.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#B7A23F",

    macro_profiles: {
      serving_2: { calories: 1065, protein_g: 69, fat_g: 81, carbs_g: 15 },
      serving_4: { calories: 1065, protein_g: 69, fat_g: 81, carbs_g: 15 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Lemons", prep: "zest and juice", quantity: "2", unit: "", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "French whole grain old-fashioned mustard", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Fresh rosemary", prep: "chopped", quantity: "1 1/2", unit: "tsp", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1 1/2", unit: "tsp", category: "Produce" },
        { item: "Fresh thyme", prep: "chopped", quantity: "1/2", unit: "tsp", category: "Produce" },
        { item: "Salt", prep: "or more or less to taste", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pork tenderloins (about 1 lb each)", prep: "", quantity: "1", unit: "", category: "Meat" },
        { item: "Fresh broccoli florets", prep: "", quantity: "2 1/2", unit: "cups", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "for the broccoli", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "for the broccoli", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "for the broccoli", quantity: "1/2", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Lemons", prep: "zest and juice", quantity: "4", unit: "", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "French whole grain old-fashioned mustard", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Fresh rosemary", prep: "chopped", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Fresh thyme", prep: "chopped", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Salt", prep: "or more or less to taste", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pork tenderloins (about 1 lb each)", prep: "", quantity: "2", unit: "", category: "Meat" },
        { item: "Fresh broccoli florets", prep: "", quantity: "5", unit: "cups", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "for the broccoli", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "for the broccoli", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Pepper", prep: "for the broccoli", quantity: "1", unit: "tsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Marinate the pork",
        detail:
          "Combine the lemon zest and juice, olive oil, garlic, mustard, rosemary, parsley, thyme, salt, and pepper in a large nonreactive bowl, glass baking dish, or gallon-size resealable plastic bag. Add the pork tenderloins and marinate at least 30 minutes or overnight."
      },
      {
        step_number: 2,
        title: "Preheat & prep the broccoli",
        detail:
          "Preheat the broiler to its highest setting and heat a grill to medium-high. Line a baking sheet with parchment paper and arrange the broccoli on it in a single layer. Season with the olive oil, salt, and pepper and set aside."
      },
      {
        step_number: 3,
        title: "Grill the tenderloins",
        detail:
          "Place the tenderloins on the grill, reserving the marinade. Cook for 6 to 8 minutes on each side, until the internal temperature reaches 140°F. Remove from the heat and let rest for 10 minutes before cutting."
      },
      {
        step_number: 4,
        title: "Broil the broccoli",
        detail:
          "Meanwhile, place the broccoli pan in the top third of the oven and broil for about 6 minutes, or until the florets are crisp-tender and beginning to char."
      },
      {
        step_number: 5,
        title: "Boil the marinade",
        detail:
          "Transfer the remaining meat marinade to a small saucepan. Bring to a boil, then boil for 3 minutes. Remove from the heat."
      },
      {
        step_number: 6,
        title: "Slice & serve",
        detail:
          "Slice the tenderloins into one-inch rounds and serve with the broccoli and warm marinade drizzled over the top."
      }
    ]
  },

  {
    recipe_id: "instant-pot-pulled-pork-coleslaw",
    title: "Instant Pot Pulled Pork and Coleslaw",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍖",
    tags: ["Instant-Pot", "Make-Ahead", "High-Protein"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Have you tried cooking pork in the Instant Pot electric pressure cooker? Every tender and juicy bite will taste just as if it's been slow-cooking all day. After you make it this way, you won't want to cook it any other way. Enjoy this throughout the week over a big pile of leafy greens, in a bowl with cauliflower rice, or just by itself—it's that good!",
    prep_time_mins: 8,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#9C6B43",

    macro_profiles: {
      serving_2: { calories: 1285, protein_g: 85, fat_g: 85, carbs_g: 45 },
      serving_4: { calories: 1285, protein_g: 85, fat_g: 85, carbs_g: 45 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Lard", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "cut into large dice", quantity: "1/2", unit: "large", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Cumin", prep: "", quantity: "1 1/2", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Oregano", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Powdered mustard", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "divided", quantity: "3/4", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "3/4", unit: "tsp", category: "Pantry" },
        { item: "Pork shoulder or sirloin roast", prep: "cut into 2-inch cubes", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Bone broth", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Apple cider vinegar", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Coleslaw mix", prep: "about 4 cups total", quantity: "1", unit: "(11-oz) bag", category: "Produce" }
      ],
      serving_4: [
        { item: "Lard", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "cut into large dice", quantity: "1", unit: "large", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Cumin", prep: "", quantity: "3", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Oregano", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Powdered mustard", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Coconut aminos", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "divided", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pork shoulder or sirloin roast", prep: "cut into 2-inch cubes", quantity: "3", unit: "lb", category: "Meat" },
        { item: "Bone broth", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Apple cider vinegar", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Coleslaw mix", prep: "about 8 cups total", quantity: "2", unit: "(11-oz) bags", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Sauté & pressure-cook the pork",
        detail:
          "Combine the lard and onion in the bottom of an Instant Pot and cook on the sauté setting for 2 minutes. Then add the garlic, cumin, coriander, paprika, oregano, mustard, coconut aminos, 1 teaspoon salt, 1 teaspoon pepper, and pork. Stir to coat, then add the bone broth. Cover and cook on the meat setting for 20 minutes."
      },
      {
        step_number: 2,
        title: "Dress the coleslaw",
        detail:
          "Meanwhile, combine the mayonnaise, vinegar, remaining ½ teaspoon salt, and remaining ½ teaspoon pepper in a large bowl. Add the coleslaw mix and toss thoroughly to combine."
      },
      {
        step_number: 3,
        title: "Shred the pork",
        detail:
          "When the pork is done, remove it from the pot, shred or chop it, then return it to the pot so it can soak up the juices."
      },
      {
        step_number: 4,
        title: "Serve",
        detail:
          "Serve hot, spooning the pork over the coleslaw mixture or serving the coleslaw on the side."
      }
    ]
  },

  {
    recipe_id: "chaffle-blts-avocado-lemon-garlic-aioli",
    title: "Chaffle BLTs with Avocado and Lemon-Garlic Aioli",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🧇",
    tags: ["Quick", "Sandwich", "High-Fat"],
    dish_category: "Sandwiches",
    description:
      "Remember my brilliant suggestion to make chaffles (page 226)? Well, now's the time to haul those chaffles out of the freezer and whip up these open-faced sammies with mouthwatering lemon-garlic aioli. The savory taste will make them a favorite as soon as you take your first bite!",
    prep_time_mins: 5,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#CD9A55",

    macro_profiles: {
      serving_2: { calories: 763, protein_g: 33, fat_g: 59, carbs_g: 25 },
      serving_4: { calories: 763, protein_g: 33, fat_g: 59, carbs_g: 25 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Large pastured eggs", prep: "", quantity: "2", unit: "", category: "Dairy" },
        { item: "Shredded cheese, such as Cheddar or a mixture of half Parmesan and half mozzarella", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Scallion", prep: "thinly sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Romaine or Bibb lettuce leaves", prep: "", quantity: "4", unit: "large", category: "Produce" },
        { item: "Uncured bacon", prep: "cooked", quantity: "8", unit: "slices", category: "Meat" },
        { item: "Avocado", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Large fresh tomato", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "for the aioli", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Garlic clove", prep: "minced", quantity: "1", unit: "large", category: "Produce" },
        { item: "Lemon", prep: "zest and juice of 1/2", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Pepper", prep: "for the aioli", quantity: "1/4", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Large pastured eggs", prep: "", quantity: "4", unit: "", category: "Dairy" },
        { item: "Shredded cheese, such as Cheddar or a mixture of half Parmesan and half mozzarella", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Scallion", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Romaine or Bibb lettuce leaves", prep: "", quantity: "8", unit: "large", category: "Produce" },
        { item: "Uncured bacon", prep: "cooked", quantity: "16", unit: "slices", category: "Meat" },
        { item: "Avocado", prep: "sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Large fresh tomato", prep: "sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Avocado oil-based mayonnaise (such as Primal Kitchen Mayo)", prep: "for the aioli", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Garlic clove", prep: "minced", quantity: "2", unit: "large", category: "Produce" },
        { item: "Lemon", prep: "zest and juice of 1", quantity: "1", unit: "", category: "Produce" },
        { item: "Pepper", prep: "for the aioli", quantity: "1/2", unit: "tsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the chaffles",
        detail:
          "In a medium bowl, combine the eggs, shredded cheese, pepper, and scallion. Pour the batter into a waffle maker and cook according to the manufacturer's directions—in two batches if necessary—until golden brown. Transfer to a wire rack."
      },
      {
        step_number: 2,
        title: "Make the aioli",
        detail:
          "While the chaffles are cooking, make the aioli: in a small bowl, whisk together the mayonnaise, garlic, lemon zest and juice, and pepper."
      },
      {
        step_number: 3,
        title: "Assemble & serve",
        detail:
          "Onto each chaffle, layer a lettuce leaf followed by two slices of bacon, some avocado slices, and some tomato slices. Drizzle the sandwiches with aioli and serve."
      }
    ]
  },

  {
    recipe_id: "quick-butter-chicken-cauliflower-rice",
    title: "Quick Butter Chicken and Cauliflower Rice",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍛",
    tags: ["Quick", "One-Pot", "Comfort"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "If you're tired of plain old chicken, reinvigorate your taste buds with this preparation of cubed meat simmered in butter with diced tomatoes and fresh herbs and spices.",
    prep_time_mins: 10,
    cook_time_mins: 30,
    native_serving: 2,
    accent: "#D08B3E",

    macro_profiles: {
      serving_2: { calories: 1311, protein_g: 54, fat_g: 99, carbs_g: 51 },
      serving_4: { calories: 1311, protein_g: 54, fat_g: 99, carbs_g: 51 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter or ghee", prep: "divided", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Onion", prep: "minced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Turmeric", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garam masala", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "divided", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "3/4", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Diced tomatoes", prep: "", quantity: "1", unit: "(14-oz) can", category: "Pantry" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh or frozen cauliflower rice", prep: "", quantity: "3", unit: "cups", category: "Produce" },
        { item: "Freshly squeezed lemon juice", prep: "", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Butter or ghee", prep: "divided", quantity: "8", unit: "tbsp", category: "Dairy" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Onion", prep: "minced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Turmeric", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Garam masala", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "divided", quantity: "3", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Diced tomatoes", prep: "", quantity: "2", unit: "(14-oz) cans", category: "Pantry" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh or frozen cauliflower rice", prep: "", quantity: "6", unit: "cups", category: "Produce" },
        { item: "Freshly squeezed lemon juice", prep: "", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Sear the chicken",
        detail:
          "In a large pot or Dutch oven, melt 2 tablespoons butter over medium-high heat. Add the chicken and sauté until almost cooked through, about 8 minutes. Transfer to a plate and set aside."
      },
      {
        step_number: 2,
        title: "Bloom the spices & simmer",
        detail:
          "Add the onion to the pot and cook until translucent, about 3 minutes, stirring occasionally to scrape up brown bits from the bottom. Add the garlic, ginger, turmeric, garam masala, 1 teaspoon salt, ½ teaspoon pepper, paprika, cumin, coriander, and cayenne. Stir and cook until fragrant, about 30 seconds. Add the diced tomatoes and simmer for 10 minutes. Using an immersion blender, blend the mixture until smooth. (Alternatively, transfer the mixture to a blender, blend until smooth, then return to the pot.)"
      },
      {
        step_number: 3,
        title: "Finish the sauce",
        detail:
          "Add the cream and stir to combine. Return the chicken and its juices to the pot. Bring to a simmer, then simmer for 5 minutes."
      },
      {
        step_number: 4,
        title: "Cook the cauliflower rice",
        detail:
          "Meanwhile, melt the remaining 2 tablespoons butter in a medium saucepan over medium-high heat. Add the cauliflower rice and the remaining ½ teaspoon salt and ¼ teaspoon pepper. Cook until the rice is heated through and begins to brown slightly."
      },
      {
        step_number: 5,
        title: "Plate & serve",
        detail:
          "Divide the cauliflower rice between two serving plates. Top with the chicken and garnish with the lemon juice and cilantro."
      }
    ]
  },

  {
    recipe_id: "spring-vegetable-chicken-carbonara-skillet",
    title: "Spring Vegetable and Chicken Carbonara Skillet",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍝",
    tags: ["Seasonal", "One-Skillet", "High-Fat"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Use asparagus in the spring, brussels sprouts in the fall, and cabbage in the winter—or choose from among other fresh seasonal options at your local farmer's market.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#8FAE6B",

    macro_profiles: {
      serving_2: { calories: 1150, protein_g: 61, fat_g: 94, carbs_g: 15 },
      serving_4: { calories: 1150, protein_g: 61, fat_g: 94, carbs_g: 15 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Uncured bacon", prep: "diced", quantity: "8", unit: "slices", category: "Meat" },
        { item: "Onion", prep: "diced small", quantity: "1", unit: "small", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Asparagus", prep: "trimmed and cut into bite-size chunks", quantity: "1", unit: "small bunch", category: "Produce" },
        { item: "Frozen green peas", prep: "thawed (optional)", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest of 1, juice of ½", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh basil", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Butter", prep: "", quantity: "1", unit: "stick", category: "Dairy" },
        { item: "Heavy cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1/2", unit: "cup", category: "Dairy" }
      ],
      serving_4: [
        { item: "Uncured bacon", prep: "diced", quantity: "16", unit: "slices", category: "Meat" },
        { item: "Onion", prep: "diced small", quantity: "2", unit: "small", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Asparagus", prep: "trimmed and cut into bite-size chunks", quantity: "2", unit: "small bunches", category: "Produce" },
        { item: "Frozen green peas", prep: "thawed (optional)", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest of 2, juice of 1", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh basil", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Butter", prep: "", quantity: "2", unit: "sticks", category: "Dairy" },
        { item: "Heavy cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Crisp the bacon",
        detail:
          "In a large skillet, cook the bacon pieces over medium-high heat until crisp. Using a slotted spoon, transfer the pieces to a plate and set aside, reserving the fat in the skillet."
      },
      {
        step_number: 2,
        title: "Cook the chicken & vegetables",
        detail:
          "Add the onion to the skillet and cook until translucent, about 5 minutes. Add the chicken thighs, salt, and pepper. Just before the meat is cooked through, add the asparagus, peas (if desired), garlic, and lemon zest and juice. Sauté for 2 minutes, then add the basil, parsley, butter, cream, and Parmesan."
      },
      {
        step_number: 3,
        title: "Simmer & serve",
        detail:
          "Stir to combine. Bring to a boil, then reduce the heat and simmer for 3 minutes. Adjust seasoning, then serve hot."
      }
    ]
  },

  {
    recipe_id: "roasted-crowns-casserole",
    title: "Roasted Crowns Casserole",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥦",
    tags: ["One-Skillet", "High-Fat", "Cheesy"],
    dish_category: "Casseroles & Bakes",
    description:
      "Cruciferous vegetables such as cauliflower and broccoli pair beautifully with healthful mayonnaise and melted cheese. Italian sausage rounds out this dish with a big dose of protein and nutritious fat. Once you've made this a couple of times, you'll have it committed to memory and be able to whip it up in no time.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#5E8C61",

    macro_profiles: {
      serving_2: { calories: 1692, protein_g: 75, fat_g: 140, carbs_g: 33 },
      serving_4: { calories: 1692, protein_g: 75, fat_g: 140, carbs_g: 33 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Fresh cauliflower florets", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Fresh broccoli florets", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Bulk Italian pork sausage", prep: "", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest of 1, plus 1 tbsp juice", quantity: "1", unit: "", category: "Produce" },
        { item: "Avocado oil-based mayonnaise", prep: "such as Primal Kitchen Mayo", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Sharp Cheddar cheese", prep: "shredded", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Scallions", prep: "thinly sliced, divided", quantity: "1", unit: "bunch", category: "Produce" }
      ],
      serving_4: [
        { item: "Fresh cauliflower florets", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Fresh broccoli florets", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "divided", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Bulk Italian pork sausage", prep: "", quantity: "3", unit: "lb", category: "Meat" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest of 2, plus 2 tbsp juice", quantity: "2", unit: "", category: "Produce" },
        { item: "Avocado oil-based mayonnaise", prep: "such as Primal Kitchen Mayo", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Sharp Cheddar cheese", prep: "shredded", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Scallions", prep: "thinly sliced, divided", quantity: "2", unit: "bunches", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Broil the florets",
        detail:
          "Preheat the broiler to its highest setting. Line two baking sheets with parchment paper. Arrange the broccoli and cauliflower florets in a single layer on the baking sheet and season with the olive oil, salt, and ½ teaspoon pepper. Place the pan on the top shelf of the oven and broil for 3 to 5 minutes, or until the florets begin to char slightly."
      },
      {
        step_number: 2,
        title: "Brown the sausage",
        detail:
          "Reduce the broiler heat to its lowest setting and place a shelf in the bottom half of the oven. In a large, ovenproof skillet over medium-high heat, cook the sausage, breaking it into bite-size pieces."
      },
      {
        step_number: 3,
        title: "Combine & finish under the broiler",
        detail:
          "Meanwhile, in a small bowl, combine the garlic, lemon zest and juice, mayonnaise, cheese, half the scallions, and remaining ½ teaspoon pepper. Once the sausage is cooked through, add the broiled broccoli and cauliflower to the skillet and toss to combine. Top with the seasoned mayonnaise mixture, then place the pan on the low shelf and broil until the top is golden and bubbly, about 3 minutes. Sprinkle with the remaining scallions and serve hot."
      }
    ]
  },

  {
    recipe_id: "sheet-pan-sausage-cabbage",
    title: "Sheet-Pan Sausage and Cabbage",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🌭",
    tags: ["Sheet-Pan", "Low-Carb", "Easy"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "This German-inspired dish is naturally low in carbohydrates, easy to prepare, and absolutely delicious.",
    prep_time_mins: 5,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#9C6B3F",

    macro_profiles: {
      serving_2: { calories: 677, protein_g: 33, fat_g: 49, carbs_g: 26 },
      serving_4: { calories: 677, protein_g: 33, fat_g: 49, carbs_g: 26 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Cooked sausage links", prep: "of your choice", quantity: "4", unit: "", category: "Meat" },
        { item: "Green cabbage", prep: "cut into 8 wedges", quantity: "1", unit: "small head", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Whole-grain old-fashioned mustard", prep: "sugar-free, for serving", quantity: "1-2", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Cooked sausage links", prep: "of your choice", quantity: "8", unit: "", category: "Meat" },
        { item: "Green cabbage", prep: "each cut into 8 wedges", quantity: "2", unit: "small heads", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "8", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Whole-grain old-fashioned mustard", prep: "sugar-free, for serving", quantity: "2-4", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat the oven",
        detail: "Preheat the oven to 450°F. Line a baking sheet with parchment paper."
      },
      {
        step_number: 2,
        title: "Arrange & drizzle",
        detail:
          "Arrange the sausages and cabbage wedges on the prepared baking sheet. Drizzle the cabbage with the olive oil."
      },
      {
        step_number: 3,
        title: "Season, roast & serve",
        detail:
          "In a small bowl, combine the salt, pepper, garlic powder, and onion powder. Sprinkle the seasoning mixture generously over the cabbage. Roast for 20 minutes and serve hot with the whole-grain mustard."
      }
    ]
  },

  {
    recipe_id: "shepherds-pie",
    title: "Shepherd's Pie",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥧",
    tags: ["Comfort", "Casserole", "High-Protein"],
    dish_category: "Casseroles & Bakes",
    description:
      "Ground lamb and yellow curry powder combine with fresh vegetables and healthful fats, herbs, and Parmesan cheese to bring out comfort in every bite. This is wonderful any time of the year, because the vegetables can be sourced year-round. Fresh ground lamb is in peak season in the United States from March to October but can generally be found frozen during the winter.",
    prep_time_mins: 15,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#A65E3A",

    macro_profiles: {
      serving_2: { calories: 1027, protein_g: 60, fat_g: 79, carbs_g: 19 },
      serving_4: { calories: 1027, protein_g: 60, fat_g: 79, carbs_g: 19 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Cauliflower", prep: "cut into large florets", quantity: "1/2", unit: "medium head", category: "Produce" },
        { item: "Garlic cloves", prep: "", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "divided", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Lard or beef tallow", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "medium", category: "Produce" },
        { item: "Celery stalks", prep: "thinly sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Carrots", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "2", unit: "oz", category: "Produce" },
        { item: "Ground lamb", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Pepper", prep: "divided", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Yellow curry powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Butter", prep: "melted", quantity: "1/2", unit: "stick", category: "Dairy" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Fresh parsley", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" }
      ],
      serving_4: [
        { item: "Cauliflower", prep: "cut into large florets", quantity: "1", unit: "medium head", category: "Produce" },
        { item: "Garlic cloves", prep: "", quantity: "2", unit: "", category: "Produce" },
        { item: "Salt", prep: "divided", quantity: "1 tbsp + 1 tsp", unit: "", category: "Pantry" },
        { item: "Lard or beef tallow", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Celery stalks", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Carrots", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Ground lamb", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Pepper", prep: "divided", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Yellow curry powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Butter", prep: "melted", quantity: "1", unit: "stick", category: "Dairy" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat the broiler",
        detail: "Preheat the broiler to its lowest setting."
      },
      {
        step_number: 2,
        title: "Boil the cauliflower",
        detail:
          "Place the florets, whole garlic cloves, and 1 teaspoon salt in a medium pot. Add just enough water to cover. Bring to a boil, reduce the heat, and simmer for 12 to 15 minutes, until the florets are fork-tender."
      },
      {
        step_number: 3,
        title: "Cook the lamb & vegetables",
        detail:
          "Meanwhile, in a large ovenproof skillet, melt the lard over medium-high heat. Add the onion, celery, carrots, and mushrooms. Cook 5 minutes. Add the lamb and season with 1 tablespoon salt, ½ teaspoon pepper, curry powder, paprika, and minced garlic. Cook, stirring occasionally, until the lamb is cooked through."
      },
      {
        step_number: 4,
        title: "Make the cauliflower mash",
        detail:
          "When the cauliflower is fork-tender, drain well and transfer to the bowl of a food processor. Add the melted butter, Parmesan, and the remaining ½ teaspoon pepper. Puree until smooth. Taste and adjust seasoning."
      },
      {
        step_number: 5,
        title: "Top & broil",
        detail:
          "Top the meat mixture in the skillet with the cauliflower mash and broil in the oven for about 6 to 8 minutes, or until warmed through and slightly golden. Serve hot, garnished with chopped parsley."
      }
    ]
  },

  {
    recipe_id: "asian-lettuce-cups",
    title: "Asian Lettuce Cups",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥬",
    tags: ["Asian-Inspired", "Low-Carb", "Quick"],
    dish_category: "Sandwiches",
    description:
      "It's amazing how fresh herbs and spices and good-quality cooking oils can transform plain meats. Ginger, sesame oil, and chili garlic sauce make these Asian lettuce wraps mouthwatering without leaving you feeling stuffed or bloated.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#6B9B7C",

    macro_profiles: {
      serving_2: { calories: 1372, protein_g: 92, fat_g: 100, carbs_g: 26 },
      serving_4: { calories: 1372, protein_g: 92, fat_g: 100, carbs_g: 26 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Lard", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "minced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Ground turkey or chicken", prep: "", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Carrot", prep: "shredded", quantity: "1", unit: "", category: "Produce" },
        { item: "Celery stalks", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Coconut aminos", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Toasted sesame oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Chili garlic sauce", prep: "sugar-free, such as Yai's Thai", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Bibb lettuce", prep: "leaves separated", quantity: "1", unit: "head", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Nuts", prep: "chopped, such as macadamia nuts or almonds", quantity: "1/2", unit: "cup", category: "Pantry" }
      ],
      serving_4: [
        { item: "Lard", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Onion", prep: "minced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Ground turkey or chicken", prep: "", quantity: "3", unit: "lb", category: "Meat" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Carrot", prep: "shredded", quantity: "2", unit: "", category: "Produce" },
        { item: "Celery stalks", prep: "thinly sliced", quantity: "4", unit: "", category: "Produce" },
        { item: "Coconut aminos", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Toasted sesame oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Chili garlic sauce", prep: "sugar-free, such as Yai's Thai", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Bibb lettuce", prep: "leaves separated", quantity: "2", unit: "heads", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Nuts", prep: "chopped, such as macadamia nuts or almonds", quantity: "1", unit: "cup", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the meat",
        detail:
          "Melt the lard in a large skillet over medium-high heat. Add the onion and sauté for 2 minutes, then add the ground meat. Cook through, stirring occasionally to break up the meat, about 10 minutes."
      },
      {
        step_number: 2,
        title: "Add aromatics & sauce",
        detail:
          "Add the garlic, ginger, carrot, celery, coconut aminos, sesame oil, and chili garlic sauce. Cook for 2 minutes, stirring to combine well."
      },
      {
        step_number: 3,
        title: "Fill & garnish",
        detail:
          "Divide the mixture between the lettuce cups and top with the cilantro and chopped nuts."
      }
    ]
  },

  {
    recipe_id: "italian-stuffed-bell-peppers",
    title: "Italian Stuffed Bell Peppers",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🫑",
    tags: ["Italian", "Stuffed", "High-Protein"],
    dish_category: "Casseroles & Bakes",
    description:
      "Stuffed bell peppers are typically filled with rice, but you can do better with ground beef and Italian sausage. Top with Parmesan and broil, and you have yourself the most convenient of gourmet meals. Try it tonight!",
    prep_time_mins: 10,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#C0392B",

    macro_profiles: {
      serving_2: { calories: 955, protein_g: 61, fat_g: 67, carbs_g: 27 },
      serving_4: { calories: 955, protein_g: 61, fat_g: 67, carbs_g: 27 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ground beef", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Bulk Italian sausage", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Celery stalks", prep: "sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Fresh tomatoes", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Red or green bell peppers", prep: "cored, seeded, and halved lengthwise", quantity: "2", unit: "", category: "Produce" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1/2", unit: "cup", category: "Dairy" }
      ],
      serving_4: [
        { item: "Ground beef", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Bulk Italian sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Celery stalks", prep: "sliced", quantity: "4", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "12", unit: "", category: "Produce" },
        { item: "Italian seasoning", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Fresh tomatoes", prep: "diced", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Red or green bell peppers", prep: "cored, seeded, and halved lengthwise", quantity: "4", unit: "", category: "Produce" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the meat",
        detail:
          "In a large skillet over medium-high heat, cook the ground beef and sausage, breaking up the meat into bite-size pieces. When the meat is cooked through, transfer to a plate and set aside."
      },
      {
        step_number: 2,
        title: "Build the filling",
        detail:
          "Heat the olive oil in the same skillet, then add the onion and celery, cooking until softened, about 3 minutes. Add the garlic, Italian seasoning, and diced tomatoes. Cook 5 minutes, then return the cooked meat to the skillet. Add the fresh parsley and toss to combine. Remove from the heat."
      },
      {
        step_number: 3,
        title: "Fill & broil",
        detail:
          "Preheat the broiler to its highest setting. Line a baking sheet with parchment paper, then arrange the peppers on the sheet, cut side up. Using your hands, fill the pepper \"boats\" with the meat mixture, rounding the tops. Top with the Parmesan cheese and place on the middle shelf of the oven. Broil for 2 to 3 minutes, until the cheese is bubbly and golden. Serve hot."
      }
    ]
  },

  {
    recipe_id: "mediterranean-stuffed-bell-peppers",
    title: "Mediterranean Stuffed Bell Peppers",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🫑",
    tags: ["Mediterranean", "Stuffed", "Lamb"],
    dish_category: "Casseroles & Bakes",
    description:
      "Mediterranean flavors, such as olives, lemon, artichoke, and feta, always make for an intense and satisfying meal. Naturally salty, these peppers will be most delicious after you have ditched processed foods and your body is craving a healthy dose of sodium.",
    prep_time_mins: 10,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#7B5EA7",

    macro_profiles: {
      serving_2: { calories: 875, protein_g: 54, fat_g: 63, carbs_g: 23 },
      serving_4: { calories: 875, protein_g: 54, fat_g: 63, carbs_g: 23 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ground lamb", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Butter", prep: "", quantity: "1", unit: "tbsp", category: "Dairy" },
        { item: "Avocado oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Bulk Italian sausage", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Kalamata olives", prep: "chopped", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Marinated artichoke hearts", prep: "drained and chopped", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Fresh tomatoes", prep: "diced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lemon", prep: "zest of 1", quantity: "1", unit: "", category: "Produce" },
        { item: "Red or green bell peppers", prep: "cored, seeded, and halved lengthwise", quantity: "2", unit: "", category: "Produce" },
        { item: "Feta cheese", prep: "crumbled", quantity: "1/4", unit: "cup", category: "Dairy" }
      ],
      serving_4: [
        { item: "Ground lamb", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Butter", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Avocado oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Bulk Italian sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Onion", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Italian seasoning", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Kalamata olives", prep: "chopped", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Marinated artichoke hearts", prep: "drained and chopped", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Fresh tomatoes", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Lemon", prep: "zest of 2", quantity: "2", unit: "", category: "Produce" },
        { item: "Red or green bell peppers", prep: "cored, seeded, and halved lengthwise", quantity: "4", unit: "", category: "Produce" },
        { item: "Feta cheese", prep: "crumbled", quantity: "1/2", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the meat",
        detail:
          "In a large skillet over medium-high heat, cook the lamb and sausage in 1 tablespoon of butter, breaking the meat into bite-size pieces. Sauté until cooked through, then transfer to a plate with a slotted spoon."
      },
      {
        step_number: 2,
        title: "Build the filling",
        detail:
          "To the fat remaining in the skillet, add 1 tablespoon of avocado oil and the onion and cook until translucent, about 3 minutes. Add the garlic, Italian seasoning, oregano, olives, artichoke hearts, and diced tomatoes. Cook 5 minutes more, then return the cooked meat to the skillet. Add the parsley and lemon zest and toss to combine. Remove from the heat."
      },
      {
        step_number: 3,
        title: "Fill & broil",
        detail:
          "Preheat the broiler to its highest setting. Line a baking sheet with parchment paper, then arrange the peppers on the sheet, cut side up. Using your hands, fill the pepper \"boats\" with the meat mixture, rounding the tops. Top with the feta cheese and place on the middle shelf of the oven. Broil for 2 to 3 minutes, until the cheese is bubbly and golden. Serve hot."
      }
    ]
  },

  {
    recipe_id: "spiced-fish-taco-bowl-avocado-lime-crema",
    title: "Spiced Fish Taco Bowl with Avocado-Lime Crema",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🐟",
    tags: ["Seafood", "Taco-Bowl", "Fresh"],
    dish_category: "Salads & Slaws",
    description:
      "Any meal featuring this exotic creation is sure to be a hit. The macadamia nut topping will make you the star of any potluck gathering.",
    prep_time_mins: 10,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#2E8B8B",

    macro_profiles: {
      serving_2: { calories: 1866, protein_g: 160, fat_g: 106, carbs_g: 68 },
      serving_4: { calories: 1866, protein_g: 160, fat_g: 106, carbs_g: 68 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Halibut or cod fillets", prep: "chopped into bite-size pieces", quantity: "2", unit: "large (about 14 oz each)", category: "Meat" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Extra-virgin olive oil or avocado oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Fresh or frozen cauliflower rice", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Shredded green cabbage or coleslaw mix", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Radishes", prep: "thinly sliced", quantity: "4", unit: "", category: "Produce" },
        { item: "Macadamia nuts", prep: "chopped", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Avocado", prep: "", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "", quantity: "1", unit: "bunch", category: "Produce" },
        { item: "Avocado oil-based mayonnaise", prep: "such as Primal Kitchen Mayo", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Limes", prep: "zest and juice", quantity: "2", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "for the dressing", quantity: "1", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Halibut or cod fillets", prep: "chopped into bite-size pieces", quantity: "4", unit: "large (about 14 oz each)", category: "Meat" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Extra-virgin olive oil or avocado oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Fresh or frozen cauliflower rice", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Shredded green cabbage or coleslaw mix", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Radishes", prep: "thinly sliced", quantity: "8", unit: "", category: "Produce" },
        { item: "Macadamia nuts", prep: "chopped", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Avocado", prep: "", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "", quantity: "2", unit: "bunches", category: "Produce" },
        { item: "Avocado oil-based mayonnaise", prep: "such as Primal Kitchen Mayo", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Limes", prep: "zest and juice", quantity: "4", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "", quantity: "2", unit: "", category: "Produce" },
        { item: "Salt", prep: "for the dressing", quantity: "2", unit: "tsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Season the fish",
        detail:
          "Pat the fish dry with paper towels and season with the salt, pepper, cumin, and chili powder."
      },
      {
        step_number: 2,
        title: "Cook the fish & rice",
        detail:
          "Heat the oil in a large skillet over medium-high heat. Cook the fish until fork-tender, 6 to 8 minutes total, turning halfway through. Add the cauliflower rice, toss, and remove from the heat."
      },
      {
        step_number: 3,
        title: "Make the avocado-lime crema",
        detail:
          "To make the dressing, combine the avocado, cilantro, mayonnaise, lime zest and juice, garlic, and salt in a blender. Blend until smooth."
      },
      {
        step_number: 4,
        title: "Assemble the bowls",
        detail:
          "Spread the cabbage at the bottom of a large bowl, then layer the fish mixture over it. Top with the dressing, radishes, and macadamia nuts."
      }
    ]
  },

  {
    recipe_id: "dill-pickle-super-burgers",
    title: "Dill Pickle Super-Burgers",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍔",
    tags: ["Burgers", "Low-Carb", "Tangy"],
    dish_category: "Sandwiches",
    description:
      "Classic dill pickle is paired with pepperoncini, cream cheese, and fresh dill and finished with a healthy scoop of gut-healing sauerkraut. The buttery score is off the charts. Are you salivating yet?",
    prep_time_mins: 10,
    cook_time_mins: 12,
    native_serving: 2,
    accent: "#6B8E23",

    macro_profiles: {
      serving_2: { calories: 857, protein_g: 74, fat_g: 57, carbs_g: 12 },
      serving_4: { calories: 857, protein_g: 74, fat_g: 57, carbs_g: 12 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ground bison or beef", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "divided", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lard or beef tallow", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Uncured bacon", prep: "diced", quantity: "8", unit: "slices", category: "Meat" },
        { item: "Full-fat cream cheese", prep: "softened", quantity: "4", unit: "oz", category: "Dairy" },
        { item: "Dill pickles", prep: "diced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Dill pickle juice", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Pepperoncini", prep: "diced", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Fresh dill", prep: "chopped", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Romaine or Bibb lettuce leaves", prep: "large", quantity: "2", unit: "", category: "Produce" },
        { item: "Sauerkraut", prep: "drained", quantity: "1/2", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Ground bison or beef", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "divided", quantity: "3", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Lard or beef tallow", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Uncured bacon", prep: "diced", quantity: "16", unit: "slices", category: "Meat" },
        { item: "Full-fat cream cheese", prep: "softened", quantity: "8", unit: "oz", category: "Dairy" },
        { item: "Dill pickles", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Dill pickle juice", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Pepperoncini", prep: "diced", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Fresh dill", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Romaine or Bibb lettuce leaves", prep: "large", quantity: "4", unit: "", category: "Produce" },
        { item: "Sauerkraut", prep: "drained", quantity: "1", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Season the meat",
        detail:
          "In a medium bowl, combine the ground meat with the salt, pepper, 1 teaspoon garlic powder, and onion powder."
      },
      {
        step_number: 2,
        title: "Fry the bacon",
        detail:
          "In a large skillet, heat the lard over medium-high heat. Fry the bacon pieces until just crisp. Remove with a slotted spoon, reserving the fat in the pan."
      },
      {
        step_number: 3,
        title: "Cook the patties",
        detail:
          "Shape the meat mixture into two oval patties. Sauté in the remaining fat over medium-high heat for 3 minutes per side."
      },
      {
        step_number: 4,
        title: "Make the spread & assemble",
        detail:
          "In a small bowl, combine the cream cheese, dill pickles, pickle juice, pepperoncini, remaining garlic powder, dill, and scallions. Arrange each meat patty on a lettuce leaf and top with a generous dollop of the cream cheese mixture and the sauerkraut."
      }
    ]
  },

  {
    recipe_id: "lemony-tuna-casserole",
    title: "Lemony Tuna Casserole",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🐟",
    tags: ["Seafood", "One-Skillet", "Comfort"],
    dish_category: "Casseroles & Bakes",
    description:
      "Put a creative spin on an all-American classic by using cabbage or spaghetti squash instead of pasta.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#E0A526",

    macro_profiles: {
      serving_2: { calories: 1052, protein_g: 70, fat_g: 64, carbs_g: 49 },
      serving_4: { calories: 1052, protein_g: 70, fat_g: 64, carbs_g: 49 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter", prep: "", quantity: "1", unit: "stick", category: "Dairy" },
        { item: "Onion", prep: "diced small", quantity: "1", unit: "large", category: "Produce" },
        { item: "Celery stalks", prep: "diced", quantity: "4", unit: "", category: "Produce" },
        { item: "Green cabbage", prep: "cut into 1/2-inch strips (or 4 cups cooked spaghetti squash)", quantity: "1", unit: "small head", category: "Produce" },
        { item: "Canned tuna in water", prep: "drained", quantity: "12-15", unit: "oz", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest of 1, juice of ½", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Red pepper flakes", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Frozen green peas", prep: "thawed (optional)", quantity: "1/2", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Butter", prep: "", quantity: "2", unit: "sticks", category: "Dairy" },
        { item: "Onion", prep: "diced small", quantity: "2", unit: "large", category: "Produce" },
        { item: "Celery stalks", prep: "diced", quantity: "8", unit: "", category: "Produce" },
        { item: "Green cabbage", prep: "cut into 1/2-inch strips (or 8 cups cooked spaghetti squash)", quantity: "2", unit: "small heads", category: "Produce" },
        { item: "Canned tuna in water", prep: "drained", quantity: "24-30", unit: "oz", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "12", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest of 2, juice of 1", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Red pepper flakes", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Frozen green peas", prep: "thawed (optional)", quantity: "1", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Soften the vegetables",
        detail:
          "In a large skillet, melt the butter over medium heat. Sauté the onion and celery until translucent, about three minutes. Add the cabbage, then increase the heat to medium-high. Toss frequently and cook until softened."
      },
      {
        step_number: 2,
        title: "Add tuna & seasonings",
        detail:
          "Add the tuna, garlic, lemon zest and juice, parsley, salt, pepper, red pepper flakes, and peas if desired. Remove from the heat and toss to coat. Adjust seasoning, then serve hot."
      },
      {
        step_number: 3,
        title: "Spaghetti squash option",
        detail:
          "To use spaghetti squash instead of cabbage, preheat the oven to 450°F and line a baking sheet with parchment paper. Cut a small spaghetti squash in half lengthwise, scoop out the seeds, and season generously with olive oil, salt, and pepper. Place the halves cut side down on the prepared baking sheet and roast until fork-tender and slightly golden, about 25 minutes."
      }
    ]
  },

  {
    recipe_id: "caribbean-seafood-stew",
    title: "Caribbean Seafood Stew",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🦐",
    tags: ["Quick", "Seafood", "One-Pot"],
    dish_category: "Soups, Stews & Chilis",
    description:
      "Not only is this dish poppin' with exotic flavors, it's also super quick to prepare, thanks to fast-cooking red snapper.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#2E8B8B",

    macro_profiles: {
      serving_2: { calories: 829, protein_g: 91, fat_g: 41, carbs_g: 24 },
      serving_4: { calories: 829, protein_g: 91, fat_g: 41, carbs_g: 24 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Extra-virgin olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Freshly squeezed lime juice", prep: "", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Skinless wild-caught salmon, tilapia, or mahi-mahi fillets", prep: "cut into 1-inch cubes", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Uncooked medium shrimp", prep: "peeled and deveined", quantity: "8", unit: "oz", category: "Meat" },
        { item: "Butter or ghee", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Green bell pepper", prep: "seeded and diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Celery", prep: "diced", quantity: "2", unit: "stalks", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Diced fresh tomatoes", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Unsweetened coconut milk or heavy cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Extra-virgin olive oil", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Freshly squeezed lime juice", prep: "", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Skinless wild-caught salmon, tilapia, or mahi-mahi fillets", prep: "cut into 1-inch cubes", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Uncooked medium shrimp", prep: "peeled and deveined", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Butter or ghee", prep: "", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Onion", prep: "diced", quantity: "2", unit: "medium", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "12", unit: "", category: "Produce" },
        { item: "Green bell pepper", prep: "seeded and diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Celery", prep: "diced", quantity: "4", unit: "stalks", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Diced fresh tomatoes", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Unsweetened coconut milk or heavy cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "2", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Marinate the seafood",
        detail:
          "In a medium bowl, combine the olive oil, lime juice, salt, pepper, fish, and shrimp and set aside."
      },
      {
        step_number: 2,
        title: "Sauté the aromatics",
        detail:
          "In a medium pan, heat the butter over medium-high heat. Add the onion, garlic, bell pepper, celery, and red pepper flakes. Cook about 4 minutes, or until the onion is translucent."
      },
      {
        step_number: 3,
        title: "Simmer & finish",
        detail:
          "Add the diced tomatoes and coconut milk. Bring to a boil, reduce to a simmer, and cook, uncovered, for 5 minutes. Stir in the fish mixture. Return to a simmer and cook 5 more minutes, or until the shrimp is opaque. Serve hot, with cilantro and avocado on the side."
      }
    ]
  },

  {
    recipe_id: "moroccan-lamb-stew",
    title: "Moroccan Lamb Stew",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍲",
    tags: ["Stew", "Spiced", "Special-Occasion"],
    dish_category: "Soups, Stews & Chilis",
    description:
      "The Moroccan spice combinations in this dish will make you feel like you're on a vacation adventure in North Africa. This dish is best eaten with lots of loved ones and candles—so make it for an extra-special occasion and enjoy!",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#B5651D",

    macro_profiles: {
      serving_2: { calories: 1105, protein_g: 59, fat_g: 81, carbs_g: 35 },
      serving_4: { calories: 1105, protein_g: 59, fat_g: 81, carbs_g: 35 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter or ghee", prep: "", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Ground lamb", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Smoked paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Turmeric", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cauliflower florets", prep: "cut into bite-size pieces", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Tomato paste", prep: "", quantity: "8", unit: "tbsp", category: "Pantry" },
        { item: "Unsweetened coconut milk", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Beef or chicken bone broth", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Plain full-fat Greek yogurt", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Lemon", prep: "zest and juice", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Butter or ghee", prep: "", quantity: "8", unit: "tbsp", category: "Dairy" },
        { item: "Onion", prep: "diced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "12", unit: "", category: "Produce" },
        { item: "Ground lamb", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Smoked paprika", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Turmeric", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Cauliflower florets", prep: "cut into bite-size pieces", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Tomato paste", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Unsweetened coconut milk", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Beef or chicken bone broth", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Plain full-fat Greek yogurt", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Lemon", prep: "zest and juice", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "2", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the lamb & spices",
        detail:
          "In a medium Dutch oven over medium-high heat, melt the butter. Add the onion, ginger, and garlic. Sauté 3 minutes, then add the ground lamb, paprika, cumin, turmeric, cinnamon, salt, and pepper. Continue to sauté until the lamb is cooked through, about 5 minutes, stirring occasionally."
      },
      {
        step_number: 2,
        title: "Simmer the stew",
        detail:
          "Add the cauliflower, tomato paste, coconut milk, and bone broth and stir to combine. Bring to a boil, then reduce to a simmer. Simmer, uncovered, for 5 minutes."
      },
      {
        step_number: 3,
        title: "Make the lemon-yogurt sauce",
        detail:
          "In a small bowl, whisk the yogurt with the lemon zest and juice."
      },
      {
        step_number: 4,
        title: "Serve",
        detail:
          "To serve, top individual servings of stew with cilantro, avocado, and lemon-yogurt sauce."
      }
    ]
  },

  {
    recipe_id: "beef-taco-casserole",
    title: "Beef Taco Casserole",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🌮",
    tags: ["Casserole", "Family-Size", "Low-Carb"],
    dish_category: "Casseroles & Bakes",
    description:
      "This casserole eschews the traditional base of white rice in favor of lighter, low-carb cauliflower rice. The cauliflower takes on the delicious flavors of all the many warm and mouthwatering spices in the sauce, so go ahead and keep a supply of cauliflower rice in your fridge or freezer so you can whip up meals like this anytime you like.",
    prep_time_mins: 10,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#C0492B",

    macro_profiles: {
      serving_2: { calories: 1090, protein_g: 76, fat_g: 70, carbs_g: 39 },
      serving_4: { calories: 1090, protein_g: 76, fat_g: 70, carbs_g: 39 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Lard", prep: "divided", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Frozen cauliflower rice", prep: "or 8 oz chopped cauliflower riced in a food processor", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Red or green bell pepper", prep: "seeded and diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Ground beef", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Cumin", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Tomato paste", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Shredded Cheddar or Colby cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Full-fat sour cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Shredded greens, such as romaine or cabbage", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Diced fresh tomatoes", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Diced black olives", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Avocado", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Jalapeño pepper", prep: "seeded and thinly sliced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Prepared salsa", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" }
      ],
      serving_4: [
        { item: "Lard", prep: "divided", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Frozen cauliflower rice", prep: "or 16 oz chopped cauliflower riced in a food processor", quantity: "1", unit: "(16-oz) bag", category: "Produce" },
        { item: "Red or green bell pepper", prep: "seeded and diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Ground beef", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Tomato paste", prep: "", quantity: "8", unit: "tbsp", category: "Pantry" },
        { item: "Shredded Cheddar or Colby cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Full-fat sour cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Shredded greens, such as romaine or cabbage", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Diced fresh tomatoes", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Diced black olives", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Avocado", prep: "sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Fresh cilantro leaves", prep: "chopped", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Jalapeño pepper", prep: "seeded and thinly sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Prepared salsa", prep: "", quantity: "1", unit: "cup", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat & brown the cauliflower rice",
        detail:
          "Preheat the oven to 425°F. In a large skillet, heat 1 tablespoon of the lard over medium-high heat. Add the cauliflower rice and sauté until brown. Transfer to a 9 × 13-inch casserole dish and set aside."
      },
      {
        step_number: 2,
        title: "Cook the beef",
        detail:
          "In the same skillet over medium-high heat, melt the remaining lard. Add the bell pepper and onion. Cook until just softened, then add the ground beef. Add the cumin, coriander, salt, pepper, chili powder, and garlic powder and toss to coat, breaking up the meat as it cooks."
      },
      {
        step_number: 3,
        title: "Assemble & bake",
        detail:
          "Just before the meat is cooked through, stir in the tomato paste and mix thoroughly. Layer the beef mixture on top of the cauliflower rice, top with shredded cheese, and bake for 12 minutes."
      },
      {
        step_number: 4,
        title: "Add toppings & serve",
        detail:
          "Remove the casserole from the oven. Spread sour cream over the top, then follow with the remaining toppings, sprinkling them over the sour cream in layers."
      }
    ]
  },

  {
    recipe_id: "beef-and-broccoli",
    title: "Beef and Broccoli",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥦",
    tags: ["Quick", "Stir-Fry", "High-Protein"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "This popular ancestral staple meal is better than ever, thanks to the addition of freshly grated ginger and chopped nuts. Your mouth is going to water just thinking about it. Note: Coconut aminos is a liquid condiment similar to soy sauce, but instead of being fermented from soybeans, it's fermented from the sap of coconut palm trees and sea salt. It's gluten- and grain-free and used often in Asian cuisine. It's a great replacement in recipes calling for soy sauce or tamari.",
    prep_time_mins: 5,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#5B7A3A",

    macro_profiles: {
      serving_2: { calories: 1550, protein_g: 115, fat_g: 106, carbs_g: 34 },
      serving_4: { calories: 1550, protein_g: 115, fat_g: 106, carbs_g: 34 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Extra-virgin olive oil or avocado oil", prep: "divided", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Sirloin steak", prep: "sliced against the grain", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Broccoli florets", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Coconut aminos", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Chopped nuts, such as Brazil nuts, macadamia nuts, almonds, or pecans", prep: "chopped", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Beef bone broth", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" }
      ],
      serving_4: [
        { item: "Extra-virgin olive oil or avocado oil", prep: "divided", quantity: "8", unit: "tbsp", category: "Pantry" },
        { item: "Sirloin steak", prep: "sliced against the grain", quantity: "3", unit: "lb", category: "Meat" },
        { item: "Broccoli florets", prep: "", quantity: "8", unit: "cups", category: "Produce" },
        { item: "Coconut aminos", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Grated fresh ginger", prep: "", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Chopped nuts, such as Brazil nuts, macadamia nuts, almonds, or pecans", prep: "chopped", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Beef bone broth", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Sear the steak",
        detail:
          "Heat 2 tablespoons of the oil in a large skillet over high heat. Add the steak and brown quickly, then transfer to a plate and set aside."
      },
      {
        step_number: 2,
        title: "Cook the broccoli & combine",
        detail:
          "Reduce the heat to medium-high, then add the remaining oil. Add the broccoli and cook 5 minutes, stirring occasionally. Return the steak to the pan, then add the coconut aminos, garlic, red pepper flakes, ginger, nuts, scallions, and bone broth. Stir to combine and cook 2 minutes to thicken slightly. Serve immediately."
      }
    ]
  },

  {
    recipe_id: "chicken-thighs-chard-mushroom-cream-sauce",
    title: "Chicken Thighs with Chard in Mushroom Cream Sauce",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍗",
    tags: ["One-Pan", "Creamy", "Comfort"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Never underestimate how indulgent chicken thighs can taste when you roast them and smother them in a rich cream and mushroom sauce. Instead of using cans of condensed mushroom soup, opt for the real deal, with fresh mushrooms and organic heavy cream (or coconut cream if you prefer).",
    prep_time_mins: 5,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#8A6D3B",

    macro_profiles: {
      serving_2: { calories: 903, protein_g: 53, fat_g: 71, carbs_g: 13 },
      serving_4: { calories: 903, protein_g: 53, fat_g: 71, carbs_g: 13 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Bone-in chicken thighs", prep: "", quantity: "4", unit: "", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Uncured bacon", prep: "chopped", quantity: "4", unit: "slices", category: "Meat" },
        { item: "Fresh mushrooms", prep: "chopped", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Swiss chard", prep: "chopped", quantity: "3", unit: "cups", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh thyme", prep: "chopped", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Italian seasoning", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Bone-in chicken thighs", prep: "", quantity: "8", unit: "", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Uncured bacon", prep: "chopped", quantity: "8", unit: "slices", category: "Meat" },
        { item: "Fresh mushrooms", prep: "chopped", quantity: "1", unit: "lb", category: "Produce" },
        { item: "Swiss chard", prep: "chopped", quantity: "6", unit: "cups", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Fresh thyme", prep: "chopped", quantity: "2", unit: "tsp", category: "Produce" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Season & roast the chicken",
        detail:
          "Preheat the oven to 375°F. Line a baking sheet with parchment paper. In a small bowl, combine the Italian seasoning, salt, and pepper. Arrange the chicken thighs on the prepared baking sheet and cover evenly with the seasoning mixture. Bake for 20 minutes."
      },
      {
        step_number: 2,
        title: "Cook the bacon & mushrooms",
        detail:
          "In a large skillet, heat the olive oil over medium heat. Add the chopped bacon and sauté until fully cooked. Using a slotted spoon, transfer to a bowl, reserving the fat in the skillet. Increase the heat to medium-high and add the mushrooms. Cook until golden brown, about 3 minutes."
      },
      {
        step_number: 3,
        title: "Build the cream sauce & finish",
        detail:
          "Add the chopped chard, garlic, cream, and thyme. Cook to wilt the chard, about 3 minutes. Add the cooked chicken thighs and bacon and simmer for 3 minutes. Taste and adjust seasoning, then serve hot."
      }
    ]
  },

  {
    recipe_id: "sisson-bigass-salad",
    title: "Sisson Bigass Salad",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥗",
    tags: ["No-Cook", "Salad", "Customizable"],
    dish_category: "Salads & Slaws",
    description:
      "This is just one of many variations of my centerpiece midday or evening meal. Experiment with steak, chicken, turkey, and other meats in place of the tuna, and an assortment of colorful vegetables and/or dressings.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 2,
    accent: "#7BA05B",

    macro_profiles: {
      serving_2: { calories: 879, protein_g: 54, fat_g: 63, carbs_g: 24 },
      serving_4: { calories: 879, protein_g: 54, fat_g: 63, carbs_g: 24 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Shredded lettuce or mixed greens", prep: "", quantity: "3-4", unit: "cups", category: "Produce" },
        { item: "Sliced fresh vegetables, such as mushrooms, bell peppers, carrots, beets, and tomatoes", prep: "sliced", quantity: "1-2", unit: "cups", category: "Produce" },
        { item: "Shredded Cheddar cheese (optional)", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Sustainably harvested canned tuna packed in water", prep: "drained", quantity: "1", unit: "(15-oz) can", category: "Meat" },
        { item: "Nuts, such as walnuts, pecans, or almonds", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Sunflower or pumpkin seeds", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Avocado oil-based salad dressing, such as Primal Kitchen Balsamic Vinaigrette or Green Goddess", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Shredded lettuce or mixed greens", prep: "", quantity: "6-8", unit: "cups", category: "Produce" },
        { item: "Sliced fresh vegetables, such as mushrooms, bell peppers, carrots, beets, and tomatoes", prep: "sliced", quantity: "2-4", unit: "cups", category: "Produce" },
        { item: "Shredded Cheddar cheese (optional)", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Sustainably harvested canned tuna packed in water", prep: "drained", quantity: "2", unit: "(15-oz) cans", category: "Meat" },
        { item: "Nuts, such as walnuts, pecans, or almonds", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Sunflower or pumpkin seeds", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Avocado oil-based salad dressing, such as Primal Kitchen Balsamic Vinaigrette or Green Goddess", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Layer & store",
        detail:
          "In a large shallow bowl, or a resealable storage container, layer the lettuce, vegetables, and cheese (if desired), in that order. Flake the tuna over the top. The salad can be stored and transported at this point."
      },
      {
        step_number: 2,
        title: "Finish & serve",
        detail:
          "When you're ready to eat, sprinkle the nuts and seeds over the top and drizzle with the dressing."
      }
    ]
  },

  {
    recipe_id: "caribbean-taco-salad",
    title: "Caribbean Taco Salad",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🌴",
    tags: ["Salad", "Spiced", "Ground-Turkey"],
    dish_category: "Salads & Slaws",
    description:
      "If you've never tried combining chili powder and cinnamon, this salad is going to make you an instant convert—ground turkey will never taste better! Put on some reggae music and drift off on your own island fantasy.",
    prep_time_mins: 10,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#D98A2B",

    macro_profiles: {
      serving_2: { calories: 1193, protein_g: 76, fat_g: 89, carbs_g: 22 },
      serving_4: { calories: 1193, protein_g: 76, fat_g: 89, carbs_g: 22 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Butter", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Ground turkey", prep: "", quantity: "1", unit: "(20-oz) package", category: "Meat" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1/2", unit: "tsp", category: "Produce" },
        { item: "Green or red bell pepper", prep: "seeded and diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Lime", prep: "zested", quantity: "1", unit: "", category: "Produce" },
        { item: "Limes", prep: "juiced", quantity: "2", unit: "", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Thinly sliced green cabbage", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Baby spinach leaves", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Thinly sliced scallions", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1/2", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Butter", prep: "", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Ground turkey", prep: "", quantity: "2", unit: "(20-oz) packages", category: "Meat" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Grated fresh ginger", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Green or red bell pepper", prep: "seeded and diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Lime", prep: "zested", quantity: "2", unit: "", category: "Produce" },
        { item: "Limes", prep: "juiced", quantity: "4", unit: "", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Thinly sliced green cabbage", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Baby spinach leaves", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Thinly sliced scallions", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the seasoned turkey",
        detail:
          "In a large skillet over medium-high heat, melt the butter. Add the turkey, salt, pepper, cumin, oregano, chili powder, paprika, onion powder, cayenne, and cinnamon. Cook, breaking up into small bits, until the meat is cooked through."
      },
      {
        step_number: 2,
        title: "Add aromatics & lime",
        detail:
          "Add the garlic, ginger, and bell pepper and cook until fragrant, about 1 minute. Add the lime zest and juice, and olive oil. Toss to combine."
      },
      {
        step_number: 3,
        title: "Assemble & serve",
        detail:
          "In a medium bowl, combine the cabbage and spinach. Top with the meat mixture, scallions, and cilantro."
      }
    ]
  },

  {
    recipe_id: "tuna-salad-cucumber-chips",
    title: "Tuna Salad with Cucumber \"Chips\"",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🐟",
    tags: ["No-Cook", "Quick", "Light"],
    dish_category: "Salads & Slaws",
    description:
      "Keep canned tuna in your pantry to use as a quick and versatile meal base. Look for label designations such as \"line caught\" or \"pole caught\" to avoid problems associated with industrialized tuna operations. Combined with mayonnaise and avocado, this salad is amazing served with your favorite low-carb crudités, such as the cucumber suggested here or radish, jicama, and bell pepper.",
    prep_time_mins: 5,
    cook_time_mins: 0,
    native_serving: 2,
    accent: "#5B9AA0",

    macro_profiles: {
      serving_2: { calories: 735, protein_g: 42, fat_g: 59, carbs_g: 9 },
      serving_4: { calories: 735, protein_g: 42, fat_g: 59, carbs_g: 9 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Sustainably harvested canned tuna packed in water", prep: "drained", quantity: "12", unit: "oz", category: "Meat" },
        { item: "Celery", prep: "diced small", quantity: "4", unit: "stalks", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest and juice", quantity: "1", unit: "small", category: "Produce" },
        { item: "Avocado", prep: "mashed", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Avocado oil-based mayonnaise, such as Primal Kitchen Mayo", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Everything bagel seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "English cucumber", prep: "sliced on the diagonal", quantity: "1", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Sustainably harvested canned tuna packed in water", prep: "drained", quantity: "24", unit: "oz", category: "Meat" },
        { item: "Celery", prep: "diced small", quantity: "8", unit: "stalks", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "4", unit: "", category: "Produce" },
        { item: "Lemon", prep: "zest and juice", quantity: "2", unit: "small", category: "Produce" },
        { item: "Avocado", prep: "mashed", quantity: "1", unit: "", category: "Produce" },
        { item: "Avocado oil-based mayonnaise, such as Primal Kitchen Mayo", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Everything bagel seasoning", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "English cucumber", prep: "sliced on the diagonal", quantity: "2", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix & serve",
        detail:
          "Combine the tuna, celery, scallions, lemon zest and juice, avocado, mayonnaise, bagel seasoning, and pepper in a medium bowl. Serve sliced cucumber on the side."
      }
    ]
  },

  {
    recipe_id: "taco-salad",
    title: "Taco Salad",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥗",
    tags: ["Salad", "Make-Ahead", "High-Protein"],
    dish_category: "Salads & Slaws",
    description:
      "Who needs a tortilla when you can enjoy the varied and intense flavors and textures in this ultrasophisticated spin on a popular staple? Again, nothing you'll find in a restaurant will ever compare to this, so make a huge batch of it and enjoy it all week.",
    prep_time_mins: 15,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#C0492B",

    macro_profiles: {
      serving_2: { calories: 1453, protein_g: 108, fat_g: 97, carbs_g: 37 },
      serving_4: { calories: 1453, protein_g: 108, fat_g: 97, carbs_g: 37 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ground beef", prep: "", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chopped leafy greens, such as romaine, spinach, or kale", prep: "chopped", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Shredded green cabbage", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Fresh white button mushrooms", prep: "thinly sliced", quantity: "2", unit: "oz", category: "Produce" },
        { item: "Fresh cherry tomatoes", prep: "halved", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Celery", prep: "thinly sliced", quantity: "2", unit: "stalks", category: "Produce" },
        { item: "Shredded Cheddar cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Full-fat sour cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Prepared salsa", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1", unit: "bunch", category: "Produce" },
        { item: "Limes", prep: "juiced", quantity: "2", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Ground beef", prep: "", quantity: "3", unit: "lb", category: "Meat" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chopped leafy greens, such as romaine, spinach, or kale", prep: "chopped", quantity: "8", unit: "cups", category: "Produce" },
        { item: "Shredded green cabbage", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Fresh white button mushrooms", prep: "thinly sliced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Fresh cherry tomatoes", prep: "halved", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Celery", prep: "thinly sliced", quantity: "4", unit: "stalks", category: "Produce" },
        { item: "Shredded Cheddar cheese", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Full-fat sour cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Prepared salsa", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Scallions", prep: "thinly sliced", quantity: "2", unit: "bunches", category: "Produce" },
        { item: "Limes", prep: "juiced", quantity: "4", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the seasoned beef",
        detail:
          "In a large skillet over medium heat, combine the ground beef, garlic, cumin, coriander, chili powder, salt, and pepper. Sauté, mixing thoroughly, until the meat is cooked through. Remove from the heat and set aside."
      },
      {
        step_number: 2,
        title: "Layer the salad",
        detail:
          "In a large bowl, layer the greens, cabbage, mushrooms, tomatoes, avocado, celery, and cheese."
      },
      {
        step_number: 3,
        title: "Make the dressing & assemble",
        detail:
          "To make the dressing, whisk together the sour cream, salsa, cilantro, scallions, and lime juice in a small bowl. Spoon the beef mixture over the greens and vegetables and generously drizzle with dressing."
      }
    ]
  },

  {
    recipe_id: "green-chili-chicken-chili",
    title: "Green Chili Chicken Chili",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🌶️",
    tags: ["One-Pot", "Spicy", "Family-Size"],
    dish_category: "Soups, Stews & Chilis",
    description:
      "This one-pot chicken-and-vegetable dish hits the spot, bursting with flavors from spicy pork sausage, comforting bone broth, and a big dose of dried and fresh herbs and spices.",
    prep_time_mins: 8,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#6B8E3D",

    macro_profiles: {
      serving_2: { calories: 993, protein_g: 88, fat_g: 61, carbs_g: 23 },
      serving_4: { calories: 993, protein_g: 88, fat_g: 61, carbs_g: 23 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Extra-virgin olive oil or lard", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Yellow onion", prep: "chopped", quantity: "1/2", unit: "large", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Ground chicken", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Spicy bulk sausage", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Zucchini", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Diced green chilies", prep: "", quantity: "1", unit: "(14-oz) can", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Chicken bone broth", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Thinly sliced scallions", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Fresh or pickled jalapeño peppers", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" },
        { item: "Full-fat sour cream", prep: "for topping", quantity: "", unit: "", category: "Dairy" },
        { item: "Shredded cheese", prep: "for topping", quantity: "", unit: "", category: "Dairy" },
        { item: "Diced black olives", prep: "for topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Avocado", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Extra-virgin olive oil or lard", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Yellow onion", prep: "chopped", quantity: "1", unit: "large", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Ground chicken", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Spicy bulk sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Zucchini", prep: "diced", quantity: "2", unit: "medium", category: "Produce" },
        { item: "Diced green chilies", prep: "", quantity: "2", unit: "(14-oz) cans", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Chicken bone broth", prep: "", quantity: "4", unit: "cups", category: "Pantry" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Thinly sliced scallions", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Fresh or pickled jalapeño peppers", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" },
        { item: "Full-fat sour cream", prep: "for topping", quantity: "", unit: "", category: "Dairy" },
        { item: "Shredded cheese", prep: "for topping", quantity: "", unit: "", category: "Dairy" },
        { item: "Diced black olives", prep: "for topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Avocado", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the meats",
        detail:
          "Heat the oil in a large stock pot over medium heat. Add the onion and garlic and cook 3 minutes. Add the chicken thighs, ground chicken, and sausage. Cook about 8 minutes, stirring to break up the meat, until almost fully cooked."
      },
      {
        step_number: 2,
        title: "Simmer & finish",
        detail:
          "Add the zucchini, green chilies, cumin, oregano, coriander, and cayenne. Bring to a boil, reduce the heat, and simmer, uncovered, for 10 minutes. Remove from the heat, adjust seasoning, and add the cilantro and scallions. Serve hot with toppings on the side."
      }
    ]
  },

  {
    recipe_id: "brads-noatmeal",
    title: "Brad's \"NOatmeal\"",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥣",
    tags: ["Breakfast", "Grain-Free", "Make-Ahead"],
    dish_category: "Breakfast",
    description:
      "Made with healthful fats and protein and just enough natural sweetness, this oatmeal is easy to make and incredibly rich and satisfying. Vary the amount of nut butter according to your preferred consistency. Double or triple the recipe to have a ready-made supply for busy mornings.",
    prep_time_mins: 5,
    cook_time_mins: 7,
    native_serving: 4,
    accent: "#C9A86A",

    macro_profiles: {
      serving_2: { calories: 331, protein_g: 11, fat_g: 23, carbs_g: 20 },
      serving_4: { calories: 331, protein_g: 11, fat_g: 23, carbs_g: 20 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Unsweetened coconut or almond milk", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Large egg yolks", prep: "", quantity: "2", unit: "", category: "Dairy" },
        { item: "Pure vanilla extract", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pureed nuts of your choice", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Nut butter, such as Brad's Macadamia Masterpiece", prep: "or more or less to taste", quantity: "1 1/2", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Unsweetened coconut or almond milk", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Large egg yolks", prep: "", quantity: "4", unit: "", category: "Dairy" },
        { item: "Pure vanilla extract", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pureed nuts of your choice", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Nut butter, such as Brad's Macadamia Masterpiece", prep: "or more or less to taste", quantity: "3", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Simmer & thicken",
        detail:
          "In a large saucepan, combine the milk, egg yolks, vanilla, and cinnamon and mix well. Simmer on low heat for about five minutes, stirring occasionally. When the mixture is warm and well blended, add the nuts and nut butter and stir a couple more minutes until the desired consistency is reached. Keep in mind that the mixture will thicken significantly after being removed from the heat, so err on the watery side when you pull the pan off the stove."
      }
    ]
  },

  {
    recipe_id: "breakfast-hash-broiled-eggs",
    title: "Breakfast Hash and Broiled Eggs",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍳",
    tags: ["Breakfast", "One-Skillet", "High-Protein"],
    dish_category: "Breakfast",
    description:
      "Hashes are often prepared with shredded potatoes, but why not experiment and use brussels sprouts? If you can't find brussels sprouts, a big bag of preshredded cabbage is a nice low-carb alternative.",
    prep_time_mins: 10,
    cook_time_mins: 18,
    native_serving: 2,
    accent: "#A0703C",

    macro_profiles: {
      serving_2: { calories: 2408, protein_g: 134, fat_g: 180, carbs_g: 63 },
      serving_4: { calories: 2408, protein_g: 134, fat_g: 180, carbs_g: 63 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Bulk pork sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Butter", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "4", unit: "oz", category: "Produce" },
        { item: "Shallot", prep: "minced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Brussels sprouts", prep: "quartered", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Large pastured eggs", prep: "", quantity: "4", unit: "", category: "Dairy" },
        { item: "Goat cheese", prep: "crumbled", quantity: "2", unit: "oz", category: "Dairy" }
      ],
      serving_4: [
        { item: "Bulk pork sausage", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Butter", prep: "", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Fresh mushrooms", prep: "diced", quantity: "8", unit: "oz", category: "Produce" },
        { item: "Shallot", prep: "minced", quantity: "2", unit: "small", category: "Produce" },
        { item: "Brussels sprouts", prep: "quartered", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Large pastured eggs", prep: "", quantity: "8", unit: "", category: "Dairy" },
        { item: "Goat cheese", prep: "crumbled", quantity: "4", unit: "oz", category: "Dairy" }
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
          "In a large ovenproof skillet, cook the sausage over medium heat, breaking it up into bite-size pieces, until cooked through. Using a slotted spoon, remove the meat from the pan and set aside."
      },
      {
        step_number: 3,
        title: "Sauté the hash",
        detail:
          "To the fat remaining in the skillet, add the butter and mushrooms and cook on medium-high heat until golden brown. Add the shallot, brussels sprouts, and garlic. Sauté until the brussels sprouts are tender and the shallot is translucent, about 5 minutes. Season with salt and pepper. Transfer the cooked sausage back into the skillet and toss to combine. Taste and adjust seasoning."
      },
      {
        step_number: 4,
        title: "Add eggs & broil",
        detail:
          "Make four wells in the sausage mixture. Crack an egg into each well, season with salt and pepper, and place the pan on the middle rack of the oven. Broil for 3–5 minutes, depending on how runny you like the yolks. Top with crumbled cheese and serve immediately."
      }
    ]
  },

  {
    recipe_id: "hearty-farmers-market-breakfast-casserole",
    title: "Hearty Farmer's Market Breakfast Casserole",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥘",
    tags: ["Breakfast", "Casserole", "Make-Ahead"],
    dish_category: "Breakfast",
    description:
      "Filled with vegetables, herbs, and lots of protein, this dish will keep you full and grounded all morning. You'll love it so much that you'll be tempted to eat it for dinner!",
    prep_time_mins: 12,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#B5894E",

    macro_profiles: {
      serving_2: { calories: 765, protein_g: 41, fat_g: 61, carbs_g: 13 },
      serving_4: { calories: 765, protein_g: 41, fat_g: 61, carbs_g: 13 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Bulk pork sausage", prep: "", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Red or green bell pepper", prep: "seeded and diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Zucchini", prep: "diced", quantity: "1/2", unit: "medium", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "medium", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Large pastured eggs", prep: "", quantity: "4", unit: "", category: "Dairy" },
        { item: "Shredded Cheddar cheese", prep: "divided", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh basil", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Fresh parsley", prep: "minced", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Scallions", prep: "thinly sliced", quantity: "1", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Bulk pork sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Red or green bell pepper", prep: "seeded and diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Zucchini", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Large pastured eggs", prep: "", quantity: "8", unit: "", category: "Dairy" },
        { item: "Shredded Cheddar cheese", prep: "divided", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh basil", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "minced", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Heavy cream or unsweetened coconut cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Scallions", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Preheat the oven",
        detail: "Preheat the oven to 375°F."
      },
      {
        step_number: 2,
        title: "Brown the sausage & vegetables",
        detail:
          "In a large pan over medium heat, brown the sausage, breaking it up into bite-size pieces. Increase the heat to medium-high and add the bell pepper, zucchini, onion, and garlic and sauté for 5 minutes."
      },
      {
        step_number: 3,
        title: "Assemble & bake",
        detail:
          "Meanwhile, in a large bowl, whisk together the eggs, ½ cup cheese, basil, parsley, salt, pepper, and cream. Transfer the cooked sausage mixture to a 9-inch pie pan. Pour the egg mixture over the top and sprinkle with the scallions and remaining cheese. Bake for 25 minutes, or until golden brown and just set."
      }
    ]
  },

  {
    recipe_id: "chaffle-avocado-toast",
    title: "Chaffle Avocado Toast",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🥑",
    tags: ["Breakfast", "Keto", "Chaffle"],
    dish_category: "Breakfast",
    description:
      "Who says you have to fill your waffle iron with nutrient-deficient grains and sweeteners? Haul that thing back out of the dark cupboard corner and try the increasingly popular \"chaffle\"—a cheese waffle! This deliciously crispy concoction is topped with healthful fats, vegetables, and protein.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#6E9B4E",

    macro_profiles: {
      serving_2: { calories: 520, protein_g: 26, fat_g: 40, carbs_g: 14 },
      serving_4: { calories: 520, protein_g: 26, fat_g: 40, carbs_g: 14 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Large pastured eggs", prep: "", quantity: "2", unit: "", category: "Dairy" },
        { item: "Shredded cheese, such as Cheddar or half Parmesan and half mozzarella", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Scallion", prep: "thinly sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Uncured bacon", prep: "", quantity: "4", unit: "slices", category: "Meat" },
        { item: "Avocado", prep: "", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Cucumber", prep: "peeled and thinly sliced", quantity: "4-inch", unit: "section", category: "Produce" },
        { item: "Lemon wedges", prep: "", quantity: "2", unit: "", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "1", unit: "pinch", category: "Pantry" }
      ],
      serving_4: [
        { item: "Large pastured eggs", prep: "", quantity: "4", unit: "", category: "Dairy" },
        { item: "Shredded cheese, such as Cheddar or half Parmesan and half mozzarella", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Scallion", prep: "thinly sliced", quantity: "2", unit: "", category: "Produce" },
        { item: "Uncured bacon", prep: "", quantity: "8", unit: "slices", category: "Meat" },
        { item: "Avocado", prep: "", quantity: "2", unit: "", category: "Produce" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cucumber", prep: "peeled and thinly sliced", quantity: "8-inch", unit: "section", category: "Produce" },
        { item: "Lemon wedges", prep: "", quantity: "4", unit: "", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "2", unit: "pinches", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the chaffles",
        detail:
          "In a medium bowl, combine the eggs with the shredded cheese, pepper, and scallion. Pour the batter into a waffle maker and cook according to the manufacturer's directions—in two batches if necessary—until golden brown. Transfer to a wire rack."
      },
      {
        step_number: 2,
        title: "Cook the bacon",
        detail:
          "Meanwhile, in a large skillet over medium heat, cook the bacon, chop it, then set aside."
      },
      {
        step_number: 3,
        title: "Mash the avocado",
        detail:
          "In a small bowl, mash the avocado flesh with the salt and garlic powder."
      },
      {
        step_number: 4,
        title: "Assemble & serve",
        detail:
          "To assemble, layer cucumber slices on top of the chaffles, followed by the avocado mixture, chopped bacon, a squeeze of fresh lemon juice, and a pinch of red pepper flakes. Tip: Make a double or triple batch of chaffles, then store them in the freezer. When you're ready to eat, simply pop them in the toaster."
      }
    ]
  },

  {
    recipe_id: "creamy-chicken-tortilla-soup",
    title: "Creamy Chicken Tortilla Soup",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍜",
    tags: ["Soup", "One-Pot", "Family-Size"],
    dish_category: "Soups, Stews & Chilis",
    description:
      "You won't miss tortilla chips when you experience this incredibly intense and diverse blend of flavors and toppings.",
    prep_time_mins: 15,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#C2622E",

    macro_profiles: {
      serving_2: { calories: 623, protein_g: 52, fat_g: 31, carbs_g: 34 },
      serving_4: { calories: 623, protein_g: 52, fat_g: 31, carbs_g: 34 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Lard or beef tallow", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "medium", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "4", unit: "", category: "Meat" },
        { item: "Tomato paste", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Canned diced green chilies", prep: "", quantity: "2", unit: "oz", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Zucchini", prep: "quartered lengthwise and sliced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Carrots", prep: "halved and sliced lengthwise", quantity: "1", unit: "", category: "Produce" },
        { item: "Green, white, or red cabbage", prep: "chopped", quantity: "1/2", unit: "small head", category: "Produce" },
        { item: "Chicken bone broth", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Thinly sliced scallions", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Full-fat sour cream", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh jalapeño peppers", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" },
        { item: "Black olives", prep: "sliced, for topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Shredded cheese", prep: "for topping", quantity: "", unit: "", category: "Dairy" },
        { item: "Onion", prep: "diced, for topping", quantity: "", unit: "", category: "Produce" },
        { item: "Avocado", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Lard or beef tallow", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Boneless, skinless chicken thighs", prep: "cut into 1-inch cubes", quantity: "8", unit: "", category: "Meat" },
        { item: "Tomato paste", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Canned diced green chilies", prep: "", quantity: "4", unit: "oz", category: "Pantry" },
        { item: "Cumin", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Coriander", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "8", unit: "", category: "Produce" },
        { item: "Zucchini", prep: "quartered lengthwise and sliced", quantity: "2", unit: "medium", category: "Produce" },
        { item: "Carrots", prep: "halved and sliced lengthwise", quantity: "2", unit: "", category: "Produce" },
        { item: "Green, white, or red cabbage", prep: "chopped", quantity: "1", unit: "small head", category: "Produce" },
        { item: "Chicken bone broth", prep: "", quantity: "4", unit: "cups", category: "Pantry" },
        { item: "Chopped fresh cilantro leaves", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Thinly sliced scallions", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Full-fat sour cream", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh jalapeño peppers", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" },
        { item: "Black olives", prep: "sliced, for topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Shredded cheese", prep: "for topping", quantity: "", unit: "", category: "Dairy" },
        { item: "Onion", prep: "diced, for topping", quantity: "", unit: "", category: "Produce" },
        { item: "Avocado", prep: "sliced, for topping", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the chicken & spices",
        detail:
          "In a large soup pot over medium-high heat, melt the lard. Add the onion and sauté until translucent, about 3 minutes. Add the diced chicken thighs, tomato paste, green chilies, cumin, coriander, oregano, chili powder, smoked paprika, salt, and pepper. Stir to combine and sauté until the chicken is almost cooked through, about 10 minutes."
      },
      {
        step_number: 2,
        title: "Add vegetables & simmer",
        detail:
          "Add the garlic, zucchini, carrots, cabbage, and bone broth. Bring to a boil, then reduce to a simmer. Simmer for 10 minutes, or until the vegetables are crisp-tender."
      },
      {
        step_number: 3,
        title: "Finish & serve",
        detail:
          "Stir in the cilantro, scallions, and sour cream. Taste and adjust seasoning. Serve with the toppings on the side."
      }
    ]
  },

  {
    recipe_id: "tuscan-sausage-soup",
    title: "Tuscan Sausage Soup",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍲",
    tags: ["Soup", "One-Pot", "Italian"],
    dish_category: "Soups, Stews & Chilis",
    description:
      "The combination of fatty Italian sausage, sun-dried tomatoes, and dry Parmesan cheese in this hearty one-pot recipe is going to blow you away. Let this one bubble for a while in your kitchen, so the delicious aroma drifts through your home as you cultivate gratitude for the opportunity to eat such delicious food.",
    prep_time_mins: 10,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#8C5A3C",

    macro_profiles: {
      serving_2: { calories: 613, protein_g: 34, fat_g: 45, carbs_g: 18 },
      serving_4: { calories: 613, protein_g: 34, fat_g: 45, carbs_g: 18 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Spicy bulk Italian sausage", prep: "", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "large", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Zucchini", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Sun-dried tomatoes packed in olive oil", prep: "drained and minced", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Fresh basil", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Dried oregano", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Chicken bone broth", prep: "", quantity: "3", unit: "cups", category: "Pantry" },
        { item: "Fresh spinach leaves", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Grated Parmesan cheese", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" }
      ],
      serving_4: [
        { item: "Spicy bulk Italian sausage", prep: "", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Extra-virgin olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "large", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "6", unit: "", category: "Produce" },
        { item: "Zucchini", prep: "diced", quantity: "2", unit: "medium", category: "Produce" },
        { item: "Sun-dried tomatoes packed in olive oil", prep: "drained and minced", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Fresh basil", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Dried oregano", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chicken bone broth", prep: "", quantity: "6", unit: "cups", category: "Pantry" },
        { item: "Fresh spinach leaves", prep: "", quantity: "4", unit: "cups", category: "Produce" },
        { item: "Grated Parmesan cheese", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Brown the sausage",
        detail:
          "In a large soup pot over medium heat, cook the sausage, breaking it into bite-size pieces. Just before it's cooked through, transfer to a bowl using a slotted spoon, reserving the fat in the pot."
      },
      {
        step_number: 2,
        title: "Sauté aromatics & vegetables",
        detail:
          "Increase the heat to medium-high, add the olive oil and onion, and cook until translucent, about 3 minutes. Add the garlic, zucchini, sun-dried tomatoes, basil, parsley, dried oregano, salt, and pepper. Toss to coat and cook for an additional 5 minutes."
      },
      {
        step_number: 3,
        title: "Simmer & finish",
        detail:
          "Transfer the sausage back into the pot and cover with the broth. Bring to a boil, then reduce the heat to a simmer. Add the spinach and stir just to wilt. Remove from the heat, add the grated Parmesan, and serve hot."
      }
    ]
  },

  {
    recipe_id: "chipotle-chicken-burrito-bowl",
    title: "Chipotle Chicken Burrito Bowl",
    category: "Comfort Food",
    source: "Chipotle Copycats",
    icon: "🍚",
    tags: ["Spicy", "Meal-Prep", "High-Protein"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "A smoky, char-charred take on the drive-thru favorite — blackened chipotle-lime chicken piled over cilantro-lime jasmine rice with black beans, blistered peppers and corn, and a double dose of chipotle crema.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#D97B3F",

    macro_profiles: {
      serving_2: { calories: 580, protein_g: 42, fat_g: 18, carbs_g: 62 },
      serving_4: { calories: 580, protein_g: 42, fat_g: 18, carbs_g: 62 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Chicken thighs", prep: "marinated in blended chipotle, oil, and lime, then seared and chopped", quantity: "2", unit: "", category: "Meat" },
        { item: "Jasmine rice", prep: "cooked, folded with cilantro and lime", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Black beans", prep: "drained and warmed", quantity: "1", unit: "can", category: "Pantry" },
        { item: "Bell pepper", prep: "sliced and blistered", quantity: "1", unit: "", category: "Produce" },
        { item: "Corn kernels", prep: "blistered", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Chipotle peppers in adobo", prep: "blended into marinade and sauce", quantity: "2", unit: "", category: "Pantry" },
        { item: "Sour cream", prep: "whipped with chipotle and lime", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Chicken thighs", prep: "marinated in blended chipotle, oil, and lime, then seared and chopped", quantity: "4", unit: "", category: "Meat" },
        { item: "Jasmine rice", prep: "cooked, folded with cilantro and lime", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Black beans", prep: "drained and warmed", quantity: "2", unit: "cans", category: "Pantry" },
        { item: "Bell pepper", prep: "sliced and blistered", quantity: "2", unit: "", category: "Produce" },
        { item: "Corn kernels", prep: "blistered", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Chipotle peppers in adobo", prep: "blended into marinade and sauce", quantity: "4", unit: "", category: "Pantry" },
        { item: "Sour cream", prep: "whipped with chipotle and lime", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Lime", prep: "juiced", quantity: "2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "4", unit: "tbsp", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Marinate the chicken",
        detail:
          "Blend the chipotle peppers with oil, lime, and salt, then coat the thighs and let them sit while you prep."
      },
      {
        step_number: 2,
        title: "Char it up",
        detail:
          "Sear the chicken hard in a hot pan until blackened at the edges and cooked through, then rest and chop."
      },
      {
        step_number: 3,
        title: "Make the rice",
        detail:
          "Fold chopped cilantro and a squeeze of lime through the warm jasmine rice."
      },
      {
        step_number: 4,
        title: "Warm the sides",
        detail:
          "Heat the black beans, and blister the peppers and corn in the same pan you cooked the chicken."
      },
      {
        step_number: 5,
        title: "Whip the sauce",
        detail:
          "Stir leftover chipotle into the sour cream with a little lime for the creamy drizzle."
      },
      {
        step_number: 6,
        title: "Build the bowl",
        detail:
          "Layer rice, chicken, beans, peppers, and corn, then finish with the chipotle sauce."
      }
    ]
  },

  {
    recipe_id: "honey-chipotle-chicken-wraps",
    title: "Honey Chipotle Chicken Wraps",
    category: "Comfort Food",
    source: "Chipotle Copycats",
    icon: "🌯",
    tags: ["Sweet & Spicy", "Handheld", "Quick"],
    dish_category: "Sandwiches",
    description:
      "Sticky honey-chipotle glazed chicken piled into a tortilla with crisp lettuce, tomato, and cheese, then toasted seam-side down until golden and crisp, with a creamy chipotle drizzle on top.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#CB9A3D",

    macro_profiles: {
      serving_2: { calories: 540, protein_g: 40, fat_g: 22, carbs_g: 44 },
      serving_4: { calories: 540, protein_g: 40, fat_g: 22, carbs_g: 44 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Chicken breasts", prep: "cubed", quantity: "2", unit: "", category: "Meat" },
        { item: "Large flour tortillas", prep: "", quantity: "2", unit: "", category: "Pantry" },
        { item: "Honey", prep: "blended into glaze", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Chipotle peppers in adobo", prep: "blended into glaze", quantity: "2", unit: "", category: "Pantry" },
        { item: "Shredded lettuce", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Sour cream", prep: "mixed with leftover glaze", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Shredded cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Chicken breasts", prep: "cubed", quantity: "4", unit: "", category: "Meat" },
        { item: "Large flour tortillas", prep: "", quantity: "4", unit: "", category: "Pantry" },
        { item: "Honey", prep: "blended into glaze", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Chipotle peppers in adobo", prep: "blended into glaze", quantity: "4", unit: "", category: "Pantry" },
        { item: "Shredded lettuce", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Sour cream", prep: "mixed with leftover glaze", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Shredded cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Lime", prep: "juiced", quantity: "2", unit: "", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the glaze",
        detail:
          "Blend the chipotle peppers with the honey and a squeeze of lime into a sticky, smoky sauce."
      },
      {
        step_number: 2,
        title: "Cook the chicken",
        detail:
          "Sear the cubes in the oil until golden, then toss them in half the glaze until coated and sticky."
      },
      {
        step_number: 3,
        title: "Mix the drizzle",
        detail:
          "Stir the remaining glaze into the sour cream for the creamy chipotle sauce on top."
      },
      {
        step_number: 4,
        title: "Load the wrap",
        detail:
          "Pile chicken, lettuce, tomato, and cheese into each tortilla and drizzle with the sauce."
      },
      {
        step_number: 5,
        title: "Toast and fold",
        detail:
          "Wrap tight and toast seam-side down in a dry pan until golden and crisp."
      }
    ]
  },

  {
    recipe_id: "steak-fajita-quesadilla",
    title: "Steak Fajita Quesadilla",
    category: "Comfort Food",
    source: "Chipotle Copycats",
    icon: "🧀",
    tags: ["Cheesy", "Handheld", "Copycat"],
    dish_category: "Sandwiches",
    description:
      "A double-cheese steak fajita quesadilla griddled until the cheese glues it shut and the first wedge pulls apart molten — seared steak, blistered peppers and onion, and two layers of melty cheese, served with sour cream for dunking.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#B5894E",

    macro_profiles: {
      serving_2: { calories: 620, protein_g: 40, fat_g: 34, carbs_g: 38 },
      serving_4: { calories: 620, protein_g: 40, fat_g: 34, carbs_g: 38 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Steak", prep: "thinly sliced, seared with fajita seasoning", quantity: "1/2", unit: "lb", category: "Meat" },
        { item: "Large flour tortillas", prep: "", quantity: "2", unit: "", category: "Pantry" },
        { item: "Bell pepper", prep: "sliced and blistered", quantity: "1", unit: "", category: "Produce" },
        { item: "Onion", prep: "sliced and blistered", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Shredded Monterey Jack cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Shredded cheddar cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fajita seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Sour cream", prep: "for dunking", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt and black pepper", prep: "", quantity: "", unit: "to taste", category: "Pantry" }
      ],
      serving_4: [
        { item: "Steak", prep: "thinly sliced, seared with fajita seasoning", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Large flour tortillas", prep: "", quantity: "4", unit: "", category: "Pantry" },
        { item: "Bell pepper", prep: "sliced and blistered", quantity: "2", unit: "", category: "Produce" },
        { item: "Onion", prep: "sliced and blistered", quantity: "1", unit: "", category: "Produce" },
        { item: "Shredded Monterey Jack cheese", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Shredded cheddar cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fajita seasoning", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Sour cream", prep: "for dunking", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt and black pepper", prep: "", quantity: "", unit: "to taste", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Sear the steak",
        detail:
          "Cook the sliced steak hot and fast with the fajita seasoning until browned, then set aside."
      },
      {
        step_number: 2,
        title: "Char the fajitas",
        detail:
          "In the same pan, blister the peppers and onion until softened and smoky at the edges."
      },
      {
        step_number: 3,
        title: "Layer the quesadilla",
        detail:
          "Cover half a tortilla with cheese, steak, peppers, and onion, then more cheese, and fold it over."
      },
      {
        step_number: 4,
        title: "Griddle it golden",
        detail:
          "Cook in the pan, pressing gently, until each side turns deep golden and the cheese melts through."
      },
      {
        step_number: 5,
        title: "Slice and serve",
        detail:
          "Cut into wedges and serve with sour cream for dunking."
      }
    ]
  },

  {
    recipe_id: "chipotle-pineapple-pot-roast-bowl",
    title: "Chipotle Pineapple Pot Roast Bowl",
    category: "Comfort Food",
    source: "Chipotle Copycats",
    icon: "🍍",
    tags: ["Slow-Cooked", "Sweet & Spicy", "Meal-Prep"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "A low-and-slow chipotle pot roast bowl finished with caramelized pineapple over cilantro jasmine rice — the kind of Sunday braise that makes the whole house smell like something all afternoon.",
    prep_time_mins: 20,
    cook_time_mins: 180,
    native_serving: 4,
    accent: "#E0A458",

    macro_profiles: {
      serving_2: { calories: 640, protein_g: 46, fat_g: 26, carbs_g: 58 },
      serving_4: { calories: 640, protein_g: 46, fat_g: 26, carbs_g: 58 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Beef chuck roast", prep: "seared and braised until it shreds", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Jasmine rice", prep: "cooked", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Pineapple", prep: "diced and caramelized", quantity: "3/4", unit: "cup", category: "Produce" },
        { item: "Chipotle peppers in adobo", prep: "", quantity: "2", unit: "", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Ground cumin", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Beef broth", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Cilantro", prep: "chopped", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1/2", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Beef chuck roast", prep: "seared and braised until it shreds", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Jasmine rice", prep: "cooked", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Pineapple", prep: "diced and caramelized", quantity: "1 1/2", unit: "cups", category: "Produce" },
        { item: "Chipotle peppers in adobo", prep: "", quantity: "3", unit: "", category: "Pantry" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Ground cumin", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Beef broth", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Sear the roast",
        detail:
          "Brown the chuck hard on every side in the oil to lock in a deep, savory crust."
      },
      {
        step_number: 2,
        title: "Start the braise",
        detail:
          "Add the onion, garlic, chipotle, cumin, and broth, then cover and cook low and slow."
      },
      {
        step_number: 3,
        title: "Cook till tender",
        detail:
          "Let it go until the beef pulls apart effortlessly, a few hours low and slow."
      },
      {
        step_number: 4,
        title: "Shred and reduce",
        detail:
          "Pull the beef apart and stir it back into the liquid, simmering to concentrate."
      },
      {
        step_number: 5,
        title: "Caramelize the pineapple",
        detail:
          "Sear the diced pineapple in a dry pan until golden and jammy at the edges."
      },
      {
        step_number: 6,
        title: "Build the bowl",
        detail:
          "Spoon the beef over rice, add the pineapple, and finish with fresh cilantro."
      }
    ]
  },

  {
    recipe_id: "copycat-chipotle-barbacoa-bowl",
    title: "Copycat Chipotle Barbacoa Bowl",
    category: "Comfort Food",
    source: "Chipotle Copycats",
    icon: "🌶️",
    tags: ["Slow-Cooked", "Copycat", "Meal-Prep"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "A slow-braised copycat barbacoa bowl built bigger than the counter ever would — smoky shredded beef over cilantro-lime rice with corn, pico, cheese, and double the guacamole, no upcharge.",
    prep_time_mins: 15,
    cook_time_mins: 150,
    native_serving: 4,
    accent: "#A65A3A",

    macro_profiles: {
      serving_2: { calories: 660, protein_g: 44, fat_g: 30, carbs_g: 60 },
      serving_4: { calories: 660, protein_g: 44, fat_g: 30, carbs_g: 60 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Beef chuck", prep: "cut into chunks, braised and shredded", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Cilantro-lime rice", prep: "cooked", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Corn kernels", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Pico de gallo", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Shredded cheese", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Guacamole", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Chipotle peppers in adobo", prep: "", quantity: "2", unit: "", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Ground cumin", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Beef chuck", prep: "cut into chunks, braised and shredded", quantity: "2", unit: "lb", category: "Meat" },
        { item: "Cilantro-lime rice", prep: "cooked", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Corn kernels", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Pico de gallo", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Shredded cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Guacamole", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Chipotle peppers in adobo", prep: "", quantity: "3", unit: "", category: "Pantry" },
        { item: "Dried oregano", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Ground cumin", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Braise the beef",
        detail:
          "Simmer the chuck low with chipotle, oregano, cumin, and a splash of broth until it shreds at a touch."
      },
      {
        step_number: 2,
        title: "Shred it down",
        detail:
          "Pull the beef apart and fold it back through its smoky braising liquid."
      },
      {
        step_number: 3,
        title: "Build the base",
        detail:
          "Spoon the cilantro-lime rice into bowls as the foundation."
      },
      {
        step_number: 4,
        title: "Load it up",
        detail:
          "Pile on the barbacoa, then arrange corn, pico, cheese, and guacamole in sections."
      },
      {
        step_number: 5,
        title: "Finish bright",
        detail:
          "Squeeze lime over the top right before serving."
      }
    ]
  },

  {
    recipe_id: "honey-bbq-chicken-mac-n-cheese",
    title: "Honey BBQ Chicken Mac N Cheese",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🧀",
    tags: ["Meal-Prep", "High-Protein", "Sweet & Smoky"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Sweet-smoky honey BBQ chicken cubes plated beside a blender-quick, high-protein mac and cheese — cottage cheese and Greek yogurt sneak in the protein while whole-wheat elbows keep it comforting.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#C9A227",

    macro_profiles: {
      serving_2: { calories: 511, protein_g: 50, fat_g: 15, carbs_g: 40 },
      serving_4: { calories: 511, protein_g: 50, fat_g: 15, carbs_g: 40 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Chicken breast", prep: "cut into bite-sized cubes", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "BBQ sauce", prep: "sugar-free or low-calorie", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Honey", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Apple cider vinegar", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Elbow macaroni", prep: "whole wheat or high-protein", quantity: "4", unit: "oz", category: "Pantry" },
        { item: "Cottage cheese", prep: "low-fat", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Cheddar cheese", prep: "shredded, reduced-fat", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Mozzarella cheese", prep: "shredded", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Garlic powder", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Fresh parsley", prep: "for garnish, optional", quantity: "", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Chicken breast", prep: "cut into bite-sized cubes", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "BBQ sauce", prep: "sugar-free or low-calorie", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Honey", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Apple cider vinegar", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Elbow macaroni", prep: "whole wheat or high-protein", quantity: "8", unit: "oz", category: "Pantry" },
        { item: "Cottage cheese", prep: "low-fat", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Cheddar cheese", prep: "shredded, reduced-fat", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Mozzarella cheese", prep: "shredded", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Fresh parsley", prep: "for garnish, optional", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the pasta",
        detail:
          "Bring a large pot of salted water to a boil. Add the macaroni and cook according to package directions until al dente. Drain and set aside."
      },
      {
        step_number: 2,
        title: "Season & sear the chicken",
        detail:
          "Toss the chicken cubes with olive oil, salt, pepper, and smoked paprika until evenly coated. Heat a large skillet over medium-high heat and sauté for 6-8 minutes until golden brown and cooked through."
      },
      {
        step_number: 3,
        title: "Make the honey BBQ sauce",
        detail:
          "Whisk together the BBQ sauce, honey, apple cider vinegar, and garlic powder. Pour over the cooked chicken and simmer for 2-3 minutes until the sauce thickens and coats the chicken."
      },
      {
        step_number: 4,
        title: "Blend the mac n cheese sauce",
        detail:
          "In a blender, combine the cottage cheese, Greek yogurt, cheddar, mozzarella, garlic powder, paprika, salt, and pepper. Blend until smooth and creamy."
      },
      {
        step_number: 5,
        title: "Combine pasta & sauce",
        detail:
          "Pour the sauce over the warm cooked macaroni and stir until fully coated and creamy."
      },
      {
        step_number: 6,
        title: "Assemble & serve",
        detail:
          "Divide the mac n cheese into containers, add the honey BBQ chicken beside it, and garnish with chopped parsley if desired."
      }
    ]
  },

  {
    recipe_id: "cheesy-beef-taco-potato-bowls",
    title: "Cheesy Beef Taco Potato Bowls",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🌮",
    tags: ["Meal-Prep", "High-Protein", "Tex-Mex"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Crispy sheet-pan potatoes topped with seasoned taco beef, fresh pico de gallo, and a drizzle of cheesy taco sauce — a build-your-own bowl that reheats like a dream.",
    prep_time_mins: 15,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#C0392B",

    macro_profiles: {
      serving_2: { calories: 522, protein_g: 54, fat_g: 18, carbs_g: 42 },
      serving_4: { calories: 522, protein_g: 54, fat_g: 18, carbs_g: 42 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Russet or gold potatoes", prep: "diced into bite-sized cubes", quantity: "3/4", unit: "lb", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Ground beef", prep: "extra lean, 93% or leaner", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Onion", prep: "finely chopped", quantity: "1/4", unit: "medium", category: "Produce" },
        { item: "Garlic", prep: "minced", quantity: "1", unit: "clove", category: "Produce" },
        { item: "Taco seasoning", prep: "low-sodium, or homemade", quantity: "1/2", unit: "packet", category: "Pantry" },
        { item: "Beef broth", prep: "low-sodium", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Tomatoes", prep: "diced", quantity: "1", unit: "medium", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/2", unit: "small", category: "Produce" },
        { item: "Jalapeño", prep: "finely chopped", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Cheddar cheese", prep: "reduced-fat, shredded", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt", prep: "plain", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Milk", prep: "low-fat", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Hot sauce", prep: "optional", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Russet or gold potatoes", prep: "diced into bite-sized cubes", quantity: "1.5", unit: "lbs", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Ground beef", prep: "extra lean, 93% or leaner", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Onion", prep: "finely chopped", quantity: "1/2", unit: "medium", category: "Produce" },
        { item: "Garlic", prep: "minced", quantity: "2", unit: "cloves", category: "Produce" },
        { item: "Taco seasoning", prep: "low-sodium, or homemade", quantity: "1", unit: "packet", category: "Pantry" },
        { item: "Beef broth", prep: "low-sodium", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Tomatoes", prep: "diced", quantity: "2", unit: "medium", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Jalapeño", prep: "finely chopped", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Cheddar cheese", prep: "reduced-fat, shredded", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Milk", prep: "low-fat", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Hot sauce", prep: "optional", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the potatoes",
        detail:
          "Preheat the oven to 425°F. Toss the diced potatoes with olive oil, paprika, garlic powder, salt, and black pepper. Spread on a parchment-lined baking sheet and bake 25-30 minutes, flipping halfway, until crispy and golden."
      },
      {
        step_number: 2,
        title: "Cook the beef",
        detail:
          "Heat a large skillet over medium-high heat. Add the ground beef and cook 5-6 minutes, breaking it apart. Add the chopped onion and garlic and cook another 2-3 minutes until soft and fragrant."
      },
      {
        step_number: 3,
        title: "Season the meat",
        detail:
          "Stir in the taco seasoning and beef broth. Simmer 3-4 minutes until the liquid reduces and the mixture thickens. Adjust seasoning with salt and pepper."
      },
      {
        step_number: 4,
        title: "Make the pico de gallo",
        detail:
          "Combine the diced tomatoes, red onion, jalapeño, cilantro, lime juice, and salt in a bowl. Toss and refrigerate until ready to serve."
      },
      {
        step_number: 5,
        title: "Make the cheesy sauce",
        detail:
          "In a small saucepan over low heat, whisk together the cheddar, Greek yogurt, milk, hot sauce, paprika, and a pinch of salt. Stir constantly until smooth and creamy."
      },
      {
        step_number: 6,
        title: "Assemble the bowls",
        detail:
          "Divide the roasted potatoes among containers, add the taco beef, then a scoop of pico de gallo. Drizzle the cheesy taco sauce over the beef and potatoes."
      }
    ]
  },

  {
    recipe_id: "korean-beef-fried-rice",
    title: "Korean Beef Fried Rice",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍚",
    tags: ["Meal-Prep", "High-Protein", "Spicy"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Gochujang-glazed ground beef tossed with chilled-rice fried rice, scrambled egg, and crunchy vegetables, finished with a sriracha-mayo drizzle and toasted sesame seeds.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#B33951",

    macro_profiles: {
      serving_2: { calories: 547, protein_g: 51, fat_g: 18, carbs_g: 45 },
      serving_4: { calories: 547, protein_g: 51, fat_g: 18, carbs_g: 45 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ground beef", prep: "extra lean, 93% or leaner", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic", prep: "minced", quantity: "1 1/2", unit: "cloves", category: "Produce" },
        { item: "Fresh ginger", prep: "grated", quantity: "1 1/2", unit: "tsp", category: "Produce" },
        { item: "Soy sauce", prep: "low-sodium", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Gochujang", prep: "Korean chili paste", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Brown sugar", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Rice vinegar", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Sesame oil", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Light mayonnaise", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Sriracha", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Rice vinegar", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Water", prep: "to thin, if needed", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Cooked jasmine or basmati rice", prep: "chilled overnight", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion", prep: "finely diced", quantity: "1/2", unit: "small", category: "Produce" },
        { item: "Shredded carrots", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Green onions", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Eggs", prep: "lightly beaten", quantity: "1", unit: "", category: "Dairy" },
        { item: "Soy sauce", prep: "low-sodium", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Sesame oil", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Toasted sesame seeds", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Green onions", prep: "sliced thin, for garnish", quantity: "1", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Ground beef", prep: "extra lean, 93% or leaner", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic", prep: "minced", quantity: "3", unit: "cloves", category: "Produce" },
        { item: "Fresh ginger", prep: "grated", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Soy sauce", prep: "low-sodium", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Gochujang", prep: "Korean chili paste", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Brown sugar", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Rice vinegar", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Sesame oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Light mayonnaise", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Sriracha", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Rice vinegar", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Water", prep: "to thin, if needed", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Cooked jasmine or basmati rice", prep: "chilled overnight", quantity: "3", unit: "cups", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "finely diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Shredded carrots", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Green onions", prep: "chopped", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Eggs", prep: "lightly beaten", quantity: "2", unit: "", category: "Dairy" },
        { item: "Soy sauce", prep: "low-sodium", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Sesame oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Toasted sesame seeds", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Green onions", prep: "sliced thin, for garnish", quantity: "2", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the beef",
        detail:
          "Heat olive oil in a large skillet over medium-high heat. Add the ground beef and cook 5-6 minutes, breaking it apart until browned. Add the garlic and ginger and sauté 1 minute."
      },
      {
        step_number: 2,
        title: "Make the sauce",
        detail:
          "Whisk together the soy sauce, gochujang, brown sugar, rice vinegar, sesame oil, and black pepper. Pour over the cooked beef and simmer 2-3 minutes until thickened. Set aside."
      },
      {
        step_number: 3,
        title: "Cook the fried rice base",
        detail:
          "In another large skillet or wok, heat olive oil over medium heat. Add the diced onion and shredded carrots and cook 2-3 minutes until softened."
      },
      {
        step_number: 4,
        title: "Add the eggs",
        detail:
          "Push the vegetables to one side, pour the beaten eggs into the pan, and scramble until just cooked, then mix together."
      },
      {
        step_number: 5,
        title: "Add rice & seasoning",
        detail:
          "Add the chilled rice to the pan with the soy sauce and sesame oil. Stir-fry 3-4 minutes until evenly coated and hot."
      },
      {
        step_number: 6,
        title: "Combine & make the drizzle",
        detail:
          "Add the Korean beef mixture into the rice and toss together until well mixed. Stir in the chopped green onions. Separately, whisk the mayonnaise, sriracha, rice vinegar, garlic powder, and water until smooth."
      },
      {
        step_number: 7,
        title: "Assemble the bowls",
        detail:
          "Divide the fried rice among containers, drizzle with the spicy mayo, and top with sesame seeds and green onions."
      }
    ]
  },

  {
    recipe_id: "garlic-butter-chicken-creamy-potatoes",
    title: "Garlic Butter Chicken & Creamy Potatoes",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🧈",
    tags: ["Meal-Prep", "High-Protein", "Garlic Butter"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Seared garlic-butter chicken bites alongside sheet-pan roasted potatoes tossed in a tangy Greek yogurt-Dijon cream sauce.",
    prep_time_mins: 15,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#D4A017",

    macro_profiles: {
      serving_2: { calories: 547, protein_g: 51, fat_g: 18, carbs_g: 45 },
      serving_4: { calories: 547, protein_g: 51, fat_g: 18, carbs_g: 45 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Chicken breast", prep: "cut into bite-sized chunks", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "optional", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Unsalted butter", prep: "", quantity: "1 1/2", unit: "tbsp", category: "Dairy" },
        { item: "Garlic", prep: "minced", quantity: "1 1/2", unit: "cloves", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped, optional", quantity: "1/2", unit: "tbsp", category: "Produce" },
        { item: "Baby red or gold potatoes", prep: "diced into small cubes", quantity: "3/4", unit: "lb", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Light cream cheese", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Milk", prep: "low-fat", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Dijon mustard", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1 1/2", unit: "tsp", category: "Produce" }
      ],
      serving_4: [
        { item: "Chicken breast", prep: "cut into bite-sized chunks", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cayenne pepper", prep: "optional", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Unsalted butter", prep: "", quantity: "3", unit: "tbsp", category: "Dairy" },
        { item: "Garlic", prep: "minced", quantity: "3", unit: "cloves", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped, optional", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Baby red or gold potatoes", prep: "diced into small cubes", quantity: "1.5", unit: "lbs", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Light cream cheese", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Milk", prep: "low-fat", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Dijon mustard", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Fresh parsley", prep: "chopped", quantity: "1", unit: "tbsp", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the potatoes",
        detail:
          "Preheat the oven to 425°F. Toss the diced potatoes with olive oil, salt, pepper, garlic powder, and paprika. Spread on a parchment-lined baking sheet and roast 25-30 minutes, flipping halfway, until golden and crispy."
      },
      {
        step_number: 2,
        title: "Season & sear the chicken",
        detail:
          "Toss the chicken pieces with olive oil, salt, pepper, smoked paprika, and cayenne (if using). Heat a large skillet over medium-high heat and sear 5-7 minutes until cooked through and slightly golden. Remove and set aside."
      },
      {
        step_number: 3,
        title: "Make the garlic butter",
        detail:
          "In the same skillet, lower the heat and add the butter. Once melted, stir in the minced garlic and cook 30 seconds until fragrant. Return the chicken to the skillet and toss to coat, then sprinkle with fresh parsley."
      },
      {
        step_number: 4,
        title: "Make the creamy sauce",
        detail:
          "In a small saucepan, combine the Greek yogurt, cream cheese, milk, Dijon mustard, garlic powder, onion powder, salt, and pepper. Stir over low heat until smooth and creamy."
      },
      {
        step_number: 5,
        title: "Coat the potatoes",
        detail:
          "Once the potatoes finish roasting, transfer them to a large bowl and toss with the creamy sauce until well coated. Mix in the chopped parsley."
      },
      {
        step_number: 6,
        title: "Assemble & serve",
        detail:
          "Divide the creamy potatoes and garlic butter chicken evenly among containers. Garnish with a sprinkle of parsley."
      }
    ]
  },

  {
    recipe_id: "garlic-butter-steak-bites-crispy-potatoes",
    title: "Garlic Butter Steak Bites & Crispy Potatoes",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥩",
    tags: ["Meal-Prep", "High-Protein", "Garlic Butter"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Seared garlic-butter steak bites over crispy sheet-pan potatoes, finished with a bright sriracha-lime mayo drizzle.",
    prep_time_mins: 15,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#A0522D",

    macro_profiles: {
      serving_2: { calories: 480, protein_g: 50, fat_g: 17, carbs_g: 32 },
      serving_4: { calories: 480, protein_g: 50, fat_g: 17, carbs_g: 32 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Sirloin or top round steak", prep: "cut into 1-inch cubes", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Unsalted butter", prep: "", quantity: "1", unit: "tbsp", category: "Dairy" },
        { item: "Garlic", prep: "minced", quantity: "1 1/2", unit: "cloves", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped, optional", quantity: "1/2", unit: "tbsp", category: "Produce" },
        { item: "Gold or russet potatoes", prep: "diced into bite-sized cubes", quantity: "3/4", unit: "lb", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Fresh parsley", prep: "chopped, for garnish", quantity: "1/2", unit: "tbsp", category: "Produce" },
        { item: "Light mayonnaise", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Sriracha", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Lime juice", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Water", prep: "to thin, if needed", quantity: "1 1/2", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Sirloin or top round steak", prep: "cut into 1-inch cubes", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Unsalted butter", prep: "", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Garlic", prep: "minced", quantity: "3", unit: "cloves", category: "Produce" },
        { item: "Fresh parsley", prep: "chopped, optional", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Gold or russet potatoes", prep: "diced into bite-sized cubes", quantity: "1.5", unit: "lbs", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Fresh parsley", prep: "chopped, for garnish", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Light mayonnaise", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Sriracha", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lime juice", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Water", prep: "to thin, if needed", quantity: "1", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the potatoes",
        detail:
          "Preheat the oven to 425°F. Toss the diced potatoes with olive oil, paprika, garlic powder, onion powder, salt, and pepper. Spread evenly on a parchment-lined baking sheet and roast 25-30 minutes, flipping halfway, until crispy and golden. Garnish with parsley once done."
      },
      {
        step_number: 2,
        title: "Prep & sear the steak",
        detail:
          "Pat the steak cubes dry and toss with olive oil, salt, pepper, garlic powder, and smoked paprika. Heat a large skillet over medium-high heat and sear the steak in a single layer (in batches if needed) for 2 minutes per side until browned and cooked to your liking. Remove and set aside."
      },
      {
        step_number: 3,
        title: "Make the garlic butter sauce",
        detail:
          "Reduce the heat to low. In the same skillet, add the butter and minced garlic and sauté 30 seconds until fragrant. Return the steak bites to the pan and toss to coat, then sprinkle with chopped parsley."
      },
      {
        step_number: 4,
        title: "Make the spicy drizzle",
        detail:
          "Whisk together the mayonnaise, sriracha, garlic powder, and lime juice, adding a splash of water if needed for drizzling consistency."
      },
      {
        step_number: 5,
        title: "Assemble & serve",
        detail:
          "Divide the crispy potatoes and garlic butter steak bites evenly among containers. Drizzle with the spicy mayo sauce and sprinkle with parsley."
      }
    ]
  },

  {
    recipe_id: "hot-honey-chipotle-bowl",
    title: "Hot Honey Chipotle Bowl",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🔥",
    tags: ["Meal-Prep", "High-Protein", "Spicy"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Air-fried sweet potato and seasoned beef piled into a bowl with crisp raw vegetables and a blended hot honey chipotle yogurt sauce — sweet, smoky, and no oven required.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#E67E22",

    macro_profiles: {
      serving_2: { calories: 690, protein_g: 38, fat_g: 27, carbs_g: 76 },
      serving_4: { calories: 690, protein_g: 38, fat_g: 27, carbs_g: 76 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ground beef", prep: "", quantity: "200", unit: "g", category: "Meat" },
        { item: "Sweet potato", prep: "cut into small cubes", quantity: "450", unit: "g", category: "Produce" },
        { item: "Red capsicum (bell pepper)", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cucumber", prep: "sliced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Chives", prep: "chopped, for topping", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Sesame seeds", prep: "for topping", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Greek yogurt", prep: "for the sauce", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Paprika", prep: "for the sauce", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Lime", prep: "juiced, for the sauce", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Garlic powder", prep: "for the sauce", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Honey", prep: "for the sauce", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "for the sauce", quantity: "1", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Ground beef", prep: "", quantity: "400", unit: "g", category: "Meat" },
        { item: "Sweet potato", prep: "cut into small cubes", quantity: "900", unit: "g", category: "Produce" },
        { item: "Red capsicum (bell pepper)", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Cucumber", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Chives", prep: "chopped, for topping", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Sesame seeds", prep: "for topping", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Greek yogurt", prep: "for the sauce", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Paprika", prep: "for the sauce", quantity: "8", unit: "tbsp", category: "Pantry" },
        { item: "Lime", prep: "juiced, for the sauce", quantity: "1", unit: "", category: "Produce" },
        { item: "Garlic powder", prep: "for the sauce", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Honey", prep: "for the sauce", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "for the sauce", quantity: "2", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Air-fry the sweet potato",
        detail:
          "Cut the sweet potato into small cubes and air fry for 20 minutes at 200°C (400°F), until tender and lightly crisped."
      },
      {
        step_number: 2,
        title: "Cook the beef",
        detail:
          "Cook the ground beef in a skillet over medium-high heat, breaking it apart, and season to taste."
      },
      {
        step_number: 3,
        title: "Prep the vegetables",
        detail:
          "Dice the red onion and capsicum, and slice the cucumber."
      },
      {
        step_number: 4,
        title: "Blend the sauce",
        detail:
          "Blend the Greek yogurt, paprika, lime juice, garlic powder, honey, and salt and pepper until smooth."
      },
      {
        step_number: 5,
        title: "Assemble the bowl",
        detail:
          "Once the sweet potato is cooked, add it to a bowl along with the beef and prepped vegetables."
      },
      {
        step_number: 6,
        title: "Finish & serve",
        detail:
          "Top with the chives and sesame seeds, then drizzle with the hot honey chipotle sauce."
      }
    ]
  },

  {
    recipe_id: "garlic-shrimp-fried-rice",
    title: "Garlic Shrimp Fried Rice",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍤",
    tags: ["Meal-Prep", "High-Protein", "Garlic"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Garlic-marinated shrimp seared until caramelized, tossed with veggie fried rice and scrambled egg, finished with a sriracha-mayo drizzle and green onions.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#4A90A4",

    macro_profiles: {
      serving_2: { calories: 503, protein_g: 46, fat_g: 15, carbs_g: 42 },
      serving_4: { calories: 503, protein_g: 46, fat_g: 15, carbs_g: 42 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Large raw shrimp", prep: "peeled and deveined", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Soy sauce", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Cooked jasmine or basmati rice", prep: "chilled overnight", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion", prep: "finely chopped", quantity: "1/2", unit: "small", category: "Produce" },
        { item: "Garlic", prep: "minced", quantity: "1", unit: "clove", category: "Produce" },
        { item: "Mixed vegetables", prep: "carrots, peas, and corn", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Eggs", prep: "lightly beaten", quantity: "1", unit: "", category: "Dairy" },
        { item: "Soy sauce", prep: "low-sodium", quantity: "1 1/2", unit: "tbsp", category: "Pantry" },
        { item: "Oyster sauce", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Sesame oil", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chili flakes", prep: "optional", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Green onions", prep: "chopped", quantity: "1", unit: "", category: "Produce" },
        { item: "Light mayonnaise", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Sriracha", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Lime juice", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Water", prep: "to thin, as needed", quantity: "1 1/2", unit: "tsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Large raw shrimp", prep: "peeled and deveined", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Soy sauce", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Cooked jasmine or basmati rice", prep: "chilled overnight", quantity: "3", unit: "cups", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Onion", prep: "finely chopped", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic", prep: "minced", quantity: "2", unit: "cloves", category: "Produce" },
        { item: "Mixed vegetables", prep: "carrots, peas, and corn", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Eggs", prep: "lightly beaten", quantity: "2", unit: "", category: "Dairy" },
        { item: "Soy sauce", prep: "low-sodium", quantity: "3", unit: "tbsp", category: "Pantry" },
        { item: "Oyster sauce", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Sesame oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chili flakes", prep: "optional", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Green onions", prep: "chopped", quantity: "2", unit: "", category: "Produce" },
        { item: "Light mayonnaise", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Sriracha", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lime juice", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Water", prep: "to thin, as needed", quantity: "1", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Marinate the shrimp",
        detail:
          "Toss the shrimp with olive oil, soy sauce, garlic powder, paprika, and black pepper. Let marinate 10-15 minutes while prepping other ingredients."
      },
      {
        step_number: 2,
        title: "Sear the shrimp",
        detail:
          "Heat a large skillet or wok over medium-high heat. Add the shrimp and cook 2-3 minutes per side until pink and lightly caramelized. Remove and set aside."
      },
      {
        step_number: 3,
        title: "Cook the vegetables",
        detail:
          "In the same pan, add olive oil, chopped onion, and minced garlic. Sauté 2 minutes until fragrant, then add the mixed vegetables and cook another 3-4 minutes."
      },
      {
        step_number: 4,
        title: "Scramble the eggs",
        detail:
          "Push the vegetables to one side of the pan. Pour the beaten eggs onto the empty side and scramble until just cooked, then mix into the vegetables."
      },
      {
        step_number: 5,
        title: "Add the rice & sauce",
        detail:
          "Add the chilled rice to the pan. Stir in the soy sauce, oyster sauce, sesame oil, and chili flakes. Toss everything together until evenly coated and heated through."
      },
      {
        step_number: 6,
        title: "Combine shrimp & rice",
        detail:
          "Return the cooked shrimp to the pan and mix well. Taste and adjust seasoning if needed."
      },
      {
        step_number: 7,
        title: "Make the spicy garlic drizzle",
        detail:
          "Whisk together the mayonnaise, sriracha, garlic powder, and lime juice. Add water as needed until smooth and drizzle-able."
      },
      {
        step_number: 8,
        title: "Serve",
        detail:
          "Divide the fried rice into containers, drizzle with the spicy garlic sauce, and top with chopped green onions."
      }
    ]
  },

  {
    recipe_id: "creamy-spicy-chipotle-chicken-pasta",
    title: "Creamy Spicy Chipotle Chicken Pasta",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍝",
    tags: ["Meal-Prep", "High-Protein", "Spicy"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Seared chicken and whole-wheat penne tossed in a smoky chipotle cream sauce built from Greek yogurt, cream cheese, and Parmesan — rich without the guilt.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#9B4B3E",

    macro_profiles: {
      serving_2: { calories: 533, protein_g: 55, fat_g: 16, carbs_g: 45 },
      serving_4: { calories: 533, protein_g: 55, fat_g: 16, carbs_g: 45 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Chicken breast", prep: "cut into bite-sized pieces", quantity: "3/4", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Penne pasta", prep: "whole wheat or high-protein", quantity: "4", unit: "oz", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic", prep: "minced", quantity: "1", unit: "clove", category: "Produce" },
        { item: "Adobo sauce", prep: "from the can", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chipotle peppers in adobo sauce", prep: "finely chopped", quantity: "1", unit: "", category: "Pantry" },
        { item: "Chicken broth", prep: "low-sodium", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Cream cheese", prep: "low-fat", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Parmesan cheese", prep: "grated", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Paprika", prep: "", quantity: "1/8", unit: "tsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Fresh parsley or cilantro", prep: "chopped, for garnish", quantity: "", unit: "", category: "Produce" }
      ],
      serving_4: [
        { item: "Chicken breast", prep: "cut into bite-sized pieces", quantity: "1.5", unit: "lbs", category: "Meat" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Penne pasta", prep: "whole wheat or high-protein", quantity: "8", unit: "oz", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Garlic", prep: "minced", quantity: "2", unit: "cloves", category: "Produce" },
        { item: "Adobo sauce", prep: "from the can", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chipotle peppers in adobo sauce", prep: "finely chopped", quantity: "2", unit: "", category: "Pantry" },
        { item: "Chicken broth", prep: "low-sodium", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Cream cheese", prep: "low-fat", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt", prep: "plain", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Paprika", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Fresh parsley or cilantro", prep: "chopped, for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the pasta",
        detail:
          "Bring a large pot of salted water to a boil. Add the penne and cook according to package instructions until al dente. Drain and set aside."
      },
      {
        step_number: 2,
        title: "Season & cook the chicken",
        detail:
          "Toss the chicken with olive oil, salt, pepper, smoked paprika, and garlic powder. Heat a large skillet over medium-high heat and cook the chicken 6-8 minutes until golden brown and cooked through. Remove and set aside."
      },
      {
        step_number: 3,
        title: "Make the sauce base",
        detail:
          "In the same skillet, add olive oil and minced garlic. Sauté 30 seconds until fragrant, then add the chopped chipotle peppers and adobo sauce, stirring for another 30 seconds."
      },
      {
        step_number: 4,
        title: "Add liquids & creaminess",
        detail:
          "Pour in the chicken broth and stir to loosen any bits from the pan. Lower the heat and whisk in the cream cheese until smooth and melted, then stir in the Greek yogurt, Parmesan, and paprika until creamy."
      },
      {
        step_number: 5,
        title: "Combine everything",
        detail:
          "Return the cooked chicken and pasta to the skillet and toss until fully coated in the chipotle cream sauce. Adjust seasoning with salt and pepper."
      },
      {
        step_number: 6,
        title: "Serve & garnish",
        detail:
          "Divide the pasta among containers and sprinkle chopped parsley or cilantro on top before serving."
      }
    ]
  },

  {
    recipe_id: "cheesy-garlic-parmesan-chicken-potatoes",
    title: "Cheesy Garlic Parmesan Chicken & Potatoes",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🧄",
    tags: ["Meal-Prep", "High-Protein", "Cheesy"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Roasted garlic-seasoned potatoes and seared chicken finished in a rich light evaporated-milk Parmesan sauce with melted cheddar — comfort food with a macro-friendly twist.",
    prep_time_mins: 15,
    cook_time_mins: 35,
    native_serving: 4,
    accent: "#9C7A3C",

    macro_profiles: {
      serving_2: { calories: 556, protein_g: 75, fat_g: 16, carbs_g: 30 },
      serving_4: { calories: 556, protein_g: 75, fat_g: 16, carbs_g: 30 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Potatoes", prep: "peeled and diced", quantity: "1", unit: "lb", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "for the potatoes", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Italian herb seasoning", prep: "for the potatoes", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion & garlic powder", prep: "for the potatoes", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the potatoes", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chicken breast", prep: "diced", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Salt", prep: "for the chicken", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Italian herb seasoning", prep: "for the chicken", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion & garlic powder", prep: "for the chicken", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the chicken", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cooking oil spray", prep: "for the pan", quantity: "", unit: "", category: "Pantry" },
        { item: "Garlic", prep: "minced", quantity: "2-3", unit: "cloves", category: "Produce" },
        { item: "Lemon juice", prep: "a squeeze", quantity: "", unit: "", category: "Produce" },
        { item: "Mozzarella or cheddar cheese", prep: "shredded, light", quantity: "6", unit: "tbsp", category: "Dairy" },
        { item: "Dried parsley", prep: "optional topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Light evaporated milk", prep: "", quantity: "2/3", unit: "cup", category: "Dairy" },
        { item: "Parmesan cheese", prep: "freshly grated", quantity: "2 1/2", unit: "tbsp", category: "Dairy" },
        { item: "Chili flakes", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Italian herb seasoning", prep: "for the sauce", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Light cream cheese", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" }
      ],
      serving_4: [
        { item: "Potatoes", prep: "peeled and diced", quantity: "2", unit: "lbs", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "for the potatoes", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Italian herb seasoning", prep: "for the potatoes", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion & garlic powder", prep: "for the potatoes", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the potatoes", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chicken breast", prep: "diced", quantity: "2", unit: "lbs", category: "Meat" },
        { item: "Salt", prep: "for the chicken", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Italian herb seasoning", prep: "for the chicken", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion & garlic powder", prep: "for the chicken", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the chicken", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cooking oil spray", prep: "for the pan", quantity: "", unit: "", category: "Pantry" },
        { item: "Garlic", prep: "minced", quantity: "5", unit: "cloves", category: "Produce" },
        { item: "Lemon juice", prep: "a squeeze", quantity: "", unit: "", category: "Produce" },
        { item: "Mozzarella or cheddar cheese", prep: "shredded, light", quantity: "3/4", unit: "cup", category: "Dairy" },
        { item: "Dried parsley", prep: "optional topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Light evaporated milk", prep: "", quantity: "1 2/3", unit: "cups", category: "Dairy" },
        { item: "Parmesan cheese", prep: "freshly grated", quantity: "1/3", unit: "cup", category: "Dairy" },
        { item: "Chili flakes", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Italian herb seasoning", prep: "for the sauce", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Light cream cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the potatoes",
        detail:
          "Toss the diced potatoes with olive oil, salt, Italian herb seasoning, onion & garlic powder, and smoked paprika. Roast at 200°C (400°F) for 25-30 minutes until golden and tender."
      },
      {
        step_number: 2,
        title: "Season & cook the chicken",
        detail:
          "Toss the diced chicken with the same seasoning blend used for the potatoes. Spray a large skillet with cooking oil and cook the chicken over medium-high heat until browned and cooked through."
      },
      {
        step_number: 3,
        title: "Sauté the garlic",
        detail:
          "Add the minced garlic to the skillet and sauté 30 seconds until fragrant, then squeeze in the lemon juice."
      },
      {
        step_number: 4,
        title: "Make the parmesan sauce",
        detail:
          "In a saucepan, warm the light evaporated milk, then whisk in the Parmesan, chili flakes, onion powder, and Italian herb seasoning until smooth. Stir in the cream cheese until melted and creamy."
      },
      {
        step_number: 5,
        title: "Combine",
        detail:
          "Toss the roasted potatoes and cooked chicken with the parmesan sauce, then fold in the shredded mozzarella or cheddar until melted."
      },
      {
        step_number: 6,
        title: "Serve",
        detail:
          "Divide among containers and top with dried parsley, if desired."
      }
    ]
  },

  {
    recipe_id: "honey-buffalo-chicken-rice-bowls",
    title: "High-Protein Honey Buffalo Chicken Rice Bowls",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍯",
    tags: ["Meal-Prep", "High-Protein", "Sweet & Spicy"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Butter-seared honey buffalo chicken bites over rice with a tangy honey-buffalo drizzle and a crunchy cabbage-carrot slaw for contrast.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#E0A458",

    macro_profiles: {
      serving_2: { calories: 528, protein_g: 44, fat_g: 16, carbs_g: 49 },
      serving_4: { calories: 528, protein_g: 44, fat_g: 16, carbs_g: 49 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Chicken breast", prep: "cubed", quantity: "14", unit: "oz", category: "Meat" },
        { item: "Garlic", prep: "minced", quantity: "2-3", unit: "cloves", category: "Produce" },
        { item: "Black pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Butter", prep: "grass-fed, for cooking", quantity: "3/4", unit: "tbsp", category: "Dairy" },
        { item: "Honey", prep: "for the chicken", quantity: "1/2", unit: "tbsp", category: "Pantry" },
        { item: "Buffalo sauce", prep: "for the chicken", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Light mayonnaise", prep: "for the sauce", quantity: "2 1/2", unit: "tbsp", category: "Pantry" },
        { item: "Buffalo hot sauce", prep: "for the sauce", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Honey", prep: "for the sauce", quantity: "1/2", unit: "tbsp", category: "Pantry" },
        { item: "Lemon juice", prep: "", quantity: "1/8", unit: "lemon", category: "Produce" },
        { item: "Garlic powder", prep: "for the sauce", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the sauce", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "for the sauce", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Red cabbage", prep: "thinly sliced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Carrots", prep: "grated", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Green onion", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Light mayonnaise", prep: "for the slaw", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Honey", prep: "for the slaw", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "for the slaw", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "for the slaw", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Cooked white rice", prep: "", quantity: "1 1/2", unit: "cups", category: "Pantry" }
      ],
      serving_4: [
        { item: "Chicken breast", prep: "cubed", quantity: "1.75", unit: "lbs", category: "Meat" },
        { item: "Garlic", prep: "minced", quantity: "4-5", unit: "cloves", category: "Produce" },
        { item: "Black pepper", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Butter", prep: "grass-fed, for cooking", quantity: "1 1/2", unit: "tbsp", category: "Dairy" },
        { item: "Honey", prep: "for the chicken", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Buffalo sauce", prep: "for the chicken", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Light mayonnaise", prep: "for the sauce", quantity: "1/3", unit: "cup", category: "Pantry" },
        { item: "Buffalo hot sauce", prep: "for the sauce", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Honey", prep: "for the sauce", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Lemon juice", prep: "", quantity: "1/4", unit: "lemon", category: "Produce" },
        { item: "Garlic powder", prep: "for the sauce", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the sauce", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "for the sauce", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Red cabbage", prep: "thinly sliced", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Carrots", prep: "grated", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Green onion", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Light mayonnaise", prep: "for the slaw", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Honey", prep: "for the slaw", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "for the slaw", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "for the slaw", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Cooked white rice", prep: "", quantity: "3", unit: "cups", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Season the chicken",
        detail:
          "Toss the cubed chicken with the minced garlic, black pepper, onion powder, smoked paprika, salt, and olive oil."
      },
      {
        step_number: 2,
        title: "Cook the chicken",
        detail:
          "Melt the butter in a large skillet over medium-high heat. Add the chicken and cook until browned and cooked through."
      },
      {
        step_number: 3,
        title: "Glaze the chicken",
        detail:
          "Stir the honey and buffalo sauce into the skillet and toss to coat the chicken, simmering until glossy."
      },
      {
        step_number: 4,
        title: "Make the honey buffalo sauce",
        detail:
          "Whisk together the mayonnaise, buffalo hot sauce, honey, lemon juice, garlic powder, smoked paprika, and black pepper."
      },
      {
        step_number: 5,
        title: "Make the crunchy slaw",
        detail:
          "Toss the red cabbage, carrots, green onion, and cilantro with the mayonnaise, honey, salt, and pepper."
      },
      {
        step_number: 6,
        title: "Assemble the bowls",
        detail:
          "Divide the rice among containers, top with the honey buffalo chicken, add the slaw, and drizzle with the honey buffalo sauce."
      }
    ]
  },

  {
    recipe_id: "pumpkin-cheesecake-delight",
    title: "Pumpkin Cheesecake Delight",
    category: "Dessert",
    source: "Desserts",
    icon: "🎃",
    tags: ["No-Bake", "Icebox Cake", "Fall"],
    dish_category: "Desserts",
    description:
      "A no-bake icebox cake layering a graham cracker crust, no-bake cheesecake filling, and a spiced pumpkin-vanilla pudding, finished with whipped topping — an easy make-ahead fall showstopper.",
    prep_time_mins: 20,
    cook_time_mins: 0,
    native_serving: 12,
    accent: "#D2691E",

    macro_profiles: {
      serving_12: { calories: 330, protein_g: 4, fat_g: 19, carbs_g: 36 }
    },

    scaling_options: [12],

    ingredients_by_serving: {
      serving_12: [
        { item: "Graham cracker crumbs", prep: "crushed", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Butter", prep: "melted", quantity: "1", unit: "stick", category: "Dairy" },
        { item: "No-bake cheesecake filling", prep: "", quantity: "1", unit: "container", category: "Dairy" },
        { item: "Pumpkin purée", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Instant vanilla or French vanilla pudding mix", prep: "", quantity: "1", unit: "(3.5-oz) box", category: "Pantry" },
        { item: "Milk", prep: "", quantity: "1.5", unit: "cups", category: "Dairy" },
        { item: "Pumpkin pie spice", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Vanilla bean paste", prep: "optional", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Whipped topping (Cool Whip)", prep: "", quantity: "1", unit: "container", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the crust",
        detail:
          "Combine the graham cracker crumbs and melted butter in a bowl, mix, then press into the bottom of a 13x9 dish. Refrigerate 15 minutes."
      },
      {
        step_number: 2,
        title: "Add the cheesecake layer",
        detail:
          "Spread the no-bake cheesecake filling evenly over the chilled graham cracker crust."
      },
      {
        step_number: 3,
        title: "Make the pumpkin layer",
        detail:
          "In a bowl, whisk together the pudding mix and milk. Fold in the pumpkin purée, pumpkin pie spice, and vanilla bean paste. Once combined, carefully spread over the cheesecake layer."
      },
      {
        step_number: 4,
        title: "Top & garnish",
        detail:
          "Spread the whipped topping over the pumpkin layer and garnish with a dusting of pumpkin pie spice."
      },
      {
        step_number: 5,
        title: "Chill & serve",
        detail:
          "Let chill in the refrigerator for 1-3 hours before serving."
      }
    ]
  },

  {
    recipe_id: "million-dollar-banana-pudding",
    title: "Million Dollar Banana Pudding",
    category: "Dessert",
    source: "Desserts",
    icon: "🍌",
    tags: ["No-Bake", "Trifle", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A layered banana pudding trifle — cream cheese and sweetened condensed milk folded into vanilla pudding, layered with Nilla Wafers, bananas, and caramel, then finished with a mountain of homemade whipped cream.",
    prep_time_mins: 25,
    cook_time_mins: 0,
    native_serving: 12,
    accent: "#D9A441",

    macro_profiles: {
      serving_12: { calories: 680, protein_g: 7, fat_g: 38, carbs_g: 75 }
    },

    scaling_options: [12],

    ingredients_by_serving: {
      serving_12: [
        { item: "Cream cheese", prep: "softened to room temperature", quantity: "1", unit: "(8-oz) block", category: "Dairy" },
        { item: "Sweetened condensed milk", prep: "", quantity: "1", unit: "(14-oz) can", category: "Dairy" },
        { item: "Instant vanilla pudding mix", prep: "", quantity: "1", unit: "(5-oz) box", category: "Pantry" },
        { item: "Milk", prep: "2% or whole", quantity: "3", unit: "cups", category: "Dairy" },
        { item: "Vanilla extract", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Nilla Wafers", prep: "divided", quantity: "1", unit: "(11-oz) box", category: "Pantry" },
        { item: "Bananas", prep: "peeled and sliced", quantity: "5-7", unit: "", category: "Produce" },
        { item: "Caramel sauce", prep: "", quantity: "", unit: "", category: "Pantry" },
        { item: "Heavy whipping cream", prep: "for the whipped cream", quantity: "3", unit: "cups", category: "Dairy" },
        { item: "Powdered sugar", prep: "for the whipped cream", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Vanilla bean paste", prep: "for the whipped cream", quantity: "1/2", unit: "tsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the whipped cream",
        detail:
          "In a large chilled mixing bowl, combine the heavy whipping cream, powdered sugar, and vanilla bean paste. Beat with a hand or stand mixer until stiff peaks form, then refrigerate until ready to use."
      },
      {
        step_number: 2,
        title: "Make the pudding base",
        detail:
          "Beat the softened cream cheese until smooth and fluffy, then mix in the sweetened condensed milk until fully combined."
      },
      {
        step_number: 3,
        title: "Thicken & combine the pudding",
        detail:
          "In a separate bowl, whisk the instant vanilla pudding mix with the milk for about 2 minutes until it begins to thicken. Add it and the vanilla extract to the cream cheese mixture and mix until smooth, then fold in about half of the whipped cream until fully incorporated."
      },
      {
        step_number: 4,
        title: "Layer the pudding",
        detail:
          "In a 9x13-inch baking dish or large trifle bowl, arrange a layer of Nilla Wafers on the bottom, then a layer of sliced bananas and a drizzle of caramel sauce. Spread half the pudding mixture over the bananas."
      },
      {
        step_number: 5,
        title: "Repeat & top",
        detail:
          "Repeat the layers with more Nilla Wafers, bananas, and the remaining pudding mixture, then spread the remaining whipped cream evenly over the top. Garnish with crushed wafers, whole wafers, caramel sauce, or additional banana slices if desired."
      },
      {
        step_number: 6,
        title: "Chill & serve",
        detail:
          "Cover and refrigerate for at least 4 hours, preferably overnight, before serving."
      }
    ]
  },

  {
    recipe_id: "smores-protein-ice-cream-bars",
    title: "High-Protein S'mores Ice Cream Bars",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍫",
    tags: ["High-Protein", "No-Bake", "Frozen"],
    dish_category: "Desserts",
    description:
      "Frozen Greek yogurt and Cool Whip bars swirled with protein powder over a graham cracker base, finished with a dark chocolate drizzle — a lower-calorie, higher-protein take on s'mores, ready in under 20 minutes of active prep.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 9,
    accent: "#6B4226",

    macro_profiles: {
      serving_9: { calories: 167, protein_g: 12, fat_g: 6, carbs_g: 16 }
    },

    scaling_options: [9],

    ingredients_by_serving: {
      serving_9: [
        { item: "Fat-free Greek yogurt", prep: "", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Whipped topping (Cool Whip)", prep: "light", quantity: "2", unit: "cups", category: "Dairy" },
        { item: "Sweetener", prep: "any", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Protein powder", prep: "French vanilla", quantity: "2", unit: "scoops", category: "Pantry" },
        { item: "Graham cracker squares", prep: "", quantity: "18", unit: "", category: "Pantry" },
        { item: "Dark chocolate chips", prep: "melted", quantity: "1/3", unit: "cup", category: "Pantry" },
        { item: "Coconut oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Prep the pan",
        detail:
          "Line a small baking dish or loaf pan with parchment paper and arrange half of the graham cracker squares in a single layer on the bottom."
      },
      {
        step_number: 2,
        title: "Mix the base",
        detail:
          "In a large bowl, whisk together the Greek yogurt, Cool Whip, sweetener, and protein powder until smooth and well combined."
      },
      {
        step_number: 3,
        title: "Fill the pan",
        detail:
          "Pour half of the yogurt mixture over the graham cracker layer, spreading evenly."
      },
      {
        step_number: 4,
        title: "Add the top layer",
        detail:
          "Arrange the remaining graham cracker squares on top, then pour the remaining yogurt mixture over them and smooth the top."
      },
      {
        step_number: 5,
        title: "Freeze",
        detail:
          "Cover and freeze for at least 4 hours, or until firm."
      },
      {
        step_number: 6,
        title: "Drizzle & cut",
        detail:
          "Melt the dark chocolate chips with the coconut oil and drizzle over the frozen bars. Cut into 9 bars and serve."
      }
    ]
  },

  {
    recipe_id: "chocolate-espresso-protein-ice-cream",
    title: "Chocolate Espresso Protein Ice Cream",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍨",
    tags: ["High-Protein", "No-Bake", "Frozen"],
    dish_category: "Desserts",
    description:
      "A thick, creamy blender ice cream made from Greek yogurt, chocolate protein powder, and instant espresso — a rich mocha treat with none of the added sugar of the scoop-shop version.",
    prep_time_mins: 5,
    cook_time_mins: 0,
    native_serving: 2,
    accent: "#4A2E23",

    macro_profiles: {
      serving_2: { calories: 157, protein_g: 22, fat_g: 2, carbs_g: 7 },
      serving_4: { calories: 157, protein_g: 22, fat_g: 2, carbs_g: 7 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "170", unit: "g", category: "Dairy" },
        { item: "Chocolate protein powder", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Unsweetened almond milk", prep: "", quantity: "120", unit: "ml", category: "Dairy" },
        { item: "Instant espresso powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Sugar-free chocolate pudding mix", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Ice cubes", prep: "", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "340", unit: "g", category: "Dairy" },
        { item: "Chocolate protein powder", prep: "", quantity: "60", unit: "g", category: "Pantry" },
        { item: "Unsweetened almond milk", prep: "", quantity: "240", unit: "ml", category: "Dairy" },
        { item: "Instant espresso powder", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Sugar-free chocolate pudding mix", prep: "", quantity: "20", unit: "g", category: "Pantry" },
        { item: "Ice cubes", prep: "", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Blend",
        detail:
          "Blend all ingredients together until thick and creamy."
      },
      {
        step_number: 2,
        title: "Transfer",
        detail:
          "Transfer the mixture to a container."
      },
      {
        step_number: 3,
        title: "Freeze",
        detail:
          "Freeze for 20 to 30 minutes for a firmer, scoopable texture."
      },
      {
        step_number: 4,
        title: "Scoop & serve",
        detail:
          "Scoop and serve."
      }
    ]
  },

  {
    recipe_id: "strawberry-shortcake-protein-mousse",
    title: "Strawberry Shortcake Protein Mousse",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍓",
    tags: ["High-Protein", "No-Bake", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A quick no-bake mousse swirling Greek yogurt, vanilla protein powder, and fresh strawberries, finished with a dusting of graham cracker crumbs for that shortcake crunch.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 2,
    accent: "#D67E8C",

    macro_profiles: {
      serving_2: { calories: 149, protein_g: 19, fat_g: 1, carbs_g: 11 },
      serving_4: { calories: 149, protein_g: 19, fat_g: 1, carbs_g: 11 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "170", unit: "g", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "25", unit: "g", category: "Pantry" },
        { item: "Strawberries", prep: "diced, divided", quantity: "100", unit: "g", category: "Produce" },
        { item: "Graham crackers", prep: "crushed", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "10", unit: "g", category: "Pantry" }
      ],
      serving_4: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "340", unit: "g", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "50", unit: "g", category: "Pantry" },
        { item: "Strawberries", prep: "diced, divided", quantity: "200", unit: "g", category: "Produce" },
        { item: "Graham crackers", prep: "crushed", quantity: "16", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "20", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the base",
        detail:
          "Mix the Greek yogurt, protein powder, and maple syrup until smooth."
      },
      {
        step_number: 2,
        title: "Fold in strawberries",
        detail:
          "Fold in half of the diced strawberries."
      },
      {
        step_number: 3,
        title: "Divide & top",
        detail:
          "Divide into serving cups and top with the remaining strawberries and graham cracker crumbs."
      },
      {
        step_number: 4,
        title: "Chill & serve",
        detail:
          "Chill for 20 minutes before serving."
      }
    ]
  },

  {
    recipe_id: "chocolate-coconut-protein-truffles",
    title: "Chocolate Coconut Protein Truffles",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍫",
    tags: ["High-Protein", "No-Bake", "Bite-Size"],
    dish_category: "Desserts",
    description:
      "No-bake truffles made from chocolate protein powder, Greek yogurt, cocoa, and shredded coconut, rolled with dark chocolate chips — a rich bite-size treat that chills up firm enough to hold its shape.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#5C3A21",

    macro_profiles: {
      serving_4: { calories: 83, protein_g: 9, fat_g: 3, carbs_g: 5 },
      serving_2: { calories: 83, protein_g: 9, fat_g: 3, carbs_g: 5 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Chocolate protein powder", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "80", unit: "g", category: "Dairy" },
        { item: "Unsweetened shredded coconut", prep: "", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Cocoa powder", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Dark chocolate chips", prep: "finely chopped", quantity: "10", unit: "g", category: "Pantry" }
      ],
      serving_2: [
        { item: "Chocolate protein powder", prep: "", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "40", unit: "g", category: "Dairy" },
        { item: "Unsweetened shredded coconut", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Cocoa powder", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Dark chocolate chips", prep: "finely chopped", quantity: "5", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Combine",
        detail:
          "Combine all ingredients in a bowl."
      },
      {
        step_number: 2,
        title: "Chill",
        detail:
          "Refrigerate for 15 minutes."
      },
      {
        step_number: 3,
        title: "Roll",
        detail:
          "Roll into 8 equal truffles."
      },
      {
        step_number: 4,
        title: "Chill again & serve",
        detail:
          "Chill for another 30 minutes before serving."
      }
    ]
  },

  {
    recipe_id: "apple-pie-protein-parfait",
    title: "Apple Pie Protein Parfait",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍎",
    tags: ["High-Protein", "Make-Ahead", "Layered"],
    dish_category: "Desserts",
    description:
      "Cinnamon-stewed apples layered over a vanilla Greek yogurt protein base and topped with oats — a warm-spiced parfait that tastes like apple pie in a glass.",
    prep_time_mins: 10,
    cook_time_mins: 5,
    native_serving: 2,
    accent: "#C1793A",

    macro_profiles: {
      serving_2: { calories: 176, protein_g: 21, fat_g: 2, carbs_g: 16 },
      serving_4: { calories: 176, protein_g: 21, fat_g: 2, carbs_g: 16 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "170", unit: "g", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Apple", prep: "diced", quantity: "100", unit: "g", category: "Produce" },
        { item: "Cinnamon", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Quick oats", prep: "", quantity: "15", unit: "g", category: "Pantry" }
      ],
      serving_4: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "340", unit: "g", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "60", unit: "g", category: "Pantry" },
        { item: "Apple", prep: "diced", quantity: "200", unit: "g", category: "Produce" },
        { item: "Cinnamon", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "20", unit: "g", category: "Pantry" },
        { item: "Quick oats", prep: "", quantity: "30", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the apple",
        detail:
          "Cook the diced apple with cinnamon and maple syrup in a pan for 4 to 5 minutes, until softened."
      },
      {
        step_number: 2,
        title: "Mix the yogurt base",
        detail:
          "Mix the Greek yogurt and protein powder in a bowl."
      },
      {
        step_number: 3,
        title: "Layer",
        detail:
          "Layer the yogurt mixture and cooked apples into serving glasses."
      },
      {
        step_number: 4,
        title: "Top & serve",
        detail:
          "Top with oats and serve."
      }
    ]
  },

  {
    recipe_id: "chocolate-peanut-butter-cheesecake-cups",
    title: "Chocolate Peanut Butter Cheesecake Cups",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥜",
    tags: ["High-Protein", "No-Bake", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A rich no-bake cheesecake cup blending Greek yogurt, light cream cheese, chocolate protein powder, and powdered peanut butter, studded with mini chocolate chips.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 2,
    accent: "#8B5A2B",

    macro_profiles: {
      serving_2: { calories: 184, protein_g: 23, fat_g: 6, carbs_g: 9 },
      serving_4: { calories: 184, protein_g: 23, fat_g: 6, carbs_g: 9 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "170", unit: "g", category: "Dairy" },
        { item: "Light cream cheese", prep: "", quantity: "80", unit: "g", category: "Dairy" },
        { item: "Chocolate protein powder", prep: "", quantity: "25", unit: "g", category: "Pantry" },
        { item: "Powdered peanut butter", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Mini chocolate chips", prep: "", quantity: "5", unit: "g", category: "Pantry" }
      ],
      serving_4: [
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "340", unit: "g", category: "Dairy" },
        { item: "Light cream cheese", prep: "", quantity: "160", unit: "g", category: "Dairy" },
        { item: "Chocolate protein powder", prep: "", quantity: "50", unit: "g", category: "Pantry" },
        { item: "Powdered peanut butter", prep: "", quantity: "20", unit: "g", category: "Pantry" },
        { item: "Sugar-free maple syrup", prep: "", quantity: "20", unit: "g", category: "Pantry" },
        { item: "Mini chocolate chips", prep: "", quantity: "10", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the base",
        detail:
          "Mix the Greek yogurt and cream cheese until smooth."
      },
      {
        step_number: 2,
        title: "Add flavor",
        detail:
          "Add the protein powder, powdered peanut butter, and maple syrup. Stir until fully combined."
      },
      {
        step_number: 3,
        title: "Fold in chips",
        detail:
          "Fold in the mini chocolate chips."
      },
      {
        step_number: 4,
        title: "Divide & chill",
        detail:
          "Divide into serving cups and chill for 30 minutes before serving."
      }
    ]
  },

  {
    recipe_id: "vanilla-cake-batter-protein-popsicles",
    title: "Vanilla Cake Batter Protein Popsicles",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍭",
    tags: ["High-Protein", "No-Bake", "Frozen"],
    dish_category: "Desserts",
    description:
      "Birthday-cake-flavored popsicles made from Greek yogurt, vanilla protein powder, and rainbow sprinkles, finished with a melted white chocolate drizzle — a make-ahead freezer treat with real protein folded in.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 6,
    accent: "#D98FC0",

    macro_profiles: {
      serving_6: { calories: 120, protein_g: 12, fat_g: 3, carbs_g: 9 }
    },

    scaling_options: [6],

    ingredients_by_serving: {
      serving_6: [
        { item: "Plain Greek yogurt", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Milk of choice", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "2", unit: "scoops", category: "Pantry" },
        { item: "Sugar-free vanilla pudding mix", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Rainbow sprinkles", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "White chocolate chips", prep: "melted, to drizzle", quantity: "2", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Whisk the base",
        detail:
          "Whisk the Greek yogurt, milk, protein powder, pudding mix, and vanilla together until completely smooth and pourable."
      },
      {
        step_number: 2,
        title: "Let it thicken",
        detail:
          "Let the mix sit for a couple of minutes so the pudding starts to thicken it slightly, which helps the sprinkles stay suspended."
      },
      {
        step_number: 3,
        title: "Stir in sprinkles",
        detail:
          "Stir in the rainbow sprinkles quickly, working fast so the colors do not bleed into the batter."
      },
      {
        step_number: 4,
        title: "Fill the molds",
        detail:
          "Pour the mixture into popsicle molds and tap them on the counter to knock out any air bubbles."
      },
      {
        step_number: 5,
        title: "Freeze",
        detail:
          "Push in the sticks and freeze overnight until solid all the way through."
      },
      {
        step_number: 6,
        title: "Release & drizzle",
        detail:
          "Run the molds under warm water to release the pops, then drizzle with the melted white chocolate right before serving."
      }
    ]
  },

  {
    recipe_id: "pistachio-chocolate-dipped-yogurt-bars",
    title: "Pistachio Chocolate-Dipped Yogurt Bars",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍫",
    tags: ["High-Protein", "No-Bake", "Frozen"],
    dish_category: "Desserts",
    description:
      "Frozen Greek yogurt bars dipped in a dark chocolate shell and finished with warmed pistachio butter and chopped pistachios — a snappy, creamy freezer treat ready whenever the craving hits.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#7C9A4E",

    macro_profiles: {
      serving_2: { calories: 210, protein_g: 9, fat_g: 11, carbs_g: 19 },
      serving_4: { calories: 210, protein_g: 9, fat_g: 11, carbs_g: 19 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Plain Greek yogurt", prep: "", quantity: "3/4", unit: "cup", category: "Dairy" },
        { item: "Honey or maple syrup", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Dark chocolate chips", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Coconut oil", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Shelled pistachios", prep: "chopped", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Pistachio butter", prep: "for drizzling", quantity: "1/2", unit: "tbsp", category: "Pantry" }
      ],
      serving_4: [
        { item: "Plain Greek yogurt", prep: "", quantity: "1 1/2", unit: "cups", category: "Dairy" },
        { item: "Honey or maple syrup", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Dark chocolate chips", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Coconut oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Shelled pistachios", prep: "chopped", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Pistachio butter", prep: "for drizzling", quantity: "1", unit: "tbsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Fill the molds",
        detail:
          "Stir the Greek yogurt, honey, and vanilla together until smooth, then spoon it into popsicle bar molds and freeze overnight until solid."
      },
      {
        step_number: 2,
        title: "Melt the chocolate",
        detail:
          "Melt the chocolate chips with the coconut oil in short bursts, stirring between each one, until it pours in a smooth ribbon."
      },
      {
        step_number: 3,
        title: "Dip the bars",
        detail:
          "Pop the bars out of the molds and dip or spoon the chocolate over each one, letting it set on contact with the frozen yogurt."
      },
      {
        step_number: 4,
        title: "Finish & freeze",
        detail:
          "Drizzle with the warmed pistachio butter, scatter the chopped pistachios over the top, and return to the freezer until ready to eat."
      }
    ]
  },

  {
    recipe_id: "passionfruit-mango-cheesecake-cups",
    title: "Passionfruit & Mango Cheesecake Cups",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥭",
    tags: ["No-Bake", "Make-Ahead", "Layered"],
    dish_category: "Desserts",
    description:
      "A no-bake cheesecake cup with a graham cracker crust, a mango-swirled cream cheese and Greek yogurt filling, and a glossy layer of fresh passionfruit pulp — a cool, tropical treat that needs no oven.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 2,
    accent: "#EFA24A",

    macro_profiles: {
      serving_2: { calories: 290, protein_g: 8, fat_g: 15, carbs_g: 32 },
      serving_4: { calories: 290, protein_g: 8, fat_g: 15, carbs_g: 32 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Graham cracker crumbs", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Butter", prep: "melted", quantity: "1", unit: "tbsp", category: "Dairy" },
        { item: "Cream cheese", prep: "softened", quantity: "4", unit: "oz", category: "Dairy" },
        { item: "Plain Greek yogurt", prep: "", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Powdered sugar", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Mango puree", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Fresh passionfruit", prep: "pulp scooped", quantity: "2", unit: "", category: "Produce" },
        { item: "Mango", prep: "diced, to top", quantity: "1/4", unit: "cup", category: "Produce" }
      ],
      serving_4: [
        { item: "Graham cracker crumbs", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Butter", prep: "melted", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Cream cheese", prep: "softened", quantity: "8", unit: "oz", category: "Dairy" },
        { item: "Plain Greek yogurt", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Powdered sugar", prep: "", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Mango puree", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Fresh passionfruit", prep: "pulp scooped", quantity: "4", unit: "", category: "Produce" },
        { item: "Mango", prep: "diced, to top", quantity: "1/2", unit: "cup", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Press the crust",
        detail:
          "Stir the graham crumbs and melted butter together until they look like wet sand, then press them firmly into the bottom of small serving glasses."
      },
      {
        step_number: 2,
        title: "Beat the filling",
        detail:
          "Beat the cream cheese, Greek yogurt, powdered sugar, and vanilla until completely smooth with no lumps hiding in there."
      },
      {
        step_number: 3,
        title: "Fold & spoon",
        detail:
          "Fold the mango puree through the cream until the whole thing turns a soft sunset yellow, then spoon it over the bases."
      },
      {
        step_number: 4,
        title: "Top with passionfruit",
        detail:
          "Tap each glass gently on the counter so the filling settles flat, then spoon the passionfruit pulp over the top in a glossy layer."
      },
      {
        step_number: 5,
        title: "Chill & finish",
        detail:
          "Chill for at least 2 hours so it sets, then finish with the diced mango right before you serve."
      }
    ]
  },

  {
    recipe_id: "dark-chocolate-peanut-butter-freezer-bark",
    title: "Dark Chocolate Peanut Butter Freezer Bark",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍫",
    tags: ["High-Protein", "No-Bake", "Frozen"],
    dish_category: "Desserts",
    description:
      "A protein-rich peanut butter and oat base topped with melted dark chocolate and flaky sea salt, frozen and sliced into bark squares — a satisfying make-ahead treat for the freezer.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#3C2A1E",

    macro_profiles: {
      serving_2: { calories: 310, protein_g: 14, fat_g: 18, carbs_g: 24 },
      serving_4: { calories: 310, protein_g: 14, fat_g: 18, carbs_g: 24 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Natural peanut butter", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Rolled oats", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Peanuts", prep: "chopped", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Vanilla protein powder", prep: "", quantity: "1/2", unit: "scoop", category: "Pantry" },
        { item: "Honey or maple syrup", prep: "", quantity: "1/2", unit: "tbsp", category: "Pantry" },
        { item: "Dark chocolate (85%)", prep: "melted", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Coconut oil", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Flaky sea salt", prep: "to finish", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Natural peanut butter", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Rolled oats", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Peanuts", prep: "chopped", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Vanilla protein powder", prep: "", quantity: "1", unit: "scoop", category: "Pantry" },
        { item: "Honey or maple syrup", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Dark chocolate (85%)", prep: "melted", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Coconut oil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Flaky sea salt", prep: "to finish", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the base",
        detail:
          "Stir the peanut butter, oats, chopped peanuts, protein powder, and honey together until thick and sticky."
      },
      {
        step_number: 2,
        title: "Press and layer",
        detail:
          "Press the mixture firmly into a parchment-lined tin in an even layer."
      },
      {
        step_number: 3,
        title: "Top with chocolate",
        detail:
          "Melt the dark chocolate with the coconut oil and pour it over the base, spreading to the edges."
      },
      {
        step_number: 4,
        title: "Freeze and cut",
        detail:
          "Sprinkle with flaky salt, freeze until firm, then slice into squares."
      }
    ]
  },

  {
    recipe_id: "blackberry-pistachio-protein-pot",
    title: "Blackberry Pistachio Protein Pot",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🫐",
    tags: ["High-Protein", "Make-Ahead", "Layered"],
    dish_category: "Desserts",
    description:
      "A layered single-serving pot of soaked oats, jammy blackberry compote, and a whipped Greek yogurt protein base, topped with crushed pistachios, fresh mint, and blackberries.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#5C3A6E",

    macro_profiles: {
      serving_1: { calories: 440, protein_g: 38, fat_g: 15, carbs_g: 40 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Rolled oats", prep: "", quantity: "1/3", unit: "cup", category: "Pantry" },
        { item: "Milk", prep: "dairy or unsweetened almond", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Greek yogurt or Skyr", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Light cream cheese", prep: "", quantity: "1", unit: "tbsp", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "1", unit: "scoop", category: "Pantry" },
        { item: "Blackberries", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Chia seeds", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Honey", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "1/4", unit: "tsp", category: "Pantry" },
        { item: "Crushed pistachios", prep: "", quantity: "1 1/2", unit: "tbsp", category: "Pantry" },
        { item: "Fresh mint and a few blackberries", prep: "to garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Soak the oats",
        detail:
          "Stir the oats, milk, chia seeds, and vanilla together. Chill until thick and creamy (overnight is best, 30 minutes minimum)."
      },
      {
        step_number: 2,
        title: "Whip the base",
        detail:
          "Beat the Greek yogurt, cream cheese, protein powder, and honey together until thick and smooth."
      },
      {
        step_number: 3,
        title: "Make the compote",
        detail:
          "Mash the blackberries and let them sit 10 minutes until thickened and jammy."
      },
      {
        step_number: 4,
        title: "Layer it up",
        detail:
          "Spoon the soaked oats into a glass, then the blackberry compote, then the whipped protein base, and finish with the crushed pistachios."
      },
      {
        step_number: 5,
        title: "Garnish",
        detail:
          "Finish with a few fresh blackberries and a sprig of mint."
      }
    ]
  },

  {
    recipe_id: "pb-berry-yogurt-crunch-bowl",
    title: "PB Berry Yogurt Crunch Bowl",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥣",
    tags: ["High-Protein", "No-Bake", "Quick"],
    dish_category: "Desserts",
    description:
      "A layered Greek yogurt bowl with crunchy granola, fresh blueberries and raspberries, a warm peanut butter drizzle, and dark chocolate chunks — a fast, balanced sweet snack with protein, fiber, and healthy fats.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#B5786B",

    macro_profiles: {
      serving_1: { calories: 410, protein_g: 27, fat_g: 18, carbs_g: 32 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Greek yogurt", prep: "", quantity: "3/4", unit: "cup", category: "Dairy" },
        { item: "Granola", prep: "", quantity: "1/3", unit: "cup", category: "Pantry" },
        { item: "Peanut butter", prep: "warmed slightly", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Blueberries", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Raspberries", prep: "", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Dark chocolate chunks", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Cinnamon", prep: "", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Build the yogurt base",
        detail:
          "Spoon the Greek yogurt into a bowl and smooth it evenly."
      },
      {
        step_number: 2,
        title: "Add crunch",
        detail:
          "Scatter the granola generously over the yogurt."
      },
      {
        step_number: 3,
        title: "Layer the fruit",
        detail:
          "Add the blueberries and raspberries evenly across the bowl."
      },
      {
        step_number: 4,
        title: "Drizzle peanut butter",
        detail:
          "Warm the peanut butter slightly before drizzling so it spreads beautifully."
      },
      {
        step_number: 5,
        title: "Finish the bowl",
        detail:
          "Top with the dark chocolate chunks and a dusting of cinnamon."
      }
    ]
  },

  {
    recipe_id: "dark-chocolate-pistachio-protein-pot",
    title: "Dark Chocolate Pistachio Protein Pot",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍫",
    tags: ["High-Protein", "No-Bake", "Quick"],
    dish_category: "Desserts",
    description:
      "A two-layer Greek yogurt pot — vanilla-honey on the bottom, cocoa swirled on top — finished with chopped pistachios. Tastes like a chocolate dessert but is mostly high-protein yogurt.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#5A4632",

    macro_profiles: {
      serving_1: { calories: 280, protein_g: 28, fat_g: 9, carbs_g: 22 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Greek yogurt", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Vanilla protein powder", prep: "", quantity: "1", unit: "scoop", category: "Pantry" },
        { item: "Cocoa powder", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Honey or maple syrup", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Pistachios", prep: "chopped", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Milk", prep: "splash, to loosen", quantity: "", unit: "", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Whisk the vanilla layer",
        detail:
          "Whisk half the yogurt with the protein powder and honey until smooth and thick, loosening with a splash of milk if needed."
      },
      {
        step_number: 2,
        title: "Make the chocolate layer",
        detail:
          "Stir the cocoa into the other half of the yogurt to make the chocolate layer."
      },
      {
        step_number: 3,
        title: "Layer the base",
        detail:
          "Spoon the vanilla layer into a pot or glass as the base."
      },
      {
        step_number: 4,
        title: "Add the chocolate layer",
        detail:
          "Spoon the chocolate layer over the top and smooth it flat."
      },
      {
        step_number: 5,
        title: "Top & chill",
        detail:
          "Scatter the chopped pistachios across the surface and chill until ready to eat."
      }
    ]
  },

  {
    recipe_id: "crispy-apple-pie-turnovers",
    title: "Crispy Apple Pie Turnovers",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥟",
    tags: ["High-Protein", "Air Fryer", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "Air-fried low-carb tortilla pockets stuffed with cinnamon apple pie filling and finished with a protein icing drizzle — a crisp, portable take on apple turnovers made in the air fryer.",
    prep_time_mins: 15,
    cook_time_mins: 5,
    native_serving: 8,
    accent: "#9C5A28",

    macro_profiles: {
      serving_8: { calories: 86, protein_g: 2, fat_g: 2, carbs_g: 15 }
    },

    scaling_options: [8],

    ingredients_by_serving: {
      serving_8: [
        { item: "No sugar added apple pie filling", prep: "", quantity: "1", unit: "can", category: "Pantry" },
        { item: "Low-carb tortillas", prep: "", quantity: "4", unit: "", category: "Pantry" },
        { item: "Ground cinnamon", prep: "", quantity: "", unit: "", category: "Pantry" },
        { item: "Cinnamon", prep: "for the brown sugar topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "for the brown sugar topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Vanilla whey/casein protein powder", prep: "for the icing", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Powdered sugar", prep: "for the icing", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "for the icing", quantity: "4", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Prep the filling",
        detail:
          "Add the apple pie filling and cinnamon to a bowl. Use a knife to cut the apples into smaller pieces."
      },
      {
        step_number: 2,
        title: "Cut the tortillas",
        detail:
          "Cut each tortilla in half to form 8 cone-shaped pockets."
      },
      {
        step_number: 3,
        title: "Fill the pockets",
        detail:
          "Add 1/8 of the pie filling to each tortilla cone. Repeat for all 8 pockets."
      },
      {
        step_number: 4,
        title: "Air fry",
        detail:
          "Spray both sides with non-stick cooking spray and air fry at 400°F for 3 to 5 minutes until golden."
      },
      {
        step_number: 5,
        title: "Make the icing & finish",
        detail:
          "Make the protein icing by mixing the dry ingredients, then slowly add cold water until it reaches icing consistency. If too thin, refrigerate to thicken, then drizzle over the turnovers and enjoy."
      }
    ]
  },

  {
    recipe_id: "reeses-uncrustable-protein-pop-tarts",
    title: "Reese's Uncrustable Protein Pop Tarts",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥧",
    tags: ["High-Protein", "Air Fryer", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "Low-calorie bread sealed around a protein peanut butter filling, air-fried until golden, then topped with chocolate protein frosting, mini Reese's cups, and crushed Reese's Puffs.",
    prep_time_mins: 20,
    cook_time_mins: 5,
    native_serving: 4,
    accent: "#6E4A2E",

    macro_profiles: {
      serving_4: { calories: 270, protein_g: 23, fat_g: 6, carbs_g: 31 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Low-calorie bread of choice", prep: "", quantity: "8", unit: "slices", category: "Pantry" },
        { item: "Egg whites", prep: "for sealing", quantity: "50", unit: "g", category: "Dairy" },
        { item: "Vanilla whey/casein protein powder", prep: "for the PB filling", quantity: "45", unit: "g", category: "Pantry" },
        { item: "Powdered peanut butter", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Chocolate whey/casein protein powder", prep: "for the frosting", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Unsweetened baking cocoa", prep: "for the frosting", quantity: "20", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "", quantity: "", unit: "", category: "Pantry" },
        { item: "Mini Reese's cups", prep: "for topping", quantity: "", unit: "", category: "Pantry" },
        { item: "Reese's Puffs cereal", prep: "crushed, for topping", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the PB filling",
        detail:
          "Mix the vanilla protein powder, powdered peanut butter, sweetener, and salt. Slowly add cold water until thick, then place in the fridge to chill."
      },
      {
        step_number: 2,
        title: "Make the chocolate frosting",
        detail:
          "Mix the chocolate protein powder and cocoa the same way — add cold water until thick and smooth, then place in the fridge."
      },
      {
        step_number: 3,
        title: "Fill the first side",
        detail:
          "Lay one slice of bread flat and brush egg whites around the edges. Add 1/4 of the PB filling to the center."
      },
      {
        step_number: 4,
        title: "Seal",
        detail:
          "Take a second slice, brush egg whites on the bottom edges, place on top, then brush the top edges and press down firmly to seal."
      },
      {
        step_number: 5,
        title: "Trim & repeat",
        detail:
          "Trim the crusts and crimp the edges with a fork. Repeat for all 4 pop tarts."
      },
      {
        step_number: 6,
        title: "Air fry",
        detail:
          "Air fry at 400°F for 4 to 5 minutes, spraying the tops lightly and flipping once golden."
      },
      {
        step_number: 7,
        title: "Top & serve",
        detail:
          "Top with the chocolate frosting, mini Reese's cups, and crushed Reese's Puffs. Enjoy."
      }
    ]
  },

  {
    recipe_id: "oreo-cookies-and-cream-protein-ice-cream",
    title: "Oreo Cookies & Cream Protein Ice Cream",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍪",
    tags: ["High-Protein", "Frozen", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A blended vanilla protein base spun into soft-serve texture in a Creami-style ice cream maker, then mixed with crushed Oreo Thins for an oversized single-pint cookies-and-cream treat.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#4A4A52",

    macro_profiles: {
      serving_1: { calories: 390, protein_g: 37, fat_g: 10, carbs_g: 38 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Fat-free milk", prep: "", quantity: "225", unit: "g", category: "Dairy" },
        { item: "Unsweetened vanilla almond milk", prep: "", quantity: "225", unit: "g", category: "Dairy" },
        { item: "Vanilla whey/casein protein powder", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Sugar-free white chocolate pudding mix", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Oreo Thins", prep: "for mix-in", quantity: "4", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Blend the base",
        detail:
          "Add all ingredients except the Oreos into your ice cream maker pint. Use a small hand blender and mix until completely smooth, with no clumps at the bottom or sides."
      },
      {
        step_number: 2,
        title: "Freeze solid",
        detail:
          "Add the pint to the freezer and freeze until completely solid — overnight works well."
      },
      {
        step_number: 3,
        title: "Spin",
        detail:
          "Once frozen solid, process the pint on the machine's \"Lite Ice Cream\" function. One spin is usually enough to get it nice and creamy."
      },
      {
        step_number: 4,
        title: "Add the mix-in",
        detail:
          "Use a spoon to make a hole down the center of the ice cream and add the Oreo Thins so they get evenly distributed."
      },
      {
        step_number: 5,
        title: "Mix in & serve",
        detail:
          "Process the pint again on the \"Mix-In\" function to break everything up and mix it throughout, then it's ready to enjoy."
      }
    ]
  },

  {
    recipe_id: "fruity-pebbles-protein-cheesecake-frosting",
    title: "Fruity Pebbles Protein Cheesecake Frosting",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🌈",
    tags: ["High-Protein", "No-Bake", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A blended cream cheese and Greek yogurt frosting swirled with crushed Fruity Pebbles — a spoonable, spreadable protein topping that thickens up overnight in the fridge.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 16,
    accent: "#8E6BC9",

    macro_profiles: {
      serving_16: { calories: 40, protein_g: 5, fat_g: 0.25, carbs_g: 4 }
    },

    scaling_options: [16],

    ingredients_by_serving: {
      serving_16: [
        { item: "Fat-free cream cheese", prep: "", quantity: "220", unit: "g", category: "Dairy" },
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "227", unit: "g", category: "Dairy" },
        { item: "Vanilla whey/casein blend protein powder", prep: "", quantity: "60", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Fruity Pebbles cereal", prep: "crushed", quantity: "56", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Blend the base",
        detail:
          "Add the cream cheese, Greek yogurt, protein powder, and sweetener into a blender and blend until everything is completely smooth — take your time so it comes out creamy and thick with no chunks or graininess."
      },
      {
        step_number: 2,
        title: "Crush the cereal",
        detail:
          "Grab the Fruity Pebbles and crush them into smaller pieces in a ziplock bag with your hands or a rolling pin — smaller pieces give better texture and little pops of crunch."
      },
      {
        step_number: 3,
        title: "Mix it in",
        detail:
          "Mix the crushed cereal into the frosting and stir it through so it's evenly distributed in every bite."
      },
      {
        step_number: 4,
        title: "Chill",
        detail:
          "Pour the mixture into jars or containers, smooth out the top, and seal them up. Place in the fridge overnight so everything sets and thickens properly."
      },
      {
        step_number: 5,
        title: "Serve",
        detail:
          "By the next day it'll be thicker, colder, and way better texture-wise. Grab a spoon and enjoy."
      }
    ]
  },

  {
    recipe_id: "nutter-butter-protein-dessert-cups",
    title: "Nutter Butter Protein Dessert Cups",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥜",
    tags: ["High-Protein", "No-Bake", "Layered"],
    dish_category: "Desserts",
    description:
      "Layered cups of peanut butter protein pudding and crushed Nutter Butter cookies — a quick, chilled dessert that doubles easily for a week of meal prep.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 3,
    accent: "#B8895C",

    macro_profiles: {
      serving_3: { calories: 167, protein_g: 8, fat_g: 3.5, carbs_g: 16 }
    },

    scaling_options: [3],

    ingredients_by_serving: {
      serving_3: [
        { item: "Vanilla whey/casein blend protein powder", prep: "", quantity: "40", unit: "g", category: "Pantry" },
        { item: "Powdered peanut butter", prep: "", quantity: "20", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "12", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "6", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "big pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "150", unit: "g", category: "Dairy" },
        { item: "Nutter Butter cookies", prep: "cream removed, crushed", quantity: "3", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the dry base",
        detail:
          "Add the protein powder, powdered peanut butter, pudding mix, sweetener, and sea salt into a bowl and mix thoroughly so everything is evenly combined with no clumps."
      },
      {
        step_number: 2,
        title: "Add water",
        detail:
          "Slowly add cold water a little at a time while mixing, until you reach a smooth, icing-like consistency."
      },
      {
        step_number: 3,
        title: "Add the yogurt",
        detail:
          "Add in the Greek yogurt and mix it all together until it thickens up into a creamy, pudding-like texture."
      },
      {
        step_number: 4,
        title: "Crush the cookies",
        detail:
          "Take the cream out of the Nutter Butters and toss the cookie pieces into a ziplock bag. Crush them up into small chunks, some fine, some a little bigger for texture."
      },
      {
        step_number: 5,
        title: "Layer",
        detail:
          "Add a layer of the PB protein pudding, then a layer of crushed cookies. Repeat for about 3 layers per cup."
      },
      {
        step_number: 6,
        title: "Chill & serve",
        detail:
          "Pop the cups in the fridge for a bit to chill and thicken, then they're good to go."
      }
    ]
  },

  {
    recipe_id: "protein-chocolate-chip-cookie-dough",
    title: "Protein Chocolate Chip Cookie Dough",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍪",
    tags: ["High-Protein", "No-Bake", "Quick"],
    dish_category: "Desserts",
    description:
      "An edible, no-bake cookie dough whipped from vegan protein powder and powdered peanut butter, loaded with mini chocolate chips, cacao nibs, and marshmallow bits, then chilled to a scoopable texture.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#A9793F",

    macro_profiles: {
      serving_1: { calories: 431, protein_g: 41, fat_g: 13, carbs_g: 38 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Vegan vanilla protein powder", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Powdered peanut butter", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Ground cinnamon", prep: "dash", quantity: "", unit: "", category: "Pantry" },
        { item: "Cookie butter emulsion", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Mini chocolate chips", prep: "", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Cacao nibs", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Marshmallow bits", prep: "", quantity: "5", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the dry ingredients",
        detail:
          "Add all the dry powdered ingredients into a bowl and mix thoroughly so everything is evenly combined and you don't get any clumping."
      },
      {
        step_number: 2,
        title: "Add water",
        detail:
          "Slowly add cold water a little at a time while mixing. Keep stirring until you reach a thick, smooth, frosting-like consistency."
      },
      {
        step_number: 3,
        title: "Stir in the mix-ins",
        detail:
          "Once the base is ready, stir in the chocolate chips and cacao nibs, but leave out the marshmallow bits for now since they'll get soggy if added too early."
      },
      {
        step_number: 4,
        title: "Chill",
        detail:
          "Place the bowl in the freezer for about an hour, or until the edges start to firm up. This helps thicken the dough and gives it a better texture."
      },
      {
        step_number: 5,
        title: "Finish & serve",
        detail:
          "Take it out of the freezer, add in the marshmallow bits, and give it one final mix. Then it's ready to go."
      }
    ]
  },

  {
    recipe_id: "strawberry-shortcake-ice-cream-bars",
    title: "Strawberry Shortcake Ice Cream Bars",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍓",
    tags: ["High-Protein", "Frozen", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "Frozen strawberry protein bars folded with Cool Whip and freeze-dried strawberries, coated in a crushed golden Oreo and freeze-dried strawberry shortcake crumb — a fruity, creamy freezer treat.",
    prep_time_mins: 20,
    cook_time_mins: 0,
    native_serving: 10,
    accent: "#D97A6B",

    macro_profiles: {
      serving_10: { calories: 94, protein_g: 5.5, fat_g: 1.5, carbs_g: 16.5 }
    },

    scaling_options: [10],

    ingredients_by_serving: {
      serving_10: [
        { item: "Fresh strawberries", prep: "diced", quantity: "200", unit: "g", category: "Produce" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "big pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Vanilla whey/casein blend protein powder", prep: "", quantity: "60", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "4", unit: "g", category: "Pantry" },
        { item: "Strawberry emulsion", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Fat-free Cool Whip", prep: "frozen", quantity: "1", unit: "container (~215g)", category: "Dairy" },
        { item: "Freeze-dried strawberries", prep: "crushed, for the bars", quantity: "10", unit: "g", category: "Produce" },
        { item: "Golden Oreo Thins", prep: "cream removed, crushed, for coating", quantity: "8", unit: "", category: "Pantry" },
        { item: "Freeze-dried strawberries", prep: "crushed, for coating", quantity: "8", unit: "g", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Macerate the strawberries",
        detail:
          "Dice the fresh strawberries and add them to a bowl with the zero-cal sweetener and a pinch of sea salt. Mix and let sit for about 10 minutes — this pulls out the natural juices so the bars don't get icy."
      },
      {
        step_number: 2,
        title: "Blend",
        detail:
          "Add the strawberries along with all that liquid into a blender. Toss in the protein powder and pudding mix, then blend until smooth."
      },
      {
        step_number: 3,
        title: "Fold in the Cool Whip",
        detail:
          "Pour into a bowl and gently fold in the frozen fat-free Cool Whip. Don't overmix — just combine it."
      },
      {
        step_number: 4,
        title: "Add texture",
        detail:
          "Add the crushed freeze-dried strawberries and mix those in for extra flavor and texture."
      },
      {
        step_number: 5,
        title: "Fill the molds",
        detail:
          "Pour evenly into ice cream bar molds. If you've got extra, pour it into cupcake molds or whatever you have."
      },
      {
        step_number: 6,
        title: "Freeze",
        detail:
          "Freeze for at least 3 to 4 hours until fully set."
      },
      {
        step_number: 7,
        title: "Coat & serve",
        detail:
          "Crush the golden Oreo Thins and freeze-dried strawberries together into fine crumbs. Pop the bars out of the molds and roll each one in the crumb mixture to coat before serving."
      }
    ]
  },

  {
    recipe_id: "cheesecake-stuffed-cosmic-brownie",
    title: "Cheesecake Stuffed Cosmic Brownie",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🌌",
    tags: ["High-Protein", "Air Fryer", "Quick"],
    dish_category: "Desserts",
    description:
      "A single-serving air-fried brownie stuffed with a fat-free cheesecake center, topped with a chocolate protein icing and rainbow candy-coated brownie bits.",
    prep_time_mins: 15,
    cook_time_mins: 8,
    native_serving: 1,
    accent: "#4B3220",

    macro_profiles: {
      serving_1: { calories: 232, protein_g: 14, fat_g: 6, carbs_g: 24 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Oat flour", prep: "for the cake layer", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Unsweetened baking cocoa", prep: "for the cake layer", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Sugar-free chocolate pudding mix", prep: "for the cake layer", quantity: "4", unit: "g", category: "Pantry" },
        { item: "Light brown sugar", prep: "", quantity: "6", unit: "g", category: "Pantry" },
        { item: "Swerve brown sugar", prep: "", quantity: "6", unit: "g", category: "Pantry" },
        { item: "Baking powder", prep: "", quantity: "1", unit: "g", category: "Pantry" },
        { item: "Baking soda", prep: "pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Sea salt", prep: "pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Canned pumpkin", prep: "", quantity: "38", unit: "g", category: "Pantry" },
        { item: "Egg whites", prep: "", quantity: "30", unit: "g", category: "Dairy" },
        { item: "Light butter", prep: "melted", quantity: "5", unit: "g", category: "Dairy" },
        { item: "Vanilla extract", prep: "for the cake layer", quantity: "1", unit: "g", category: "Pantry" },
        { item: "Fat-free cream cheese", prep: "for the cheesecake layer", quantity: "28", unit: "g", category: "Dairy" },
        { item: "Zero-calorie sweetener", prep: "for the cheesecake layer", quantity: "3", unit: "g", category: "Pantry" },
        { item: "Vanilla extract", prep: "for the cheesecake layer", quantity: "1", unit: "g", category: "Pantry" },
        { item: "Cosmic brownie candy bits", prep: "for topping", quantity: "7", unit: "g", category: "Pantry" },
        { item: "Chocolate whey/casein protein powder", prep: "for the icing", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Powdered sugar", prep: "for the icing", quantity: "7", unit: "g", category: "Pantry" },
        { item: "Swerve zero-cal powdered sugar", prep: "for the icing", quantity: "7", unit: "g", category: "Pantry" },
        { item: "Chocolate sugar-free pudding mix", prep: "for the icing", quantity: "2", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the cake layer",
        detail:
          "Mix the dry cake layer ingredients in one bowl to avoid clumping. In another bowl, mix the wet ingredients (pumpkin, egg whites, melted butter, vanilla). Fold the dry into the wet, being careful not to overmix."
      },
      {
        step_number: 2,
        title: "Mix the cheesecake layer",
        detail:
          "Mix the cream cheese layer ingredients until smooth."
      },
      {
        step_number: 3,
        title: "Assemble",
        detail:
          "Add the brownie batter into a 4-inch mini cheesecake pan, then add the cream cheese layer to the middle."
      },
      {
        step_number: 4,
        title: "Air fry",
        detail:
          "Air fry at 320°F for 8 minutes."
      },
      {
        step_number: 5,
        title: "Make the icing",
        detail:
          "While that's cooking, mix the chocolate protein icing ingredients together with cold water — it gets a better consistency the more you mix it."
      },
      {
        step_number: 6,
        title: "Cool, top & serve",
        detail:
          "Once the brownie is done, let it set until the cheesecake pan is cool enough to touch. Take out the brownie, top with the icing and cosmic brownie bits, and enjoy."
      }
    ]
  },

  {
    recipe_id: "frosted-flakes-cereal-milk-protein-ice-cream",
    title: "Frosted Flakes Cereal Milk Protein Ice Cream",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥣",
    tags: ["High-Protein", "Frozen", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A Creami-style protein ice cream made from Frosted Flakes cereal milk, spun to soft-serve texture and mixed with a scoop of the cereal for crunch — a nostalgic cereal-milk treat in a single oversized pint.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#CBA135",

    macro_profiles: {
      serving_1: { calories: 284, protein_g: 36, fat_g: 4, carbs_g: 26 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Fat-free milk", prep: "for the cereal milk", quantity: "240", unit: "g", category: "Dairy" },
        { item: "Unsweetened vanilla almond milk", prep: "", quantity: "240", unit: "g", category: "Dairy" },
        { item: "Frosted Flakes cereal", prep: "for steeping", quantity: "56", unit: "g", category: "Pantry" },
        { item: "Vanilla whey/casein blend protein powder", prep: "", quantity: "40", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Fat-free milk", prep: "to top off the pint", quantity: "100", unit: "g", category: "Dairy" },
        { item: "Frosted Flakes cereal", prep: "for mix-in", quantity: "21", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the cereal milk",
        detail:
          "Add the fat-free milk and almond milk to a bowl with the Frosted Flakes. Mix well and refrigerate for 6 to 7 hours to soak and create the cereal milk. Once done, strain out the cereal to get the cereal milk."
      },
      {
        step_number: 2,
        title: "Mix & freeze",
        detail:
          "Add the extra fat-free milk to the pint to make up for what was absorbed, then add the rest of the dry ingredients. Mix until smooth using a hand milk frother, then freeze until solid — preferably overnight."
      },
      {
        step_number: 3,
        title: "Spin",
        detail:
          "Once frozen, add the pint to your ice cream maker and run the \"Ice Cream\" function once. That's all you need."
      },
      {
        step_number: 4,
        title: "Mix in & serve",
        detail:
          "Make a hole in the middle for the Frosted Flakes mix-ins, add them in, then run the \"Mix-Ins\" function. Top it off and enjoy."
      }
    ]
  },

  {
    recipe_id: "cherry-pie-turnovers",
    title: "Cherry Pie Turnovers",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍒",
    tags: ["High-Protein", "Air Fryer", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "Air-fried low-carb tortilla pockets stuffed with no-sugar-added cherry pie filling and finished with a protein icing drizzle — a crisp, portable turnover made in the air fryer.",
    prep_time_mins: 15,
    cook_time_mins: 5,
    native_serving: 10,
    accent: "#A3324A",

    macro_profiles: {
      serving_10: { calories: 75, protein_g: 3, fat_g: 2, carbs_g: 14 }
    },

    scaling_options: [10],

    ingredients_by_serving: {
      serving_10: [
        { item: "No sugar added cherry pie filling", prep: "", quantity: "1", unit: "can", category: "Pantry" },
        { item: "Low-carb tortillas", prep: "", quantity: "5", unit: "", category: "Pantry" },
        { item: "Vanilla whey/casein protein powder", prep: "for the icing", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Powdered sugar", prep: "for the icing", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "for the icing", quantity: "4", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Prep the filling",
        detail:
          "Add the whole can of cherry pie filling into a bowl."
      },
      {
        step_number: 2,
        title: "Cut the tortillas",
        detail:
          "Cut each tortilla in half to form 10 cone-shaped pockets."
      },
      {
        step_number: 3,
        title: "Fill the pockets",
        detail:
          "Add 1/10th of your pie filling to each tortilla cone. Repeat for all 10 pockets."
      },
      {
        step_number: 4,
        title: "Air fry",
        detail:
          "Once all 10 pockets are made, spray both sides with non-stick cooking spray and air fry at 400°F for 3 to 5 minutes until golden."
      },
      {
        step_number: 5,
        title: "Make the icing & finish",
        detail:
          "Make the protein icing by adding all the dry ingredients into a bowl and mixing, then add cold water and mix until you have an icing. Be careful not to add too much water — it thickens up fast in the fridge. Drizzle over the turnovers and enjoy."
      }
    ]
  },

  {
    recipe_id: "pretzel-milk-toffee-crunch-protein-ice-cream",
    title: "Pretzel Milk Toffee Crunch Protein Ice Cream",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥨",
    tags: ["High-Protein", "Frozen", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A Creami-style protein ice cream steeped from pretzel-infused milk, mixed with dark chocolate chips, toffee bits, and crushed pretzels, then finished with a low-calorie caramel drizzle.",
    prep_time_mins: 20,
    cook_time_mins: 0,
    native_serving: 1,
    accent: "#8C6239",

    macro_profiles: {
      serving_1: { calories: 449, protein_g: 52, fat_g: 10, carbs_g: 35 }
    },

    scaling_options: [1],

    ingredients_by_serving: {
      serving_1: [
        { item: "Unsweetened almond milk", prep: "", quantity: "240", unit: "g", category: "Dairy" },
        { item: "Fat-free milk", prep: "for steeping the pretzels", quantity: "240", unit: "g", category: "Dairy" },
        { item: "Pretzels", prep: "for infusing", quantity: "56", unit: "g", category: "Pantry" },
        { item: "Fat-free milk", prep: "to bring the base to 450g", quantity: "150", unit: "g", category: "Dairy" },
        { item: "Vanilla whey/casein protein powder", prep: "", quantity: "45", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Butter extract", prep: "", quantity: "2", unit: "g", category: "Pantry" },
        { item: "Vanilla extract", prep: "", quantity: "2", unit: "g", category: "Pantry" },
        { item: "Dark chocolate chips", prep: "for mix-in", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Heath toffee bits", prep: "for mix-in", quantity: "7", unit: "g", category: "Pantry" },
        { item: "Pretzels", prep: "crushed, for mix-in", quantity: "7", unit: "g", category: "Pantry" },
        { item: "Sugar-free pancake syrup", prep: "for the caramel", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Biscoff cookie butter", prep: "melted, for the caramel", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Caramel emulsion", prep: "1 drop, for the caramel", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Steep the pretzels",
        detail:
          "Add the almond milk, 240g of fat-free milk, and the pretzels to a container. Press the pretzels into the milk so they're fully submerged, then cover and refrigerate overnight."
      },
      {
        step_number: 2,
        title: "Strain",
        detail:
          "The next day, strain the mixture through a fine mesh strainer or cheesecloth. You should have about 300g of pretzel-infused milk. Discard the soaked pretzels."
      },
      {
        step_number: 3,
        title: "Blend",
        detail:
          "Add 150g more fat-free milk to bring the total milk base to 450g. Add the protein powder, pudding mix, sweetener, butter extract, and vanilla extract. Blend until completely smooth."
      },
      {
        step_number: 4,
        title: "Freeze",
        detail:
          "Pour into a pint and freeze overnight, leaving the lid off to help prevent a hump from forming."
      },
      {
        step_number: 5,
        title: "Spin",
        detail:
          "Spin on the Ice Cream setting. It will look dry and crumbly at first — that's normal and helps create a thicker final texture."
      },
      {
        step_number: 6,
        title: "Mix in",
        detail:
          "Make a small well in the center, add the chocolate chips, toffee bits, and crushed pretzels, then run the Mix-In cycle."
      },
      {
        step_number: 7,
        title: "Drizzle & serve",
        detail:
          "Whisk together the pancake syrup, melted Biscoff, and caramel emulsion, then top with a drizzle of the low-calorie caramel and enjoy."
      }
    ]
  },

  {
    recipe_id: "funfetti-protein-cheesecake-cannolis",
    title: "Funfetti Protein Cheesecake Cannolis",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🎉",
    tags: ["High-Protein", "No-Bake", "Party"],
    dish_category: "Desserts",
    description:
      "Crisp pizzelle shells shaped into cannoli tubes and piped with a whipped cream cheese and Greek yogurt cheesecake filling, finished with sprinkles at each end.",
    prep_time_mins: 30,
    cook_time_mins: 0,
    native_serving: 20,
    accent: "#B85C9E",

    macro_profiles: {
      serving_20: { calories: 57, protein_g: 4, fat_g: 1, carbs_g: 8 }
    },

    scaling_options: [20],

    ingredients_by_serving: {
      serving_20: [
        { item: "Vanilla pizzelles", prep: "", quantity: "20", unit: "", category: "Pantry" },
        { item: "Fat-free cream cheese", prep: "", quantity: "220", unit: "g", category: "Dairy" },
        { item: "Plain non-fat Greek yogurt", prep: "", quantity: "227", unit: "g", category: "Dairy" },
        { item: "Vanilla whey/casein blend protein powder", prep: "", quantity: "60", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Fat-free Cool Whip", prep: "", quantity: "100", unit: "g", category: "Dairy" },
        { item: "Sprinkles", prep: "", quantity: "50", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Blend the filling",
        detail:
          "Add the cream cheese, Greek yogurt, protein powder, pudding mix, and zero-cal sweetener to a small blender. Blend until silky smooth."
      },
      {
        step_number: 2,
        title: "Fold in Cool Whip",
        detail:
          "Add to a bowl and fold in the fat-free Cool Whip."
      },
      {
        step_number: 3,
        title: "Chill",
        detail:
          "Place the mixture in the fridge to cool and thicken up."
      },
      {
        step_number: 4,
        title: "Shape the shells",
        detail:
          "Take one pizzelle at a time and cover each side in a paper towel. Microwave for 20 seconds, then immediately form into a cannoli shape — they harden within seconds. Repeat for all 20."
      },
      {
        step_number: 5,
        title: "Pipe the filling",
        detail:
          "Once the filling has cooled, add it to a ziplock bag, cut the tip, and pipe it into each cannoli shell."
      },
      {
        step_number: 6,
        title: "Chill & garnish",
        detail:
          "Repeat for all 20, then refrigerate for at least an hour to cool. Add sprinkles to the outside ends and enjoy."
      }
    ]
  },

  {
    recipe_id: "cosmic-brownie-ice-cream-bars",
    title: "Cosmic Brownie Ice Cream Bars",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🌌",
    tags: ["High-Protein", "Frozen", "Make-Ahead"],
    dish_category: "Desserts",
    description:
      "A black cocoa protein base folded with Cool Whip, frozen into bars, and coated in crushed Fiber One Brownies and Cosmic Brownie chips for a crunchy, chocolatey shell.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 10,
    accent: "#241812",

    macro_profiles: {
      serving_10: { calories: 123, protein_g: 5.5, fat_g: 3.5, carbs_g: 20 }
    },

    scaling_options: [10],

    ingredients_by_serving: {
      serving_10: [
        { item: "Vanilla whey/casein blend protein powder", prep: "", quantity: "45", unit: "g", category: "Pantry" },
        { item: "Black cocoa powder", prep: "", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Sugar-free cheesecake pudding mix", prep: "", quantity: "8", unit: "g", category: "Pantry" },
        { item: "Zero-calorie sweetener", prep: "", quantity: "5", unit: "g", category: "Pantry" },
        { item: "Sea salt", prep: "big pinch", quantity: "", unit: "", category: "Pantry" },
        { item: "Fat-free Cool Whip", prep: "frozen", quantity: "1", unit: "container (~215g)", category: "Dairy" },
        { item: "Fiber One brownies", prep: "crushed, for coating", quantity: "4", unit: "", category: "Pantry" },
        { item: "Cosmic Brownie chips", prep: "for coating", quantity: "40", unit: "g", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Mix the base",
        detail:
          "Add the dry powdered ingredients into a bowl and mix. Slowly add cold water and mix until you get a runny, icing-like consistency."
      },
      {
        step_number: 2,
        title: "Fold in the Cool Whip",
        detail:
          "Fold in the frozen fat-free Cool Whip, trying not to overmix."
      },
      {
        step_number: 3,
        title: "Fill the molds",
        detail:
          "Evenly divide the mixture into 10 ice cream bar molds. If you run short on molds, use mini cupcake molds for the extra."
      },
      {
        step_number: 4,
        title: "Freeze",
        detail:
          "Add to the freezer until frozen, at least 3 to 4 hours."
      },
      {
        step_number: 5,
        title: "Coat & serve",
        detail:
          "Crush the Fiber One brownies and Cosmic Brownie chips together into a coating. Once the bars are frozen, take them out of the molds and roll each one in the coating before serving."
      }
    ]
  },

  {
    recipe_id: "pesto-chicken-caesar-pasta-salad",
    title: "Pesto Chicken Caesar Pasta Salad",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥗",
    tags: ["Pasta Salad", "Meal-Prep", "Make-Ahead"],
    dish_category: "Salads & Slaws",
    description:
      "A summer-ready pasta salad made with pesto-coated chicken, crisp romaine, toasted panko, Parmesan, fresh basil, pasta, and a creamy pesto Caesar dressing. Garlicky, herby, crunchy, and perfect for entertaining or make-ahead lunches.",
    prep_time_mins: 20,
    cook_time_mins: 15,
    native_serving: 6,
    accent: "#6F8F3E",

    macro_profiles: {
      serving_6: { calories: 610, protein_g: 38, fat_g: 32, carbs_g: 46 }
    },

    scaling_options: [6],

    ingredients_by_serving: {
      serving_6: [
        { item: "Shellbows pasta (or short-cut pasta of choice)", prep: "", quantity: "12", unit: "oz", category: "Pantry" },
        { item: "Boneless, skinless chicken breasts", prep: "thinly sliced into cutlets", quantity: "1", unit: "lb", category: "Meat" },
        { item: "Kosher salt & black pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Extra-virgin olive oil", prep: "divided", quantity: "3", unit: "tbsp", category: "Pantry" },
        { item: "Pesto", prep: "for the chicken", quantity: "3", unit: "tbsp", category: "Pantry" },
        { item: "Panko breadcrumbs", prep: "", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Romaine lettuce", prep: "chopped", quantity: "6", unit: "cups", category: "Produce" },
        { item: "Parmigiano-Reggiano cheese", prep: "grated, for the salad", quantity: "1/3", unit: "cup", category: "Dairy" },
        { item: "Fresh basil leaves", prep: "chopped or torn", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Plain full-fat Greek yogurt", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Mayonnaise", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Extra-virgin olive oil", prep: "for the dressing", quantity: "3", unit: "tbsp", category: "Pantry" },
        { item: "Pesto", prep: "for the dressing", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Fresh lemon juice", prep: "", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Parmigiano-Reggiano cheese", prep: "grated, for the dressing", quantity: "1/4", unit: "cup", category: "Dairy" },
        { item: "Anchovy fillets", prep: "minced", quantity: "3", unit: "", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Worcestershire sauce", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Cracked black pepper & kosher salt", prep: "to taste, for the dressing", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the pasta",
        detail:
          "Bring a large pot of salted water to a boil. Cook the pasta until al dente, then drain and let cool slightly."
      },
      {
        step_number: 2,
        title: "Season & sear the chicken",
        detail:
          "Season the chicken cutlets with kosher salt and pepper, then toss with the pesto. Heat 2 tablespoons of the olive oil in a skillet over medium-high heat and sear the chicken until golden and cooked through, about 3-4 minutes per side. Let rest, then slice."
      },
      {
        step_number: 3,
        title: "Toast the panko",
        detail:
          "Toast the panko breadcrumbs in a dry skillet over medium heat, stirring often, until golden and crisp, 2-3 minutes. Set aside, reserving a little for topping."
      },
      {
        step_number: 4,
        title: "Make the pesto Caesar dressing",
        detail:
          "Whisk together the Greek yogurt, mayonnaise, remaining olive oil, pesto, lemon juice, Parmigiano-Reggiano, anchovies, garlic, and Worcestershire sauce until smooth. Season with cracked black pepper and kosher salt to taste."
      },
      {
        step_number: 5,
        title: "Toss the salad",
        detail:
          "In a large bowl, toss the cooled pasta and romaine with the dressing until well coated. Fold in most of the toasted panko, Parmigiano-Reggiano, and basil. Top with the sliced chicken."
      },
      {
        step_number: 6,
        title: "Finish & serve",
        detail:
          "Sprinkle the reserved toasted panko over the top just before serving so the salad keeps its crispy Caesar-style crunch."
      }
    ]
  },

  {
    recipe_id: "creamy-lemon-parmesan-chicken-hasselback-potatoes",
    title: "Creamy Lemon Parmesan Chicken & Hasselback Potatoes",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🥔",
    tags: ["Meal-Prep", "Creamy", "Lemon-Garlic"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Golden chicken in a creamy lemon garlic Parmesan sauce with crispy Hasselback potatoes and grilled greens. Cozy, flavorful, and perfect for an easy dinner.",
    prep_time_mins: 15,
    cook_time_mins: 50,
    native_serving: 4,
    accent: "#D9A62E",

    macro_profiles: {
      serving_4: { calories: 690, protein_g: 45, fat_g: 40, carbs_g: 42 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Chicken breasts", prep: "", quantity: "3", unit: "", category: "Meat" },
        { item: "Salt", prep: "to taste, for the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Black pepper", prep: "to taste, for the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Paprika", prep: "to taste, for the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Garlic powder", prep: "to taste, for the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Chili flakes", prep: "to taste, for the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Oregano", prep: "to taste, for the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Olive oil", prep: "for cooking the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "3", unit: "", category: "Produce" },
        { item: "Heavy cream", prep: "", quantity: "300", unit: "ml", category: "Dairy" },
        { item: "Parmesan cheese", prep: "finely grated", quantity: "50", unit: "g", category: "Dairy" },
        { item: "Lemon", prep: "zest of 1 + juice of 1/2", quantity: "1", unit: "", category: "Produce" },
        { item: "Chili flakes", prep: "for the sauce", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Chicken broth", prep: "", quantity: "60", unit: "ml", category: "Pantry" },
        { item: "Salt & black pepper", prep: "to taste, for the sauce", quantity: "", unit: "", category: "Pantry" },
        { item: "Lemon slices", prep: "for finishing the sauce", quantity: "", unit: "", category: "Produce" },
        { item: "Medium potatoes", prep: "", quantity: "6-8", unit: "", category: "Produce" },
        { item: "Butter", prep: "melted", quantity: "3", unit: "tbsp", category: "Dairy" },
        { item: "Olive oil", prep: "for the potatoes", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt & black pepper", prep: "to taste, for the potatoes", quantity: "", unit: "", category: "Pantry" },
        { item: "Paprika", prep: "for the potatoes", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Zucchini or asparagus", prep: "for grilling", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the potatoes",
        detail:
          "Cut the potatoes Hasselback-style and brush with the melted butter, olive oil, salt, pepper, and paprika. Roast at 220°C (425°F) for 30 minutes."
      },
      {
        step_number: 2,
        title: "Cook the chicken",
        detail:
          "Slice the chicken breasts in half horizontally, season with salt, pepper, paprika, garlic powder, chili flakes, and oregano, and cook in olive oil until golden. Set aside."
      },
      {
        step_number: 3,
        title: "Crisp the potatoes",
        detail:
          "Brush the potatoes again with the butter mixture and roast for another 20-25 minutes, until crispy."
      },
      {
        step_number: 4,
        title: "Deglaze the pan",
        detail:
          "In the chicken pan, cook the minced garlic, then add the chicken broth and scrape up the browned bits."
      },
      {
        step_number: 5,
        title: "Make the sauce",
        detail:
          "Add the heavy cream, lemon zest, chili flakes, and Parmesan. Simmer until thickened."
      },
      {
        step_number: 6,
        title: "Finish the chicken",
        detail:
          "Return the chicken to the sauce with the lemon juice and lemon slices, and simmer until creamy."
      },
      {
        step_number: 7,
        title: "Grill the sides",
        detail:
          "Grill the zucchini or asparagus with olive oil, salt, and pepper."
      },
      {
        step_number: 8,
        title: "Plate & serve",
        detail:
          "Plate the chicken and potatoes and spoon the sauce over the top."
      }
    ]
  },

  {
    recipe_id: "grilled-hot-honey-chicken-peach-salsa",
    title: "Grilled Hot Honey Chicken with Peach Salsa",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍑",
    tags: ["Meal-Prep", "Grilled", "Sweet & Spicy"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "The perfect sweet, spicy, and savory summer dinner: grilled hot honey chicken topped with fresh peach salsa, served alongside grilled lemon asparagus.",
    prep_time_mins: 20,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#E2833F",

    macro_profiles: {
      serving_4: { calories: 610, protein_g: 44, fat_g: 18, carbs_g: 62 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Boneless, skinless chicken thighs or chicken breasts", prep: "", quantity: "1 1/2", unit: "lb", category: "Meat" },
        { item: "Olive oil", prep: "to brush over the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Smoked paprika", prep: "to season the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Cumin", prep: "to season the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Salt", prep: "to season the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Black pepper", prep: "to season the chicken", quantity: "", unit: "", category: "Pantry" },
        { item: "Honey", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Garlic cloves", prep: "minced", quantity: "4", unit: "", category: "Produce" },
        { item: "Red pepper flakes", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "for the hot honey sauce", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "for the hot honey sauce", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Peaches", prep: "diced", quantity: "3-4", unit: "large", category: "Produce" },
        { item: "Jalapeño", prep: "deseeded and finely diced", quantity: "1", unit: "large", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced, or more to taste", quantity: "1", unit: "", category: "Produce" },
        { item: "Asparagus", prep: "ends trimmed", quantity: "1", unit: "bundle", category: "Produce" },
        { item: "Avocado oil or olive oil", prep: "for the asparagus", quantity: "1 1/2", unit: "tsp", category: "Pantry" },
        { item: "Garlic salt", prep: "to taste, for the asparagus", quantity: "", unit: "", category: "Pantry" },
        { item: "Black pepper", prep: "to taste, for the asparagus", quantity: "", unit: "", category: "Pantry" },
        { item: "Lemon zest", prep: "to taste, for the asparagus", quantity: "", unit: "", category: "Produce" },
        { item: "Steamed rice", prep: "for serving", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Make the peach salsa",
        detail:
          "Mix the diced peaches, jalapeño, red onion, and cilantro in a bowl. Squeeze the lime juice over the top, toss, taste, and adjust with more lime if needed. Refrigerate until serving."
      },
      {
        step_number: 2,
        title: "Make the hot honey sauce",
        detail:
          "Add the honey, garlic, red pepper flakes, smoked paprika, and salt to a small saucepan. Warm over low heat, stirring often, until runny and warm. Do not boil."
      },
      {
        step_number: 3,
        title: "Grill the chicken",
        detail:
          "Preheat a grill or grill pan to medium-high heat and lightly oil the grates. Brush the chicken with olive oil on both sides, then season with smoked paprika, cumin, salt, and black pepper. Grill for 5-6 minutes per side, or until it reaches 165°F inside."
      },
      {
        step_number: 4,
        title: "Glaze the chicken",
        detail:
          "During the last 2-3 minutes of grilling, brush the hot honey sauce over both sides of the chicken."
      },
      {
        step_number: 5,
        title: "Grill the asparagus",
        detail:
          "Toss the asparagus with oil, garlic salt, and black pepper. Grill for 3-5 minutes, until tender and slightly charred, then finish with lemon zest."
      },
      {
        step_number: 6,
        title: "Plate & serve",
        detail:
          "Serve the chicken over steamed rice with the peach salsa, grilled lemon asparagus, and extra hot honey sauce."
      }
    ]
  },

  {
    recipe_id: "lemon-garlic-shrimp-alfredo",
    title: "Lemon Garlic Shrimp Alfredo",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍤",
    tags: ["Meal-Prep", "Creamy", "Shrimp"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "An easy under-30-minute dinner made with juicy shrimp, a silky lemon Parmesan cream sauce, and pappardelle pasta. Creamy, garlicky, bright, and perfect for a cozy restaurant-style pasta night at home.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#C2A46B",

    macro_profiles: {
      serving_2: { calories: 950, protein_g: 42, fat_g: 58, carbs_g: 74 }
    },

    scaling_options: [2],

    ingredients_by_serving: {
      serving_2: [
        { item: "Shrimp", prep: "peeled and deveined", quantity: "200", unit: "g", category: "Meat" },
        { item: "Butter", prep: "for the shrimp", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Garlic cloves", prep: "minced, for the shrimp", quantity: "2", unit: "", category: "Produce" },
        { item: "Salt & black pepper", prep: "to taste, for the shrimp", quantity: "", unit: "", category: "Pantry" },
        { item: "Paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Lemon zest", prep: "for the shrimp", quantity: "1/2", unit: "lemon", category: "Produce" },
        { item: "Honey", prep: "optional", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Pappardelle pasta", prep: "", quantity: "200", unit: "g", category: "Pantry" },
        { item: "Butter", prep: "for the sauce", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Garlic cloves", prep: "minced, for the sauce", quantity: "3", unit: "", category: "Produce" },
        { item: "Heavy cream", prep: "", quantity: "250", unit: "ml", category: "Dairy" },
        { item: "Parmesan cheese", prep: "freshly grated", quantity: "3", unit: "tbsp", category: "Dairy" },
        { item: "Pasta water", prep: "reserved", quantity: "50-100", unit: "ml", category: "Pantry" },
        { item: "Lemon zest", prep: "for the sauce", quantity: "1/2", unit: "lemon", category: "Produce" },
        { item: "Lemon juice", prep: "", quantity: "1-2", unit: "tsp", category: "Produce" },
        { item: "Salt, black pepper & chili flakes", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Fresh parsley", prep: "for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the pasta",
        detail:
          "Cook the pappardelle until al dente, reserving some pasta water before draining."
      },
      {
        step_number: 2,
        title: "Season & sear the shrimp",
        detail:
          "Pat the shrimp dry and season with salt, pepper, paprika, lemon zest, and honey if using. Melt the butter in a pan and cook the shrimp for 60-90 seconds per side until pink and golden."
      },
      {
        step_number: 3,
        title: "Finish the shrimp",
        detail:
          "Add the garlic and toss for 20-30 seconds, then set the shrimp aside."
      },
      {
        step_number: 4,
        title: "Start the sauce",
        detail:
          "In the same pan, melt the remaining butter and cook the garlic for 30 seconds."
      },
      {
        step_number: 5,
        title: "Add the cream",
        detail:
          "Pour in the heavy cream and simmer for 2-3 minutes."
      },
      {
        step_number: 6,
        title: "Season the sauce",
        detail:
          "Stir in the Parmesan, reserved pasta water, lemon zest, and lemon juice."
      },
      {
        step_number: 7,
        title: "Toss the pasta",
        detail:
          "Toss the pasta in the sauce until creamy and glossy."
      },
      {
        step_number: 8,
        title: "Serve",
        detail:
          "Top with the shrimp, extra lemon zest, parsley, and black pepper. Add pasta water slowly so the Alfredo sauce turns silky rather than greasy."
      }
    ]
  },

  {
    recipe_id: "cowboy-caviar-dip",
    title: "Cowboy Caviar Dip",
    category: "Salsa",
    source: "Salsas",
    icon: "🤠",
    tags: ["No-Cook", "Make-Ahead", "Vegetarian"],
    dish_category: "Salsas & Dips",
    description:
      "A colorful, chip-scooping bean salad — black beans, black-eyed peas, corn, bell pepper, and avocado tossed in a bright lime dressing. Make it ahead; it only gets better as it sits.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#C9A227",

    macro_profiles: {
      serving_2: { calories: 220, protein_g: 8, fat_g: 8, carbs_g: 30 },
      serving_4: { calories: 220, protein_g: 8, fat_g: 8, carbs_g: 30 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Black beans", prep: "drained and rinsed", quantity: "1/2", unit: "can (7.5 oz)", category: "Pantry" },
        { item: "Black-eyed peas", prep: "drained and rinsed", quantity: "1/2", unit: "can (7.5 oz)", category: "Pantry" },
        { item: "Corn kernels", prep: "", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Red bell pepper", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Small red onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Jalapeños", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt & pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Black beans", prep: "drained and rinsed", quantity: "1", unit: "can (15 oz)", category: "Pantry" },
        { item: "Black-eyed peas", prep: "drained and rinsed", quantity: "1", unit: "can (15 oz)", category: "Pantry" },
        { item: "Corn kernels", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Red bell pepper", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Small red onion", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Jalapeños", prep: "seeded and minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Olive oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Salt & pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Prep the vegetables",
        detail:
          "Dice the bell pepper, onion, tomato, and avocado. Seed and mince the jalapeños, and chop the cilantro."
      },
      {
        step_number: 2,
        title: "Combine",
        detail:
          "In a large bowl, combine the black beans, black-eyed peas, corn, bell pepper, onion, jalapeños, tomato, and cilantro."
      },
      {
        step_number: 3,
        title: "Dress & toss",
        detail:
          "Add the lime juice, olive oil, salt, and pepper, then toss gently to coat."
      },
      {
        step_number: 4,
        title: "Fold in avocado & serve",
        detail:
          "Fold in the avocado last so it stays intact. Serve chilled with tortilla chips."
      }
    ]
  },

  {
    recipe_id: "strawberry-salsa",
    title: "Strawberry Salsa",
    category: "Salsa",
    source: "Salsas",
    icon: "🍓",
    tags: ["No-Cook", "Fresh", "Sweet & Spicy"],
    dish_category: "Salsas & Dips",
    description:
      "A sweet-and-spicy summer salsa — diced strawberries, jalapeño, red onion, and cilantro brightened with lime and a touch of honey. Great with cinnamon chips or spooned over grilled fish.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#D1495B",

    macro_profiles: {
      serving_2: { calories: 45, protein_g: 1, fat_g: 0, carbs_g: 11 },
      serving_4: { calories: 45, protein_g: 1, fat_g: 0, carbs_g: 11 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Strawberries", prep: "hulled and diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Red onion", prep: "minced", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Honey", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Strawberries", prep: "hulled and diced", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Red onion", prep: "minced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Honey", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Dice the strawberries",
        detail:
          "Hull the strawberries and dice into small, even pieces."
      },
      {
        step_number: 2,
        title: "Combine",
        detail:
          "In a bowl, combine the strawberries, jalapeño, red onion, and cilantro."
      },
      {
        step_number: 3,
        title: "Dress",
        detail:
          "Stir in the lime juice, honey, and salt to taste."
      },
      {
        step_number: 4,
        title: "Chill & serve",
        detail:
          "Let sit for 10 minutes so the flavors meld, then serve with cinnamon-sugar chips or grilled fish."
      }
    ]
  },

  {
    recipe_id: "pineapple-mango-salsa",
    title: "Pineapple Mango Salsa",
    category: "Salsa",
    source: "Salsas",
    icon: "🍍",
    tags: ["No-Cook", "Fresh", "Tropical"],
    dish_category: "Salsas & Dips",
    description:
      "A juicy tropical salsa of pineapple, mango, and tomato with jalapeño heat and a squeeze of lime — built for tacos, grilled chicken, or straight-up chip dipping.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#E8A33D",

    macro_profiles: {
      serving_2: { calories: 70, protein_g: 1, fat_g: 0, carbs_g: 18 },
      serving_4: { calories: 70, protein_g: 1, fat_g: 0, carbs_g: 18 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Pineapple", prep: "diced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Ripe mango", prep: "diced", quantity: "1/2", unit: "cup", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Jalapeños", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Pineapple", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Ripe mango", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Large tomato", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Jalapeños", prep: "seeded and minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Dice the fruit",
        detail:
          "Dice the pineapple and mango into small, even pieces."
      },
      {
        step_number: 2,
        title: "Combine",
        detail:
          "Add the diced tomato, red onion, jalapeños, and cilantro to the fruit."
      },
      {
        step_number: 3,
        title: "Dress & serve",
        detail:
          "Toss with lime juice and salt to taste. Serve immediately, or chill for 15 minutes to let the flavors meld."
      }
    ]
  },

  {
    recipe_id: "kiwi-mango-salsa",
    title: "Kiwi Mango Salsa",
    category: "Salsa",
    source: "Salsas",
    icon: "🥝",
    tags: ["No-Cook", "Fresh", "Tropical"],
    dish_category: "Salsas & Dips",
    description:
      "A bright green-and-gold salsa pairing tart kiwi with sweet mango, jalapeño, and lime — a fun twist on fruit salsa for fish tacos or a chip-dipping snack.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#8FAF3D",

    macro_profiles: {
      serving_2: { calories: 65, protein_g: 1, fat_g: 0, carbs_g: 16 },
      serving_4: { calories: 65, protein_g: 1, fat_g: 0, carbs_g: 16 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Kiwis", prep: "peeled and diced", quantity: "1 1/2", unit: "", category: "Produce" },
        { item: "Ripe mango", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Kiwis", prep: "peeled and diced", quantity: "3", unit: "", category: "Produce" },
        { item: "Ripe mango", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Prep the fruit",
        detail:
          "Peel and dice the kiwis and mango."
      },
      {
        step_number: 2,
        title: "Combine",
        detail:
          "Toss the fruit with the red onion, jalapeño, and cilantro."
      },
      {
        step_number: 3,
        title: "Dress & serve",
        detail:
          "Add lime juice and salt to taste. Serve chilled."
      }
    ]
  },

  {
    recipe_id: "pico-de-gallo",
    title: "Pico de Gallo",
    category: "Salsa",
    source: "Salsas",
    icon: "🍅",
    tags: ["No-Cook", "Fresh", "Classic"],
    dish_category: "Salsas & Dips",
    description:
      "The classic fresh salsa — diced tomato, onion, and jalapeño with cilantro and lime. Simple, bright, and endlessly versatile on tacos, eggs, or chips.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#B23A2E",

    macro_profiles: {
      serving_2: { calories: 25, protein_g: 1, fat_g: 0, carbs_g: 6 },
      serving_4: { calories: 25, protein_g: 1, fat_g: 0, carbs_g: 6 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Tomatoes", prep: "diced", quantity: "1 1/2", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Jalapeños", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Tomatoes", prep: "diced", quantity: "3", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Jalapeños", prep: "seeded and minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Dice the vegetables",
        detail:
          "Dice the tomatoes, onion, and jalapeños into small, even pieces."
      },
      {
        step_number: 2,
        title: "Combine",
        detail:
          "Toss the tomatoes, onion, and jalapeños together with the cilantro."
      },
      {
        step_number: 3,
        title: "Dress & rest",
        detail:
          "Stir in the lime juice and salt, then let sit for 10 minutes before serving so the flavors meld."
      }
    ]
  },

  {
    recipe_id: "mango-avocado-salsa",
    title: "Mango Avocado Salsa",
    category: "Salsa",
    source: "Salsas",
    icon: "🥑",
    tags: ["No-Cook", "Fresh", "Creamy"],
    dish_category: "Salsas & Dips",
    description:
      "Sweet mango and creamy avocado meet tomato, onion, and jalapeño in this rich, chunky salsa — great on grilled chicken or fish, or scooped up with chips.",
    prep_time_mins: 10,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#5B7F45",

    macro_profiles: {
      serving_2: { calories: 150, protein_g: 2, fat_g: 10, carbs_g: 15 },
      serving_4: { calories: 150, protein_g: 2, fat_g: 10, carbs_g: 15 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Ripe mango", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Avocados", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Ripe mango", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Avocados", prep: "diced", quantity: "2", unit: "", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Dice the produce",
        detail:
          "Dice the mango, avocado, tomato, and red onion."
      },
      {
        step_number: 2,
        title: "Combine gently",
        detail:
          "In a bowl, gently combine the mango, avocado, onion, jalapeño, tomato, and cilantro."
      },
      {
        step_number: 3,
        title: "Dress & serve",
        detail:
          "Toss gently with lime juice and salt to taste. Serve right away so the avocado stays fresh."
      }
    ]
  },

  {
    recipe_id: "roasted-corn-salsa",
    title: "Roasted Corn Salsa",
    category: "Salsa",
    source: "Salsas",
    icon: "🌽",
    tags: ["Quick", "Smoky", "Vegetarian"],
    dish_category: "Salsas & Dips",
    description:
      "Charred, smoky corn kernels tossed with red onion, bell pepper, jalapeño, cilantro, and lime — a summery salsa that's just as good spooned over tacos as it is with chips.",
    prep_time_mins: 10,
    cook_time_mins: 8,
    native_serving: 4,
    accent: "#DDB94A",

    macro_profiles: {
      serving_2: { calories: 90, protein_g: 3, fat_g: 1, carbs_g: 20 },
      serving_4: { calories: 90, protein_g: 3, fat_g: 1, carbs_g: 20 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Corn kernels", prep: "roasted", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Red bell pepper", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Corn kernels", prep: "roasted", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Red bell pepper", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the corn",
        detail:
          "Char the corn kernels in a dry skillet over high heat, or under the broiler, until lightly blackened in spots, about 5-8 minutes. Let cool."
      },
      {
        step_number: 2,
        title: "Combine",
        detail:
          "Toss the roasted corn with the red onion, jalapeño, bell pepper, and cilantro."
      },
      {
        step_number: 3,
        title: "Dress & serve",
        detail:
          "Stir in the lime juice and salt to taste. Serve warm or chilled."
      }
    ]
  },

  {
    recipe_id: "black-bean-corn-salsa",
    title: "Black Bean Corn Salsa",
    category: "Salsa",
    source: "Salsas",
    icon: "🫘",
    tags: ["No-Cook", "Make-Ahead", "Vegetarian"],
    dish_category: "Salsas & Dips",
    description:
      "A hearty, protein-packed salsa of black beans, corn, tomato, and avocado in a lime dressing — filling enough to eat as a side salad, not just a chip dip.",
    prep_time_mins: 12,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#6B4C7A",

    macro_profiles: {
      serving_2: { calories: 180, protein_g: 7, fat_g: 6, carbs_g: 26 },
      serving_4: { calories: 180, protein_g: 7, fat_g: 6, carbs_g: 26 }
    },

    scaling_options: [2, 4],

    ingredients_by_serving: {
      serving_2: [
        { item: "Black beans", prep: "drained and rinsed", quantity: "1/2", unit: "can (7.5 oz)", category: "Pantry" },
        { item: "Corn kernels", prep: "", quantity: "3/4", unit: "cup", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ],
      serving_4: [
        { item: "Black beans", prep: "drained and rinsed", quantity: "1", unit: "can (15 oz)", category: "Pantry" },
        { item: "Corn kernels", prep: "", quantity: "1 1/2", unit: "cups", category: "Produce" },
        { item: "Red onion", prep: "diced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Tomato", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "seeded and minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Avocado", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cilantro", prep: "chopped", quantity: "1/4", unit: "cup", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Combine the base",
        detail:
          "In a bowl, combine the black beans, corn, red onion, tomato, and jalapeño."
      },
      {
        step_number: 2,
        title: "Dress",
        detail:
          "Stir in the lime juice and salt to taste."
      },
      {
        step_number: 3,
        title: "Fold in avocado & serve",
        detail:
          "Gently fold in the avocado just before serving with tortilla chips."
      }
    ]
  },

  {
    recipe_id: "fajita-steak-loaded-sweet-potato-nachos",
    title: "Fajita Steak Loaded Sweet Potato Nachos",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🧀",
    tags: ["Sheet-Pan", "Steak", "Shareable"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Crispy sweet potato \"chips\" loaded with fajita-seasoned steak, melted cheddar and mozzarella, caramelized onion and pepper, fresh tomato salsa, guacamole, and a drizzle of honey and chili flakes.",
    prep_time_mins: 15,
    cook_time_mins: 45,
    native_serving: 4,
    accent: "#C1622E",

    macro_profiles: {
      serving_4: { calories: 480, protein_g: 34, fat_g: 18, carbs_g: 35 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Rump steaks", prep: "", quantity: "2", unit: "", category: "Meat" },
        { item: "Sweet potatoes", prep: "cut into circles", quantity: "4", unit: "", category: "Produce" },
        { item: "Fajita seasoning", prep: "for the sweet potatoes", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Chicken seasoning", prep: "for the sweet potatoes", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Fajita seasoning", prep: "for the steak and vegetables", quantity: "1/2", unit: "sachet", category: "Pantry" },
        { item: "Reduced-fat cheddar cheese", prep: "grated", quantity: "20", unit: "g", category: "Dairy" },
        { item: "Mozzarella cheese", prep: "grated", quantity: "20", unit: "g", category: "Dairy" },
        { item: "Onion", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Bell pepper", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Tomatoes", prep: "chopped into small chunks", quantity: "8", unit: "", category: "Produce" },
        { item: "Red onion", prep: "finely chopped", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Lime", prep: "squeezed, for the tomatoes", quantity: "1", unit: "", category: "Produce" },
        { item: "Guacamole", prep: "prepared", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Light crème fraîche", prep: "", quantity: "4", unit: "tbsp", category: "Dairy" },
        { item: "Honey", prep: "for drizzling", quantity: "", unit: "", category: "Pantry" },
        { item: "Chili flakes", prep: "to finish", quantity: "", unit: "", category: "Pantry" },
        { item: "Fresh parsley", prep: "to finish", quantity: "", unit: "", category: "Produce" },
        { item: "Salt & black pepper", prep: "to taste, for the steak", quantity: "", unit: "", category: "Pantry" },
        { item: "Olive oil", prep: "for cooking", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Roast the sweet potatoes",
        detail:
          "Cut the sweet potatoes into circles and add to a baking tray. Drizzle with oil and the sweet potato seasoning, then cook in a preheated oven at 190°C (375°F) for 35 minutes."
      },
      {
        step_number: 2,
        title: "Caramelize the onion & pepper",
        detail:
          "Slice the onion and pepper and add to an oiled pan. Sprinkle with half of the remaining fajita seasoning and cook on medium heat for 20 minutes, until completely soft."
      },
      {
        step_number: 3,
        title: "Cook the steak",
        detail:
          "Season the steak with salt and pepper, then coat in the rest of the fajita seasoning. Cook in an oiled pan to your preferred doneness (medium-rare works well), then rest for at least 10 minutes before slicing."
      },
      {
        step_number: 4,
        title: "Make the tomato salsa & guacamole",
        detail:
          "Chop the tomatoes into small chunks and combine with the finely chopped red onion, a drizzle of olive oil, and a squeeze of lime. Prepare the guacamole."
      },
      {
        step_number: 5,
        title: "Melt the cheese",
        detail:
          "Once the sweet potatoes are cooked, sprinkle over the cheddar and mozzarella and return to the oven for 10 minutes, until the cheese is golden."
      },
      {
        step_number: 6,
        title: "Assemble & serve",
        detail:
          "Layer the caramelized onion and pepper, sliced steak, tomato salsa, guacamole, and crème fraîche over the cheesy sweet potatoes. Finish with a drizzle of honey, chili flakes, and fresh parsley."
      }
    ]
  },

  {
    recipe_id: "fresh-guacamole",
    title: "Fresh Guacamole",
    category: "Salsa",
    source: "Salsas",
    icon: "🥑",
    tags: ["No-Cook", "Make-Ahead", "Vegetarian"],
    dish_category: "Salsas & Dips",
    description:
      "A simple, bright, and creamy dip made with smashed avocados, tomatoes, onion, jalapeños, fresh lemon and lime, salt, and pepper. Easy, flavorful, and perfect with chips, tacos, bowls, toast, or any quick snack plate.",
    prep_time_mins: 15,
    cook_time_mins: 0,
    native_serving: 4,
    accent: "#6B8E4E",

    macro_profiles: {
      serving_4: { calories: 230, protein_g: 3, fat_g: 20, carbs_g: 12 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Avocados", prep: "smashed", quantity: "3", unit: "", category: "Produce" },
        { item: "Tomatoes", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Onion", prep: "minced", quantity: "1/4", unit: "", category: "Produce" },
        { item: "Jalapeño", prep: "minced", quantity: "1", unit: "", category: "Produce" },
        { item: "Lemon", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Lime", prep: "juiced", quantity: "1", unit: "", category: "Produce" },
        { item: "Salt", prep: "to taste", quantity: "", unit: "", category: "Pantry" },
        { item: "Black pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Smash the avocados",
        detail:
          "Smash the avocados in a large bowl until mostly smooth with some texture remaining."
      },
      {
        step_number: 2,
        title: "Add the aromatics",
        detail:
          "Add the minced tomatoes, onion, and jalapeño."
      },
      {
        step_number: 3,
        title: "Season",
        detail:
          "Squeeze in the fresh lemon and lime juice, then season with salt and pepper to taste."
      },
      {
        step_number: 4,
        title: "Mix & serve",
        detail:
          "Mix until combined and serve fresh."
      }
    ]
  },

  {
    recipe_id: "italian-pasta-salad-pepperoncini-dressing",
    title: "Italian Pasta Salad with Pepperoncini Dressing",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍝",
    tags: ["Pasta Salad", "Vegetarian", "Make-Ahead"],
    dish_category: "Salads & Slaws",
    description:
      "A fresh, make-ahead vegetarian pasta salad packed with chickpeas, cherry tomatoes, sweet peppers, pepperoncini, olives, spinach, Parmesan, and a zesty homemade Italian dressing. Colorful, tangy, and satisfying for weekday lunches, BBQs, or warm-weather entertaining.",
    prep_time_mins: 20,
    cook_time_mins: 15,
    native_serving: 6,
    accent: "#8AA84F",

    macro_profiles: {
      serving_6: { calories: 650, protein_g: 23, fat_g: 30, carbs_g: 68 }
    },

    scaling_options: [6],

    ingredients_by_serving: {
      serving_6: [
        { item: "Fusilli pasta", prep: "", quantity: "1", unit: "lb", category: "Pantry" },
        { item: "Chickpeas", prep: "drained and rinsed", quantity: "1", unit: "15-oz can", category: "Pantry" },
        { item: "Cherry tomatoes", prep: "halved", quantity: "1", unit: "pint", category: "Produce" },
        { item: "Mini sweet peppers", prep: "thinly sliced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Pepperoncini peppers", prep: "sliced", quantity: "3/4", unit: "cup", category: "Pantry" },
        { item: "Kalamata olives", prep: "pitted and halved", quantity: "3/4", unit: "cup", category: "Pantry" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Provolone or mozzarella cheese", prep: "small cubed", quantity: "3/4", unit: "cup", category: "Dairy" },
        { item: "Fresh baby spinach", prep: "roughly chopped", quantity: "2-3", unit: "cups", category: "Produce" },
        { item: "Extra-virgin olive oil", prep: "for the dressing", quantity: "1/2", unit: "cup", category: "Pantry" },
        { item: "Red wine vinegar", prep: "", quantity: "1/4", unit: "cup", category: "Pantry" },
        { item: "Pepperoncini brine", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Shallots", prep: "minced", quantity: "3", unit: "tbsp", category: "Produce" },
        { item: "Garlic cloves", prep: "minced", quantity: "2", unit: "", category: "Produce" },
        { item: "Dried oregano", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Dried parsley", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Kosher salt", prep: "", quantity: "3/4", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the pasta",
        detail:
          "Bring a large pot of salted water to a boil and cook the fusilli until al dente. Drain and let cool."
      },
      {
        step_number: 2,
        title: "Make the dressing",
        detail:
          "Whisk together the olive oil, red wine vinegar, pepperoncini brine, shallots, garlic, oregano, parsley, salt, and pepper."
      },
      {
        step_number: 3,
        title: "Combine the salad",
        detail:
          "In a large bowl, toss the cooled pasta with the chickpeas, cherry tomatoes, sweet peppers, pepperoncini, olives, Parmesan, provolone, and spinach."
      },
      {
        step_number: 4,
        title: "Dress & chill",
        detail:
          "Pour the dressing over the salad and toss to coat. Make 1-2 hours ahead so the pasta absorbs the dressing and the flavors deepen."
      }
    ]
  },

  {
    recipe_id: "butter-cream-shrimp-rice",
    title: "Butter-Cream Shrimp & Rice",
    category: "Meal Prep",
    source: "High-Protein Meal Prep",
    icon: "🍤",
    tags: ["Meal-Prep", "Creamy", "Shrimp"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "A rich, creamy shrimp dinner made with extra-jumbo shrimp, tomato paste, garlic, Cajun seasoning, heavy cream, chicken broth, butter, and lemon. Saucy, savory, restaurant-style, and perfect served over warm rice.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#B5452E",

    macro_profiles: {
      serving_4: { calories: 1020, protein_g: 51, fat_g: 60, carbs_g: 55 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Extra-jumbo shrimp", prep: "", quantity: "2", unit: "lbs", category: "Meat" },
        { item: "Heavy cream", prep: "", quantity: "2 1/4", unit: "cups", category: "Dairy" },
        { item: "Chicken broth", prep: "", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Tomato paste", prep: "", quantity: "5", unit: "tbsp", category: "Pantry" },
        { item: "Butter", prep: "divided", quantity: "3", unit: "tbsp", category: "Dairy" },
        { item: "Garlic", prep: "minced", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Avocado oil", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Creole/Cajun seasoning", prep: "", quantity: "4", unit: "tsp", category: "Pantry" },
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Onion powder", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Smoked paprika", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Dried parsley", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Dried basil", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lemon", prep: "juiced", quantity: "1/2", unit: "", category: "Produce" },
        { item: "Rice", prep: "for serving", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Season & sear the shrimp",
        detail:
          "Pat the shrimp dry and season with the Creole/Cajun seasoning, Italian seasoning, garlic powder, onion powder, smoked paprika, black pepper, parsley, and basil. Sear in the avocado oil for 2 minutes per side in a hot skillet, then remove."
      },
      {
        step_number: 2,
        title: "Start the sauce",
        detail:
          "Melt 2 tablespoons of the butter in the skillet, then sauté the garlic and tomato paste until deep red."
      },
      {
        step_number: 3,
        title: "Build the sauce",
        detail:
          "Whisk in the chicken broth and heavy cream, then simmer until the sauce is thick enough to coat a spoon."
      },
      {
        step_number: 4,
        title: "Finish & serve",
        detail:
          "Stir the shrimp back into the sauce, then add the remaining 1 tablespoon of cold butter and the lemon juice. Serve over warm rice."
      }
    ]
  },

  {
    recipe_id: "chicken-enchilada-quinoa",
    title: "Chicken Enchilada Quinoa",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🌯",
    tags: ["Crockpot", "High-Protein", "Meal-Prep"],
    dish_category: "Soups, Stews & Chilis",
    description:
      "A set-and-forget crockpot dinner — shredded chicken, quinoa, black beans, and corn simmered in enchilada sauce and finished with melted cheddar and fresh cilantro.",
    prep_time_mins: 10,
    cook_time_mins: 400,
    native_serving: 6,
    accent: "#B5652E",

    macro_profiles: {
      serving_6: { calories: 484, protein_g: 48, fat_g: 7, carbs_g: 39 }
    },

    scaling_options: [6],

    ingredients_by_serving: {
      serving_6: [
        { item: "Chicken breast", prep: "", quantity: "2", unit: "lbs", category: "Meat" },
        { item: "Quinoa", prep: "uncooked", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Enchilada sauce", prep: "", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Chicken broth", prep: "low sodium", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Black beans", prep: "drained", quantity: "1", unit: "can", category: "Pantry" },
        { item: "Corn", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cumin", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Chili powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Reduced fat cheddar cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Fresh cilantro", prep: "for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Load the crockpot",
        detail:
          "Add chicken, enchilada sauce, broth, onion, beans, corn, cumin, and chili powder to the crockpot."
      },
      {
        step_number: 2,
        title: "Cook & shred",
        detail: "Cook on LOW for 6 hours, then remove and shred the chicken."
      },
      {
        step_number: 3,
        title: "Stir in the quinoa",
        detail:
          "Stir the uncooked quinoa into the crockpot and cook another 30 to 40 minutes until the quinoa is tender."
      },
      {
        step_number: 4,
        title: "Finish & serve",
        detail:
          "Return the chicken to the crockpot and stir in the cheese. Garnish with cilantro before serving."
      }
    ]
  },

  {
    recipe_id: "crockpot-pizza-chicken-bowls",
    title: "Crockpot Pizza Chicken Bowls",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🍕",
    tags: ["Crockpot", "High-Protein", "Kid-Friendly"],
    dish_category: "Casseroles & Bakes",
    description:
      "All the flavor of a pepperoni pizza in a crockpot chicken bowl — shredded chicken, rice, and turkey pepperoni simmered in pizza sauce and topped with melted mozzarella.",
    prep_time_mins: 10,
    cook_time_mins: 370,
    native_serving: 6,
    accent: "#C25C3A",

    macro_profiles: {
      serving_6: { calories: 452, protein_g: 50, fat_g: 5, carbs_g: 27 }
    },

    scaling_options: [6],

    ingredients_by_serving: {
      serving_6: [
        { item: "Chicken breast", prep: "", quantity: "2", unit: "lbs", category: "Meat" },
        { item: "Rice", prep: "cooked", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Pizza sauce", prep: "", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Bell peppers", prep: "diced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Turkey pepperoni", prep: "", quantity: "1/2", unit: "cup", category: "Meat" },
        { item: "Reduced fat mozzarella cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Italian seasoning", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Mushrooms", prep: "sliced", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Fresh basil", prep: "for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Load the crockpot",
        detail:
          "Add chicken, pizza sauce, peppers, mushrooms, garlic powder, and Italian seasoning to the crockpot."
      },
      {
        step_number: 2,
        title: "Cook & shred",
        detail: "Cook on LOW for 6 hours, then shred the chicken."
      },
      {
        step_number: 3,
        title: "Stir in rice & pepperoni",
        detail: "Stir in the cooked rice and turkey pepperoni."
      },
      {
        step_number: 4,
        title: "Melt & serve",
        detail:
          "Top with mozzarella cheese, cover until melted, and garnish with basil before serving."
      }
    ]
  },

  {
    recipe_id: "creamy-cajun-chicken-potatoes",
    title: "Creamy Cajun Chicken & Potatoes",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🥔",
    tags: ["Crockpot", "Creamy", "High-Protein"],
    dish_category: "Casseroles & Bakes",
    description:
      "Baby potatoes and peppers slow-cook under Cajun-seasoned chicken, then everything gets stirred into a creamy Greek yogurt, cream cheese, and Parmesan sauce.",
    prep_time_mins: 10,
    cook_time_mins: 400,
    native_serving: 5,
    accent: "#C48A3D",

    macro_profiles: {
      serving_5: { calories: 489, protein_g: 51, fat_g: 4, carbs_g: 34 }
    },

    scaling_options: [5],

    ingredients_by_serving: {
      serving_5: [
        { item: "Chicken breast", prep: "", quantity: "2", unit: "lbs", category: "Meat" },
        { item: "Baby potatoes", prep: "halved", quantity: "700", unit: "g", category: "Produce" },
        { item: "Low fat Greek yogurt", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Light cream cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Chicken broth", prep: "", quantity: "1", unit: "cup", category: "Pantry" },
        { item: "Red bell pepper", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Onion", prep: "sliced", quantity: "1", unit: "", category: "Produce" },
        { item: "Cajun seasoning", prep: "", quantity: "2", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Parmesan cheese", prep: "", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Fresh parsley", prep: "for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Layer the crockpot",
        detail: "Add potatoes, peppers, and onion to the crockpot."
      },
      {
        step_number: 2,
        title: "Season & top with chicken",
        detail:
          "Place chicken on top and season with Cajun seasoning and garlic powder, then pour broth over everything."
      },
      {
        step_number: 3,
        title: "Cook & shred",
        detail: "Cook on LOW for 6 to 7 hours, then shred the chicken."
      },
      {
        step_number: 4,
        title: "Stir in the creamy sauce",
        detail:
          "Stir in the Greek yogurt, cream cheese, and Parmesan. Mix until creamy and fully combined, then garnish with parsley."
      }
    ]
  },

  {
    recipe_id: "honey-garlic-chicken-rice",
    title: "Honey Garlic Chicken Rice",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🍯",
    tags: ["Crockpot", "Asian-Inspired", "High-Protein"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Shredded chicken and jasmine rice simmered in a honey garlic sauce with ginger, soy, and bell peppers, finished with broccoli and melted mozzarella.",
    prep_time_mins: 10,
    cook_time_mins: 380,
    native_serving: 6,
    accent: "#CB8A3A",

    macro_profiles: {
      serving_6: { calories: 478, protein_g: 49, fat_g: 3, carbs_g: 41 }
    },

    scaling_options: [6],

    ingredients_by_serving: {
      serving_6: [
        { item: "Boneless skinless chicken breast", prep: "", quantity: "2", unit: "lbs", category: "Meat" },
        { item: "Jasmine rice", prep: "uncooked", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Chicken broth", prep: "low sodium", quantity: "2", unit: "cups", category: "Pantry" },
        { item: "Sugar free honey garlic sauce", prep: "", quantity: "1/3", unit: "cup", category: "Pantry" },
        { item: "Red bell pepper", prep: "diced", quantity: "1", unit: "", category: "Produce" },
        { item: "Broccoli florets", prep: "", quantity: "1", unit: "cup", category: "Produce" },
        { item: "Garlic", prep: "minced", quantity: "1", unit: "tbsp", category: "Produce" },
        { item: "Ginger", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Low sodium soy sauce", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Reduced fat mozzarella cheese", prep: "", quantity: "1", unit: "cup", category: "Dairy" },
        { item: "Green onions", prep: "for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Load the crockpot",
        detail:
          "Add chicken, broth, honey garlic sauce, garlic, ginger, soy sauce, and peppers to the crockpot."
      },
      {
        step_number: 2,
        title: "Cook & shred",
        detail: "Cook on LOW for 6 hours. Remove the chicken and shred."
      },
      {
        step_number: 3,
        title: "Cook the rice",
        detail:
          "Stir the uncooked rice into the crockpot and cook another 45 to 60 minutes until tender, adding the broccoli during the final 20 minutes."
      },
      {
        step_number: 4,
        title: "Finish & serve",
        detail:
          "Stir the shredded chicken back in with the mozzarella cheese. Garnish with green onions before serving."
      }
    ]
  },

  {
    recipe_id: "crispy-hot-honey-chicken-bowls",
    title: "Crispy Hot Honey Chicken Bowls",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🔥",
    tags: ["Skillet", "Spicy-Sweet", "High-Protein"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Cornstarch-coated chicken bites pan-seared until golden and crispy, then tossed in a sweet-and-spicy honey hot sauce and served over jasmine rice with green beans.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#BF5A2E",

    macro_profiles: {
      serving_4: { calories: 499, protein_g: 53, fat_g: 11, carbs_g: 42 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Boneless skinless chicken breast", prep: "diced", quantity: "600", unit: "g", category: "Meat" },
        { item: "Jasmine rice", prep: "cooked", quantity: "450", unit: "g", category: "Pantry" },
        { item: "Green beans", prep: "", quantity: "300", unit: "g", category: "Produce" },
        { item: "Honey", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Hot sauce", prep: "", quantity: "30", unit: "g", category: "Pantry" },
        { item: "Cornstarch", prep: "", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "10", unit: "ml", category: "Pantry" },
        { item: "Salt, pepper & garlic powder", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Coat the chicken",
        detail: "Coat the diced chicken lightly with cornstarch and seasonings."
      },
      {
        step_number: 2,
        title: "Sear until crispy",
        detail: "Cook in olive oil until golden and crispy."
      },
      {
        step_number: 3,
        title: "Make the sauce & toss",
        detail: "Mix the honey and hot sauce together, then toss the chicken in the sauce."
      },
      {
        step_number: 4,
        title: "Serve",
        detail: "Serve over rice with green beans, divided into 4 servings."
      }
    ]
  },

  {
    recipe_id: "bbq-chicken-mac-cheese-bowl",
    title: "BBQ Chicken Mac & Cheese Bowl",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🧀",
    tags: ["High-Protein", "Comfort Food", "Quick"],
    dish_category: "Casseroles & Bakes",
    description:
      "High-protein macaroni tossed with seared chicken, steamed broccoli, and a smooth BBQ cheese sauce made with light cheddar and almond milk.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#A8522E",

    macro_profiles: {
      serving_4: { calories: 497, protein_g: 52, fat_g: 11, carbs_g: 43 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Boneless skinless chicken breast", prep: "", quantity: "600", unit: "g", category: "Meat" },
        { item: "High-protein macaroni", prep: "dry", quantity: "240", unit: "g", category: "Pantry" },
        { item: "Light cheddar cheese", prep: "shredded", quantity: "120", unit: "g", category: "Dairy" },
        { item: "Unsweetened almond milk", prep: "", quantity: "250", unit: "ml", category: "Dairy" },
        { item: "Sugar-free BBQ sauce", prep: "", quantity: "80", unit: "g", category: "Pantry" },
        { item: "Broccoli florets", prep: "", quantity: "300", unit: "g", category: "Produce" },
        { item: "Cornstarch", prep: "", quantity: "10", unit: "g", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the pasta & chicken",
        detail:
          "Cook the pasta according to package directions. Cook the chicken, season lightly, and dice."
      },
      {
        step_number: 2,
        title: "Steam the broccoli",
        detail: "Steam the broccoli until tender."
      },
      {
        step_number: 3,
        title: "Make the cheese sauce",
        detail:
          "Heat the almond milk, cheese, and cornstarch until smooth, then stir in the BBQ sauce."
      },
      {
        step_number: 4,
        title: "Toss & serve",
        detail: "Toss the pasta, broccoli, and chicken with the cheese sauce, divided into 4 servings."
      }
    ]
  },

  {
    recipe_id: "chicken-taco-rice-skillet",
    title: "Chicken Taco Rice Skillet",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🌮",
    tags: ["Skillet", "Tex-Mex", "High-Protein"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Taco-seasoned chicken, sautéed peppers and onions, rice, black beans, and salsa come together in one skillet, topped with melted cheese.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#C1622E",

    macro_profiles: {
      serving_4: { calories: 497, protein_g: 52, fat_g: 11, carbs_g: 43 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Boneless skinless chicken breast", prep: "", quantity: "600", unit: "g", category: "Meat" },
        { item: "Rice", prep: "cooked", quantity: "500", unit: "g", category: "Pantry" },
        { item: "Black beans", prep: "drained", quantity: "200", unit: "g", category: "Pantry" },
        { item: "Bell peppers", prep: "diced", quantity: "300", unit: "g", category: "Produce" },
        { item: "Onion", prep: "diced", quantity: "150", unit: "g", category: "Produce" },
        { item: "Salsa", prep: "", quantity: "120", unit: "g", category: "Pantry" },
        { item: "Light shredded cheese", prep: "", quantity: "60", unit: "g", category: "Dairy" },
        { item: "Taco seasoning", prep: "", quantity: "15", unit: "g", category: "Pantry" },
        { item: "Olive oil", prep: "", quantity: "10", unit: "ml", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Cook the chicken",
        detail: "Cook the chicken with taco seasoning, then remove and slice."
      },
      {
        step_number: 2,
        title: "Sauté the vegetables",
        detail: "Sauté the peppers and onions in olive oil."
      },
      {
        step_number: 3,
        title: "Combine & heat through",
        detail: "Add the rice, beans, salsa, and chicken, and heat through."
      },
      {
        step_number: 4,
        title: "Top & serve",
        detail: "Top with cheese before serving."
      }
    ]
  },

  {
    recipe_id: "cajun-blackened-crab-stuffed-salmon",
    title: "Cajun Blackened Crab Stuffed Salmon over Jasmine Rice & Broccolini",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🦀",
    tags: ["Seafood", "Date-Night", "High-Protein"],
    dish_category: "Grilled & Sheet-Pan",
    description:
      "Cajun-seared salmon fillets stuffed with a creamy Parmesan crab filling, served over jasmine rice with roasted broccolini and a squeeze of lemon.",
    prep_time_mins: 20,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#B0524A",

    macro_profiles: {
      serving_4: { calories: 720, protein_g: 52, fat_g: 34, carbs_g: 42 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Salmon fillets", prep: "skin-on, about 170g each (680g total)", quantity: "4", unit: "", category: "Meat" },
        { item: "Cajun seasoning", prep: "for the salmon", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Olive oil", prep: "for the salmon", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt and pepper", prep: "to taste, for the salmon", quantity: "", unit: "", category: "Pantry" },
        { item: "Lump crab meat", prep: "", quantity: "8", unit: "oz", category: "Meat" },
        { item: "Light cream cheese", prep: "softened", quantity: "3", unit: "tbsp", category: "Dairy" },
        { item: "Mayonnaise", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Parmesan cheese", prep: "grated", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Green onion", prep: "finely chopped", quantity: "2", unit: "tbsp", category: "Produce" },
        { item: "Cajun seasoning", prep: "for the crab stuffing", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Lemon juice", prep: "", quantity: "1", unit: "tsp", category: "Produce" },
        { item: "Broccolini", prep: "", quantity: "1", unit: "lb", category: "Produce" },
        { item: "Olive oil", prep: "for the broccolini", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt", prep: "for the broccolini", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "for the broccolini", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Jasmine rice", prep: "uncooked", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Water or chicken broth", prep: "", quantity: "3", unit: "cups", category: "Pantry" },
        { item: "Salt", prep: "for the rice", quantity: "1/2", unit: "tsp", category: "Pantry" },
        { item: "Lemon", prep: "cut into wedges, for serving", quantity: "1", unit: "", category: "Produce" },
        { item: "Fresh parsley", prep: "for garnish", quantity: "", unit: "", category: "Produce" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Prepare the rice",
        detail:
          "Rinse the jasmine rice until the water runs clear. In a saucepan, combine rice, water or broth, and salt. Bring to a boil, reduce to low, cover, and simmer for 15 minutes. Remove from heat and let sit covered for 5 minutes, then fluff with a fork."
      },
      {
        step_number: 2,
        title: "Roast the broccolini",
        detail:
          "Preheat the oven to 400°F (200°C). Toss broccolini with olive oil, salt, and pepper. Roast on a sheet pan for 12–15 minutes until tender-crisp."
      },
      {
        step_number: 3,
        title: "Make the crab stuffing",
        detail:
          "In a bowl, mix the crab meat, cream cheese, mayonnaise, Parmesan, green onion, Cajun seasoning, and lemon juice until combined."
      },
      {
        step_number: 4,
        title: "Stuff the salmon",
        detail:
          "Pat the salmon dry. With a sharp knife, cut a slit lengthwise in the center of each fillet to create a pocket (do not cut all the way through). Stuff with the crab mixture."
      },
      {
        step_number: 5,
        title: "Cook the salmon",
        detail:
          "Brush the salmon with olive oil and coat generously with Cajun seasoning. Heat a cast-iron skillet over medium-high heat, sear skin-side down for 3–4 minutes, flip gently, then transfer the skillet to the oven. Bake at 400°F (200°C) for 8–10 minutes, until the salmon is cooked through and the stuffing is hot."
      },
      {
        step_number: 6,
        title: "Assemble the plate",
        detail:
          "Serve the salmon over jasmine rice with the roasted broccolini on the side. Garnish with lemon wedges and fresh parsley."
      }
    ]
  },

  {
    recipe_id: "creamy-lemon-chicken-orzo",
    title: "Creamy Lemon Chicken Orzo",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🍋",
    tags: ["Skillet", "One-Pan", "Comfort Food"],
    dish_category: "Skillets & Stir-Fries",
    description:
      "Seared chicken thighs nestled into a creamy lemon-Parmesan orzo with wilted spinach, all made in one pan.",
    prep_time_mins: 15,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#C9A227",

    macro_profiles: {
      serving_4: { calories: 540, protein_g: 42, fat_g: 22, carbs_g: 46 }
    },

    scaling_options: [4],

    ingredients_by_serving: {
      serving_4: [
        { item: "Boneless skinless chicken thighs", prep: "", quantity: "1.75", unit: "lb", category: "Meat" },
        { item: "Salt", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Black pepper", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Garlic powder", prep: "", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Dried oregano", prep: "or Italian seasoning", quantity: "1", unit: "tsp", category: "Pantry" },
        { item: "Olive oil", prep: "for searing the chicken", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Dry orzo pasta", prep: "", quantity: "1 1/2", unit: "cups", category: "Pantry" },
        { item: "Yellow onion", prep: "finely diced", quantity: "1", unit: "small", category: "Produce" },
        { item: "Garlic", prep: "minced", quantity: "3", unit: "cloves", category: "Produce" },
        { item: "Chicken broth", prep: "low-sodium", quantity: "3", unit: "cups", category: "Pantry" },
        { item: "Nonfat Greek yogurt", prep: "or light cream", quantity: "1/2", unit: "cup", category: "Dairy" },
        { item: "Lemon zest", prep: "", quantity: "1", unit: "lemon", category: "Produce" },
        { item: "Lemon juice", prep: "", quantity: "1", unit: "large lemon", category: "Produce" },
        { item: "Fresh spinach", prep: "", quantity: "3", unit: "cups", category: "Produce" },
        { item: "Parmesan cheese", prep: "grated", quantity: "1/4", unit: "cup", category: "Dairy" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Season the chicken",
        detail:
          "Pat the chicken dry and season evenly with salt, pepper, garlic powder, and oregano."
      },
      {
        step_number: 2,
        title: "Sear the chicken",
        detail:
          "Heat olive oil in a large skillet over medium-high heat, add the chicken, and cook 4 to 5 minutes per side until deeply golden and cooked through. Remove and set aside."
      },
      {
        step_number: 3,
        title: "Cook the aromatics",
        detail:
          "In the same pan, add the onion and cook for 2 to 3 minutes until softened, then add the garlic and cook for 30 seconds."
      },
      {
        step_number: 4,
        title: "Toast the orzo",
        detail: "Stir in the dry orzo and cook for 1 minute to lightly toast."
      },
      {
        step_number: 5,
        title: "Simmer the orzo",
        detail:
          "Pour in the chicken broth, bring to a gentle simmer, and cook for 8 to 10 minutes, stirring occasionally, until the orzo is tender and creamy."
      },
      {
        step_number: 6,
        title: "Make it creamy",
        detail:
          "Lower the heat and stir in the Greek yogurt, lemon zest, lemon juice, and Parmesan until smooth."
      },
      {
        step_number: 7,
        title: "Add the spinach",
        detail: "Fold in the spinach and let it wilt into the orzo."
      },
      {
        step_number: 8,
        title: "Finish the dish",
        detail:
          "Nestle the chicken back into the pan and simmer for 2 to 3 minutes to warm through and absorb flavor."
      }
    ]
  },

  {
    recipe_id: "marry-me-steak-sandwich",
    title: "Marry Me Steak Sandwich",
    category: "Web Finds",
    source: "Web Finds",
    icon: "🥪",
    tags: ["Sandwich", "Date-Night", "Steak"],
    dish_category: "Sandwiches",
    description:
      "Seared New York strip steak and balsamic-caramelized onions piled on toasted ciabatta with lemon herb aioli and peppery arugula.",
    prep_time_mins: 15,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#8B4A3A",

    macro_profiles: {
      serving_2: { calories: 720, protein_g: 45, fat_g: 38, carbs_g: 48 }
    },

    scaling_options: [2],

    ingredients_by_serving: {
      serving_2: [
        { item: "New York strip steaks", prep: "", quantity: "2", unit: "", category: "Meat" },
        { item: "Yellow onions", prep: "thinly sliced", quantity: "2", unit: "large", category: "Produce" },
        { item: "Balsamic glaze", prep: "", quantity: "2", unit: "tbsp", category: "Pantry" },
        { item: "Lemon herb aioli", prep: "Stonewall Kitchen brand recommended, or homemade", quantity: "4", unit: "tbsp", category: "Pantry" },
        { item: "Fresh arugula", prep: "", quantity: "2", unit: "cups", category: "Produce" },
        { item: "Ciabatta loaf", prep: "cut into 4 sandwich-sized pieces", quantity: "1", unit: "large", category: "Pantry" },
        { item: "Butter", prep: "optional", quantity: "2", unit: "tbsp", category: "Dairy" },
        { item: "Olive oil", prep: "", quantity: "1", unit: "tbsp", category: "Pantry" },
        { item: "Salt and black pepper", prep: "to taste", quantity: "", unit: "", category: "Pantry" }
      ]
    },

    instructions: [
      {
        step_number: 1,
        title: "Bring the steaks to temp",
        detail:
          "Remove the steaks from the refrigerator 1 hour before cooking to bring them to room temperature. Season all sides generously with salt and black pepper."
      },
      {
        step_number: 2,
        title: "Sear the steaks",
        detail:
          "Heat a large skillet over medium-high heat and add the olive oil. Place the steaks fat cap side down for about 1 minute to render some fat, then cook 2–3 minutes per side, or until they reach your preferred doneness. If using butter, add it during the last flip and baste the steaks with the melted butter. Remove and let rest for 5 minutes before slicing thinly."
      },
      {
        step_number: 3,
        title: "Caramelize the onions",
        detail:
          "In the same skillet, add the sliced onions with 1 teaspoon of salt. Cook over medium heat, stirring occasionally, for 10–15 minutes until soft and golden. Add 1 tablespoon of balsamic glaze, stir, and cook another 1–2 minutes until deeply caramelized. Remove and set aside."
      },
      {
        step_number: 4,
        title: "Toast the ciabatta",
        detail:
          "Slice the ciabatta loaf into sandwich-sized pieces. Toast each piece in a skillet, grill pan, or toaster until golden and crisp."
      },
      {
        step_number: 5,
        title: "Assemble",
        detail:
          "Spread lemon herb aioli evenly on the bottom halves of the toasted ciabatta. Layer with fresh arugula, sliced steak, caramelized onions, and a drizzle of balsamic glaze. Top with the remaining ciabatta halves."
      },
      {
        step_number: 6,
        title: "Serve",
        detail: "Slice the sandwiches in half and serve warm."
      }
    ]
  }
];

/* ==========================================================================
   COLLECTIONS  —  the Recipes tab (mirrors 4WTO's Programs page)
   --------------------------------------------------------------------------
   Each collection is a "flagship card" on the Recipes screen. A LIVE
   collection links to collection.html?c=<id> and lists every recipe whose
   `source` matches `source_match`. A COMING-SOON collection renders the same
   glowing card (tappable) but opens a Coming-Soon state instead of a list.

   Card fields mirror 4WTO's program cards:
     tag      — eyebrow line (e.g. "★ Collection · Primal Diet")
     title    — card headline
     blurb    — 2-line description
     count    — meta line ("10 Recipes →" / "Coming Soon →")
     designer — attribution footer
     accent   — per-card glow color (drives border-top + ambient glow)
     icon     — faint watermark emoji, top-right
     status   — "live" | "coming-soon"
   Add a future collection by appending here — no rendering changes needed.
   ========================================================================== */
const COLLECTIONS = [
  {
    id: "two-meals-a-day",
    title: "Two Meals a Day",
    tag: "★ Collection · Primal Diet",
    blurb:
      "Primal, high-protein plates built for two-meal eating windows — " +
      "heavy on meat, eggs and vegetables, light on the clock.",
    designer: "📖 From Two Meals a Day",
    accent: "#C87A53",          // terracotta
    icon: "🍖",
    status: "live",
    source_match: "Two Meals a Day"
  },
  {
    id: "kelli-cross",
    title: "Kelli Cross' Recipes",
    tag: "★ Collection · Heritage",
    blurb:
      "Cherished heirloom hand-me-downs from Kelli's kitchen — the family " +
      "recipes worth passing on. Coming soon.",
    designer: "✍️ Kelli Cross, with Love",
    accent: "#B08D57",          // heritage gold
    icon: "🥧",
    status: "coming-soon",
    source_match: null
  },
  {
    id: "carnivore",
    title: "Carnivore",
    tag: "★ Collection · Carnivore Diet",
    blurb:
      "Zero-carb, meat-forward performance plates — beef, organs, eggs and " +
      "fat for full carnivore eating. Coming soon.",
    designer: "✍️ Designed by Mike Cross",
    accent: "#B23A48",          // crimson
    icon: "🥩",
    status: "coming-soon",
    source_match: null
  },
  {
    id: "chipotle-copycats",
    title: "Chipotle Copycats",
    tag: "★ Collection · Comfort Food",
    blurb:
      "Smoky, cheesy, chipotle-loaded copycat bowls, wraps, and quesadillas — " +
      "drive-thru favorites made bigger and better at home.",
    designer: "📖 Copycat Comfort Classics",
    accent: "#CC6A3D",          // chipotle orange
    icon: "🌶️",
    status: "live",
    source_match: "Chipotle Copycats"
  },
  {
    id: "high-protein-meal-prep",
    title: "High-Protein Meal Prep",
    tag: "★ Collection · Meal Prep",
    blurb:
      "Macro-counted, container-ready bowls built for batch cooking — big " +
      "protein, balanced carbs, zero guesswork.",
    designer: "📖 From Eating Healthy Today",
    accent: "#4E8B65",          // fresh green
    icon: "🍱",
    status: "live",
    source_match: "High-Protein Meal Prep"
  },
  {
    id: "desserts",
    title: "Desserts",
    tag: "★ Collection · Sweet Treats",
    blurb:
      "No-bake icebox cakes, trifles, and other make-ahead sweets worth " +
      "saving room for.",
    designer: "📖 Saved From Around the Web",
    accent: "#C9738B",          // dusty rose
    icon: "🍰",
    status: "live",
    source_match: "Desserts"
  },
  {
    id: "salsas",
    title: "Salsas & Dips",
    tag: "★ Collection · Fresh & No-Cook",
    blurb:
      "Fresh, no-cook salsas and dips — fruit salsas, pico, and bean-and-corn " +
      "scoopers for chips, tacos, and grilled everything.",
    designer: "📖 Saved From Around the Web",
    accent: "#C1442E",          // tomato red
    icon: "🌶️",
    status: "live",
    source_match: "Salsas"
  }
];

/* ==========================================================================
   MIKES_FAVORITES  —  Mike's curated, shipped-to-everyone favorites
   --------------------------------------------------------------------------
   This is DIFFERENT from a user's personal ❤ favorites (which live per-device
   in localStorage under mc-cookbook:favorites). This list is the canonical set
   of recipes Mike has loved — drawn from ACROSS the whole cookbook (any
   collection or diet: Two Meals a Day, Kelli's, Carnivore, his own additions),
   not just recipes he authored. It is the SAME for every visitor because it
   ships in the repo and deploys via GitHub Pages.

   It drives:
     • the "Mike's Favorites" Home module + its dedicated screen, and
     • a small "Mike's pick" star badge on those recipes' cards everywhere.

   Editing the published list:
     Mike can build it in-app with owner mode (unlock via ?owner=1 or tap the
     "Mike's" title 5×, then double-tap recipe cards). That edits a LOCAL draft;
     to publish it to all visitors, use the "Copy list" button on the Mike's
     Favorites screen and paste the array below — or just hand it to the AI to
     commit. Order here is the display order. Use exact recipe_id slugs.
   ========================================================================== */
const MIKES_FAVORITES = [
  "jalapeno-chicken-bake",
  "meat-lovers-pizza-skillet",
  "asian-turkey-meatballs-spaghetti-squash",
  "cilantro-lime-flank-steak-green-beans",
  "chicken-divan",
  "spring-vegetable-chicken-carbonara-skillet",
  "spiced-fish-taco-bowl-avocado-lime-crema",
  "dill-pickle-super-burgers",
  "beef-taco-casserole",
  "sisson-bigass-salad",
  "hearty-farmers-market-breakfast-casserole"
];

/* Expose for both classic <script> include and any future module bundling. */
if (typeof window !== "undefined") {
  window.RECIPES = RECIPES;
  window.COLLECTIONS = COLLECTIONS;
  window.MIKES_FAVORITES = MIKES_FAVORITES;
}
