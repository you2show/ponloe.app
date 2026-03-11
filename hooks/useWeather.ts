import { useQuery } from '@tanstack/react-query';

export interface WeatherData {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
    time: string;
}

export function useWeather(lat?: number, lon?: number) {
    const fetchWeather = async () => {
        if (lat === undefined || lon === undefined) {
            return null;
        }

        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        
        if (!res.ok) {
            throw new Error(`Weather API error: ${res.status}`);
        }
        
        const data = await res.json();
        if (data.current_weather) {
            return data.current_weather as WeatherData;
        }
        return null;
    };

    const { data: weather, isLoading: loading } = useQuery({
        queryKey: ['weather', lat, lon],
        queryFn: fetchWeather,
        enabled: lat !== undefined && lon !== undefined,
        staleTime: 1000 * 60 * 30, // 30 minutes
        refetchInterval: 1000 * 60 * 30, // 30 minutes
        retry: 2,
    });

    return { weather, loading };
}
