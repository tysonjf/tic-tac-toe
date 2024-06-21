import { useState } from "react";

export const useAsync = <TPromise extends () => Promise<any>>({
  queryFn,
  onFulfilled,
}: {
  queryFn: TPromise;
  onFulfilled: (data: NonNullable<Awaited<ReturnType<TPromise>>>) => void;
}) => {
  const [state, setState] = useState<
    "idle" | "loading" | "fulfilled" | "error"
  >("idle");
  const [data, setData] = useState<Awaited<ReturnType<TPromise>> | undefined>();
  const emit = async () => {
    try {
      setState("loading");
      const res = await queryFn();
      setData(res);
      setState("fulfilled");
      if (res !== undefined) {
        onFulfilled(res as NonNullable<Awaited<ReturnType<TPromise>>>);
      } else {
        console.error("Received undefined data from the promise.");
      }
    } catch (error) {
      console.error(error);
      setState("error");
    }
  };
  return {
    emit,
    data,
    state,
    reset: () => {
      setState("idle");
      setData(undefined);
    },
  };
};
