import { useState, useEffect } from "react";

const ShortLinkDisplay = ({ shortUrl, shortCode, qrCode }) => {
    const [clicks, setClicks] = useState(null);

    useEffect(() => {
        if (!shortCode) return;

        fetch(`/api/stats/${shortCode}`)
            .then((res) => res.json())
            .then((data) => setClicks(data.clicks))
            .catch((err) => console.error("Error fetching clicks:", err));
    }, [shortCode]);

    return (
        <div>
            <h3>Short Link:</h3>
            <a href={shortUrl} target="_blank">{shortUrl}</a>

            <h3>QR Code:</h3>
            {qrCode ? (
                <img src={qrCode} alt="QR Code" />
            ) : (
                <p>QR Code not available</p>
            )}

            <h3>Clicks: {clicks !== null ? clicks : "Loading..."}</h3>
        </div>
    );
};

export default ShortLinkDisplay;
