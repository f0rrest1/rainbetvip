"use client";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Link,
  Fade,
  InputAdornment
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import faqData from "@/data/faqData";

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
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
    },
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.9) 0%, rgba(42, 52, 65, 0.8) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
          borderRadius: '12px !important',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          marginBottom: '8px',
          '&:before': {
            display: 'none',
          },
          '&:hover': {
            borderColor: 'rgba(0, 212, 255, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 24px rgba(0, 212, 255, 0.1)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00d4ff',
            },
          },
        },
      },
    },
  },
});

export default function FAQ() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return faqData;
    return faqData.filter((item) =>
      item.question.toLowerCase().includes(t) || item.answer.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search questions..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
              </InputAdornment>
            ),
          }}
        />

        <div>
          {filtered.map((item, index) => (
            <Fade
              in={true}
              timeout={200 + index * 50}
              key={item.id}
            >
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 500,
                      color: '#ffffff',
                    }}
                  >
                    {item.question}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    pt: 0,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Fade>
          ))}
        </div>

        <Typography
          variant="body2"
          sx={{
            mt: 4,
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
          }}
        >
          Need more help? Contact support at{' '}
          <Link
            href="mailto:support@rainbetvip.com"
            sx={{
              color: '#00d4ff',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            support@rainbetvip.com
          </Link>
          .
        </Typography>
      </div>
    </ThemeProvider>
  );
}



