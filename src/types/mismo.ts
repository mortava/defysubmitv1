export interface XMLFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

export interface UploadResponse {
  success: boolean;
  result?: string;
  error?: string;
  loanNumber?: string;
}
