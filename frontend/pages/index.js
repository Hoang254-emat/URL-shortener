import { useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import ShortLinkDisplay from "@/components/ShortLinkDisplay";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [clicks, setClicks] = useState(null);
  const [shortCode, setShortCode] = useState("");

  const handleShorten = async () => {
    try {
      const res = await axios.post("https://s.toolhub.app:4444/api/shorten", {
        original_url: originalUrl,
      });

      setShortUrl(`https://s.toolhub.app/${res.data.short_url}`);
      setQrCode(res.data.qr);
      setShortCode(res.data.short_url);
    } catch (error) {
      console.error("Error shortening URL:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>URL Shortener</h1>

      <input
        type="text"
        placeholder="Enter your URL"
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
        style={{ padding: "8px", width: "300px", marginBottom: "10px" }}
      />
      <br />
      <button onClick={handleShorten} style={{ padding: "8px 15px" }}>
        Shorten URL
      </button>

      {shortCode && (
        <ShortLinkDisplay shortUrl={shortUrl} shortCode={shortCode} qrCode={qrCode} />
      )}
    </div>
  );
}
