"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CountyData } from '@/types'; // Assuming Locale is not needed here anymore
import { CaliforniaMap } from './CaliforniaMap';
import { RegionDataDisplay } from './RegionDataDisplay';
import { AISummary } from './AISummary';
import { generateRegionSummary } from '@/ai/flows/generate-region-summary';
// Removed useLanguage hook and translations import
import { useToast } from "@/hooks/use-toast";

// Dummy data for California counties
const californiaCountiesData: CountyData[] = [
  { id: 'alameda', name: 'Alameda County', population: 1671329, medianIncome: 105270 },
  { id: 'alpine', name: 'Alpine County', population: 1129, medianIncome: 67813 },
  { id: 'amador', name: 'Amador County', population: 39752, medianIncome: 66171 },
  { id: 'butte', name: 'Butte County', population: 219186, medianIncome: 55591 },
  { id: 'calaveras', name: 'Calaveras County', population: 45905, medianIncome: 63779 },
  { id: 'colusa', name: 'Colusa County', population: 21547, medianIncome: 58582 },
  { id: 'contra_costa', name: 'Contra Costa County', population: 1153526, medianIncome: 103969 },
  { id: 'del_norte', name: 'Del Norte County', population: 27811, medianIncome: 47211 },
  { id: 'el_dorado', name: 'El Dorado County', population: 193237, medianIncome: 83379 },
  { id: 'fresno', name: 'Fresno County', population: 1000000, medianIncome: 58355 },
  { id: 'glenn', name: 'Glenn County', population: 28393, medianIncome: 53403 },
  { id: 'humboldt', name: 'Humboldt County', population: 135558, medianIncome: 52360 },
  { id: 'imperial', name: 'Imperial County', population: 181215, medianIncome: 49180 },
  { id: 'inyo', name: 'Inyo County', population: 18039, medianIncome: 57016 },
  { id: 'kern', name: 'Kern County', population: 900202, medianIncome: 56919 },
  { id: 'kings', name: 'Kings County', population: 152940, medianIncome: 57910 },
  { id: 'lake', name: 'Lake County', population: 64386, medianIncome: 49521 },
  { id: 'lassen', name: 'Lassen County', population: 30573, medianIncome: 60285 },
  { id: 'los_angeles', name: 'Los Angeles County', population: 10014009, medianIncome: 76367 },
  { id: 'madera', name: 'Madera County', population: 157327, medianIncome: 57108 },
  { id: 'marin', name: 'Marin County', population: 258826, medianIncome: 129771 },
  { id: 'mariposa', name: 'Mariposa County', population: 17203, medianIncome: 56648 },
  { id: 'mendocino', name: 'Mendocino County', population: 86749, medianIncome: 56501 },
  { id: 'merced', name: 'Merced County', population: 277680, medianIncome: 54226 },
  { id: 'modoc', name: 'Modoc County', population: 8703, medianIncome: 46279 },
  { id: 'mono', name: 'Mono County', population: 13956, medianIncome: 70923 },
  { id: 'monterey', name: 'Monterey County', population: 434061, medianIncome: 81101 },
  { id: 'napa', name: 'Napa County', population: 136484, medianIncome: 93967 },
  { id: 'nevada', name: 'Nevada County', population: 100193, medianIncome: 72121 },
  { id: 'orange', name: 'Orange County', population: 3175692, medianIncome: 94441 },
  { id: 'placer', name: 'Placer County', population: 404739, medianIncome: 99734 },
  { id: 'plumas', name: 'Plumas County', population: 18807, medianIncome: 58325 },
  { id: 'riverside', name: 'Riverside County', population: 2470546, medianIncome: 74818 },
  { id: 'sacramento', name: 'Sacramento County', population: 1552058, medianIncome: 76048 },
  { id: 'san_benito', name: 'San Benito County', population: 62888, medianIncome: 93377 },
  { id: 'san_bernardino', name: 'San Bernardino County', population: 2180085, medianIncome: 70287 },
  { id: 'san_diego', name: 'San Diego County', population: 3338330, medianIncome: 86303 },
  { id: 'san_francisco', name: 'San Francisco County', population: 873965, medianIncome: 121826 },
  { id: 'san_joaquin', name: 'San Joaquin County', population: 769721, medianIncome: 71810 },
  { id: 'san_luis_obispo', name: 'San Luis Obispo County', population: 283111, medianIncome: 82777 },
  { id: 'san_mateo', name: 'San Mateo County', population: 766546, medianIncome: 136837 },
  { id: 'santa_barbara', name: 'Santa Barbara County', population: 446499, medianIncome: 83384 },
  { id: 'santa_clara', name: 'Santa Clara County', population: 1927852, medianIncome: 136817 },
  { id: 'santa_cruz', name: 'Santa Cruz County', population: 270861, medianIncome: 91304 },
  { id: 'shasta', name: 'Shasta County', population: 180080, medianIncome: 56834 },
  { id: 'sierra', name: 'Sierra County', population: 3005, medianIncome: 52031 },
  { id: 'siskiyou', name: 'Siskiyou County', population: 43539, medianIncome: 45489 },
  { id: 'solano', name: 'Solano County', population: 447643, medianIncome: 86761 },
  { id: 'sonoma', name: 'Sonoma County', population: 494336, medianIncome: 89976 },
  { id: 'stanislaus', name: 'Stanislaus County', population: 550660, medianIncome: 65598 },
  { id: 'sutter', name: 'Sutter County', population: 96971, medianIncome: 65046 },
  { id: 'tehama', name: 'Tehama County', population: 65084, medianIncome: 50798 },
  { id: 'trinity', name: 'Trinity County', population: 11966, medianIncome: 43045 },
  { id: 'tulare', name: 'Tulare County', population: 473117, medianIncome: 52927 },
  { id: 'tuolumne', name: 'Tuolumne County', population: 54501, medianIncome: 60625 },
  { id: 'ventura', name: 'Ventura County', population: 843843, medianIncome: 92987 },
  { id: 'yolo', name: 'Yolo County', population: 220500, medianIncome: 79898 },
  { id: 'yuba', name: 'Yuba County', population: 80276, medianIncome: 57592 },
];


export function DashboardClient() {
  // Using hardcoded English strings now
  const { toast } = useToast();
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const handleRegionSelect = useCallback((county: CountyData) => {
    setSelectedCounty(county);
    setAiSummary(null); // Clear previous summary
  }, []);

  const fetchAISummary = useCallback(async () => {
    if (!selectedCounty) {
      toast({ title: "County Not Selected", description: "Please select a county to generate a summary.", variant: "destructive" });
      return;
    }
    if (!selectedCounty.population || !selectedCounty.medianIncome) {
       toast({ title: "No County Data", description: "Selected county has no population or income data available for summary.", variant: "destructive" });
       return;
    }

    setIsSummaryLoading(true);
    setAiSummary(null);
    try {
      const dataPoints = `Population: ${selectedCounty.population.toLocaleString()}, Median Income: $${selectedCounty.medianIncome.toLocaleString()}`;
      const result = await generateRegionSummary({
        region: selectedCounty.name,
        language: 'en', // Hardcoded to English
        dataPoints: dataPoints,
      });
      setAiSummary(result.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setAiSummary("Error generating summary."); // Hardcoded error message
      toast({
        title: "Error Generating Summary",
        description: (error as Error).message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSummaryLoading(false);
    }
  }, [selectedCounty, toast]);

  return (
    <div className="container mx-auto p-4 flex-grow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-1 h-full flex flex-col">
          <CaliforniaMap 
            counties={californiaCountiesData} 
            onRegionSelect={handleRegionSelect}
            selectedCountyId={selectedCounty?.id}
          />
        </div>
        <div className="md:col-span-2 h-full flex flex-col space-y-6">
          <RegionDataDisplay countyData={selectedCounty} />
          <AISummary
            summary={aiSummary}
            isLoading={isSummaryLoading}
            onGenerateSummary={fetchAISummary}
            selectedCountyName={selectedCounty?.name || null}
          />
        </div>
      </div>
    </div>
  );
}
