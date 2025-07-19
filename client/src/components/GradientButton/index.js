import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const GradientButton = ({
  children,
  onClick,
  to,
  className = '',
  size = 'medium',
  variant = 'primary',
  icon,
  disabled = false,
  type = 'button',
  motionProps = {},
  ...props
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
    secondary: 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white',
    success: 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600',
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const baseClasses = `
    font-semibold rounded-xl shadow-lg transition-all duration-300
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={baseClasses}
      disabled={disabled}
      variants={buttonVariants}
      whileHover={disabled ? {} : "hover"}
      whileTap={disabled ? {} : "tap"}
      {...motionProps}
      {...props}
    >
      <span className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

GradientButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  to: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  motionProps: PropTypes.object,
};

export default GradientButton; 