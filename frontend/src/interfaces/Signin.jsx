import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"; // Import icons

import { Appbar } from "../components/Appbar";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";

import "./Signin.css"; // Make sure to import the CSS

export const Signin = () => {
  // State management
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSignin = async (e) => {
    e && e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        toast.success("Sign-in successful!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => navigate("/home", { replace: true }),
        });
      } else {
        toast.error("Sign-in successful, but no token received. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Sign-in failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signin-page">
      <div className="appbar-container">
        <Appbar />
      </div>
      
      <div className="form-container">
        <div className="form-box">
          <div className="decorative-circle"></div>
          
          <Heading label="Welcome Back" />
          <SubHeading label="Enter your credentials to access your account" />
          
          <form onSubmit={handleSignin} className="signin-form">
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
              
              {/* Password Input */}
              <div className="form-field">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiLock /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
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
              </div>
              
              <div className="forgot-password">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
              
              <div className="button-wrapper">
                <Button
                  label={loading ? "Signing In..." : "Sign In"}
                  onClick={handleSignin}
                  disabled={loading}
                  className="signin-button"
                />
              </div>
              
              <div className="signup-link">
                <BottomWarning label="Don't have an account?" buttonText="Sign Up" to="/signup" />
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};