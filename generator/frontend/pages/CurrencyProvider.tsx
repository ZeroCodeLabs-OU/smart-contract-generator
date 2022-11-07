import{ createContext, useContext, useState } from "react";
import {CurrencyContextState} from "../libs/types"

const contextDefaultValues: CurrencyContextState = {
  currency: "",
  handleCurrencyChange: () => {}
};

export const CurrencyContext = createContext<CurrencyContextState>(contextDefaultValues);

export const useCurrency = () => useContext(CurrencyContext);

function CurrencyProvider({children}:any) {

    const [currency, setCurrency] = useState<string>("eth")

    const handleCurrencyChange = (selectedOption:any, next:any) => {
      setCurrency(selectedOption)
      let chainNo = selectedOption === "eth" ? 5 : selectedOption === "bsc" ? 97 : selectedOption === "matic" ? 80001 : 5 ;
      next(chainNo);
    }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        handleCurrencyChange,
      }}
    >
    {children}

    </CurrencyContext.Provider>
  );
}

export default CurrencyProvider;
