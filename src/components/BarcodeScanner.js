import React, { useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_ID = "barcode-reader";

function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 }
          },
          (decodedText) => {
            // ✅ Prevent double fire
            if (!isRunningRef.current) return;

            isRunningRef.current = false;

            onDetected(decodedText);

            // ✅ SAFE stop
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                scanner.clear();
              });
          }
        );

        isRunningRef.current = true;
      } catch (err) {
        console.error("Scanner start failed", err);
      }
    };

    startScanner();

    return () => {
      // ✅ SAFE cleanup
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current.clear();
            isRunningRef.current = false;
          });
      }
    };
  }, [onDetected]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.95)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Typography
        sx={{
          color: "#ff9800",
          fontWeight: 700,
          mb: 2
        }}
      >
        Scan Barcode
      </Typography>

      {/* 📷 CAMERA VIEW */}
      <Box
        id={SCANNER_ID}
        sx={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 2,
          overflow: "hidden",
          mb: 3
        }}
      />

      {/* ❌ CLOSE BUTTON */}
      <Button
        variant="contained"
        onClick={() => {
          if (scannerRef.current && isRunningRef.current) {
            scannerRef.current
              .stop()
              .catch(() => {})
              .finally(() => {
                scannerRef.current.clear();
                isRunningRef.current = false;
                onClose();
              });
          } else {
            onClose();
          }
        }}
        sx={{
          bgcolor: "#f44336",
          fontWeight: 700
        }}
      >
        Close Scanner
      </Button>
    </Box>
  );
}

export default BarcodeScanner;
