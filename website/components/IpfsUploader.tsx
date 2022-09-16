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

export const IpfsUploader = ({ setUrl }: { setUrl: any }) => {
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
      ipfs.addAll(fileObjectsArray, { wrapWithDirectory: true })
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
    const FilesUrl = "https://ipfs.infura.io/ipfs/" + FilesHash;
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
              <h5>
                ✅{" "}
                <a href={filesUrl} target="_blank" rel="noopener noreferrer">
                  Files
                </a>{" "}
                Uploaded Successfully ✅
              </h5>
            ) : (
              <div>
                <Button className="mb-3" type="submit">
                  Upload Files
                </Button>

                <div className="flex flex-col justify-start items-start mb-3">
                  {Array.from(files!).map((file) => {
                    return (
                      <div
                        className="flex flex-row justify-between items-start"
                        key={file.name}
                      >
                        <div className="text-left">{file.name}</div>
                        <div className="">{file.size} kb</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div>
            <h4>Uploading Files</h4>
            <h4>Please Wait ...</h4>
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
            Upload Files
            <input
              required
              type="file"
              multiple
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
