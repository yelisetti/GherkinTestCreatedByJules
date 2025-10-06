document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const vegetableInput = document.getElementById('vegetable-input');
    const vegetableImageInput = document.getElementById('vegetable-image');
    const recipesContainer = document.getElementById('recipes-container');

    searchBtn.addEventListener('click', () => {
        const vegetable = vegetableInput.value.trim();
        const imageFile = vegetableImageInput.files[0];

        if (imageFile) {
            handleImageUpload(imageFile);
        } else if (vegetable) {
            findRecipes(vegetable);
        } else {
            alert('Please enter a vegetable name or select an image.');
        }
    });

    function handleImageUpload(file) {
        console.log(`Processing image: ${file.name}`);
        recipesContainer.innerHTML = `<p>Image recognition feature is not yet implemented. Here is a preview of your uploaded image:</p>`;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '200px';
            img.style.display = 'block';
            img.style.margin = '20px auto';
            recipesContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }

    async function findRecipes(vegetable) {
        const API_URL = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${vegetable}`;
        recipesContainer.innerHTML = `<p>Searching for recipes with ${vegetable}...</p>`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (!data.meals) {
                recipesContainer.innerHTML = '<p>No recipes found. Try another vegetable.</p>';
                return;
            }

            const mealDetailsPromises = data.meals.map(meal => {
                return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                    .then(res => res.json())
                    .then(detailData => detailData.meals[0]);
            });

            const mealsWithDetails = await Promise.all(mealDetailsPromises);
            displayRecipes(mealsWithDetails);

        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipesContainer.innerHTML = `<p>Could not find recipes. Please try again later.</p>`;
        }
    }

    function displayRecipes(meals) {
        recipesContainer.innerHTML = '';

        if (!meals || meals.length === 0) {
            recipesContainer.innerHTML = '<p>No recipes found. Try another vegetable.</p>';
            return;
        }

        const recipesByCuisine = meals.reduce((acc, meal) => {
            const cuisine = meal.strArea || 'General';
            if (!acc[cuisine]) {
                acc[cuisine] = [];
            }
            acc[cuisine].push({
                name: meal.strMeal,
                image: meal.strMealThumb,
                id: meal.idMeal
            });
            return acc;
        }, {});


        for (const cuisine in recipesByCuisine) {
            const cuisineSection = document.createElement('div');
            cuisineSection.classList.add('cuisine-category');

            const cuisineTitle = document.createElement('h2');
            cuisineTitle.textContent = `${cuisine} Cuisine`;
            cuisineSection.appendChild(cuisineTitle);

            recipesByCuisine[cuisine].forEach(recipe => {
                const recipeElement = document.createElement('div');
                recipeElement.classList.add('recipe');

                const recipeLink = document.createElement('a');
                recipeLink.href = `https://www.themealdb.com/meal/${recipe.id}`;
                recipeLink.target = '_blank';

                const recipeImage = document.createElement('img');
                recipeImage.src = recipe.image;
                recipeImage.alt = recipe.name;
                recipeImage.style.width = '100px';
                recipeLink.appendChild(recipeImage);

                const recipeName = document.createElement('h3');
                recipeName.textContent = recipe.name;
                recipeLink.appendChild(recipeName);

                recipeElement.appendChild(recipeLink);
                cuisineSection.appendChild(recipeElement);
            });

            recipesContainer.appendChild(cuisineSection);
        }
    }
});