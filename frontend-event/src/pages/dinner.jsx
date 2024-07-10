import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import axios from "axios";
import { MdOutlineVerified } from "react-icons/md";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast, { Toaster } from "react-hot-toast";

const Dinner = () => {
  const [qrData, setQrData] = useState("No result");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let isMounted = true;

    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        const videoElement = videoRef.current;
        if (!videoElement) return;

        videoElement.srcObject = stream;

        const qrScanner = new QrScanner(
          videoElement,
          async (result) => {
            if (result && isMounted && scannerEnabled) {
              setQrData(result.data);
              setLoading(true);
              setScannerEnabled(false);

              try {
                const response = await axios.get("http://localhost:5000/scan", {
                  params: { value: result.data, position: "dinner" },
                });
                setResult({ value: result.data, position: "dinner" });
                setScanResult(response.data);
                setLoading(false);
              } catch (error) {
                console.error("Error sending QR data to backend:", error);
                setLoading(false);
              }
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: false,
          }
        );

        qrScannerRef.current = qrScanner;

        videoElement.addEventListener("loadedmetadata", () => {
          videoElement.play().catch((error) => {
            console.error("Error starting video playback:", error);
          });

          qrScanner.start().catch((error) => {
            console.error("Error starting QR scanner:", error);
          });
        });

        return () => {
          isMounted = false;
          qrScanner.stop();
          stream.getTracks().forEach((track) => track.stop());
        };
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    requestCameraPermission();

    return () => {
      isMounted = false;
    };
  }, [scannerEnabled]);

  const handleAccept = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/accept",
        result,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      if (response.data === true) {
        toast.success("Accepted successfully!");
      } else {
        toast.error("QR already used!");
      }

      console.log("Accepted sent to server");
      setScanResult(null);
      setLoading(true);
      setScannerEnabled(true);
    } catch (error) {
      toast.error("Error sending accept request");
      console.error("Error sending accept request:", error);
    }
  };

  const handleReject = async () => {
    try {
      await axios.post("http://localhost:5000/reject");
      toast.error("Rejected");
      console.log("Rejected sent to server");
      setScanResult(null);
      setLoading(true);
      setScannerEnabled(true);
    } catch (error) {
      toast.error("Error sending reject request");
      console.error("Error sending reject request:", error);
    }
  };

  const videoContainerStyle = {
    height: "50vh",
    width: "100%",
  };

  return (
    <div>
      <Toaster />

      <div className="flex flex-col items-center justify-center bg-gray-100">
        <div style={videoContainerStyle}>
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%" }}
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-2 p-5">
          <Skeleton height={40} width={200} />
          <Skeleton height={20} width={150} />
          <Skeleton height={20} width={250} />
          <div className="flex justify-center items-center">
            <Skeleton height={40} width={100} className="mr-2" />
            <Skeleton height={40} width={100} />
          </div>
        </div>
      ) : (
        scanResult && (
          <div className="mt-2 p-5  bg-white ">
            <p className="text-left font-bold text-4xl flex items-center">
              {scanResult.name}
              <MdOutlineVerified className="ml-2 text-green-500" />
            </p>

            <div className="mt-2 font-bold text-lg">
              <p>Attendee - IDC Bhopal</p>
            </div>

            <div className="mt-2">
              <p>{scanResult.scannedValue}</p>
            </div>

            <div className="flex justify-center items-center">
              <button className="btn btn-success mr-2" onClick={handleAccept}>
                Accept
              </button>
              <button className="btn btn-error" onClick={handleReject}>
                Reject
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Dinner;
