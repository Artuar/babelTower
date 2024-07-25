import {Button as MaterialButton, ButtonProps} from "@mui/material";

export const Button: React.FC<ButtonProps> = (props) => {
  return <MaterialButton
    sx={{ mt: 2, cursor: 'pointer', fontWeight: "bold" }}
    color="primary"
    { ...props }
  >
    {props.children}
  </MaterialButton>
}