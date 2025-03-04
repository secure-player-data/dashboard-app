import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Map from 'ol/Map';
import View from 'ol/View';
import { Feature } from 'ol';
import { Heatmap as HeatmapLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { useEffect, useRef } from 'react';
import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj';

function generateDummyCoordinates(numPoints = 1000) {
  const xBound = 2300;
  const yBound = 1300;
  let x = Math.floor(Math.random() * (xBound * 2)) - xBound;
  let y = Math.floor(Math.random() * (yBound * 2)) - yBound;
  let coords = [];

  for (let i = 0; i < numPoints; i++) {
    x += Math.floor(Math.random() * 100) - 50;
    y += Math.floor(Math.random() * 60) - 30;

    x = Math.max(-xBound, Math.min(xBound, x));
    y = Math.max(-yBound, Math.min(yBound, y));

    const z = Math.random() * 1.5;

    coords.push({ x, y, z });
  }

  return coords;
}

export default function Heatmap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const coords = generateDummyCoordinates();

  useEffect(() => {
    if (!mapRef.current) return;

    const pitchWidth = mapRef.current.offsetWidth;
    const pitchHeight = mapRef.current.offsetHeight;

    const pitchProjection = new Projection({
      code: 'PITCH',
      units: 'pixels',
      extent: [0, 0, pitchWidth, pitchHeight],
    });

    addProjection(pitchProjection);
    addCoordinateTransforms(
      'EPSG:4326',
      'PITCH',
      (coord) => coord,
      (coord) => coord
    );

    const view = new View({
      projection: pitchProjection,
      center: [0, 0],
      zoom: 1,
      extent: [0, 0, pitchWidth, pitchHeight],
      constrainOnlyCenter: true,
      multiWorld: false,
      enableRotation: false,
    });

    const features = coords.map(({ x, y, z }) => {
      const point = new Point([x, y]);
      const feature = new Feature(point);
      feature.set('weight', z || 0.5);
      return feature;
    });

    const heatmapLayer = new HeatmapLayer({
      source: new VectorSource({
        features,
      }),
      blur: 15,
      radius: 8,
      weight: (feature) => feature.get('weight') || 0.5,
    });

    const map = new Map({
      target: mapRef.current!,
      controls: [],
      interactions: [],
      layers: [heatmapLayer],
      view,
    });

    return () => map.dispose();
  }, [coords]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pitch Heatmap</CardTitle>
        <CardDescription>
          Heatmap over the players position on the pitch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video border-2 border-primary rounded-md">
          {/* Pitch lines */}
          {/* Middle line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary" />
          {/* Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-[10%] border-2 border-primary rounded-full" />
          {/* 5 meter */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 border-2 border-primary aspect-[9/16] w-[5%]" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-0.5 border-2 border-primary aspect-[9/16] w-[5%]" />
          {/* 16 meter */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 border-2 border-primary aspect-[9/16] w-[15%]" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-0.5 border-2 border-primary aspect-[9/16] w-[15%]" />

          <div id="map" ref={mapRef} className="relative z-10 w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}
