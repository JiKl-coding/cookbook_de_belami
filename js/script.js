const toggleButton = document.getElementsByClassName("toggle-button")[0]
const navbarLinks = document.getElementById("toggle")

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})

