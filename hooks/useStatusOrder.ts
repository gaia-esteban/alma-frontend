import { useGetStatusOrderQuery } from "@/store/api/statusOrderApi";
import { useDispatch } from "react-redux";
import { setMasterData } from "@/store/slices/masterDataSlice";
import { useEffect } from "react";

export const useStatusOrder = (options?: { skip?: boolean }) => {
  const queryResult = useGetStatusOrderQuery(
    {},
    {
      skip: options?.skip,
    }
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (queryResult.data) {
      dispatch(setMasterData(queryResult.data));
    }
  }, [queryResult.data, dispatch]);

  return {
    orders: queryResult.data?.data || [],
    total: queryResult.data?.total || 0,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    errorApi: queryResult.error,
    refetch: queryResult.refetch,
  };
};
