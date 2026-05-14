const mealDatabase = {
  india: {
    nonveg: [
      { name: "Egg bhurji + 2 chapati + salad", kcal: 520, protein: 28, carbs: 55, fat: 20 },
      { name: "Chicken curry + rice + dal + veg", kcal: 720, protein: 48, carbs: 80, fat: 22 },
      { name: "Grilled fish/chicken + roti + curd", kcal: 600, protein: 50, carbs: 45, fat: 18 },
      { name: "Curd + fruit + roasted chana", kcal: 350, protein: 22, carbs: 40, fat: 10 }
    ],
    veg: [
      { name: "Paneer bhurji + 2 chapati + salad", kcal: 600, protein: 32, carbs: 55, fat: 28 },
      { name: "Dal + rice + sabzi + curd", kcal: 680, protein: 30, carbs: 95, fat: 18 },
      { name: "Chickpea curry + roti + vegetables", kcal: 620, protein: 26, carbs: 85, fat: 16 },
      { name: "Sprouts chaat + curd", kcal: 360, protein: 22, carbs: 45, fat: 8 }
    ]
  },

  uk: {
    nonveg: [
      { name: "Eggs + wholegrain toast + spinach", kcal: 480, protein: 32, carbs: 38, fat: 22 },
      { name: "Chicken wrap + salad + Greek yogurt", kcal: 650, protein: 52, carbs: 60, fat: 18 },
      { name: "Salmon/chicken + potatoes + vegetables", kcal: 700, protein: 50, carbs: 65, fat: 24 },
      { name: "Cottage cheese + berries", kcal: 300, protein: 25, carbs: 28, fat: 8 }
    ],
    veg: [
      { name: "Oats + Greek yogurt + berries", kcal: 450, protein: 28, carbs: 55, fat: 12 },
      { name: "Lentil soup + wholegrain bread + salad", kcal: 600, protein: 30, carbs: 75, fat: 14 },
      { name: "Tofu/paneer bowl + potatoes + veg", kcal: 680, protein: 36, carbs: 70, fat: 24 },
      { name: "Cottage cheese + fruit", kcal: 320, protein: 25, carbs: 30, fat: 8 }
    ]
  }
};

function getCheckedConditions() {
  return Array.from(document.querySelectorAll(".checks input:checked")).map(i => i.value);
}

function calculateBMR(age, weight, height, sex) {
  return sex === "male"
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

function getTargetCalories(tdee, goal) {
  if (goal === "loss") return Math.round(tdee - 400);
  if (goal === "gain") return Math.round(tdee + 300);
  return Math.round(tdee);
}

function scaleMeal(meal, targetMealCalories) {
  const factor = targetMealCalories / meal.kcal;

  return {
    name: meal.name,
    kcal: Math.round(meal.kcal * factor),
    protein: Math.round(meal.protein * factor),
    carbs: Math.round(meal.carbs * factor),
    fat: Math.round(meal.fat * factor)
  };
}

function getMedicalWarnings(conditions, sex) {
  const warnings = [];

  if (conditions.includes("diabetes")) {
    warnings.push("Diabetes/sugar issue: avoid high-sugar meals. Keep carbs controlled and speak with a doctor/dietitian.");
  }

  if (conditions.includes("highbp")) {
    warnings.push("High BP: keep salt low. Avoid processed foods, salty sauces, and deep-fried meals.");
  }

  if (conditions.includes("lowbp")) {
    warnings.push("Low BP: do not cut salt or calories aggressively without medical guidance.");
  }

  if (conditions.includes("kidney")) {
    warnings.push("Kidney issue: protein and minerals may need strict control. Do not follow high-protein plans without medical advice.");
  }

  if (conditions.includes("heart")) {
    warnings.push("Heart issue: keep saturated fat and salt low. Confirm diet targets with a professional.");
  }

  if (conditions.includes("pregnancy")) {
    if (sex !== "female") warnings.push("Pregnancy selected but sex is not female. Check the form.");
    warnings.push("Pregnancy: do not use fat-loss calories. Use this only as general guidance.");
  }

  if (conditions.includes("eating")) {
    warnings.push("Eating disorder history: calorie tracking may be unsafe. Speak with a qualified professional.");
  }

  return warnings;
}

function generatePlan() {
  const age = Number(document.getElementById("age").value);
  const weight = Number(document.getElementById("weight").value);
  const height = Number(document.getElementById("height").value);
  const sex = document.getElementById("sex").value;
  const activity = Number(document.getElementById("activity").value);
  const goal = document.getElementById("goal").value;
  const country = document.getElementById("country").value;
  const diet = document.getElementById("diet").value;
  const mealsPerDay = Number(document.getElementById("meals").value);
  const conditions = getCheckedConditions();

  if (!age || !weight || !height) {
    alert("Enter age, weight and height.");
    return;
  }

  const dbCountry = mealDatabase[country] ? country : "uk";
  const dbDiet = mealDatabase[dbCountry][diet] ? diet : "nonveg";

  const bmr = calculateBMR(age, weight, height, sex);
  const tdee = bmr * activity;
  let target = getTargetCalories(tdee, goal);

  if (
    conditions.includes("pregnancy") ||
    conditions.includes("breastfeeding") ||
    conditions.includes("eating")
  ) {
    target = Math.round(tdee);
  }

  const proteinTarget = Math.round(weight * (goal === "gain" ? 1.8 : goal === "loss" ? 1.6 : 1.4));
  const carbsTarget = Math.round((target * 0.45) / 4);
  const fatTarget = Math.round((target * 0.25) / 9);

  const caloriesPerMeal = Math.round(target / mealsPerDay);
  const meals = mealDatabase[dbCountry][dbDiet].slice(0, mealsPerDay)
    .map(meal => scaleMeal(meal, caloriesPerMeal));

  const totalCalories = meals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const warnings = getMedicalWarnings(conditions, sex);

  let html = `
    <h2>Your Diet Plan</h2>

    <p><strong>BMR:</strong> ${Math.round(bmr)} kcal/day</p>
    <p><strong>TDEE:</strong> ${Math.round(tdee)} kcal/day</p>
    <p><strong>Goal Calories:</strong> ${target} kcal/day</p>

    <h3>Daily Macro Target</h3>
    <p><strong>Protein:</strong> ${proteinTarget}g/day</p>
    <p><strong>Carbs:</strong> around ${carbsTarget}g/day</p>
    <p><strong>Fat:</strong> around ${fatTarget}g/day</p>

    <h3>Meal Plan</h3>
  `;

  meals.forEach((meal, index) => {
    html += `
      <div class="meal">
        <h4>Meal ${index + 1}</h4>
        <p><strong>${meal.name}</strong></p>
        <p>Calories: ${meal.kcal} kcal</p>
        <p>Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fat: ${meal.fat}g</p>
      </div>
    `;
  });

  html += `
    <h3>Total From This Plan</h3>
    <p><strong>Calories:</strong> ${totalCalories} kcal</p>
    <p><strong>Protein:</strong> ${totalProtein}g</p>
    <p><strong>Carbs:</strong> ${totalCarbs}g</p>
    <p><strong>Fat:</strong> ${totalFat}g</p>
  `;

  if (warnings.length > 0) {
    html += `<div class="warning"><h3>Safety Warnings</h3>`;
    warnings.forEach(w => html += `<p>${w}</p>`);
    html += `</div>`;
  }

  html += `
    <div class="warning">
      This is a general estimate, not medical advice.
      For diabetes, pregnancy, kidney disease, heart disease, blood pressure problems,
      or eating disorder history, speak with a doctor or registered dietitian.
    </div>
  `;

  document.getElementById("result").innerHTML = html;
}