import {
  MenuItem,
  Select as MaterialSelect,
  SelectProps as MaterialSelectProps,
} from '@mui/material';

type SelectProps = MaterialSelectProps & {
  options: Record<string, string>;
};

export const Select = (props: SelectProps) => {
  return (
    <MaterialSelect fullWidth {...props}>
      {Object.entries(props.options).map(([key, value]) => (
        <MenuItem key={key} value={key}>
          {value}
        </MenuItem>
      ))}
    </MaterialSelect>
  );
};
