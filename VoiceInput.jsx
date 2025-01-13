import React, { useState,useEffect,useRef } from 'react';
import RecipeSuggestions from './RecipeSuggestions';
import style from './VoiceInput.module.css';
import { db,auth } from "../firebase";
import { collection, addDoc, getDocs ,doc, deleteDoc} from "firebase/firestore";

const FoodCard = ({ id,food, expiryDate, daysLeft , qty ,setFoodItems}) => {
    const expiryDateStr = expiryDate instanceof Date && !isNaN(expiryDate) ? expiryDate.toDateString() : 'Invalid Date';
    const alertShownRef = useRef(false);
    useEffect(() => {
        if(daysLeft<=3 && !alertShownRef.current){
            alert(`Hurry!${food} is expiring in ${daysLeft}`);
            alertShownRef.current = true;
        }
    },[daysLeft,food]);
    const fetchFoodURL = async (food) => {
        const apiKey = "a6f8f5611b5d4164b20226a83a9fef9b"; 

        try{
            const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${food}&apiKey=${apiKey}`);
            const data = await response.json();
            console.log(data)
            const baseUrl = "https://spoonacular.com/cdn/ingredients_100x100/";
            return data.length > 0 ? `${baseUrl}${data[0].image}` : "";

           
        } catch(err){
            console.error("Error fetching image",err);
        }
    }
    const [imgURL,setimgURL] = useState("");
    useEffect(() => {
        fetchFoodURL(food).then((url) => setimgURL(url));
    },[food]);

    const handleDelete = async () => {
        try {
            // Delete from Firestore
            console.log("Deleting document with ID: ", id);

            await deleteDoc(doc(db, "foodItems", id));
            
            // Remove from local state
            setFoodItems((prevItems) => prevItems.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error deleting food item: ", error);
            alert("Failed to delete the food item.");
        }
    };


    return (
        <div className={daysLeft>3?style.foodCard1:style.foodCard2}>
           {id && (<button onClick={handleDelete} className={style.dltBtn}>x</button>)}
            <h3>{food.toUpperCase()}</h3>
            {imgURL?(<img src = {imgURL} alt = {food}/>):(<p>Loading img</p>)}
            <p>Qty: {qty}</p>
            <p>Expires on: {expiryDate.toDateString()}</p>
            <p>{daysLeft} days left</p>
        </div>
    );
};

const VoiceInput = () => {
    const [foodName, setFoodName] = useState('');
    const [expiryDateStr, setExpiryDateStr] = useState('');
    const [foodItems, setFoodItems] = useState([]);
    const [quantity,setQuantity] = useState(1);
    const [displayMode,setDisplayMode] = useState('current');
    const [showRecipeSuggestions,setshowRecipeSuggestions] = useState(false);
    const [expiryItems,setExpiryItems] = useState([]);



    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const expiryDate = parseExpiryDate(expiryDateStr);
        if (!expiryDate) {
            alert("Please enter a valid expiry date in the format 'DD Month' (e.g., '25 January').");
            return;
        }

        const daysLeft = calculateDaysUntilExpiry(expiryDate);
        const newFoodItem = { food: foodName, expiryDate, daysLeft,quantity };

        try {
        
            
            
            await addDoc(collection(db, "foodItems"), newFoodItem);
            
        
            setFoodItems((prevItems) => [...prevItems, newFoodItem]);
    
            setFoodName('');
            setExpiryDateStr('');
            setQuantity('');
        } catch (error) {
            console.error("Error adding food item: ", error);
            alert("Failed to save the food item to the database.");
        }
    };

    const handleShowItems = () =>{
        setDisplayMode('current');
    }

    const handleDiscardItems = () =>{
        setDisplayMode('discard');
    }

    const handleRecipe = () => {
        /*const expiringItems = foodItems.filter(item => item.daysLeft <= 3 && item.daysLeft > 0);
        console.log("Expiring items: ", expiringItems);
        if (expiringItems.length > 0) {   
            setExpiryItems(expiringItems);
            setshowRecipeSuggestions(!showRecipeSuggestions); 
        } else {
            alert("No ingredients are expiring within 3 days.");
        }*/
       setshowRecipeSuggestions(!showRecipeSuggestions);
    }

    const parseExpiryDate = (expiryDateStr) => {
        const [day, month] = expiryDateStr.split(' ');
        const months = {
            January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
            July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
        };
        const dayInt = parseInt(day);
        const monthInt = months[month];
        const year = new Date().getFullYear();

        if (!dayInt || !monthInt) return null; 
        return new Date(year, monthInt - 1, dayInt);
    };

    const calculateDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysRemaining;
    };
    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "foodItems"));
                const items = querySnapshot.docs.map((doc) => {
                    const data = doc.data(); // Correctly extract the data from Firestore
                    return {
                        id: doc.id,
                        ...data,
                        expiryDate: data.expiryDate.toDate(), // Convert Firestore Timestamp to Date
                        daysLeft: calculateDaysUntilExpiry(data.expiryDate.toDate()), 
                    };
                });
                setFoodItems(items);
            } catch (error) {
                console.error("Error fetching documents: ", error);
                alert("Failed to fetch food items from the database.");
            }
        };
    
        fetchFoodItems();
    
    
        const intervalId = setInterval(() => {
            setFoodItems((prevItems) =>
                prevItems.map((item) => ({
                    ...item,
                    daysLeft: calculateDaysUntilExpiry(item.expiryDate),
                }))
            );
        }, 24 * 60 * 60 * 1000);
        return () => clearInterval(intervalId);
},[]);
    return (
        <div className={style.wrapper}>
            <div>
            <form onSubmit={handleFormSubmit} className={style.form}>
                <div>
                    <label htmlFor="foodName">Food Name:</label>
                    <input
                        id="foodName"
                        type="text"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="Enter food name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="expiryDate">Expiry Date:</label>
                    <input
                        id="expiryDate"
                        type="text"
                        value={expiryDateStr}
                        onChange={(e) => setExpiryDateStr(e.target.value)}
                        placeholder="Enter expiry date (e.g., 25 January)"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Add Food</button>
            </form>
            </div>
            <div>
                <div className={style.btnWrap}>
                    <button onClick={handleShowItems} className={style.myShow}>Show Items</button>
                    <button onClick = {handleDiscardItems} className={style.myDisc}>Discarded Items</button>
                    <button onClick={handleRecipe} className={style.myRec}>Get Recipe</button>
                </div>
                <div className={style.foodCardsContainer}>
                    {foodItems.filter((item) =>
                            displayMode === 'current' ? item.daysLeft > 0 : item.daysLeft <= 0).map((item, index) => (
                        <FoodCard
                            key={index}
                            id = {item.id}
                            food={item.food}
                            expiryDate={item.expiryDate}
                            daysLeft={item.daysLeft}
                            qty = {item.quantity}
                            setFoodItems={setFoodItems}
                        />
                    ))}
                </div>
            </div>
            {showRecipeSuggestions && (<RecipeSuggestions />)};


        </div>
    );
};

export default VoiceInput;
