function getSelectedCategories(event) {
    event.preventDefault();
    const categorias = [];

    if (document.querySelector('input[name="Lugar"]:checked')?.value === "si") categorias.push("Lugar");
    if (document.querySelector('input[name="Comunidad"]:checked')?.value === "si") categorias.push("Comunidad");
    if (document.querySelector('input[name="Materiales"]:checked')?.value === "si") categorias.push("Materiales");
    if (document.querySelector('input[name="Agua"]:checked')?.value === "si") categorias.push("Agua");
    if (document.querySelector('input[name="Educacion"]:checked')?.value === "si") categorias.push("Educacion");
    if (document.querySelector('input[name="Gestion"]:checked')?.value === "si") categorias.push("Gestion");
    if (document.querySelector('input[name="Salud"]:checked')?.value === "si") categorias.push("Salud");
    if (document.querySelector('input[name="Energia"]:checked')?.value === "si") categorias.push("Energia");

    // Construir la URL con las categorías seleccionadas
    const url = `index.html?categorias=${categorias.join("+")}`;
    window.location.href = url;

}

window.getSelectedCategories = getSelectedCategories;