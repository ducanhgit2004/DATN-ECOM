const baseUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

export const request = async (path, options = {}) => {
  try {
    const token = localStorage.getItem("sellerAccessToken");
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, status: response.status };
  } catch (error) {
    return {
      error: true,
      success: false,
      message: error.message || "Cannot connect to the server",
    };
  }
};

export const uploadProductImages = async (files) => {
  try {
    const token = localStorage.getItem("sellerAccessToken");
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));
    const response = await fetch(`${baseUrl}/api/seller/products/upload-image`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, status: response.status };
  } catch (error) {
    return {
      error: true,
      success: false,
      message: error.message || "Cannot upload images",
    };
  }
};

export const uploadStoreImage = async (file) => {
  try {
    const token = localStorage.getItem("sellerAccessToken");
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${baseUrl}/api/seller/store/upload-image`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, status: response.status };
  } catch (error) {
    return {
      error: true,
      success: false,
      message: error.message || "Cannot upload image",
    };
  }
};
