import { useCallback, useContext, useEffect, useState } from "react";
import { Button, CircularProgress, MenuItem, Select } from "@mui/material";
import { MdOutlineStorefront } from "react-icons/md";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi } from "../../utils/api";

const badge = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const Sellers = () => {
  const context = useContext(MyContext);
  const [items, setItems] = useState([]);
  const [approval, setApproval] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const query = approval ? `?approval=${approval}` : "";
    const result = await fetchDataFromApi(`/api/user/admin/sellers${query}`);
    if (result?.success) setItems(Array.isArray(result.data) ? result.data : []);
    else context.alertBox("error", result?.message || "Unable to load sellers.");
    setLoading(false);
  }, [approval, context]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const review = async (seller, approvalStatus) => {
    let reason = "";
    if (approvalStatus === "rejected") {
      reason = window.prompt("Reason for rejecting this seller:") || "";
      if (!reason.trim()) return;
    }
    setUpdating(seller._id);
    const result = await editData(
      `/api/user/admin/sellers/${seller._id}/review`,
      { approvalStatus, reason },
    );
    if (result?.success) {
      setItems((current) =>
        current.map((item) => (item._id === seller._id ? result.data : item)),
      );
      context.alertBox("success", result.message);
    } else {
      context.alertBox("error", result?.message || "Unable to review seller.");
    }
    setUpdating("");
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Seller Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review stores before they can access the seller dashboard.
          </p>
        </div>
        <Select
          size="small"
          value={approval}
          displayEmpty
          onChange={(event) => setApproval(event.target.value)}
        >
          <MenuItem value="">All applications</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <CircularProgress size={34} />
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-16 text-center text-gray-500">
          No seller applications found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Store</th>
                <th className="px-4 py-4">Owner</th>
                <th className="px-4 py-4">Description</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((seller) => (
                <tr key={seller._id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-lg bg-gray-100">
                        {seller.storeLogo ? <img src={seller.storeLogo} alt="" className="h-full w-full object-cover" /> : <MdOutlineStorefront className="m-auto h-full text-2xl text-gray-500" />}
                      </div>
                      <div>
                        <p className="font-semibold">{seller.storeName}</p>
                        <p className="text-xs text-gray-500">{seller.productCount || 0} products</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-gray-500">{seller.email}</p>
                  </td>
                  <td className="max-w-[300px] px-4 py-4 text-gray-600">
                    {seller.storeDescription || "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[seller.sellerApprovalStatus]}`}>
                      {seller.sellerApprovalStatus}
                    </span>
                    {seller.sellerRejectionReason && (
                      <p className="mt-2 text-xs text-red-600">
                        {seller.sellerRejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outlined"
                        onClick={() =>
                          context.setIsOpenFullScreenPanel({
                            open: true,
                            model: "Seller Products",
                            seller,
                          })
                        }
                      >
                        View products
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={updating === seller._id || seller.sellerApprovalStatus === "approved"}
                        onClick={() => review(seller, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={updating === seller._id || seller.sellerApprovalStatus === "rejected"}
                        onClick={() => review(seller, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Sellers;
