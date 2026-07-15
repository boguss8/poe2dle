import Image from "next/image";
import type { ItemListProps } from "./types";

export default function ItemList({ items, onSelect }: ItemListProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <ul className="divide-y divide-gray-700">
        {items.slice(0, 10).map((item, index) => (
          <li
            key={
              item.base_item?.id ??
              `${item.base_item?.display_name ?? "item"}-${index}`
            }
            className="cursor-pointer py-3"
            onClick={() => onSelect?.(item)}
          >
            <div className="flex items-center gap-4">
              <Image
                src={`/icons/poe2/${item?.icon_dds_file?.replace(/\.dds$/i, ".png")}`}
                alt={item?.base_item?.display_name || "Skill icon"}
                width={48}
                height={48}
                className="rounded border border-gray-600 bg-gray-800 object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-100">
                  {item?.base_item?.display_name}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
