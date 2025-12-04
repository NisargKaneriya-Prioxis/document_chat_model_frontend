export interface ChatResponse {
  answer: string;
  metadata?: any;
}

export interface UploadResponse {
  message: string;
  uploaded_files: string[];
  details: string;
}

export interface FileListResponse {
  files: string[];
  count: number; 
}

export interface SystemResetResponse {
  message: string;
  details: {
    deleted_files_count: number;
    index_status: string;
    cache_status: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// Function to ask the chatbot a question
export const askChatBot = async (query: string, sessionId: string): Promise<ChatResponse> => {
  try {
    const res = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        query: query, 
        session_id: sessionId 
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data;
    
  } catch (error) {
    console.error("Failed to fetch chat response:", error);
    throw error;
  }
};


// Function to upload PDF files
export const uploadPdfs = async (files: FileList | null): Promise<UploadResponse> => {
  if (!files || files.length === 0) {
    throw new Error("No files selected");
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file); 
  });

  try {
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Function to fetch list of uploaded files
export const fetchFiles = async (): Promise<FileListResponse> => {
  try {
    const response = await fetch(`${API_URL}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching files: ${response.statusText}`);
    }

    // Assuming your backend returns: { "files": ["a.pdf", "b.pdf"], "count": 2 }
    const data: FileListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("File Service Error:", error);
    throw error;
  }
};

// Function to delete a specific file
export const deleteFile = async (fileName: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/delete/${fileName}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); 
      throw new Error(errorData.detail || `Error deleting file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Delete File Error:", error);
    throw error;
  }
}


export const deleteAllFiles = async (): Promise<SystemResetResponse> => {
  try {
    const response = await fetch(`${API_URL}/delete-all`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'System reset failed');
    }

    return await response.json();
  } catch (error) {
    console.error("Delete All Error:", error);
    throw error;
  }
};