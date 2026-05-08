const LightBulbIcon = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Bulb Outline */}
      <path d="M15 14c.9-.7 1.5-1.8 1.5-3a4.5 4.5 0 1 0-9 0c0 1.2.6 2.3 1.5 3 .5.4.8 1 .8 1.5l.2 2.5h4l.2-2.5c0-.5.3-1.1.8-1.5z" />

      {/* Screw Base */}
      <line x1="10" y1="18" x2="14" y2="18" />
      <path d="M10 21h4a1 1 0 0 1 1 1v0H9v0a1 1 0 0 1 1-1z" />
      <line x1="10" y1="19.5" x2="14" y2="19.5" />

      {/* Curved Highlight Inside */}
      <path d="M10 8.5c.5-.5 1.2-.8 2-.8" />

      {/* Radiating Light Rays */}
      <line x1="12" y1="3" x2="12" y2="5" />       {/* Top */}
      <line x1="18.36" y1="5.64" x2="16.95" y2="7.05" /> {/* Top-Right */}
      <line x1="21" y1="11" x2="19" y2="11" />      {/* Right */}
      <line x1="18.36" y1="16.36" x2="16.95" y2="14.95" /> {/* Bottom-Right */}
      <line x1="5.64" y1="16.36" x2="7.05" y2="14.95" />   {/* Bottom-Left */}
      <line x1="3" y1="11" x2="5" y2="11" />       {/* Left */}
      <line x1="5.64" y1="5.64" x2="7.05" y2="7.05" />    {/* Top-Left */}
    </svg>
  );
};

export default LightBulbIcon;