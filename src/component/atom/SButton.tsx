import { Button, type ButtonProps } from "@mui/material";

interface SButtonProps extends ButtonProps {}
const SButton: React.FC<SButtonProps> = (props) => {
  return <Button variant="contained" {...props} />;
};

export default SButton;
