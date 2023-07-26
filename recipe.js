class IngredientsCalculator {
  constructor(currentAmount, currentPortions) {
    this.currentPortions = currentPortions;
    this.currentAmount = currentAmount;
  }

  change(button) {
    const number = parseInt(this.currentPortions.innerHTML);
    let newNumber;
    if (button.innerHTML === "+") {
      if (number >=12) return;
      this.currentPortions.innerHTML = number + 1;
      newNumber = number + 1;
    }
    if (button.innerHTML === "-") {
      if (number <=1) return;
      this.currentPortions.innerHTML = number - 1;
      newNumber = number -1 ;
    }
    this.recalculate(number, newNumber)
  }

  recalculate(oldAmount, newAmount) {
    this.currentAmount.forEach(amount => {
      const oldValue = parseFloat(amount.innerHTML);
      if (!isNaN(oldValue)) {
          const newValue = ((oldValue/oldAmount)*newAmount);
          amount.innerHTML = newValue;
      }
    })
  }

}

const portions = document.querySelector("[data-portions]")
const ingredients = document.querySelectorAll("[data-ingredient-amount]")
const buttons = document.querySelectorAll("[data-button]")

const ingredientsCalculator = new IngredientsCalculator(ingredients, portions)
buttons.forEach(button => {
  button.addEventListener('click', () => {
    ingredientsCalculator.change(button);
  })
})
