import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, { successMsg, errorMsg, onSuccess, onError } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      if (successMsg) toast.success(successMsg);
      if (onSuccess) onSuccess(result?.data);
      return result?.data;
    } catch (err) {
      const msg = err?.response?.data?.message || errorMsg || 'Something went wrong.';
      setError(msg);
      toast.error(msg);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
