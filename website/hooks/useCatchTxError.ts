import { useCallback, useState } from "react";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { isGasEstimationError, isUserRejected } from "@/libs/utils";

type TxResponse = TransactionResponse | null | { blockNumber: number };

export type CatchTxErrorReturn = {
  fetchWithCatchTxError: (
    fn: () => Promise<TxResponse>
  ) => Promise<TransactionReceipt | null>;
  loading: boolean;
};

type ErrorData = {
  code: number;
  message: string;
};

type TxError = {
  data: ErrorData;
  error: string;
};

export default function useCatchTxError(): CatchTxErrorReturn {
  const { library } = useWeb3React();
  const [loading, setLoading] = useState(false);

  const handleNormalError = useCallback(
    (error: any, tx?: TxResponse) => {
      let errMsg =
        "Please try again. Confirm the transaction and make sure you are paying enough gas!";
      if (
        !!error &&
        !!error.reason &&
        error.reason.indexOf("execution reverted: ") > -1
      ) {
        errMsg = error.reason.slice(20);
      }
      if (tx) {
        toast.error(errMsg);
      } else {
        toast.error(errMsg);
      }
    },
    [toast]
  );

  const fetchWithCatchTxError = useCallback(
    async (
      callTx: () => Promise<TxResponse>
    ): Promise<TransactionReceipt | null> => {
      let tx: TxResponse = { blockNumber: 0 };

      try {
        setLoading(true);

        tx = await callTx();
        // @ts-ignore
        const receipt = await tx.wait();
        return receipt;
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error);
          } else {
            library
              .call(tx, tx.blockNumber)
              .then(() => {
                handleNormalError(error, tx);
              })
              .catch((err: any) => {
                if (isGasEstimationError(err)) {
                  handleNormalError(error, tx);
                } else {
                  let recursiveErr = err;

                  let reason: string | undefined;

                  // for MetaMask
                  if (recursiveErr?.data?.message) {
                    reason = recursiveErr?.data?.message;
                  } else {
                    while (recursiveErr) {
                      reason =
                        recursiveErr.reason ?? recursiveErr.message ?? reason;
                      recursiveErr =
                        recursiveErr.error ?? recursiveErr.data?.originalError;
                    }
                  }

                  const REVERT_STR = "execution reverted: ";
                  const indexInfo = reason?.indexOf(REVERT_STR) || 0;
                  const isRevertedError = indexInfo ? indexInfo >= 0 : false;

                  if (isRevertedError)
                    reason = reason?.substring(indexInfo + REVERT_STR.length);

                  toast.error(
                    isRevertedError
                      ? `Transaction failed with error: ${reason}`
                      : "Transaction failed. For detailed error message:"
                  );
                }
              });
          }
        } else {
          toast.error("Rejected");
        }
      } finally {
        setLoading(false);
      }

      return null;
    },
    [handleNormalError, toast, library]
  );

  return {
    fetchWithCatchTxError,
    loading,
  };
}
