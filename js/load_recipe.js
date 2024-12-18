document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');

  const recipes = window.recipes || []; // Ensure recipes is defined
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
        headerRow.appendChild(headerCell);
        ingredientsTable.appendChild(headerRow);
      } else {
        const [name, amount] = ingredient.split(':');
        const row = document.createElement('tr');
        const nameCell = document.createElement('th');
        const amountCell = document.createElement('th');
        nameCell.textContent = name;
        amountCell.innerHTML = `<span data-ingredient-amount>${amount}</span>`;
        row.appendChild(nameCell);
        row.appendChild(amountCell);
        ingredientsTable.appendChild(row);
      }
    });
  } else {
    console.log('Recipe not found for ID:', recipeId); // Debugging statement
  }
});
