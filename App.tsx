import React, { useState, useRef } from 'react';
import { extractPassportData } from './services/geminiService';
import { PassportData, FormattedResult } from './types';
import { formatPassportDate } from './utils/dateUtils';
import ResultRow from './components/ResultRow';
import { Upload, Loader2, FileText, AlertCircle, Camera, X, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setResult(null);
      setPreview(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError("لا يمكن الوصول للكاميرا. يرجى التحقق من الصلاحيات.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg');
        setPreview(base64Image);
        stopCamera();
        handleProcessing(base64Image);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      handleProcessing(base64String);
    };
  };

  const handleProcessing = async (base64String: string) => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await extractPassportData(base64String);
      processData(data);
    } catch (err) {
      setError("حدث خطأ أثناء معالجة الصورة. يرجى التأكد من وضوح الصورة والمحاولة مرة أخرى.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data: PassportData) => {
    // Format Dates using the utility function to get DDMMMYYYY (e.g. 20JAN2025)
    const birthDateFmt = formatPassportDate(data.dateOfBirth);
    const expiryDateFmt = formatPassportDate(data.dateOfExpiry);
    
    // Line 1: FAMILY NAME / FIRST NAME MIDDLE NAME
    const line1 = `${data.surname.toUpperCase()} / ${data.givenNames.toUpperCase()}`;

    // Line 2 format:
    // srdocsyyHK1-P-EGY-BW13172-EGY-12JUL1970-F-09JUL2030-NAME
    
    const prefix = "srdocsyyHK1-P";
    const iss = data.issuingCountry.toUpperCase();
    const num = data.passportNumber.toUpperCase();
    const nat = data.nationality.toUpperCase();
    const dob = birthDateFmt.toUpperCase();
    const gen = data.sex.toUpperCase();
    const exp = expiryDateFmt.toUpperCase();
    
    const line2 = `${prefix}-${iss}-${num}-${nat}-${dob}-${gen}-${exp}-${line1}`;

    setResult({
      line1,
      line2
    });
  };

  return (
    <div className="min-h-screen bg-[#DDE6F2] py-6 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Special Header (Teta Munira) */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 font-serif mb-1">تيتا منيرة</h2>
          <p className="text-gray-600 text-lg">ادعو لها بالرحمة والمغفرة</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Main Header */}
          <div className="bg-blue-900 p-6 text-white text-center">
            <h1 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
              <FileText />
              قارئ الباسبور الإلكتروني (AI)
            </h1>
            <p className="text-blue-200 mt-2 text-sm">استخراج بيانات دقيقة بالتنسيق المطلوب</p>
          </div>

          <div className="p-8">
            
            {/* Input Selection Area */}
            {!isCameraOpen ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* File Upload Button */}
                <label 
                  className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    loading ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    {loading ? (
                      <Loader2 className="w-8 h-8 mb-2 text-blue-600 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mb-2 text-blue-500" />
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {loading ? "جاري المعالجة..." : "رفع صورة من الجهاز"}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </label>

                {/* Camera Button */}
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    loading ? 'bg-gray-100 border-gray-300' : 'bg-green-50 border-green-300 hover:bg-green-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                     {loading ? (
                      <Loader2 className="w-8 h-8 mb-2 text-green-600 animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 mb-2 text-green-500" />
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {loading ? "جاري المعالجة..." : "تصوير بالكاميرا"}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              /* Camera View */
              <div className="mb-8 relative bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-64 md:h-96 object-cover"
                  onLoadedMetadata={() => videoRef.current?.play()}
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button 
                    onClick={captureImage}
                    className="bg-white text-black rounded-full p-4 shadow-lg hover:bg-gray-200 transition-all"
                    title="التقاط"
                  >
                    <Camera size={32} />
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="bg-red-500 text-white rounded-full p-4 shadow-lg hover:bg-red-600 transition-all"
                    title="إلغاء"
                  >
                    <X size={32} />
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 ml-2" size={20} />
                  <p className="text-red-700 font-bold">خطأ</p>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* Results Section */}
            {result && !loading && !isCameraOpen && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Image Preview */}
                {preview && (
                   <div className="mb-6 flex justify-center">
                     <img src={preview} alt="Passport Preview" className="h-32 object-contain border rounded shadow-sm" />
                   </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <ResultRow 
                    label="السطر الأول (الاسم):" 
                    value={result.line1} 
                  />
                  
                  <ResultRow 
                    label="السطر الثاني (البيانات):" 
                    value={result.line2} 
                  />
                </div>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => {
                        setResult(null);
                        setPreview(null);
                        setError(null);
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 mx-auto text-sm"
                  >
                    <RefreshCw size={16} />
                    مسح وبدء عملية جديدة
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;