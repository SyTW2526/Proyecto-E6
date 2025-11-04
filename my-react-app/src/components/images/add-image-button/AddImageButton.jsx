import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function AddImageButton({ onClick, sx = {} }) {
  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{ position: "fixed", bottom: 16, right: 16, ...sx }}
    >
      <AddIcon />
    </Fab>
  );
}

export default AddImageButton;