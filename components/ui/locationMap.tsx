import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
    onLocationChange?: (location: string, coordinates: { lat: number; lng: number }) => void;
}

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
}

function MapController({
                           searchResult,
                           onLocationChange
                       }: {
    searchResult: SearchResult | null;
    onLocationChange?: (location: string, coordinates: { lat: number; lng: number }) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (searchResult) {
            const lat = parseFloat(searchResult.lat);
            const lng = parseFloat(searchResult.lon);
            map.setView([lat, lng], 13);
        }
    }, [searchResult, map]);

    useEffect(() => {
        // Initialize Geoman drawing tools
        map.pm.addControls({
            position: 'topright',
            drawCircle: true,
            drawMarker: true,
            drawPolygon: true,
            drawRectangle: true,
            drawPolyline: false,
            drawCircleMarker: false,
            editMode: true,
            dragMode: false,
            cutPolygon: false,
            removalMode: true,
        });

        // Handle shape creation
        const handleCreate = (e: any) => {
            const layer = e.layer;
            let center: L.LatLng;

            if (layer.getBounds) {
                center = layer.getBounds().getCenter();
            } else if (layer.getLatLng) {
                center = layer.getLatLng();
            } else {
                return;
            }

            onLocationChange?.(
                `Custom boundary (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})`,
                { lat: center.lat, lng: center.lng }
            );
        };

        // Handle shape editing
        const handleEdit = (e: any) => {
            const layer = e.layer;
            let center: L.LatLng;

            if (layer.getBounds) {
                center = layer.getBounds().getCenter();
            } else if (layer.getLatLng) {
                center = layer.getLatLng();
            } else {
                return;
            }

            onLocationChange?.(
                `Edited boundary (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})`,
                { lat: center.lat, lng: center.lng }
            );
        };

        map.on('pm:create', handleCreate);
        map.on('pm:edit', handleEdit);

        return () => {
            map.off('pm:create', handleCreate);
            map.off('pm:edit', handleEdit);
            map.pm.removeControls();
        };
    }, [map, onLocationChange]);

    return null;
}

export function LocationMap({ onLocationChange }: LocationMapProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                setSearchResult(data[0]);
                onLocationChange?.(data[0].display_name, {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                });
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };


    return (
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle>Project Location & Boundaries</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Search for a location or draw boundaries on the map to define your project area
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for a place (e.g., Madre de Dios, Peru)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={isSearching}>
                        <MapPin className="w-4 h-4 mr-2" />
                        {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                </div>

                {/* Map */}
                <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                    <MapContainer
                        center={[0, 0]}
                        zoom={2}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController
                            searchResult={searchResult}
                            onLocationChange={onLocationChange}
                        />
                    </MapContainer>
                </div>

            </CardContent>
        </Card>
    );
}