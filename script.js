/* ============================================================
   Recipe Finder — script.js
   数据源：TheMealDB 公共 API（https://www.themealdb.com/api.php）
   - 搜索：search.php?s=关键词
   - 详情：lookup.php?i=菜品ID
   ============================================================ */

/* ---------- 1. 元素引用 ---------- */
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const quickTags = document.getElementById("quick-tags");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

/* ---------- 2. 接口地址 ---------- */
const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

/* ---------- 3. 事件绑定 ---------- */
searchBtn.addEventListener("click", searchMeals);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchMeals();
  if (e.key === "Escape") {
    searchInput.value = "";
    searchInput.focus();
  }
});

quickTags.addEventListener("click", (e) => {
  const tag = e.target.closest(".tag");
  if (!tag) return;
  searchInput.value = tag.dataset.term;
  searchMeals();
});

/* 事件委托：点卡片进详情（卡片是动态生成的，必须绑在父容器上） */
mealsContainer.addEventListener("click", handleMealClick);

backBtn.addEventListener("click", () => {
  mealDetails.classList.add("hidden");
  mealsContainer.classList.remove("hidden");
  resultHeading.classList.remove("hidden");
});

/* ---------- 4. 搜索 ---------- */
async function searchMeals() {
  const searchTerm = searchInput.value.trim();

  /* 先清屏：详情页 / 列表 / 标题 / 错误提示全部收起来 */
  mealDetails.classList.add("hidden");
  mealsContainer.classList.add("hidden");
  resultHeading.classList.add("hidden");
  errorContainer.classList.add("hidden");
  mealsContainer.innerHTML = "";

  if (!searchTerm) {
    errorContainer.innerHTML = "<p>Please enter a search term</p>";
    errorContainer.classList.remove("hidden");
    return;
  }

  resultHeading.textContent = `Searching for "${searchTerm}"...`;
  resultHeading.classList.remove("hidden");
  mealsContainer.innerHTML = `<div class="loading"><span class="spinner"></span> Loading recipes...</div>`;
  mealsContainer.classList.remove("hidden");

  try {
    const response = await fetch(`${SEARCH_URL}${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.meals) {
      mealsContainer.classList.add("hidden");
      resultHeading.classList.add("hidden");
      errorContainer.innerHTML = `<p>No recipes found for "${escapeHtml(searchTerm)}". Try another search term!</p>`;
      errorContainer.classList.remove("hidden");
    } else {
      resultHeading.textContent = `Search results for "${escapeHtml(searchTerm)}":`;
      resultHeading.classList.remove("hidden");
      mealsContainer.classList.remove("hidden");
      displayMeals(data.meals);
    }
  } catch (error) {
    mealsContainer.classList.add("hidden");
    resultHeading.classList.add("hidden");
    errorContainer.innerHTML = `
      <p>Something went wrong. Please try again later.</p>
      <p>Check your network connection — this page needs to reach themealdb.com.</p>`;
    errorContainer.classList.remove("hidden");
  }
}

/* ---------- 5. 渲染列表 ---------- */
function displayMeals(meals) {
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}" loading="lazy">
        <div class="meal-info">
          <h3 class="meal-title">${escapeHtml(meal.strMeal)}</h3>
          ${meal.strCategory ? `<div class="meal-category">${escapeHtml(meal.strCategory)}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
}

/* ---------- 6. 详情 ---------- */
async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.dataset.mealId;

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (data.meals && data.meals[0]) {
      renderMealDetails(data.meals[0]);

      mealsContainer.classList.add("hidden");
      resultHeading.classList.add("hidden");
      errorContainer.classList.add("hidden");
      mealDetails.classList.remove("hidden");
      mealDetails.scrollIntoView({ behavior: "smooth" });
    } else {
      errorContainer.innerHTML = "<p>Could not load recipe details. Please try another recipe.</p>";
      errorContainer.classList.remove("hidden");
    }
  } catch (error) {
    errorContainer.innerHTML = "<p>Could not load recipe details. Please try again later.</p>";
    errorContainer.classList.remove("hidden");
  }
}

function renderMealDetails(meal) {
  const ingredients = buildIngredients(meal);

  mealDetailsContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}" class="meal-details-img">
    <h2 class="meal-details-title">${escapeHtml(meal.strMeal)}</h2>
    <p class="meal-details-meta">
      ${[meal.strArea, meal.strTags].filter(Boolean).map(escapeHtml).join(" · ")}
    </p>
    <div class="meal-details-category">
      <span>${escapeHtml(meal.strCategory || "Uncategorized")}</span>
    </div>
    <div class="meal-details-instructions">
      <h3>Instructions</h3>
      <p>${escapeHtml(meal.strInstructions || "No instructions provided.")}</p>
    </div>
    <div class="meal-details-ingredients">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${ingredients
          .map(
            (item) => `
            <li>
              <i class="fas fa-check-circle"></i>
              ${escapeHtml(item.measure)} ${escapeHtml(item.ingredient)}
            </li>`
          )
          .join("")}
      </ul>
    </div>
    ${
      meal.strYoutube
        ? `<a href="${meal.strYoutube}" target="_blank" rel="noopener" class="youtube-link">
             <i class="fab fa-youtube"></i> Watch Video
           </a>`
        : ""
    }`;
}

/* TheMealDB 把配料拆成 strIngredient1..20 / strMeasure1..20 两组字段 */
function buildIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      list.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : "",
      });
    }
  }
  return list;
}

/* ---------- 7. 工具 ---------- */
/* 接口返回的文本要插进 innerHTML，先转义再拼，避免标签/引号破坏页面 */
function escapeHtml(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
