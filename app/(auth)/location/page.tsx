"use client";

import { createClient } from "@/lib/supabase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const USER_COOKIE = "user_data";

interface NominatimResult {
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    county?: string;
    country?: string;
    country_code?: string;
  };
  display_name: string;
}

export default function LocationPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "SocialThingApp/1.0",
          },
        }
      );
      const data: NominatimResult[] = await response.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  };

  const handleInputChange = (value: string) => {
    setAddress(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const selectLocation = (result: NominatimResult) => {
    const city = result.address.city || result.address.town || result.address.village || result.address.municipality || result.address.county || "";
    const state = result.address.state || result.address.county || "";
    const fullAddress = result.display_name;
    const country = result.address.country || "";

    setAddress(fullAddress);
    setSuggestions([]);

    saveLocation({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city: city || state || "Unknown",
      country: country,
      fullAddress: fullAddress,
    });
  };

  const saveLocation = useCallback(async (locationData: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    fullAddress: string;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      const userCookie = Cookies.get(USER_COOKIE);
      if (!userCookie) {
        router.push("/sign-in");
        return;
      }

      const user = JSON.parse(userCookie);
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("users")
        .update({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          city: locationData.city,
          country: locationData.country,
          full_address: locationData.fullAddress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setError("Failed to save location. Please try again.");
        setIsLoading(false);
        return;
      }

      const newCookieData = {
        ...user,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        country: locationData.country,
      };
      Cookies.set(USER_COOKIE, JSON.stringify(newCookieData), { expires: 7 });

      router.push("/posts");
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex items-center flex-col gap-8 w-full max-w-md px-4">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl md:text-4xl font-medium md:leading-13 text-center">
            Tell us where you live
          </h2>
          <p className="text-neutral-500">
            We will show you relevant content based on your location and let you know how close you are to others
          </p>
        </div>
        <div className="w-full space-y-4 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for your city..."
            value={address}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full"
            disabled={isLoading}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((result, index) => (
                <li
                  key={index}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => selectLocation(result)}
                >
                  {result.display_name}
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center">Saving your location...</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { Input } from "@/components/ui/input";
