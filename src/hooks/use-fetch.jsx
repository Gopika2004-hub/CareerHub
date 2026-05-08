import { useUser } from "@clerk/clerk-react";
import { useState } from "react";

const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useUser();

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    console.log("useFetch called with user:", user);
    console.log("useFetch user ID:", user?.id);

    try {
      // Use Clerk user ID as token for our API, fallback to test user for development
      const userId = user?.id || 'test-user-123';
      console.log("Using user ID:", userId);
      const response = await cb(userId, options, ...args);
      console.log("API Response:", response);
      setData(response);
      setError(null);
    } catch (error) {
      console.error("API Error:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;
