import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    riskTolerance: 50,
    monthlyInvestableIncome: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const { email, password, name, age, riskTolerance, monthlyInvestableIncome } =
    formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!name) newErrors.name = "Name is required";

    if (!age) newErrors.age = "Age is required";
    else if (age < 18 || age > 120)
      newErrors.age = "Age must be between 18 and 120";

    if (riskTolerance < 1 || riskTolerance > 100)
      newErrors.riskTolerance = "Risk tolerance must be between 1 and 100";

    if (monthlyInvestableIncome < 0)
      newErrors.monthlyInvestableIncome =
        "Monthly investable income cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          age: parseInt(age),
          investmentProfile: {
            riskTolerance,
            monthlyInvestableIncome: parseFloat(monthlyInvestableIncome),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the backend
        if (data.message === "User already exists") {
          setApiError(
            "An account with this email already exists. Please try logging in instead."
          );
        } else {
          setApiError(data.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Success! Show success message and redirect
      setSuccessMessage(
        "Account created successfully! Redirecting to login..."
      );

      // Store the token if needed for future use
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join us and start your financial journey
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {successMessage}
          </motion.div>
        )}

        {/* API Error Message */}
        {apiError && (
          <motion.div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {apiError}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              required
            />
            {errors.email && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email}
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              minLength="8"
              required
            />
            {errors.password && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>

          {/* Name Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
              required
            />
            {errors.name && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>

          {/* Age Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={age}
              onChange={onChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.age ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your age"
              min="18"
              max="120"
              required
            />
            {errors.age && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.age}
              </motion.p>
            )}
          </motion.div>

          {/* Risk Tolerance Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Tolerance: {riskTolerance}%
            </label>
            <input
              type="range"
              name="riskTolerance"
              value={riskTolerance}
              onChange={onChange}
              min="1"
              max="100"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${riskTolerance}%, #e5e7eb ${riskTolerance}%, #e5e7eb 100%)`,
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
            {errors.riskTolerance && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.riskTolerance}
              </motion.p>
            )}
          </motion.div>

          {/* Monthly Investable Income Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Investable Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                name="monthlyInvestableIncome"
                value={monthlyInvestableIncome}
                onChange={onChange}
                className={`w-full px-4 py-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.monthlyInvestableIncome
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            {errors.monthlyInvestableIncome && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.monthlyInvestableIncome}
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div className="text-center mt-6" variants={itemVariants}>
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
