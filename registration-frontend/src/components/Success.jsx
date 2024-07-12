import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import QRCode from 'qrcode.react';

const Success = () => {
  const location = useLocation();
  const { id } = location.state;
  const qrRef = useRef();

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qr-code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-lg">
        <h1 className="text-3xl font-bold text-green-600 mb-6">Payment Successful!</h1>
        <div ref={qrRef} className="flex justify-center mb-4">
          <QRCode value={id} size={256} />
        </div>
        <p className="mb-6">Your ID: {id}</p>
        <button
          onClick={downloadQR}
          className="btn btn-accent"
        >
          Download QR Code
        </button>
        <div className="alert alert-info mt-2">
          <div>
            <span>
              Download the QR code using the button above.
              A confirmation email will be sent to your registered email.
              You will also receive a confirmation message on your WhatsApp number.
              This QR code is required to show at the event, so please keep it safe.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
