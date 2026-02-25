import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import type { RootState } from '../../app/store';
import { endTransition } from '../../features/ui/transitionSlice';

const InnerTransition: React.FC = () => {
  const activeTransition = useSelector((state: RootState) => state.transition.activeTransition);
  const dispatch = useDispatch();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (activeTransition === 'INTERNAL') {
      gsap.set(overlayRef.current, { y: '-100%' });
      gsap.set(pathRef.current, { strokeDashoffset: 1000, fill: "transparent" });

      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => {
            gsap.to(overlayRef.current, {
              y: '100%',
              duration: 0.3,
              ease: 'power3.inOut',
              onComplete: () => {
                dispatch(endTransition());
                gsap.set(overlayRef.current, { y: '-100%' });
              }
            });
          }, 200);
        }
      });

      // 1. Slide in from top
      tl.to(overlayRef.current, {
        y: '0%',
        duration: 0.2,
        ease: 'power3.out'
      })
      // 2. Draw outline
      .to(pathRef.current, { strokeDashoffset: 0, duration: 0.2, ease: 'power2.inOut' })
      // 3. Fill logo
      .to(pathRef.current, { fill: '#10B77F', duration: 0.1, ease: 'power2.out' }, "-=0.05");
    }
  }, [activeTransition, dispatch]);

  if (activeTransition !== 'INTERNAL') return null;

  return (
    <div 
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0d1f2d] will-change-transform rounded-xl shadow-2xl"
      style={{ transform: 'translateY(-100%)' }}
    >
      <svg 
        ref={logoRef}
        width="100" 
        height="110" 
        viewBox="0 0 23 25" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path 
          ref={pathRef}
          d="M11.25 25L0 18.75V6.25L11.25 0L22.5 6.25V18.75L11.25 25ZM7.625 9.0625C8.10417 8.5625 8.65625 8.17708 9.28125 7.90625C9.90625 7.63542 10.5625 7.5 11.25 7.5C11.9375 7.5 12.5938 7.63542 13.2188 7.90625C13.8438 8.17708 14.3958 8.5625 14.875 9.0625L18.625 6.96875L11.25 2.875L3.875 6.96875L7.625 9.0625ZM10 21.4375V17.3438C8.875 17.0521 7.96875 16.4583 7.28125 15.5625C6.59375 14.6667 6.25 13.6458 6.25 12.5C6.25 12.2708 6.26042 12.0573 6.28125 11.8594C6.30208 11.6615 6.34375 11.4583 6.40625 11.25L2.5 9.0625V17.2812L10 21.4375ZM11.25 15C11.9375 15 12.526 14.7552 13.0156 14.2656C13.5052 13.776 13.75 13.1875 13.75 12.5C13.75 11.8125 13.5052 11.224 13.0156 10.7344C12.526 10.2448 11.9375 10 11.25 10C10.5625 10 9.97396 10.2448 9.48438 10.7344C8.99479 11.224 8.75 11.8125 8.75 12.5C8.75 13.1875 8.99479 13.776 9.48438 14.2656C9.97396 14.7552 10.5625 15 11.25 15ZM12.5 21.4375L20 17.2812V9.0625L16.0938 11.25C16.1562 11.4583 16.1979 11.6615 16.2188 11.8594C16.2396 12.0573 16.25 12.2708 16.25 12.5C16.25 13.6458 15.9062 14.6667 15.2188 15.5625C14.5312 16.4583 13.625 17.0521 12.5 17.3438V21.4375Z" 
          fill="transparent"
          stroke="#10B77F"
          strokeWidth="0.5"
          strokeDasharray="1000"
          strokeDashoffset="1000"
        />
      </svg>
    </div>
  );
};

export default InnerTransition;
