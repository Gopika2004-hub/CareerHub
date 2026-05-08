const TargetIcon = ({ className = "w-16 h-16" }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer concentric circle */}
      <circle cx="100" cy="100" r="80" />
      
      {/* Middle concentric circle */}
      <circle cx="100" cy="100" r="50" />
      
      {/* Inner concentric circle */}
      <circle cx="100" cy="100" r="20" />
      
      {/* Solid center circle */}
      <circle cx="100" cy="100" r="8" fill="currentColor" />
    </svg>
  );
};

export default TargetIcon;
