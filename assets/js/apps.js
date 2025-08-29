console.log("js loaded");


const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const ingredientBtn = document.getElementById('ingredientBtn');
const categorySelect = document.getElementById('categorySelect');
const areaSelect = document.getElementById('areaSelect');
const mealList = document.getElementById('mealList');
const mealModal = document.getElementById('mealModal');
const modalClose = document.getElementById('modalClose');
const mealDetails = document.getElementById('mealDetails');


async function loadFilters() {
    const [catRes, areaRes] = await Promise.all([
        fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list'),
        fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
    ]);
    const { meals: categories } = await catRes.json();
    const { meals: areas } = await areaRes.json();

    categories.forEach(c => createOption(categorySelect, c.strCategory));
    areas.forEach(a => createOption(areaSelect, a.strArea));
}

function createOption(selectEl, value) {
    const opt = document.createElement('option');
    opt.value = opt.textContent = value;
    selectEl.appendChild(opt);
}


async function fetchMeals(url) {
    mealList.innerHTML = '<p>Loading…</p>';
    const res = await fetch(url);
    const data = await res.json();
    displayMeals(data.meals || []);
}

function displayMeals(meals) {
    mealList.innerHTML = meals.length
        ? meals.map(m => mealCardHTML(m)).join('')
        : '<p>No meals found.</p>';
}

function mealCardHTML(meal) {
    return `
    <div class="card">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <h3>${meal.strMeal}</h3>
      <button onclick="getMealDetails('${meal.idMeal}')">View Details</button>
    </div>
  `;
}


searchBtn.onclick = () => {
    const q = document.getElementById('searchInput').value.trim();
    if (q) fetchMeals(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`);
};
randomBtn.onclick = () => {
    fetchMeals('https://www.themealdb.com/api/json/v1/1/random.php');
};
ingredientBtn.onclick = () => {
    const i = document.getElementById('ingredientInput').value.trim();
    if (i) fetchMeals(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${i}`);
};
categorySelect.onchange = () => {
    if (categorySelect.value) {
        fetchMeals(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categorySelect.value}`);
    }
};
areaSelect.onchange = () => {
    if (areaSelect.value) {
        fetchMeals(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaSelect.value}`);
    }
};


async function getMealDetails(id) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const { meals } = await res.json();
    const m = meals[0];

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = m[`strIngredient${i}`];
        const meas = m[`strMeasure${i}`];
        if (ing) ingredients.push(`<li>${ing} – ${meas}</li>`);
    }

    mealDetails.innerHTML = `
    <h2>${m.strMeal}</h2>
    <p><strong>Category:</strong> ${m.strCategory}</p>
    <p><strong>Area:</strong> ${m.strArea}</p>
    <img src="${m.strMealThumb}" alt="${m.strMeal}"/>
    <h3>Ingredients</h3>
    <ul>${ingredients.join('')}</ul>
    <h3>Instructions</h3>
    <p>${m.strInstructions}</p>
  `;
    mealModal.classList.remove('hidden');
}


modalClose.onclick = () => mealModal.classList.add('hidden');


loadFilters();
