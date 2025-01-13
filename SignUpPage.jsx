import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./SignUpPage.module.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth} from "../firebase";
const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSignUp = async (e) => {
    e.preventDefault();
    if(password==confirmPassword){
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }
  else{
    alert("Passwords do not match!!");
  }
  };

  return (
    <div className={style.wrapper}>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className={style.myForm} onSubmit={handleSignUp}>
        <h2>Sign Up</h2>

        <div className={style.myInputs}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder=" Confirm Password" value={confirmPassword} onChange={(e) => setconfirmPassword(e.target.value)} required />

        </div>

        <div className={style.myBtn}>
            <button type="submit">Sign Up</button>
        </div>
        <p>
        Already have an account? <a onClick={() => navigate("/")}>Login</a>
      </p>
      </form>

    </div>
  );
};

export default SignUpPage;
