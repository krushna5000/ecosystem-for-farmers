import axios from "axios";
import toast from "react-hot-toast";
import { domain } from "../../utils/domain";

export const onToggle = async (
  id,
  currentState,
  apiEndpoint,
  setDataCallback
) => {
  try {
    const KEYS = {
      districts: "district_id",
      cities: "city_id",
      villages: "village_id",
      pincodes: "pincode_id",
    };

    const RESPONSE_KEYS = {
      districts: "district",
      cities: "city",
      villages: "village",
      pincodes: "pincode",
    };

    const response = await axios.put(
      `${domain}/location/${apiEndpoint}/${id}/toggle-active`,
      {},
      { withCredentials: true }
    );

    if (response.data?.success) {
      let updatedObj = response.data[RESPONSE_KEYS[apiEndpoint]];

      updatedObj = {
        ...updatedObj,
        created_at: formatDate(updatedObj.created_at),
        updated_at: formatDate(updatedObj.updated_at),
      };

      setDataCallback((prev) =>
        prev.map((item) => (item[KEYS[apiEndpoint]] === id ? updatedObj : item))
      );

      updatedObj.is_active ? toast.success("Enabled") : toast.error("Disabled");
    }
  } catch (err) {
    toast.error(err.response.data.message || "Something went wrong");
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
