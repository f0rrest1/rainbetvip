"use client";
import { useCallback, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Backdrop,
  Zoom,
  Fade
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0f1a',
      paper: 'rgba(26, 35, 50, 0.9)',
    },
    primary: {
      main: '#00d4ff',
      dark: '#0099cc',
    },
    warning: {
      main: '#ff6b35',
      dark: '#e55a2b',
    },
    error: {
      main: '#dc2626',
      dark: '#b91c1c',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(145deg, rgba(26, 35, 50, 0.9) 0%, rgba(42, 52, 65, 0.8) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 32px rgba(0, 212, 255, 0.15)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        },
      },
    },
  },
});

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "default" | "warning" | "danger";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "default",
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "warning":
        return "warning";
      case "danger":
        return "error";
      default:
        return "primary";
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={isOpen}
        onClose={handleCancel}
        TransitionComponent={Zoom}
        transitionDuration={{
          enter: 300,
          exit: 250,
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '28rem',
          }
        }}
        BackdropComponent={(props) => (
          <Fade in={isOpen} timeout={200}>
            <Backdrop {...props} />
          </Fade>
        )}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton
            onClick={handleCancel}
            disabled={loading}
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              '&:hover': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 2 }}>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.6,
            }}
          >
            {message}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
          <Button
            onClick={handleCancel}
            disabled={loading}
            variant="outlined"
            sx={{
              minWidth: '100px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            {cancelText}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant="contained"
            color={getButtonColor() as "primary" | "warning" | "error"}
            sx={{
              minWidth: '100px',
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

// Hook for managing confirmation dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, "isOpen" | "onCancel">>({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showDialog = useCallback((options: Omit<ConfirmDialogProps, "isOpen" | "onCancel">) => {
    setConfig(options);
    setIsOpen(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const DialogComponent = useCallback((props: Partial<ConfirmDialogProps>) => (
    <ConfirmDialog {...config} isOpen={isOpen} onCancel={handleCancel} {...props} />
  ), [config, isOpen, handleCancel]);

  return {
    isOpen,
    config,
    showDialog,
    hideDialog,
    ConfirmDialog: DialogComponent,
  };
}

