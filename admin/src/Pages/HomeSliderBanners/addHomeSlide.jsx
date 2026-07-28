import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, CircularProgress, FormControlLabel } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import UploadBox from "../../components/UploadBox";
import { MyContext } from "../../App";
import {
  editData,
  fetchDataFromApi,
  postData,
  uploadImages,
} from "../../utils/api";

const AddHomeSlide = ({ slide = null }) => {
  const context = useContext(MyContext);
  const [title, setTitle] = useState(slide?.title || "");
  const [link, setLink] = useState(slide?.link || "");
  const [destinationType, setDestinationType] = useState(
    slide?.link?.startsWith("/shop/") ? "shop" : "custom",
  );
  const [sellerId, setSellerId] = useState(
    slide?.link?.startsWith("/shop/") ? slide.link.split("/shop/")[1] : "",
  );
  const [sellers, setSellers] = useState([]);
  const [order, setOrder] = useState(slide?.order ?? 0);
  const [active, setActive] = useState(slide?.active ?? true);
  const [image, setImage] = useState(slide?.image || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  useEffect(() => {
    let active = true;
    fetchDataFromApi("/api/user/admin/sellers?approval=approved").then(
      (result) => {
        if (active && result?.success) setSellers(result.data || []);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const chooseImage = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (!selected.type.startsWith("image/")) return context.alertBox("error", "Please choose an image file.");
    setFile(selected);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!image && !file) return context.alertBox("error", "Please choose a banner image.");
    setLoading(true);
    try {
      let imageUrl = image;
      if (file) {
        const uploaded = await uploadImages("/api/home-sliders/uploadImages", [file]);
        if (!uploaded?.success || !uploaded.images?.[0]) throw new Error(uploaded?.message || "Image upload failed.");
        imageUrl = uploaded.images[0];
      }
      if (destinationType === "shop" && !sellerId) {
        throw new Error("Please select a destination shop.");
      }
      const destinationLink =
        destinationType === "shop" ? `/shop/${sellerId}` : link.trim();
      const payload = { image: imageUrl, title: title.trim(), link: destinationLink, order: Number(order) || 0, active };
      const result = slide
        ? await editData(`/api/home-sliders/${slide._id}`, payload)
        : await postData("/api/home-sliders/create", payload);
      if (!result?.success) throw new Error(result?.message || "Unable to save the home slider.");
      context.alertBox("success", slide ? "Home slider updated successfully." : "Home slider added successfully.");
      context.setHomeSliderRefreshKey((key) => key + 1);
      context.setIsOpenFullScreenPanel({ open: false, model: "" });
    } catch (error) {
      context.alertBox("error", error.message || "Unable to save the home slider.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-5 bg-gray-50 min-h-full">
      <form className="form p-8 max-w-[1100px]" onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <label className="text-sm font-semibold">Banner title (optional)<input value={title} onChange={(e) => setTitle(e.target.value)} className="block mt-2 w-full h-[42px] border rounded p-3 font-normal" placeholder="Summer collection" /></label>
          <label className="text-sm font-semibold">
            Destination type
            <select
              value={destinationType}
              onChange={(event) => setDestinationType(event.target.value)}
              className="block mt-2 w-full h-[42px] border rounded px-3 font-normal bg-white"
            >
              <option value="custom">Custom link</option>
              <option value="shop">Seller shop</option>
            </select>
          </label>
          {destinationType === "shop" ? (
            <label className="text-sm font-semibold">
              Destination shop
              <select
                required
                value={sellerId}
                onChange={(event) => setSellerId(event.target.value)}
                className="block mt-2 w-full h-[42px] border rounded px-3 font-normal bg-white"
              >
                <option value="">Select an approved shop</option>
                {sellers.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.storeName} ({seller.productCount || 0} products)
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="text-sm font-semibold">Destination link (optional)<input value={link} onChange={(e) => setLink(e.target.value)} className="block mt-2 w-full h-[42px] border rounded p-3 font-normal" placeholder="/products or https://..." /></label>
          )}
          <label className="text-sm font-semibold">Display order<input type="number" min="0" value={order} onChange={(e) => setOrder(e.target.value)} className="block mt-2 w-full h-[42px] border rounded p-3 font-normal" /></label>
          <FormControlLabel className="md:mt-7" control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active on storefront" />
        </div>
        <h3 className="text-[16px] font-[600] mb-3">Banner image</h3>
        <p className="text-sm text-gray-500 mb-4">Use a wide image for the best result (recommended ratio 3:1).</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {(preview || image) && <div className="relative col-span-2 h-[180px] rounded-md overflow-hidden border bg-white"><button type="button" aria-label="Remove image" onClick={() => { setFile(null); setImage(""); }} className="absolute right-2 top-2 w-7 h-7 rounded-full bg-red-600 text-white z-10 flex items-center justify-center"><IoMdClose /></button><img src={preview || image} alt={title || "Home slider preview"} className="w-full h-full object-cover" /></div>}
          <UploadBox accept="image/*" onChange={chooseImage} />
        </div>
        <Button disabled={loading} type="submit" className="btn-blue btn-lg !mt-8 !w-[250px] !flex !gap-2">
          {loading ? <CircularProgress size={22} color="inherit" /> : <FaCloudUploadAlt className="text-[25px]" />}
          {slide ? "Update Slider" : "Publish Slider"}
        </Button>
      </form>
    </section>
  );
};

export default AddHomeSlide;
