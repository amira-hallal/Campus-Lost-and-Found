import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useItems } from "../context/ItemsContext";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useFeedback } from "../context/FeedbackContext";
import { CATEGORIES } from "../data/constants";

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

const API_FIELD_TO_FORM = { title: "name", type: "status", locationId: "building" };

const emptyForm = {
  name: "",
  status: "Lost",
  category: "",
  building: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  image: "",
};

export default function ItemForm() {
  const { currentUser } = useAuth();
  const { getItem: getSharedItem } = useData();
  const { id } = useParams();
  const navigate = useNavigate();

  const { items, addItem, updateItem } = useItems();

  const isEditing = Boolean(id);

  const existingItem = items.find(
    (item) => item.id === Number(id)
  );
  const sharedItem = id ? getSharedItem(id) : null;
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const { notify } = useFeedback();

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
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: "" }));
  };

   const handleSubmit = async (e) => {
     e.preventDefault();
     if (saving) return;
     setFormError("");

    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Enter an item name.";
    if (!formData.category) nextErrors.category = "Choose a category.";
    if (!formData.building) nextErrors.building = "Choose a campus building.";
    if (!formData.date) nextErrors.date = "Choose the date you lost or found it.";
    if (!formData.description.trim()) nextErrors.description = "Add a short description.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
     
    setSaving(true);
    try {
      if (isEditing) {
        await updateItem(id, formData);
        notify("Changes saved.");
      } else {
        await addItem({ ...formData, postedBy: currentUser.id });
        notify("Report submitted. Thank you for helping!");
      }
      navigate(isEditing ? `/items/${id}` : "/items");
    } catch (error) {
      // Show the server's field errors next to the matching inputs
      if (error.details && typeof error.details === "object" && !Array.isArray(error.details)) {
        const fieldErrors = {};
        for (const [field, text] of Object.entries(error.details)) {
          fieldErrors[API_FIELD_TO_FORM[field] ?? field] = text;
        }
        setErrors(fieldErrors);
      }
      setFormError(error.message);
      setSaving(false);
    }
  };

  if (isEditing && (!existingItem || !currentUser || sharedItem?.postedBy !== currentUser.id)) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="display text-2xl">Report unavailable</h1><p className="mt-3">Only the person who reported this item can edit it.</p><Link to="/dashboard" className="btn-primary mt-6">Back to dashboard</Link></main>;
  }

  if (!currentUser) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="display text-2xl">Sign in to report an item</h1><Link to="/login" className="btn-primary mt-6">Log in</Link></main>;

  const inputStyle =
    "w-full border border-line dark:border-night-700 rounded-lg px-4 py-3 bg-white dark:bg-night-800 text-body dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-500";

  const labelStyle =
    "block text-sm font-semibold text-ink dark:text-stone-200 mb-2";

  return (
    <main className="min-h-screen bg-cream px-6 py-12 text-body dark:bg-night-950 dark:text-stone-100">

      <div className="max-w-3xl mx-auto">

        <Link
          to={isEditing ? `/items/${id}` : "/items"}
          className="inline-flex items-center gap-2 text-brand-700 dark:text-brand-300 font-semibold mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </Link>

        <div className="bg-white dark:bg-night-900 rounded-2xl shadow-sm border border-line dark:border-night-700 p-6 md:p-10">

          <h1 className="text-3xl font-bold text-ink dark:text-stone-50 mb-2">
            {isEditing ? "Edit Item" : "Report an Item"}
          </h1>

          <p className="text-muted dark:text-stone-400 mb-8">
            {isEditing
              ? "Update the information about this item."
              : "Fill in the details to report a lost or found item."}
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Item Name */}
            <div>
              <label htmlFor="name" className={labelStyle}>
                Item Name *
              </label>

              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Blue Backpack"
                className={inputStyle}
                required
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className={labelStyle}>
                Status *
              </label>

              <select
                name="status"
                id="status"
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
              <label htmlFor="category" className={labelStyle}>
                Category *
              </label>

              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className={inputStyle}
                required
                aria-invalid={Boolean(errors.category)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>

            {/* Building */}
            <div>
              <label htmlFor="building" className={labelStyle}>
                Building *
              </label>

              <select
                name="building"
                id="building"
                value={formData.building}
                onChange={handleChange}
                className={inputStyle}
                required
                aria-invalid={Boolean(errors.building)}
              >
                <option value="">Select a building</option>

                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
              {errors.building && <p className="form-error">{errors.building}</p>}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className={labelStyle}>
                Date *
              </label>

              <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className={inputStyle}
                required
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelStyle}>
                Description *
              </label>

              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item and any details that might help identify it..."
                rows="4"
                className={inputStyle}
                required
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className={labelStyle}>
                Image URL (Optional)
              </label>

              <input
                type="url"
                name="image"
                id="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={inputStyle}
              />

              <p className="text-xs text-muted dark:text-stone-400 mt-2">
                Paste an image URL if you have one.
              </p>
            </div>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="disabled:opacity-60 w-full bg-brand-800dark:bg-brand-500 text-white dark:text-night-950 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-brand-700 dark:hover:bg-brand-400 transition"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Submit Report"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
