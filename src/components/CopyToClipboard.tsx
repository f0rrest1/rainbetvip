"use client";
import { ReactNode, useState } from "react";
import { Tooltip, Snackbar, Alert, Grow } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    success: {
      main: '#00d4ff',
    },
  },
});

export function CopyToClipboard({
  text,
  onCopied,
  children,
  showTooltip = true,
  showSnackbar = true
}: {
  text: string;
  onCopied?: () => void;
  children: ReactNode;
  showTooltip?: boolean;
  showSnackbar?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (showSnackbar) {
        setShowAlert(true);
      }
      setTimeout(() => setCopied(false), 2000);
      onCopied?.();
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }

  const content = (
    <span
      onClick={handleCopy}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
    </span>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      {showTooltip ? (
        <Tooltip
          title={copied ? "Copied!" : "Click to copy"}
          TransitionComponent={Grow}
          arrow
          placement="top"
        >
          {content}
        </Tooltip>
      ) : (
        content
      )}

      {showSnackbar && (
        <Snackbar
          open={showAlert}
          autoHideDuration={2000}
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowAlert(false)}
            severity="success"
            sx={{
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              color: '#00d4ff',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            Copied to clipboard!
          </Alert>
        </Snackbar>
      )}
    </ThemeProvider>
  );
}



