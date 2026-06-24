import { useEffect, useState } from "react";
import { publicApi } from "@/services/publicApi";

export default function usePublicProperties() {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      try {
        const result = await publicApi.getProperties();
        if (!cancelled) {
          setProperties(result.properties || []);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setProperties([]);
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  return { properties, error, isLoading };
}
