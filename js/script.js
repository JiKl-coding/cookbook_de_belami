document.addEventListener("DOMContentLoaded", function() {
  const currentPage = window.location.pathname.split("/").pop(); // Move currentPage declaration here

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
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') || 
            (currentPage === 'main_dish.html' && href === 'main_dish.html') || 
            (currentPage === 'menus.html' && href === 'menus.html') || 
            (currentPage === 'appetizers.html' && href === 'appetizers.html') || 
            (currentPage === 'desserts.html' && href === 'desserts.html')) {
          link.style.textDecoration = 'underline';
        }
      });
    });

  fetch('partials/footer.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('.footer-placeholder').innerHTML = data;
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

      // Generate recipe list
      const recipesList = document.getElementById('recipes-list');
      if (recipesList) {
        const ul = document.createElement('ul');
        recipes.forEach(recipe => {
          if ((recipe.type === 'dish' && currentPage === 'main_dish.html') ||
              (recipe.type === 'appetizer' && currentPage === 'appetizers.html') ||
              (recipe.type === 'dessert' && currentPage === 'desserts.html')) {
            const li = document.createElement('li');
            li.textContent = recipe.name;
            li.addEventListener('click', (event) => {
              event.preventDefault();
              window.location.href = `recipe.html?id=${recipe.id}`;
            });
            ul.appendChild(li);
          }
        });
        recipesList.appendChild(ul);
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