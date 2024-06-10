import { useSocket } from "@/sockets/gameSocket/useSocket";
import { setUsername } from "@/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/store/storeHooks";
import { useRef, useState } from "react";

export default function GameUsernameSignup() {
  const ws = useSocket();
  const [isLoading, setIsLoading] = useState(false);
  const username = useAppSelector(({ game }) => game.username);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isAlreadyUsername = username.length > 0;

  const handleOnSubmit = async () => {
    if (!inputRef.current || inputRef.current.value.trim().length < 3) {
      setErrorMessage("username must be at least 3 characters...");
    } else {
      try {
        setIsLoading(true);
        const isSuccess = await ws?.emitWithAck(
          "submitUsername",
          inputRef.current.value.trim(),
        );
        if (isSuccess) {
          dispatch(setUsername(inputRef.current.value.trim()));
          setErrorMessage("");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("error occurred submitting username");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg gap-4 bg-slate-800 p-8 rounded-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
      {errorMessage.length > 0 ? (
        <p className="text-center text-rose-500 bg-rose-100 rounded p-2">
          {errorMessage}
        </p>
      ) : isAlreadyUsername ? (
        <p className="text-center text-emerald-500 bg-emerald-100 p-2 rounded">
          Username submitted
        </p>
      ) : null}
      <p className="text-white text-center">Enter a username to start</p>
      <input
        className="p-2 bg-slate-300 rounded "
        placeholder="username"
        disabled={isAlreadyUsername || isLoading}
        type="text"
        ref={inputRef}
      />
      <button
        className="p-2 bg-slate-300 rounded [&:not:disabled]:hover:bg-slate-400 transition-all"
        disabled={isAlreadyUsername || isLoading}
        onClick={handleOnSubmit}
      >
        {isLoading ? "loading..." : "submit username"}
      </button>
    </div>
  );
}
