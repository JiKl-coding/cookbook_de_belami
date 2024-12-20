document.addEventListener("DOMContentLoaded", function() {
  const loginContainer = document.getElementById('login-container');
  const adminContainer = document.getElementById('admin-container');
  const loginForm = document.getElementById('login-form');
  const recipeList = document.getElementById('recipe-list');
  const newRecipeButton = document.getElementById('new-recipe-button');
  const recipeFormContainer = document.getElementById('recipe-form-container');
  const recipeForm = document.getElementById('recipe-form');
  const formTitle = document.getElementById('form-title');
  const addRecipeButton = document.getElementById('add-recipe-button');
  const editRecipeButton = document.getElementById('edit-recipe-button');
  const recipeImageInput = document.getElementById('recipe-image');
  const recipeImagePreview = document.getElementById('recipe-image-preview');
  let editingRecipeId = null;

  // Check login state
  if (localStorage.getItem('isLoggedIn') === 'true') {
    showAdminPanel();
  }

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'cookbook') {
      localStorage.setItem('isLoggedIn', 'true');
      showAdminPanel();
    } else {
      alert('Invalid username or password');
    }
  });

  newRecipeButton.addEventListener('click', function() {
    formTitle.textContent = 'New Recipe';
    recipeForm.reset();
    recipeImagePreview.style.display = 'none';
    addRecipeButton.style.display = 'block';
    editRecipeButton.style.display = 'none';
    recipeFormContainer.style.display = 'block';
    editingRecipeId = null;
  });

  recipeForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const confirmation = confirm("Are you sure you want to submit this recipe?");
    if (!confirmation) {
      return;
    }
    const name = document.getElementById('recipe-name').value;
    const type = document.getElementById('recipe-type').value;
    const image = document.getElementById('recipe-image').value;
    const portions = document.getElementById('recipe-portions').value;
    const ingredients = document.getElementById('recipe-ingredients').value.split('\n').join('|');
    const desc = document.getElementById('recipe-desc').value;

    if (['appetizer', 'dish', 'dessert'].includes(type)) {
      if (editingRecipeId) {
        editRecipe(editingRecipeId, name, type, image, portions, ingredients, desc);
      } else {
        addNewRecipe(name, type, image, portions, ingredients, desc);
      }
    } else {
      alert('Invalid recipe type');
    }
  });

  recipeImageInput.addEventListener('input', function() {
    const file = recipeImageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        recipeImagePreview.src = e.target.result;
        recipeImagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      recipeImagePreview.style.display = 'none';
    }
  });

  function showAdminPanel() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
    loadRecipes();
  }

  function loadRecipes() {
    fetch('../data/recipes.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        recipeList.innerHTML = '';
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === '') continue;
          const [id, name] = line.split(';');
          const li = document.createElement('li');
          li.textContent = name;
          li.addEventListener('click', () => loadRecipeForEdit(id));
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            confirmDeleteRecipe(id);
          });
          li.appendChild(deleteButton);
          recipeList.appendChild(li);
        }
      });
  }

  function confirmDeleteRecipe(id) {
    const confirmation = confirm("Are you sure you want to delete this recipe?");
    if (confirmation) {
      deleteRecipe(id);
    }
  }

  function deleteRecipe(id) {
    fetch('../data/recipes.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.trim().split('\n');
        const newLines = lines.filter(line => !line.startsWith(id));
        const newData = newLines.join('\n');
        const cleanedData = newData.split('\n').filter(line => line.trim() !== '').join('\n'); // Remove empty lines
        fetch('http://localhost:3000/update-recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: cleanedData })
        }).then(response => {
          if (response.ok) {
            alert('Recipe deleted successfully');
            loadRecipes();
          } else {
            alert('Failed to delete recipe');
          }
        }).catch(error => {
          console.error('Error deleting recipe:', error);
          alert('Failed to delete recipe');
        });
      });
  }

  function loadRecipeForEdit(id) {
    fetch('../data/recipes.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const recipe = lines.find(line => line.startsWith(id));
        if (recipe) {
          const [id, name, type, image, portions, ingredients, desc] = recipe.split(';');
          document.getElementById('recipe-name').value = name;
          document.getElementById('recipe-type').value = type;
          document.getElementById('recipe-image').value = image;
          document.getElementById('recipe-portions').value = portions;
          document.getElementById('recipe-ingredients').value = ingredients.split('|').join('\n');
          document.getElementById('recipe-desc').value = desc;
          formTitle.textContent = 'Edit Recipe';
          addRecipeButton.style.display = 'none';
          editRecipeButton.style.display = 'block';
          recipeFormContainer.style.display = 'block';
          editingRecipeId = id;
        }
      });
  }

  function addNewRecipe(name, type, image, portions, ingredients, desc) {
    const id = generateRecipeId(type);
    const newRecipe = `${id};${name};${type};${image};${portions};${ingredients};${desc}`;
    fetch('../data/recipes.csv')
      .then(response => response.text())
      .then(data => {
        const newData = data.trim() + '\n' + newRecipe;
        const cleanedData = newData.split('\n').filter(line => line.trim() !== '').join('\n'); // Remove empty lines
        fetch('http://localhost:3000/update-recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: cleanedData })
        }).then(response => {
          if (response.ok) {
            alert('Recipe added successfully');
            loadRecipes();
            recipeFormContainer.style.display = 'none';
          } else {
            alert('Failed to add recipe');
          }
        }).catch(error => {
          console.error('Error adding recipe:', error);
          alert('Failed to add recipe');
        });
      });
  }

  function editRecipe(id, name, type, image, portions, ingredients, desc) {
    fetch('../data/recipes.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.trim().split('\n');
        const newLines = lines.map(line => {
          if (line.startsWith(id)) {
            return `${id};${name};${type};${image};${portions};${ingredients};${desc}`;
          }
          return line;
        });
        const newData = newLines.join('\n');
        const cleanedData = newData.split('\n').filter(line => line.trim() !== '').join('\n'); // Remove empty lines
        fetch('http://localhost:3000/update-recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: cleanedData })
        }).then(response => {
          if (response.ok) {
            alert('Recipe updated successfully');
            loadRecipes();
            recipeFormContainer.style.display = 'none';
          } else {
            alert('Failed to update recipe');
          }
        }).catch(error => {
          console.error('Error updating recipe:', error);
          alert('Failed to update recipe');
        });
      });
  }

  function generateRecipeId(type) {
    return `${type}-${Date.now()}`;
  }
});
