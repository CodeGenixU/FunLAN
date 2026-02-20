import { useState, useRef } from "react";
import { FileText, Download, Check, Loader2 } from "lucide-react";

type Props = {
    fileId: string;
    filename: string;
};

export const FileMessage = ({ fileId, filename }: Props) => {
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [done, setDone] = useState(false);
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    const handleDownload = () => {
        if (downloading) return;

        setDownloading(true);
        setProgress(0);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open("GET", `/api/download/${fileId}`, true);
        xhr.responseType = "blob";

        // progress tracking (this is why we use XHR)
        xhr.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                setProgress(Math.round(percent));
            }
        };

        xhr.onload = () => {
            setDownloading(false);
            setDone(true);

            // trigger browser save (Chrome, etc.)
            const blob = new Blob([xhr.response]);
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        };

        xhr.onerror = () => {
            setDownloading(false);
            alert("Download failed");
        };

        xhr.send();
    };

    return (
        <div
            onClick={handleDownload}
            className="max-w-xs cursor-pointer rounded-lg text-white p-3 transition"
        >
            <div className="flex items-center gap-3">
                <div className="bg-[#111b21] p-2 rounded-md">
                    <FileText size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm break-all">{filename}</p>

                    {/* Progress Bar */}
                    {downloading && (
                        <div className="mt-2 h-1.5 w-full bg-[#111b21] rounded">
                            <div
                                className="h-1.5 bg-primary rounded transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    {downloading && (
                        <p className="text-xs text-gray-400 mt-1">
                            Downloading… {progress}%
                        </p>
                    )}
                </div>

                <div className="shrink-0">
                    {downloading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : done ? (
                        <Check size={18} className="text-green-400" />
                    ) : (
                        <Download size={18} />
                    )}
                </div>
            </div>
        </div>
    );
};
