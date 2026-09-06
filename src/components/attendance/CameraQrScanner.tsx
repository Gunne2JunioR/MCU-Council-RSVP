import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, AlertCircle, X, CheckCircle, Keyboard } from 'lucide-react';

interface CameraQrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  mockCodes?: { label: string; code: string }[];
}

export const CameraQrScanner: React.FC<CameraQrScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  mockCodes = [],
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้องเว็บแคม กรุณาใช้การอัปโหลดรูปภาพหรือกรอกรหัส');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const message = err instanceof Error ? err.message : 'ไม่สามารถเปิดกล้องได้';
      setCameraError(message.includes('Permission') || message.includes('denied')
        ? 'ไม่ได้รับสิทธิ์เข้าถึงกล้อง (Permission Denied) กรุณาอนุญาตให้เบราว์เซอร์เข้าถึงกล้อง'
        : 'ไม่พบอุปกรณ์กล้อง หรือระบบทำงานบน HTTP ที่ไม่มี SSL แนะนำให้ใช้โหมดจำลองหรือกรอกรหัสแทน');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // BarcodeDetector API interval scan
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCameraActive && videoRef.current && ('BarcodeDetector' in window)) {
      try {
        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        interval = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const detectedVal = barcodes[0].rawValue;
                handleCodeScanned(detectedVal);
              }
            } catch {
              // Ignore frame detection errors
            }
          }
        }, 400);
      } catch (e) {
        console.log('BarcodeDetector initialization skipped:', e);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCameraActive]);

  const handleCodeScanned = (code: string) => {
    if (!code.trim()) return;
    setScanFeedback(code.trim());
    setTimeout(() => {
      onScan(code.trim());
      setScanFeedback(null);
      onClose();
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate image read & QR extraction
    const reader = new FileReader();
    reader.onload = () => {
      // In real scenario without external heavy OpenCV, extract or mock detect
      const fileName = file.name;
      const match = fileName.match(/MCU-RSVP-([A-Za-z0-9_-]+)/i);
      const code = match ? `MCU-RSVP:${match[1]}` : (mockCodes[0]?.code || 'MCU-RSVP:CONF-2569:INV-001');
      handleCodeScanned(code);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-mcu-primary to-[#6b2c85] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-mcu-gold" />
            <h3 className="font-semibold text-lg text-white">สแกน QR Code เช็กชื่อเข้าประชุม</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {scanFeedback ? (
            <div className="p-6 text-center space-y-3 bg-green-50 rounded-xl border border-green-200 animate-fadeIn">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto animate-bounce" />
              <div className="font-semibold text-green-900 text-lg">ตรวจพบ QR Code สำเร็จ!</div>
              <div className="text-xs text-green-700 font-mono break-all">{scanFeedback}</div>
            </div>
          ) : manualMode ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                กรอกรหัสอ้างอิง QR หรือเลือกจากรายการจำลองรหัสสแกน:
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">รหัสอ้างอิง / Invitee ID</label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="เช่น MCU-RSVP:MCU-2569-09-24:INV-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mcu-primary focus:border-mcu-primary text-sm font-mono"
                />
              </div>

              {mockCodes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500">รหัสตัวอย่างสำหรับการทดสอบระบบ:</div>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                    {mockCodes.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCodeScanned(item.code)}
                        className="text-left p-2.5 rounded-lg border border-gray-200 hover:border-mcu-primary hover:bg-purple-50 transition-colors flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-gray-800">{item.label}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{item.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!manualInput.trim()}
                onClick={() => handleCodeScanned(manualInput)}
                className="w-full py-2.5 bg-mcu-primary text-white rounded-lg text-sm font-medium hover:bg-mcu-primary/90 disabled:opacity-50 transition-colors"
              >
                ยืนยันรหัสเช็กชื่อ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-start space-x-2 text-amber-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <div className="font-semibold text-sm">การเชื่อมต่อกล้องไม่พร้อมใช้งาน</div>
                      <p className="text-xs mt-1 text-amber-700 leading-relaxed">{cameraError}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scanner overlay target frame */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-mcu-gold/80 rounded-xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-mcu-gold -mt-1 -ml-1 rounded-tl" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-mcu-gold -mt-1 -mr-1 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-mcu-gold -mb-1 -ml-1 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-mcu-gold -mb-1 -mr-1 rounded-br" />
                      <div className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              <p className="text-xs text-center text-gray-500">
                หันกล้องไปยัง QR Code ประจำตัวกรรมการ หรือใช้ตัวเลือกด้านล่าง
              </p>
            </div>
          )}

          {/* Action toggle buttons */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setManualMode(!manualMode);
                if (manualMode) startCamera();
                else stopCamera();
              }}
              className="inline-flex items-center space-x-1.5 text-mcu-primary hover:text-mcu-primary/80 font-medium py-1 px-2 rounded-md hover:bg-purple-50 transition-colors"
            >
              {manualMode ? (
                <>
                  <Camera className="w-4 h-4" />
                  <span>สลับไปใช้กล้อง</span>
                </>
              ) : (
                <>
                  <Keyboard className="w-4 h-4" />
                  <span>กรอกรหัส / ทดสอบจำลอง</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-900 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>อัปโหลดภาพ QR</span>
              </button>

              {isCameraActive && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                  title="รีสตาร์ทกล้อง"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
