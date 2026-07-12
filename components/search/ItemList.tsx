import Image from "next/image";
import skills from "../../data/skill_gems.json";

export default function ItemList() {
  const itemList = Object.values(skills).slice(0, 10);

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <ul className="divide-y divide-gray-700">
        {itemList.map((item, index) => (
          <li key={index} className="py-3">
            <div
              className="flex items-center gap-4"
              onClick={() =>
                console.log(`Clicked on ${item?.base_item?.display_name}`)
              }
            >
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
