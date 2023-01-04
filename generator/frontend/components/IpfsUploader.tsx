import React, { useState } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import all from "it-all";
import { INFURA_PROJECT_ID, INFURA_SECRET_KEY } from "@/libs/constants";
import { Button, FormControl } from "@mui/material";

const auth =
  "Basic " +
  Buffer.from(INFURA_PROJECT_ID + ":" + INFURA_SECRET_KEY).toString("base64");

const ipfs = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export const IpfsUploader = ({
  label,
  acceptType,
  setUrl,
  isPrereveal
}: {
  label: string;
  acceptType: string;
  setUrl: any;
  isPrereveal?:boolean
}) => {
  const [files, setFiles] = useState<FileList | Array<any> | null>([]);
  const [filesUrl, setFilesUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const uploadFiles = async (files: any) => {
    let fileObjectsArray = Array.from(files).map((file: any) => {
      return {
        path: file.name,
        content: file,
      };
    });

    const results = await all(
      ipfs.addAll(fileObjectsArray, { wrapWithDirectory: !isPrereveal ? true : false })
    );

    console.log(results);
    return results;
  };

  const returnFilesUrl = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    const results = await uploadFiles(files);
    const length = results.length;
    // @ts-ignore
    const FilesHash = results[length - 1].cid._baseCache.get("z");
    const FilesUrl = "https://infura-ipfs.io/ipfs/" + FilesHash + (!isPrereveal ? "/" : "");
    setUrl(FilesUrl);
    setFilesUrl(FilesUrl);
    setLoading(false);
    setUploaded(true);
  };

  const filesAndUploadButton = () => {
    if (files?.length !== 0) {
      if (!loading) {
        return (
          <div>
            {uploaded ? (
              <h4 className="my-3">
                ✅&nbsp;
                <a
                  href={filesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  {files!.length} Files
                </a>
                &nbsp;Uploaded
              </h4>
            ) : (
              <div className="flex flex-row justify-center items-center">
                <Button className="mb-3" type="submit">
                  Upload ({Array.from(files!).length} Files)
                </Button>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="fixed left-0 top-0 w-screen h-screen bg-orange-400 bg-opacity-30 flex flex-row justify-center items-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-pink-500"></div>
          </div>
        );
      }
    }
  };

  return (
    <div>
      <form onSubmit={returnFilesUrl}>
        <FormControl fullWidth>
          <Button variant="contained" component="label">
            Select {label} Files
            <input
              required
              type="file"
              accept={acceptType}
              multiple={!isPrereveal ? true : false}
              onChange={(e) => setFiles(e.target.files)}
              hidden
            />
          </Button>
        </FormControl>
        {filesAndUploadButton()}
      </form>
    </div>
  );
};
