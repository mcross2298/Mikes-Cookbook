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
    recipe_id: "caribbean-seafood-stew",
    title: "Caribbean Seafood Stew",
    category: "Primal",
    source: "Two Meals a Day",
    icon: "🦐",
    tags: ["Quick", "Seafood", "One-Pot"],
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
  }
];

/* Expose for both classic <script> include and any future module bundling. */
if (typeof window !== "undefined") window.RECIPES = RECIPES;
