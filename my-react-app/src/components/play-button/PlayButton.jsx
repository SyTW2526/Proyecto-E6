import { useState } from "react";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

function PlayButton() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  const stylePlayButton = {
    backgroundColor: isClicked ? "red" : "green",
    "&:hover": {
      backgroundColor: isClicked ? "darkRed" : "darkGreen",
    },
  };

  return (
    <Button
      disableRipple
      sx={stylePlayButton}
      variant="contained"
      onClick={handleClick}
      endIcon={isClicked ? <StopIcon /> : <PlayArrowIcon />}
    >
      {isClicked ? "STOP" : "PLAY"}
    </Button>
  );
}

export default PlayButton;
