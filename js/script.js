document.addEventListener("DOMContentLoaded", function() {
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
      const currentPage = window.location.pathname.split("/").pop();
      const navLinks = document.querySelectorAll('.navbar-links a');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') || 
            (currentPage === 'main dish.html' && href === 'main dish.html') || 
            (currentPage === 'menus.html' && href === 'menus.html')) {
          link.style.textDecoration = 'underline';
        }
      });
    });

  fetch('partials/footer.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('.footer-placeholder').innerHTML = data;
    });
});

