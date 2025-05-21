document.addEventListener("DOMContentLoaded", function() {
  const currentPage = window.location.pathname.split("/").pop();

  fetch('partials/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('.navbar-placeholder').innerHTML = data;

      const toggleButton = document.getElementsByClassName("toggle-button")[0];
      const navbarLinks = document.getElementById("toggle");

      if (toggleButton && navbarLinks) {
        toggleButton.addEventListener('click', () => {
          navbarLinks.classList.toggle('active');
        });
      }

      // Underline the active page
      const navLinks = document.querySelectorAll('.navbar-links a');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        console.log(href, currentPage);
        if (href === currentPage || 
            (currentPage === 'home' && href === 'index.html') || 
            (currentPage === 'hlavni-chody' && href === 'main_dish.html') || 
            (currentPage === 'menu' && href === 'menus.html') || 
            (currentPage === 'snidane-a-predkrmy' && href === 'appetizers.html') || 
            (currentPage === 'dezerty' && href === 'desserts.html')) {
          link.style.textDecoration = 'underline';
        }
      });
    });

  fetch('partials/footer.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('.footer-placeholder').innerHTML = data;

      // ✨ Dynamicky doplníme aktuální rok do footeru
      const yearEl = document.getElementById('year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
    });

  // Load and parse recipes.csv
  fetch('../data/recipes.csv')
    .then(response => response.text())
    .then(data => {
      const recipes = [];
      const lines = data.split('\n');
      const headers = lines[0].split(';').map(header => header.replace(/\r/g, '')); // Remove carriage return character

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;
        const values = line.split(';');
        const recipe = {};
        headers.forEach((header, index) => {
          recipe[header] = values[index];
        });
        recipes.push(recipe);
      }

      // Store recipes globally
      window.recipes = recipes;

      // Pagination variables
      let currentPageIndex = 0;
      const recipesPerPage = 6; // Change to 6 recipes per page

      // Function to render recipes with pagination
      function renderRecipes(recipes, type) {
        const recipesList = document.getElementById('recipes-list');
        if (recipesList) {
          recipesList.innerHTML = '';
          const ul = document.createElement('ul');
          const start = currentPageIndex * recipesPerPage;
          const end = start + recipesPerPage;
          const paginatedRecipes = recipes.filter(recipe => recipe.type === type).slice(start, end);

          paginatedRecipes.forEach(recipe => {
            const li = document.createElement('li');
            li.textContent = recipe.name;
            li.addEventListener('click', (event) => {
              event.preventDefault();
              window.location.href = `recipe.html?id=${recipe.id}`;
            });
            ul.appendChild(li);
          });

          recipesList.appendChild(ul);

          // Create and append navigation arrows
          const navContainer = document.createElement('div');
          navContainer.classList.add('navigation-arrows');

          const prevArrow = document.createElement('a');
          prevArrow.id = 'prev-arrow';
          prevArrow.textContent = '<';
          prevArrow.style.display = currentPageIndex > 0 ? 'inline' : 'none';
          prevArrow.addEventListener('click', (event) => {
            event.preventDefault();
            if (currentPageIndex > 0) {
              currentPageIndex--;
              renderRecipes(window.recipes, recipeType);
            }
          });

          const nextArrow = document.createElement('a');
          nextArrow.id = 'next-arrow';
          nextArrow.textContent = '>';
          nextArrow.style.display = end < recipes.filter(recipe => recipe.type === type).length ? 'inline' : 'none';
          nextArrow.addEventListener('click', (event) => {
            event.preventDefault();
            if ((currentPageIndex + 1) * recipesPerPage < window.recipes.filter(recipe => recipe.type === recipeType).length) {
              currentPageIndex++;
              renderRecipes(window.recipes, recipeType);
            }
          });

          navContainer.appendChild(prevArrow);
          navContainer.appendChild(nextArrow);
          recipesList.appendChild(navContainer);
        }
      }

      // Determine the type of recipes to display based on the current page
      let recipeType;
      if (currentPage === 'hlavni-chody') {
        recipeType = 'dish';
      } else if (currentPage === 'snidane-a-predkrmy') {
        recipeType = 'appetizer';
      } else if (currentPage === 'dezerty') {
        recipeType = 'dessert';
      }

      // Generate recipe list with pagination
      if (recipeType) {
        renderRecipes(recipes, recipeType);
      }

      // Load recipe details if on recipe.html
      if (currentPage === 'recipe.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        let selectedRecipe;

        for (let i = 0; i < recipes.length; i++) {
          const recipe = recipes[i];
          if (recipe.id === recipeId) {
            selectedRecipe = new Recipe(
              recipe.id,
              recipe.name,
              recipe.type,
              recipe.image,
              recipe.portions,
              recipe.ingredients.split('|'),
              recipe.desc
            );
            break;
          }
        }

        if (selectedRecipe) {
          document.getElementById('recipe-title').textContent = selectedRecipe.name;
          document.getElementById('recipe-image').src = `assets/images/${selectedRecipe.image}`;
          document.getElementById('recipe-image').alt = selectedRecipe.name;
          document.getElementById('recipe-portions').textContent = selectedRecipe.portions;
          document.getElementById('recipe-desc').innerHTML = selectedRecipe.desc;

          // Set the document title to the recipe name
          document.title = selectedRecipe.name;

          const ingredientsTable = document.getElementById('ingredients-table');
          selectedRecipe.ingredients.forEach(ingredient => {
            if (ingredient.includes('<') && ingredient.includes('>')) {
              const headerRow = document.createElement('tr');
              const headerCell = document.createElement('th');
              headerCell.colSpan = 2;
              headerCell.innerHTML = `<strong>${ingredient.replace(/<|>/g, '')}</strong>`;
              ingredientsTable.appendChild(headerRow);
            } else {
              const [name, amount] = ingredient.split(':');
              let amountValue = '';
              let unit = amount || '';
              if (amount) {
                const match = amount.match(/^(\d+(\.\d+)?)(.*)$/);
                if (match) {
                  amountValue = match[1];
                  unit = match[3].trim();
                }
              }
              const row = document.createElement('tr');
              const nameCell = document.createElement('th');
              const amountCell = document.createElement('th');
              nameCell.textContent = name;
              amountCell.innerHTML = `<span data-ingredient-amount>${amountValue}</span> ${unit}`;
              row.appendChild(nameCell);
              row.appendChild(amountCell);
              ingredientsTable.appendChild(row);
            }
          });

          // Initialize IngredientsCalculator after ingredients are loaded
          const portions = document.getElementById("recipe-portions");
          const ingredients = document.querySelectorAll("[data-ingredient-amount]");
          const buttons = document.querySelectorAll("[data-button]");

          const ingredientsCalculator = new IngredientsCalculator(ingredients, portions);
          buttons.forEach(button => {
            button.addEventListener('click', () => {
              ingredientsCalculator.change(button);
            });
          });
        } else {
          console.log('Recipe not found for ID:', recipeId); // Debugging statement
        }
      }
    });
});

// Dynamicky nastaví <h1> pro SEO na stránce recipe.html
document.addEventListener('DOMContentLoaded', function() {
  const h1 = document.getElementById('recipe-title-h1');
  if (h1) {
    // Předpokládáme, že název receptu je v elementu s id "recipe-title" nebo podobném
    const recipeTitleEl = document.getElementById('recipe-title');
    if (recipeTitleEl && recipeTitleEl.textContent.trim() !== '') {
      h1.textContent = recipeTitleEl.textContent.trim() + ' - Cookbook de Bel-Ami';
    }
  }
});

class Recipe {
  constructor(id, name, type, image, portions, ingredients, desc) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.image = image;
    this.portions = portions;
    this.ingredients = ingredients;
    this.desc = desc;
  }
}

document.getElementById('scroll-arrow').addEventListener('click', function() {
  document.getElementById('tab-container').scrollIntoView({ behavior: 'smooth' });
});