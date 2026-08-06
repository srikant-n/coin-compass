import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 32,
  className = '' 
}) => {
  return (
    <img
      src="/logo.svg"
      alt="Coin Compass Logo"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Logo;