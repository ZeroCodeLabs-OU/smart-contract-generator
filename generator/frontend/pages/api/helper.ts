import axios from 'axios'
import {baseURL} from '@/libs/constants';

export const getNFTABI = () => {
    return new Promise((resolve, reject) => {
      const config:any = {
        method: "get",
        url: 'https://techyroots.com:5550/erc721ByteCode',
        headers: {},
      };
  
      axios(config)
        .then(function (response) {
          console.log(response,"re")
          if (response.data.success === true) {
            resolve(response);
          } else {
            resolve([]);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  };
  