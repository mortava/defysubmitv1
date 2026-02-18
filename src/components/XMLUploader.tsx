"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface XMLFile { id: string; name: string; type: string; size: number; content: string; status: "pending" | "uploading" | "success" | "error"; errorMessage?: string; loanNumber?: string; }

export default function XMLUploader() {
  const [files, setFiles] = useState<XMLFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: XMLFile[] = [];

      for (const file of Array.from(selectedFiles)) {
        if (!file.name.endsWith(".xml")) {
          continue;
        }

        const xmlContent = await fileToText(file);
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: xmlContent,
                    status: "pending",
        });
      }

      setFiles((prev) => [...prev, ...newFiles]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const fileToText = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsText(file); reader.onload = () => { resolve(reader.result as string); }; reader.onerror = (error) => reject(error); }); };

  const updateFile = (id: string, updates: Partial<XMLFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadAll = async () => {


    setIsUploading(true);

    for (const file of files) {
      if (file.status === "success") continue;

      updateFile(file.id, { status: "uploading" });

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            xmlContent: file.content, fileName: file.name,
          }),
        });

        const result = await response.json();

        if (result.success) {
          updateFile(file.id, { status: "success", loanNumber: result.loanNumber });
        } else {
          updateFile(file.id, {
            status: "error",
            errorMessage: result.error || "Upload failed",
          });
        }
      } catch (error) {
        updateFile(file.id, {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    setIsUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
          dragActive
            ? "border-[rgb(0,245,255)] bg-[rgb(0,245,255)]/5"
            : "border-white/20 hover:border-[rgb(0,245,255)]/50 hover:bg-white/[0.02]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xml"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
            dragActive ? "bg-[rgb(0,245,255)]/20" : "bg-white/5"
          )}>
            <Upload className={cn(
              "w-7 h-7 transition-colors",
              dragActive ? "text-[rgb(0,245,255)]" : "text-white/40"
            )} />
          </div>
          <div>
            <p className="text-white font-medium">
              {dragActive ? "Drop files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-white/40 text-sm mt-1">MISMO FNM 3.4 XML files only</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
            {successCount > 0 && (
              <p className="text-sm text-[rgb(0,245,255)]">
                {successCount} submitted
              </p>
            )}
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "rounded-lg p-4 border transition-all",
                  file.status === "success"
                    ? "bg-[rgb(0,245,255)]/5 border-[rgb(0,245,255)]/30"
                    : file.status === "error"
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-white/[0.02] border-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    file.status === "success" ? "bg-[rgb(0,245,255)]/20" : "bg-white/5"
                  )}>
                    <FileText className={cn(
                      "w-5 h-5",
                      file.status === "success" ? "text-[rgb(0,245,255)]" : "text-white/40"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-white/40 flex-shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                    </div>

                    {file.status === "error" && file.errorMessage && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <p className="text-xs text-red-400">{file.errorMessage}</p>
                      </div>
                    )}

                    {file.status === "success" && file.loanNumber && (
                      <div className="flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3 text-[rgb(0,245,255)]" />
                        <p className="text-xs text-[rgb(0,245,255)]">Loan #: {file.loanNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {file.status === "uploading" && (
                      <Loader2 className="w-5 h-5 text-[rgb(0,245,255)] animate-spin" />
                    )}
                    {file.status === "success" && (
                      <Check className="w-5 h-5 text-[rgb(0,245,255)]" />
                    )}
                    {(file.status === "pending" || file.status === "error") && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-white/40 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && pendingCount > 0 && (
        <Button
          onClick={handleUploadAll}
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting to MeridianLink...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Submit {pendingCount} Loan File{pendingCount > 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}

      {/* Success message - Large Congratulations Banner */}
      {files.filter(f => f.status === "success" && f.loanNumber).map((file) => (
        <div key={file.id} className="space-y-6">
          <div className="rounded-xl border-2 border-[rgb(0,245,255)] bg-[rgb(0,245,255)]/10 p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[rgb(0,245,255)]/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-[rgb(0,245,255)]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Congratulations!</h2>
            <p className="text-white/80 text-lg">Your Loan ID is:</p>
            <p className="text-4xl font-bold text-[rgb(0,245,255)]">{file.loanNumber}</p>
            <p className="text-white/60 text-sm">Please record this in your file</p>
          </div>

          {/* Cognito Form Iframe - Displayed after Loan Number is issued */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-visible w-full">
            <iframe
              src="https://www.cognitoforms.com/DEFY1/lsd"
              allow="payment"
              style={{ border: 0, width: '100%', minWidth: '100%', display: 'block' }}
              height="2308"
              title="Loan Submission Form"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
