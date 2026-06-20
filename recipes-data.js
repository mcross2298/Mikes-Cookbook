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
  },

  {
    recipe_id: "dry-rubbed-chicken-thighs-zucchini",
    title: "Dry-Rubbed Chicken Thighs with Broiled Zucchini",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🍗",
    tags: ["Sheet-Pan", "High-Protein", "Summer"],
    description:
      "Summer, when zucchini is at its best, is the perfect time to put this recipe on repeat. A little Parmesan cheese goes a long way, heightening this dish's naturally sweet and salty flavors.",
    prep_time_mins: 5,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#B86B3D",

    macro_profiles: {
      serving_2: { calories: 756, protein_g: 88, fat_g: 36, carbs_g: 20 },
      serving_4: { calories: 1512, protein_g: 176, fat_g: 72, carbs_g: 40 }
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
    description:
      "Freshly broiled salmon served with seasonal vegetables is one of the greatest culinary pairings known to humankind. Keep a supply of frozen wild-caught salmon fillets in your freezer so you can whip up this dish anytime, along with the freshest vegetables of the season.",
    prep_time_mins: 5,
    cook_time_mins: 10,
    native_serving: 2,
    accent: "#D27E5E",

    macro_profiles: {
      serving_2: { calories: 1009, protein_g: 121, fat_g: 53, carbs_g: 12 },
      serving_4: { calories: 2018, protein_g: 242, fat_g: 106, carbs_g: 24 }
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
    description:
      "Anyone who takes the leap and replaces grain-based pasta with spaghetti squash knows the truth: not only is spaghetti squash much more healthful, it also tastes much better! If you have an Instant Pot, your squash cooking time will be reduced dramatically, giving you more time to play outside.",
    prep_time_mins: 10,
    cook_time_mins: 25,
    native_serving: 2,
    accent: "#C7913F",

    macro_profiles: {
      serving_2: { calories: 746, protein_g: 63, fat_g: 46, carbs_g: 20 },
      serving_4: { calories: 1492, protein_g: 126, fat_g: 92, carbs_g: 40 }
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
    description:
      "The fresh flavor of lime pairs with the warm and grounding flavors of coconut aminos and sesame oil for a delicious and memorable combination. Flank steak marinates in just thirty minutes, making this recipe a great choice when you're pressed for time.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 4,
    accent: "#A05A45",

    macro_profiles: {
      serving_2: { calories: 588, protein_g: 38, fat_g: 42, carbs_g: 15 },
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
    description:
      "Creamy chicken with broccoli and mushrooms gets even more comforting and pleasurable with the addition of shredded Cheddar cheese.",
    prep_time_mins: 15,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#C99A4E",

    macro_profiles: {
      serving_2: { calories: 357, protein_g: 23, fat_g: 27, carbs_g: 6 },
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
    description:
      "Salty corned beef broiled with sweet Swiss cheese captures the heart's every single time, so make this when you need a little extra self-love or when you're wanting to share that love with a friend.",
    prep_time_mins: 5,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#B5654D",

    macro_profiles: {
      serving_2: { calories: 1245, protein_g: 88, fat_g: 77, carbs_g: 50 },
      serving_4: { calories: 2490, protein_g: 176, fat_g: 154, carbs_g: 100 }
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
    description:
      "Adding lemon zest to a warm recipe like this gives it a special burst of flavor, so try to keep fresh lemons in your kitchen at all times. Get comfortable using your broiler by watching the pan carefully and pulling it out when the meat and vegetables are perfectly bronze and crispy but not burned. Adjust the cooking times based on your experience, because ovens can vary a bit.",
    prep_time_mins: 15,
    cook_time_mins: 20,
    native_serving: 4,
    accent: "#B7A23F",

    macro_profiles: {
      serving_2: { calories: 533, protein_g: 35, fat_g: 41, carbs_g: 8 },
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
    description:
      "Have you tried cooking pork in the Instant Pot electric pressure cooker? Every tender and juicy bite will taste just as if it's been slow-cooking all day. After you make it this way, you won't want to cook it any other way. Enjoy this throughout the week over a big pile of leafy greens, in a bowl with cauliflower rice, or just by itself—it's that good!",
    prep_time_mins: 8,
    cook_time_mins: 30,
    native_serving: 4,
    accent: "#9C6B43",

    macro_profiles: {
      serving_2: { calories: 643, protein_g: 43, fat_g: 43, carbs_g: 23 },
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
    description:
      "Remember my brilliant suggestion to make chaffles (page 226)? Well, now's the time to haul those chaffles out of the freezer and whip up these open-faced sammies with mouthwatering lemon-garlic aioli. The savory taste will make them a favorite as soon as you take your first bite!",
    prep_time_mins: 5,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#CD9A55",

    macro_profiles: {
      serving_2: { calories: 763, protein_g: 33, fat_g: 59, carbs_g: 25 },
      serving_4: { calories: 1526, protein_g: 66, fat_g: 118, carbs_g: 50 }
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
    description:
      "If you're tired of plain old chicken, reinvigorate your taste buds with this preparation of cubed meat simmered in butter with diced tomatoes and fresh herbs and spices.",
    prep_time_mins: 10,
    cook_time_mins: 30,
    native_serving: 2,
    accent: "#D08B3E",

    macro_profiles: {
      serving_2: { calories: 1311, protein_g: 54, fat_g: 99, carbs_g: 51 },
      serving_4: { calories: 2622, protein_g: 108, fat_g: 198, carbs_g: 102 }
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
    description:
      "Use asparagus in the spring, brussels sprouts in the fall, and cabbage in the winter—or choose from among other fresh seasonal options at your local farmer's market.",
    prep_time_mins: 10,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#8FAE6B",

    macro_profiles: {
      serving_2: { calories: 1150, protein_g: 61, fat_g: 94, carbs_g: 15 },
      serving_4: { calories: 2300, protein_g: 122, fat_g: 188, carbs_g: 30 }
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
    description:
      "Cruciferous vegetables such as cauliflower and broccoli pair beautifully with healthful mayonnaise and melted cheese. Italian sausage rounds out this dish with a big dose of protein and nutritious fat. Once you've made this a couple of times, you'll have it committed to memory and be able to whip it up in no time.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#5E8C61",

    macro_profiles: {
      serving_2: { calories: 1692, protein_g: 75, fat_g: 140, carbs_g: 33 },
      serving_4: { calories: 3384, protein_g: 150, fat_g: 280, carbs_g: 66 }
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
    description:
      "This German-inspired dish is naturally low in carbohydrates, easy to prepare, and absolutely delicious.",
    prep_time_mins: 5,
    cook_time_mins: 20,
    native_serving: 2,
    accent: "#9C6B3F",

    macro_profiles: {
      serving_2: { calories: 677, protein_g: 33, fat_g: 49, carbs_g: 26 },
      serving_4: { calories: 1354, protein_g: 66, fat_g: 98, carbs_g: 52 }
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
    description:
      "Ground lamb and yellow curry powder combine with fresh vegetables and healthful fats, herbs, and Parmesan cheese to bring out comfort in every bite. This is wonderful any time of the year, because the vegetables can be sourced year-round. Fresh ground lamb is in peak season in the United States from March to October but can generally be found frozen during the winter.",
    prep_time_mins: 15,
    cook_time_mins: 25,
    native_serving: 4,
    accent: "#A65E3A",

    macro_profiles: {
      serving_2: { calories: 514, protein_g: 30, fat_g: 40, carbs_g: 10 },
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
    description:
      "It's amazing how fresh herbs and spices and good-quality cooking oils can transform plain meats. Ginger, sesame oil, and chili garlic sauce make these Asian lettuce wraps mouthwatering without leaving you feeling stuffed or bloated.",
    prep_time_mins: 10,
    cook_time_mins: 15,
    native_serving: 2,
    accent: "#6B9B7C",

    macro_profiles: {
      serving_2: { calories: 1372, protein_g: 92, fat_g: 100, carbs_g: 26 },
      serving_4: { calories: 2744, protein_g: 184, fat_g: 200, carbs_g: 52 }
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
  }
];

/* Expose for both classic <script> include and any future module bundling. */
if (typeof window !== "undefined") window.RECIPES = RECIPES;
