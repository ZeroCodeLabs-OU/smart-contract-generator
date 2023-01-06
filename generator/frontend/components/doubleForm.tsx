import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface DoubleFormProps {
  label: string;
  currentId: number;
  setCurrentId: (v: number) => void;
  tokenArray: number[];
  initialArray?: number[];
  onChange: (e: any) => void;
}
const DoubleForm = ({
  currentId,
  label,
  setCurrentId,
  tokenArray,
  initialArray,
  onChange,
}: DoubleFormProps) => {
    const [value, setValue] = useState(0)
    useEffect(()=>{
        setValue(tokenArray[currentId])
    },[currentId])
    if(initialArray) {
        useEffect(()=>{
            if(initialArray) {
                setValue(0)
                onChange(0)
            }
        },[initialArray[currentId]])    
    }
    
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <FormControl>
        <InputLabel id="select-type-label">{label} id:</InputLabel>
        <Select
 
          id="select-type"
          value={currentId}
          label={`${label} id`}
          onChange={(e) => {
            setCurrentId(Number(e.target.value));
          }}
        >
          {tokenArray.map((el, i) => {
            return (
              <MenuItem value={i} key={i}>
                ID: {i} Value: {el}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <TextField
        required
        style={{ width: "50%" }}
        id="input-mint-price"
        label={`${label} for ` + currentId}
        value={value}
        type="number"
        onChange={(e) => {
            if(initialArray && initialArray[currentId] < Number(e?.target?.value)) {
                console.log(initialArray[currentId], e.target.value);
                setValue(1)
                toast.error("Reserve can't be higher than Quantity") 
            } else {
                setValue(Number(e.target.value))
                onChange(e.target.value)
            }
        }}
      />
    </div>
  );
};
export default DoubleForm;
