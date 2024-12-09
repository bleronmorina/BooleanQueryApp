import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const DropdownSelect = ({ label, value, options, onChange }) => (
  <FormControl fullWidth sx={{ mt: 2 }}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} onChange={onChange}>
      <MenuItem value="">None</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default DropdownSelect;
