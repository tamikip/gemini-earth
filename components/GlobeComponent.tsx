
import React, { useEffect, useRef, useState } from 'react';
import { GEOJSON_URL } from '../constants';
import { CountryProperties, Language } from '../types';

interface GlobeComponentProps {
  onCountryClick: (country: CountryProperties) => void;
  controlledRegions: string[];
  rebelliousRegions?: string[];
  nuclearPlants?: string[]; // New Prop
  language: Language;
  selectedCountry: CountryProperties | null;
}

declare global {
  interface Window {
    Globe: any;
  }
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ onCountryClick, controlledRegions, rebelliousRegions = [], nuclearPlants = [], language, selectedCountry }) => {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  
  // Use a ref to access the latest regions inside the closure-heavy globe callbacks
  const controlledRegionsRef = useRef(controlledRegions);
  const rebelliousRegionsRef = useRef(rebelliousRegions);
  const nuclearPlantsRef = useRef(nuclearPlants);

  useEffect(() => {
    controlledRegionsRef.current = controlledRegions;
    rebelliousRegionsRef.current = rebelliousRegions;
    nuclearPlantsRef.current = nuclearPlants;
    
    // Trigger a color update if the globe exists so the map reflects changes immediately
    if (globeInstance.current) {
       const getCapColor = (d: any) => {
          const iso = d.properties.ISO_A2;
          const isControlled = controlledRegionsRef.current.includes(iso);
          const isRebellious = rebelliousRegionsRef.current.includes(iso);

          if (isRebellious) return 'rgba(220, 38, 38, 0.8)'; // Red for rebellion
          if (isControlled) return 'rgba(6, 182, 212, 0.6)'; // Cyan for controlled
          return 'rgba(15, 23, 42, 0.8)'; // Dark Slate for others
        };
        
        const getStrokeColor = (d: any) => {
            const iso = d.properties.ISO_A2;
            const isRebellious = rebelliousRegionsRef.current.includes(iso);
            if (isRebellious) return '#ef4444';
            return '#155e75';
        }

      globeInstance.current.polygonCapColor(getCapColor);
      globeInstance.current.polygonStrokeColor(getStrokeColor);
    }
  }, [controlledRegions, rebelliousRegions, nuclearPlants]);

  // Reset zoom when selectedCountry becomes null
  useEffect(() => {
    if (!selectedCountry && globeInstance.current) {
      globeInstance.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
      }, 1500);
    }
  }, [selectedCountry]);

  useEffect(() => {
    // Load GeoJSON data once
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setCountries(data.features);
        if (globeInstance.current) {
          globeInstance.current.polygonsData(data.features);
        }
      });
  }, []);

  useEffect(() => {
    if (!globeEl.current || !window.Globe) return;

    const world = window.Globe()
      (globeEl.current)
      .backgroundColor('#000000')
      .showAtmosphere(true)
      .atmosphereColor('#06b6d4') // Cyan atmosphere
      .atmosphereAltitude(0.25)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .polygonAltitude(0.01)
      .polygonSideColor(() => 'rgba(0, 100, 200, 0.05)')
      .polygonStrokeColor((d: any) => {
         const isRebellious = rebelliousRegionsRef.current.includes(d.properties.ISO_A2);
         return isRebellious ? '#ef4444' : '#155e75';
      }) 
      .polygonCapColor((d: any) => {
        const iso = d.properties.ISO_A2;
        const isControlled = controlledRegionsRef.current.includes(iso);
        const isRebellious = rebelliousRegionsRef.current.includes(iso);

        if (isRebellious) return 'rgba(220, 38, 38, 0.8)';
        if (isControlled) return 'rgba(6, 182, 212, 0.6)';
        return 'rgba(15, 23, 42, 0.8)';
      })
      .onPolygonHover((hoverD: any) => {
        // Update cursor
        if (globeEl.current) {
          globeEl.current.style.cursor = hoverD ? 'pointer' : 'default';
        }

        // Dynamic hover color update
        world.polygonCapColor((d: any) => {
          const iso = d.properties.ISO_A2;
          const isControlled = controlledRegionsRef.current.includes(iso);
          const isRebellious = rebelliousRegionsRef.current.includes(iso);
          
          // Hover State
          if (d === hoverD) {
            if (isRebellious) return 'rgba(254, 202, 202, 0.9)'; // Bright red
            return isControlled 
              ? 'rgba(103, 232, 249, 0.9)' // Bright Cyan
              : 'rgba(56, 189, 248, 0.6)'; // Blue-ish
          }
          
          // Normal State
          if (isRebellious) return 'rgba(220, 38, 38, 0.8)';
          return isControlled 
            ? 'rgba(6, 182, 212, 0.6)' 
            : 'rgba(15, 23, 42, 0.8)';
        });

        // Highlight borders on hover
        world.polygonStrokeColor((d: any) => {
           if (d === hoverD) return '#ffffff';
           const isRebellious = rebelliousRegionsRef.current.includes(d.properties.ISO_A2);
           return isRebellious ? '#ef4444' : '#155e75';
        });
        
        // Pause rotation on hover for better UX
        world.controls().autoRotate = !hoverD;
      })
      .polygonLabel(({ properties: d }: any) => {
        const isRebellious = rebelliousRegionsRef.current.includes(d.ISO_A2);
        const hasNuke = nuclearPlantsRef.current.includes(d.ISO_A2);
        const borderColor = isRebellious ? '#ef4444' : '#00f0ff';
        const textColor = isRebellious ? '#ef4444' : '#00f0ff';

        return `
        <div style="
          background: rgba(0, 10, 20, 0.95); 
          border: 1px solid ${borderColor}; 
          color: #fff; 
          padding: 10px 15px; 
          font-family: 'Rajdhani', sans-serif; 
          border-radius: 0px 10px 0px 10px;
          backdrop-filter: blur(4px);
          box-shadow: 0 0 15px rgba(${isRebellious ? '239, 68, 68' : '0, 240, 255'}, 0.2);
          min-width: 150px;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-family: 'Orbitron'; color: ${textColor}; font-size: 1.1em; letter-spacing: 1px;">${d.ADMIN}</strong>
            ${hasNuke ? '<span style="font-size: 1.2em; color: #fbbf24;">☢️</span>' : ''}
          </div>
          <div style="margin-top: 5px; height: 1px; background: linear-gradient(90deg, ${borderColor}, transparent);"></div>
          <div style="margin-top: 5px; color: #94a3b8; font-size: 0.8em; display: flex; justify-content: space-between;">
            <span>${language === 'zh' ? '代码' : 'ISO'}:</span>
            <span style="color: #fff;">${d.ISO_A2}</span>
          </div>
          ${isRebellious ? `<div style="margin-top: 5px; color: #ef4444; font-weight: bold; font-size: 0.8em;">⚠ REBELLION</div>` : ''}
        </div>
      `})
      .onPolygonClick((d: any) => {
        if (d) {
          // Include bbox in the clicked properties for area calculation later
          const propsWithBbox = { ...d.properties, bbox: d.bbox };
          onCountryClick(propsWithBbox);
          
          const lat = (d.bbox[1] + d.bbox[3]) / 2;
          const lng = (d.bbox[0] + d.bbox[2]) / 2;
          
          world.pointOfView({
            lat,
            lng,
            altitude: 0.6 // Closer zoom
          }, 1500);
        }
      });
    
    // Auto-rotate setup
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.3;
    world.controls().minDistance = 101;
    world.controls().maxDistance = 500;

    const handleResize = () => {
      world.width(window.innerWidth);
      world.height(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    globeInstance.current = world;

    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [onCountryClick]); 

  // Update labels when language changes
  useEffect(() => {
    if (globeInstance.current) {
      globeInstance.current.polygonLabel(({ properties: d }: any) => {
        const isRebellious = rebelliousRegionsRef.current.includes(d.ISO_A2);
        const hasNuke = nuclearPlantsRef.current.includes(d.ISO_A2);
        const borderColor = isRebellious ? '#ef4444' : '#00f0ff';
        const textColor = isRebellious ? '#ef4444' : '#00f0ff';

        return `
        <div style="
          background: rgba(0, 10, 20, 0.95); 
          border: 1px solid ${borderColor}; 
          color: #fff; 
          padding: 10px 15px; 
          font-family: 'Rajdhani', sans-serif; 
          border-radius: 0px 10px 0px 10px;
          backdrop-filter: blur(4px);
          box-shadow: 0 0 15px rgba(${isRebellious ? '239, 68, 68' : '0, 240, 255'}, 0.2);
          min-width: 150px;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-family: 'Orbitron'; color: ${textColor}; font-size: 1.1em; letter-spacing: 1px;">${d.ADMIN}</strong>
             ${hasNuke ? '<span style="font-size: 1.2em; color: #fbbf24;">☢️</span>' : ''}
          </div>
          <div style="margin-top: 5px; height: 1px; background: linear-gradient(90deg, ${borderColor}, transparent);"></div>
          <div style="margin-top: 5px; color: #94a3b8; font-size: 0.8em; display: flex; justify-content: space-between;">
            <span>${language === 'zh' ? '代码' : 'ISO'}:</span>
            <span style="color: #fff;">${d.ISO_A2}</span>
          </div>
          ${isRebellious ? `<div style="margin-top: 5px; color: #ef4444; font-weight: bold; font-size: 0.8em;">⚠ REBELLION</div>` : ''}
        </div>
      `});
    }
  }, [language]);

  return <div ref={globeEl} className="absolute inset-0 z-0" />;
};

export default GlobeComponent;
