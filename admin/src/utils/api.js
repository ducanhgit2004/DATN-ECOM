import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

const getAuthToken = () => localStorage.getItem("accesstoken");

const buildUrl = (path) => {
  const trimmedBase = apiUrl.replace(/\/+$/, "");
  return `${trimmedBase}${path.startsWith("/") ? path : `/${path}`}`;
};

export const postData = async (URL, formData) => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(URL), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const text = await response.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      return {
        error: true,
        status: response.status,
        statusText: response.statusText,
        ...data,
      };
    }

    return {
      status: response.status,
      statusText: response.statusText,
      ...data,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      error: true,
      message: error?.message || "API request failed",
    };
  }
};

export const fetchDataFromApi = async (url) => {
  try {
    const token = getAuthToken();

    if (!token) {
      return { error: true, message: "No auth token found" };
    }

    const { data } = await axios.get(apiUrl + url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return data;
  } catch (error) {
    console.log(error);
    return error?.response?.data || error;
  }
};

export const editData = async (url, updatedData) => {
  try {
    const token = getAuthToken();
    const { data } = await axios.put(apiUrl + url, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    return error?.response?.data || { error: true, message: error.message };
  }
};

export const deleteData = async (url) => {
  try {
    const token = getAuthToken();
    const { data } = await axios.delete(apiUrl + url, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    return error?.response?.data || { error: true, message: error.message };
  }
};

export const uploadImages = async (url, files) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const { data } = await axios.post(apiUrl + url, formData, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    return error?.response?.data || { error: true, message: error.message };
  }
};
