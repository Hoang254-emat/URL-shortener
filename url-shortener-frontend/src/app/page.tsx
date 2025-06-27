'use client'; 

import { useState } from 'react';
import Image from 'next/image'; 
import { Inter } from 'next/font/google'; 
import { MdContentCopy } from 'react-icons/md'; 
import { QRCodeCanvas } from 'qrcode.react'; 

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [clicks, setClicks] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShorten = async () => {
    setError(null);
    setLoading(true);
    setShortUrl('');
    setQrCodeDataUrl('');
    setClicks(null);
    setCopySuccess(false);

    try {
      let formattedLongUrl = longUrl;
      if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
        formattedLongUrl = `https://${longUrl}`;
      }

      const response = await fetch('http://localhost:3001/shorten', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: formattedLongUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi rút gọn URL.');
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setQrCodeDataUrl(data.qrCode); 
      setClicks(data.clicks);

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Lỗi: ', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      const el = document.createElement('textarea');
      el.value = shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); 
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4 ${inter.className}`}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 drop-shadow-sm">Rút Gọn Link</h1>

        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Nhập URL dài của bạn tại đây..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleShorten();
              }
            }}
          />
          <button
            onClick={handleShorten}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Rút Gọn'
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center font-medium border border-red-300 animate-fade-in">
            {error}
          </p>
        )}

        {shortUrl && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-inner space-y-4 animate-fade-in">
            <h2 className="text-2xl font-semibold text-blue-800 text-center">Link của bạn đã được rút gọn!</h2>
            <div className="flex items-center justify-between bg-white border border-blue-200 rounded-lg p-3 group">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-lg font-medium truncate hover:underline flex-grow"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="ml-4 p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group-hover:scale-105"
                title="Copy link"
              >
                <MdContentCopy size={24} />
              </button>
            </div>
            {copySuccess && (
              <p className="text-green-600 text-center font-medium animate-fade-in">Đã copy vào clipboard!</p>
            )}

            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-700 text-lg">
                Lượt bấm: <span className="font-bold text-blue-800">{clicks}</span>
              </p>
              {shortUrl && ( 
                <div className="p-2 bg-white rounded-lg shadow-md border border-gray-200">
                  {}
                  <QRCodeCanvas value={shortUrl} size={180} level="H" includeMargin={false} />
                  <p className="text-center text-sm text-gray-500 mt-2">Quét mã QR để truy cập link</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}