import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMail, FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi"; // Import icons

import { Appbar } from "../components/Appbar";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";

import "./Signup.css"; // Make sure to import the CSS

export const Signup = () => {
  // State management
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      newErrors.username = "Please enter a valid email address";
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSignup = async (e) => {
    e && e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        
        toast.success("Account created successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => navigate("/home", { replace: true })
        });
      } else {
        toast.error("Signup successful, but login required. Please sign in.");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Registration failed. Please try again.";
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup-page">
      <div className="appbar-container">
        <Appbar />
      </div>
      
      <div className="form-container">
        <div className="form-box">
          <div className="decorative-circle"></div>
          
          <Heading label="Create Account" />
          <p className="signup-subtitle">Join our community and get started today</p>
          
          <form onSubmit={handleSignup} className="signup-form">
            <div className="input-group">
              {/* Email Input */}
              <div className="form-field">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiMail /></span>
                  <input
                    type="email"
                    name="username"
                    placeholder="your.email@example.com"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? "input-error" : ""}`}
                  />
                </div>
                {errors.username && <div className="error-message">{errors.username}</div>}
              </div>
              
              {/* Name Fields */}
              <div className="name-fields">
                <div className="form-field">
                  <label className="form-label">First Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FiUser /></span>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`form-input ${errors.firstName ? "input-error" : ""}`}
                    />
                  </div>
                  {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>
                
                <div className="form-field">
                  <label className="form-label">Last Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FiUser /></span>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`form-input ${errors.lastName ? "input-error" : ""}`}
                    />
                  </div>
                  {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div>
              </div>
              
              {/* Password Input */}
              <div className="form-field">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? "input-error" : ""}`}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
                <div className="password-requirements">
                  Password must be at least 8 characters
                </div>
              </div>
              
              <div className="button-wrapper">
                <Button
                  label={loading ? "Creating Account..." : "Create Account"}
                  onClick={handleSignup}
                  disabled={loading}
                  className="signup-button"
                />
              </div>
              
              <div className="login-link">
                <BottomWarning label="Already have an account?" buttonText="Sign In" to="/signin" />
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};