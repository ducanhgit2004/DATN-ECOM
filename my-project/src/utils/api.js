import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

const getAuthToken = () => localStorage.getItem("accesstoken");

export const postData = async (URL, formData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(apiUrl + URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      return errorData;
    }
  } catch (error) {
    console.error("API Error:", error);
  }
};

export const fetchDataFromApi = async (url) => {
  try {
    const token = getAuthToken();
    const { data } = await axios.get(apiUrl + url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    });

    return data;
  } catch (error) {
    console.log(error);
    return error?.response?.data || error;
  }
};

export const editData = async (url, updatedData) => {
  const token = getAuthToken();
  const { response } = await axios.put(apiUrl + url, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response;
};

export const putData = async (URL, formData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(apiUrl + URL, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Network error" };
  }
};

export const deleteData = async (URL, formData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(apiUrl + URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Network error" };
  }
};
