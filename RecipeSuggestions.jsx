/*import React, { useState } from 'react';
import axios from 'axios';

const RecipeSuggestions = ({ ingredients }) => {
    const[recipes, setRecipes] = useState([]);
    const[loading, setLoading] = useState(false);

    const API_KEY = '42de194ef1504eb4b923db1f3650bcf0';
    
        const getRecipes = async () => {
            setLoading(true);
            try {
                const soonToExpireIngredients = ingredients.map((item) => item.food); 
                if (soonToExpireIngredients.length === 0) {
                    alert('No ingredients expiring within 3 days');
                    setLoading(false);
                    return;
                }
                const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
                    params: {
                        apiKey: API_KEY,
                        ingredients: soonToExpireIngredients.join(','),
                        number: 5,
                    },
                });
                setRecipes(response.data);
            } catch (error) {
                console.error("error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        };
        
   

    return(
        <div>
            <h2>Recipe Suggestions</h2>
            <div>
                {recipes.length > 0 ? (
                   recipes.map((recipe) => (
                    <div key={recipe.id}>
                        <h3>{recipe.title}</h3>
                        <img src={recipe.image} alt={recipe.title} />
                        <a href={`https://spoonacular.com/recipes/${recipe.title.replaceAll(' ' , '-').toLowerCase()}-${recipe.id}`} 
                        target = "_blank" rel = "noopener noreferrer">View Recipe</a>
                        </div>
                   ))
                   ) : (
                    <p>No recipe found. Add ingredients and try again.</p>
                   )}
            </div>
        </div>

    );
};
          
export default RecipeSuggestions;
*/

import React, { useState, useEffect } from 'react';
import { db } from "../firebase"; // Assuming firebase setup
import { collection, getDocs } from "firebase/firestore";
import style from './RecipeSuggestions.module.css';

const RecipeSuggestions = () => {
  const [ingredients, setIngredients] = useState('');
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  
  // Function to fetch recipes from Firestore
  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return recipes;
    } catch (error) {
      console.error("Error fetching recipes: ", error);
      alert("Failed to fetch recipes.");
      return [];
    }
  };

  // Function to handle recipe search
  const searchRecipes = async () => {
    if (!ingredients) {
      alert("Please enter some ingredients.");
      return;
    }

    const enteredIngredients = ingredients.split(',').map(ingredient => ingredient.trim().toLowerCase());
    
    const recipes = await fetchRecipes();
    
    // Filter recipes where ingredients match
    const matching = recipes.filter(recipe => {
      const recipeIngredients = recipe.ingredients.map(ingredient => ingredient.toLowerCase());
      return enteredIngredients.every(ingredient => recipeIngredients.includes(ingredient));
    });

    if (matching.length > 0) {
      setMatchingRecipes(matching);
    } else {
      alert("No recipes found with these ingredients.");
      setMatchingRecipes([]);
    }
  };

  return (
    <div>
      <h2>Recipe Search</h2>
      <div>
        <input
          type="text"
          placeholder="Enter ingredients (comma-separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button onClick={searchRecipes}>Search</button>
      </div>
      <div>
        {matchingRecipes.length > 0 ? (
          <div>
            <h3>Matching Recipes:</h3>
            {matchingRecipes.map(recipe => (
              <div key={recipe.id}>
                <h4>{recipe.name}</h4>
            <div className={style.ingWrap}>
                <p><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
                <p><strong>Instructions:</strong> {recipe.instructions}</p>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <p>No matching recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeSuggestions;
