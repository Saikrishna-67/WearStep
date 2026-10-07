import React, { useEffect, useRef, useId } from 'react';
import { animate } from 'animejs';

export const LiquidGoldEmblem = ({
  size = 128,
  color = 'var(--gold-bright)',
  className = '',
  interactive = true,
}) => {
  const rawId = useId();
  const filterId = `displacementFilter-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const turbulenceRef = useRef(null);
  const displacementRef = useRef(null);
  const polygonRef = useRef(null);

  useEffect(() => {
    let animFilter = null;
    let animPoly = null;

    if (turbulenceRef.current && displacementRef.current && polygonRef.current) {
      try {
        animFilter = animate([turbulenceRef.current, displacementRef.current], {
          baseFrequency: 0.05,
          scale: 15,
          alternate: true,
          loop: true,
          duration: 2200,
        });

        animPoly = animate(polygonRef.current, {
          points: '64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100',
          alternate: true,
          loop: true,
          duration: 2200,
        });
      } catch (err) {
        console.warn('Anime.js SVG animation initialization:', err);
      }
    }

    return () => {
      try {
        if (animFilter && typeof animFilter.pause === 'function') animFilter.pause();
        if (animPoly && typeof animPoly.pause === 'function') animPoly.pause();
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <div
      className={`liquid-gold-emblem-wrap ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
      }}
      title="WearStep Liquid Morphing Seal"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        style={{
          overflow: 'visible',
          filter: 'drop-shadow(0 8px 20px rgba(212, 166, 74, 0.35))',
        }}
      >
        <defs>
          <filter id={filterId}>
            <feTurbulence
              ref={turbulenceRef}
              type="turbulence"
              numOctaves="2"
              baseFrequency="0"
              result="turbulence"
            />
            <feDisplacementMap
              ref={displacementRef}
              in2="turbulence"
              in="SourceGraphic"
              scale="1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <linearGradient id={`goldGrad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4CD6A" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6218" />
          </linearGradient>
        </defs>
        <polygon
          ref={polygonRef}
          points="64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96"
          fill={`url(#goldGrad-${filterId})`}
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
};
