import { GoalWithIdAndUserData } from "@/types/types";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ResultContextType {
  successResults: GoalWithIdAndUserData[];
  setSuccessResults: React.Dispatch<
    React.SetStateAction<GoalWithIdAndUserData[]>
  >;
  failedResults: GoalWithIdAndUserData[];
  setFailedResults: React.Dispatch<
    React.SetStateAction<GoalWithIdAndUserData[]>
  >;
  pendingResults: GoalWithIdAndUserData[];
  setPendingResults: React.Dispatch<
    React.SetStateAction<GoalWithIdAndUserData[]>
  >;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export const ResultProvider = ({ children }: { children: ReactNode }) => {
  const [successResults, setSuccessResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [failedResults, setFailedResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [pendingResults, setPendingResults] = useState<GoalWithIdAndUserData[]>(
    []
  );

  return (
    <ResultContext.Provider
      value={{
        successResults,
        setSuccessResults,
        failedResults,
        setFailedResults,
        pendingResults,
        setPendingResults,
      }}
    >
      {children}
    </ResultContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultProvider");
  }
  return context;
};
