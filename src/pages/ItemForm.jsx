import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useItems } from "../context/ItemsContext";

const buildings = [
  "Adnan Kassar School of Business",
  "Gezairi Building",
  "Irwin Hall",
  "Nicol Hall",
  "Orme-Gray",
  "Riyad Nassar Library",
  "Safadi Fine Arts",
  "Sage Hall",
  "Wadad Sabbagh Khoury Student Center",
  "Joseph G. Jabbra Gymnasium",
  "Beirut Underground Parking",
];

const emptyForm = {
  name: "",
  status: "Lost",
  category: "",
  building: "",
  date: new Date().toLocaleDateString("en-CA"),
  description: "",
  image: "",
};

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { items, addItem, updateItem } = useItems();

  const isEditing = Boolean(id);

  const existingItem = items.find(
    (item) => item.id === Number(id)
  );

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isEditing && existingItem) {
      setFormData({
        ...emptyForm,
        ...existingItem,
      });
    }
  }, [id, isEditing, existingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      updateItem(id, formData);
    } else {
      addItem(formData);
    }

    navigate(isEditing ? `/items/${id}` : "/items");
  };

  if (isEditing && !existingItem) {
    return (
      <main className="min-h-screen bg-[#F7F5EC] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-[#244B3C] mb-4">
          Item Not Found
        </h2>

        <Link
          to="/items"
          className="bg-[#244B3C] text-white px-6 py-3 rounded-lg"
        >
          Back to Items
        </Link>
      </main>
    );
  }

  const inputStyle =
    "w-full border border-[#DCE6D8] rounded-lg px-4 py-3 bg-white text-[#343A35] focus:outline-none focus:ring-2 focus:ring-[#718B70]";

  const labelStyle =
    "block text-sm font-semibold text-[#244B3C] mb-2";

  return (
    <main className="min-h-screen bg-[#F7F5EC] px-6 py-12">

      <div className="max-w-3xl mx-auto">

        <Link
          to={isEditing ? `/items/${id}` : "/items"}
          className="inline-flex items-center gap-2 text-[#52765F] font-semibold mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-[#DCE6D8] p-6 md:p-10">

          <h1 className="text-3xl font-bold text-[#244B3C] mb-2">
            {isEditing ? "Edit Item" : "Report an Item"}
          </h1>

          <p className="text-[#68796C] mb-8">
            {isEditing
              ? "Update the information about this item."
              : "Fill in the details to report a lost or found item."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Item Name */}
            <div>
              <label className={labelStyle}>
                Item Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Blue Backpack"
                className={inputStyle}
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelStyle}>
                Status *
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={labelStyle}>
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Bags">Bags</option>
                <option value="Accessories">Accessories</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Building */}
            <div>
              <label className={labelStyle}>
                Building *
              </label>

              <select
                name="building"
                value={formData.building}
                onChange={handleChange}
                className={inputStyle}
                required
              >
                <option value="">Select a building</option>

                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className={labelStyle}>
                Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelStyle}>
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item and any details that might help identify it..."
                rows="4"
                className={inputStyle}
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className={labelStyle}>
                Image URL (Optional)
              </label>

              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={inputStyle}
              />

              <p className="text-xs text-[#68796C] mt-2">
                Paste an image URL if you have one.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#244B3C] text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#315C49] transition"
            >
              <Save size={20} />
              {isEditing ? "Save Changes" : "Submit Report"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}