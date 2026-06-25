import React from 'react';
import atomLogo from '../../assets/atomlogo.png';

export default function AnimatedLogo() {
  return (
    <div className="animated-logo-container">
      {/* ── Atom Symbol ── */}
      <div className="atom-symbol">
        <img src={atomLogo} alt="Atom Logo" className="atom-img" width="52" height="52" />
      </div>

      {/* ── Text Section ── */}
      <div className="logo-text-section">
        <div className="logo-main-text">
          <span>at</span>
          
          {/* ── Spinning Globe 'o' ── */}
          <span className="globe-o">
            <svg viewBox="0 0 100 100" width="24" height="24" className="globe-svg">
              <circle cx="50" cy="50" r="45" className="globe-outline" />
              <g className="globe-lines">
                {/* Latitudes */}
                <path d="M 10,30 Q 50,45 90,30" className="globe-lat" />
                <path d="M 5,50 L 95,50" className="globe-lat" />
                <path d="M 10,70 Q 50,55 90,70" className="globe-lat" />
                {/* Longitudes */}
                <path d="M 50,5 A 45,45 0 0,0 50,95 A 45,45 0 0,0 50,5" className="globe-lon lon-1" />
                <path d="M 50,5 A 25,45 0 0,0 50,95 A 25,45 0 0,0 50,5" className="globe-lon lon-2" />
                <path d="M 50,5 L 50,95" className="globe-lon lon-3" />
              </g>
            </svg>
          </span>
          
          <span>ms</span>
        </div>
        
        {/* ── Subtitle ── */}
        <div className="logo-subtext">Digital Solutions</div>
      </div>
    </div>
  );
}
