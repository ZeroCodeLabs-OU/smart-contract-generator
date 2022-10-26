import Head from "next/head";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative">
      <Head>
        <title>NFT Launchpad</title>
        <meta name="description" content="NFT Launchpad" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative">{children}</main>
    </div>
  );
};

export default Layout;
