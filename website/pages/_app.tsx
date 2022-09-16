import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import "@/styles/globals.css";

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <ToastContainer
        theme="colored"
        position="top-right"
        bodyClassName="toastBody"
      />
      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
      </Web3ReactProvider>
    </MuiPickersUtilsProvider>
  );
}

export default MyApp;
