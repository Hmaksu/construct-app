'use client';

import React, { memo, useState } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup
} from 'react-simple-maps';
import { useProjects } from '@/lib/ProjectContext';
import './WorldMap.css';

// Using a simplified topojson of the world (from UN/Natural Earth)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = () => {
    const { filteredCountry, setFilteredCountry, projects } = useProjects();
    const [tooltipContent, setTooltipContent] = useState<{ name: string, projects: number } | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Valid TopoJSON Countries
    const TOPOJSON_COUNTRIES = [
        "Fiji", "Tanzania", "W. Sahara", "Canada", "United States of America", "Kazakhstan", "Uzbekistan", "Papua New Guinea", "Indonesia", "Argentina", "Chile", "Dem. Rep. Congo", "Somalia", "Kenya", "Sudan", "Chad", "Haiti", "Dominican Rep.", "Russia", "Bahamas", "Falkland Is.", "Norway", "Greenland", "Fr. S. Antarctic Lands", "Timor-Leste", "South Africa", "Lesotho", "Mexico", "Uruguay", "Brazil", "Bolivia", "Peru", "Colombia", "Panama", "Costa Rica", "Nicaragua", "Honduras", "El Salvador", "Guatemala", "Belize", "Venezuela", "Guyana", "Suriname", "France", "Ecuador", "Puerto Rico", "Jamaica", "Cuba", "Zimbabwe", "Botswana", "Namibia", "Senegal", "Mali", "Mauritania", "Benin", "Niger", "Nigeria", "Cameroon", "Togo", "Ghana", "Côte d'Ivoire", "Guinea", "Guinea-Bissau", "Liberia", "Sierra Leone", "Burkina Faso", "Central African Rep.", "Congo", "Gabon", "Eq. Guinea", "Zambia", "Malawi", "Mozambique", "eSwatini", "Angola", "Burundi", "Israel", "Lebanon", "Madagascar", "Palestine", "Gambia", "Tunisia", "Algeria", "Jordan", "United Arab Emirates", "Qatar", "Kuwait", "Iraq", "Oman", "Vanuatu", "Cambodia", "Thailand", "Laos", "Myanmar", "Vietnam", "North Korea", "South Korea", "Mongolia", "India", "Bangladesh", "Bhutan", "Nepal", "Pakistan", "Afghanistan", "Tajikistan", "Kyrgyzstan", "Turkmenistan", "Iran", "Syria", "Armenia", "Sweden", "Belarus", "Ukraine", "Poland", "Austria", "Hungary", "Moldova", "Romania", "Lithuania", "Latvia", "Estonia", "Germany", "Bulgaria", "Greece", "Turkey", "Albania", "Croatia", "Switzerland", "Luxembourg", "Belgium", "Netherlands", "Portugal", "Spain", "Ireland", "New Caledonia", "Solomon Is.", "New Zealand", "Australia", "Sri Lanka", "China", "Taiwan", "Italy", "Denmark", "United Kingdom", "Iceland", "Azerbaijan", "Georgia", "Philippines", "Malaysia", "Brunei", "Slovenia", "Finland", "Slovakia", "Czechia", "Eritrea", "Japan", "Paraguay", "Yemen", "Saudi Arabia", "Antarctica", "N. Cyprus", "Cyprus", "Morocco", "Egypt", "Libya", "Ethiopia", "Djibouti", "Somaliland", "Uganda", "Rwanda", "Bosnia and Herz.", "Macedonia", "Serbia", "Montenegro", "Kosovo", "Trinidad and Tobago", "S. Sudan"
    ];

    // Aggregate projects by country for visual feedback
    const countryCounts = projects.reduce((acc, project) => {
        const fullLocationString = `${project.location || ''} ${project.country || ''} ${project.city || ''} ${project.region || ''}`.toLowerCase();

        let matchedCountry = TOPOJSON_COUNTRIES.find(c => fullLocationString.includes(c.toLowerCase()));

        // Handle common variations if an exact strict match wasn't found
        if (!matchedCountry) {
            if (fullLocationString.includes('united states') || fullLocationString.includes('usa') || fullLocationString.includes(', us') || fullLocationString.includes('amerika')) {
                matchedCountry = 'United States of America';
            } else if (fullLocationString.includes('united kingdom') || fullLocationString.includes('uk') || fullLocationString.includes('england') || fullLocationString.includes('london')) {
                matchedCountry = 'United Kingdom';
            } else if (fullLocationString.includes('uae') || fullLocationString.includes('dubai') || fullLocationString.includes('birleşik arap')) {
                matchedCountry = 'United Arab Emirates';
            } else if (fullLocationString.includes('türkiye') || fullLocationString.includes('turkey') || fullLocationString.includes('istanbul') || fullLocationString.includes(', tr')) {
                matchedCountry = 'Turkey';
            } else if (fullLocationString.includes(', de') || fullLocationString.includes('germany') || fullLocationString.includes('almanya') || fullLocationString.includes('berlin') || fullLocationString.includes('munich')) {
                matchedCountry = 'Germany';
            } else if (fullLocationString.includes(', jp') || fullLocationString.includes('japan') || fullLocationString.includes('japonya') || fullLocationString.includes('tokyo')) {
                matchedCountry = 'Japan';
            } else if (fullLocationString.includes(', fr') || fullLocationString.includes('france') || fullLocationString.includes('fransa') || fullLocationString.includes('paris')) {
                matchedCountry = 'France';
            } else if (fullLocationString.includes('hindistan') || fullLocationString.includes('india')) {
                matchedCountry = 'India';
            } else if (fullLocationString.includes('ermenistan') || fullLocationString.includes('armenia')) {
                matchedCountry = 'Armenia';
            } else if (fullLocationString.includes('kenya')) {
                matchedCountry = 'Kenya';
            }
        }

        if (matchedCountry) {
            acc[matchedCountry] = (acc[matchedCountry] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="world-map-container card">
            <div className="map-header">
                <div>
                    <h3>Global Footprint</h3>
                    <p>Click a highlighted country to filter the dashboard.</p>
                </div>
                {filteredCountry && (
                    <button
                        className="btn btn-outline btn-sm clear-filter-btn"
                        onClick={() => setFilteredCountry(null)}
                    >
                        Clear Filter: {filteredCountry}
                    </button>
                )}
            </div>

            <div className="map-wrapper">
                {tooltipContent && (
                    <div
                        className="map-tooltip"
                        style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
                    >
                        <h4>{tooltipContent.name}</h4>
                        <p>{tooltipContent.projects} Active Project{tooltipContent.projects !== 1 ? 's' : ''}</p>
                    </div>
                )}
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
                    <ZoomableGroup center={[0, 20]} zoom={1} minZoom={1} maxZoom={5}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const countryName = geo.properties.name;
                                    const hasProjects = countryCounts[countryName] > 0;
                                    const isActive = filteredCountry === countryName;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onClick={() => {
                                                if (hasProjects) {
                                                    setFilteredCountry(isActive ? null : countryName);
                                                }
                                            }}
                                            onMouseEnter={(e) => {
                                                if (hasProjects) {
                                                    const rect = (e.target as SVGElement).getBoundingClientRect();
                                                    // Get the map-wrapper rect to calculate relative position
                                                    const wrapper = (e.target as SVGElement).closest('.map-wrapper');
                                                    if (wrapper) {
                                                        const wrapperRect = wrapper.getBoundingClientRect();
                                                        setTooltipPosition({
                                                            x: e.clientX - wrapperRect.left,
                                                            y: e.clientY - wrapperRect.top
                                                        });
                                                        setTooltipContent({ name: countryName, projects: countryCounts[countryName] });
                                                    }
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                setTooltipContent(null);
                                            }}
                                            onMouseMove={(e) => {
                                                if (hasProjects && tooltipContent) {
                                                    const wrapper = (e.target as SVGElement).closest('.map-wrapper');
                                                    if (wrapper) {
                                                        const wrapperRect = wrapper.getBoundingClientRect();
                                                        setTooltipPosition({
                                                            x: e.clientX - wrapperRect.left,
                                                            y: e.clientY - wrapperRect.top
                                                        });
                                                    }
                                                }
                                            }}
                                            style={{
                                                default: {
                                                    fill: isActive ? "var(--accent-primary)" : hasProjects ? "#93c5fd" : "#e2e8f0",
                                                    outline: "none",
                                                    stroke: "#ffffff",
                                                    strokeWidth: 0.5,
                                                    cursor: hasProjects ? 'pointer' : 'default',
                                                    transition: "fill 250ms"
                                                },
                                                hover: {
                                                    fill: hasProjects ? "var(--accent-hover)" : "#e2e8f0",
                                                    outline: "none",
                                                    cursor: hasProjects ? 'pointer' : 'default',
                                                },
                                                pressed: {
                                                    fill: "var(--accent-primary)",
                                                    outline: "none",
                                                },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>
        </div>
    );
};

export default memo(WorldMap);
