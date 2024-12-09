import { TextField } from "@mui/material";

const InputField = ({ label, value, onChange, ...props }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={onChange}
    sx={{ mt: 2 }}
    {...props}
  />
);

export default InputField;
