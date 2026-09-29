import { useReactiveVar } from "@apollo/client/react";
import {
  Alert,
  Snackbar as MUISnackbar,
  SnackbarCloseReason,
  Stack,
} from "@mui/material";
import { snackVar } from "../../constants/snack";

const Snackbar = () => {
  const snack = useReactiveVar(snackVar);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    snackVar(undefined);
  };

  return (
    <>
      {snack && (
        <Stack spacing={2} sx={{ width: "100%" }}>
          <MUISnackbar
            open={!!snack}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity={snack.type}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snack.message}
            </Alert>
          </MUISnackbar>
        </Stack>
      )}
    </>
  );
};

export default Snackbar;
