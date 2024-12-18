class IngredientsCalculator {
  constructor(currentAmount, currentPortions) {
    this.currentPortions = currentPortions;
    this.currentAmount = currentAmount;
    this.initialPortions = parseInt(currentPortions.innerHTML); // Uložení výchozího počtu porcí
    this.initializeOriginalValues(); // Inicializace původních hodnot
  }

  change(button) {
    const number = parseInt(this.currentPortions.innerHTML);
    let newNumber;
    if (button.innerHTML === "+") {
      if (number >= 12) return;
      this.currentPortions.innerHTML = number + 1;
      newNumber = number + 1;
    }
    if (button.innerHTML === "-") {
      if (number <= 1) return;
      this.currentPortions.innerHTML = number - 1;
      newNumber = number - 1;
    }
    this.recalculate(newNumber);
  }

  initializeOriginalValues() {
    this.currentAmount.forEach(amount => {
      const oldValue = parseFloat(amount.innerHTML);
      if (!isNaN(oldValue)) {
        amount.dataset.originalValue = oldValue; // Uložení původní hodnoty do atributu "data-originalValue"
      }
    });
  }

  roundToQuarter(number) {
    const rounded = Math.round(number * 4) / 4;
    return parseFloat(rounded.toFixed(2));
  }

  recalculate(newAmount) {
    this.currentAmount.forEach(amount => {
      const originalValue = parseFloat(amount.dataset.originalValue);
      if (!isNaN(originalValue)) {
        let newValue = (originalValue / this.initialPortions) * newAmount;

        newValue = this.roundToQuarter(newValue);
        amount.innerHTML = newValue;
      }
    });
  }
}

/* moved to script.js */
/* 
const portions = document.getElementById("recipe-portions");
const ingredients = document.querySelectorAll("[data-ingredient-amount]");
const buttons = document.querySelectorAll("[data-button]");

const ingredientsCalculator = new IngredientsCalculator(ingredients, portions);
buttons.forEach(button => {
  button.addEventListener('click', () => {
    ingredientsCalculator.change(button);
  });
});
*/