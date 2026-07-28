import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { GoTrash } from "react-icons/go";

const ConfirmDialog = ({ open, title, message, loading, onClose, onConfirm }) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600"><GoTrash size={21} /></span>
      {title}
    </DialogTitle>
    <DialogContent><DialogContentText>{message}</DialogContentText></DialogContent>
    <DialogActions sx={{ padding: "0 24px 20px" }}>
      <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
      <Button onClick={onConfirm} disabled={loading} color="error" variant="contained">{loading ? "Deleting..." : "Delete"}</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
