import { toast } from "react-toastify";

type ErrorData = {
  code: number;
  message: string;
};

type TxError = {
  data: ErrorData;
  error: string;
};

export const shortenAddress = (addr: string) =>
  `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

export const isEqualAddress = (addr1: string, addr2: string) => {
  return addr1.toLocaleLowerCase() === addr2.toLocaleLowerCase();
};

export const isUserRejected = (err: any) => {
  // provider user rejected error code
  return typeof err === "object" && "code" in err && err.code === 4001;
};

export const isGasEstimationError = (err: TxError): boolean =>
  err?.data?.code === -32000;

export const truncateAddress = (address: string | null | undefined) => {
  if (!address) return "No Account";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{2})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const toHex = (num: any) => {
  const val = Number(num);
  return "0x" + val.toString(16);
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * max) + min;
};

export const addActivityFeed = async (
  topic: string,
  title: string,
  description: string,
  url: string,
  images: Array<any>,
  contractAddress: string,
  walletAddress: string
) => {
  const response = await fetch("/api/addactivity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      title,
      description,
      url,
      images,
      contractAddress,
      walletAddress,
    }),
  });

  if (response.ok) {
    toast.success("Your activity is successfully posted.");
  } else {
    if (response.status == 400) {
      const data = await response.json();
      const error = data?.error;
      toast.error(error);
    } else {
      toast.error("Error occured on submitting post in server side.");
    }
  }
};
