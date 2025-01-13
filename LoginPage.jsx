import style from "./LoginPage.module.css";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from "../firebase";

function LoginPage({setUser}){

    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("");

    const handleSubmit = async (e) => {
            e.preventDefault();
            try{
                const userCredentials = await signInWithEmailAndPassword(auth,email,password);
                setUser(userCredentials.user);
                alert("Login Successfull!");
                navigate("/content");
            } catch (err) {
                if (err.code === "auth/invalid-email") {
                  setError("The email address is not valid. Please check and try again.");
                } else if (err.code === "auth/invalid-credential") {
                  setError("No account found with this email/password. Please sign up.");
                } else if (err.code === "auth/wrong-password") {
                  setError("The password is incorrect. Please try again.");
                } else {
                  setError(err.message);
                }
              }
    };

    return(
        <div className = {style.wrapper}>
            <div>
                 <form onSubmit={handleSubmit} className = {style.myForm}>
                    <h2>Login</h2>
                    <div className={style.myInputs}>
                        <input type = "email" placeholder = "Email" onChange={(e) => {setEmail(e.target.value)}} />
                        <input type = "password" placeholder = "Password" onChange={(e) => {setPassword(e.target.value)}} />
                    </div>
                    <div className={style.myBtn}>
                        <button type = "submit" >Log in</button>
                    </div>
                    <p>
                        Not Registered?<a onClick={() => navigate("/signUp")}>Click here.</a>
                    </p>
                </form>
                {error && <p>{error}</p>}
            </div>

        </div>
    )

}

export default LoginPage;