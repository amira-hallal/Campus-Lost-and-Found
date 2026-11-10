import { Link } from "react-router-dom";
import { MapPin, Calendar, Package } from "lucide-react";

export default function ItemCard({ item }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-[#DCE6D8] shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300"
    >
      {/* Item Image */}
      <div className="h-52 bg-[#DCE6D8] relative overflow-hidden">

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Fallback Image */}
        <div
          style={{ display: item.image ? "none" : "flex" }}
          className="w-full h-full flex-col items-center justify-center text-[#68796C]"
        >
          <Package size={48} strokeWidth={1.3} />
          <span className="text-sm mt-2 font-medium">
            No image available
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold ${
            item.status === "Lost"
              ? "bg-[#F8E2DF] text-[#A33F35]"
              : "bg-[#DCE6D8] text-[#244B3C]"
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* Item Information */}
      <div className="p-5">

        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-xl font-bold text-[#244B3C]">
            {item.name}
          </h3>

          <span className="text-xs bg-[#F7F5EC] text-[#68796C] px-3 py-1 rounded-full whitespace-nowrap">
            {item.category}
          </span>
        </div>

        <p className="text-[#68796C] text-sm leading-relaxed mb-5 min-h-[40px]">
          {item.description}
        </p>

        {/* Building */}
        <div className="flex items-center gap-2 text-sm text-[#52765F] mb-3">
          <MapPin size={17} />
          <span>{item.building}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-[#52765F]">
          <Calendar size={17} />
          <span>{item.date}</span>
        </div>

      </div>

      <div className="h-1.5 bg-[#DCE6D8]"></div>
    </Link>
  );
}