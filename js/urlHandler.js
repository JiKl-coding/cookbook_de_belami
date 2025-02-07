document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll('a[href$=".html"]');
    links.forEach(link => {
        const url = new URL(link.href);
        link.href = url.pathname.replace('.html', '');
    });

    const path = window.location.pathname;
    if (path === "/" || path === "/index.html") {
        window.history.replaceState({}, '', '/home');
    } else if (path === "/appetizers.html") {
        window.history.replaceState({}, '', '/snidane-a-predkrmy');
    } else if (path === "/main_dish.html") {
        window.history.replaceState({}, '', '/hlavni-chody');
    } else if (path === "/desserts.html") {
        window.history.replaceState({}, '', '/dezerty');
    } else if (path.startsWith("/recipe.html?id=")) {
        window.history.replaceState({}, '', path.replace("/recipe.html?id=", "/recept="));
    } else if (path.endsWith('/')) {
        window.history.replaceState({}, '', path.slice(0, -1));
    } else if (!path.includes('.')) {
        window.history.replaceState({}, '', `${path}.html`);
    }
});
