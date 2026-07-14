"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import skills from "../../data/skill_gems.json";
import ItemList from "./ItemList";
import type { SkillItem } from "./types";

export default function InputField() {
  const [showList, setShowList] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SkillItem | null>(null);
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(
    () => Object.values(skills as Record<string, SkillItem>),
    [],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    if (!normalizedQuery) {
      return allItems.slice(0, 10);
    }

    return allItems.filter((item) =>
      item.base_item?.display_name?.toLowerCase().includes(normalizedQuery),
    );
  }, [allItems, searchText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectItem = (item: SkillItem) => {
    setSelectedItem(item);
    setSearchText(item.base_item?.display_name ?? "");
    setShowList(false);
  };

  const handleInputChange = (value: string) => {
    setSearchText(value);
    setSelectedItem(null);
    setShowList(true);
  };

  return (
    <div className="flex gap-4">
      <div ref={containerRef} className="w-full rounded-lg bg-gray-400 p-4">
        <div className="flex items-center gap-4">
          {selectedItem ? (
            <Image
              src={`/icons/poe2/${selectedItem?.icon_dds_file?.replace(/\.dds$/i, ".png")}`}
              alt={selectedItem?.base_item?.display_name || "Skill icon"}
              width={48}
              height={48}
              className="rounded border border-gray-600 bg-gray-800 object-cover"
            />
          ) : null}
          <input
            name="guess"
            className=""
            placeholder="Type a skill name..."
            value={searchText || selectedItem?.base_item?.display_name || ""}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={() => setShowList(true)}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded align-center h-10"
          >
            Submit
          </button>
        </div>

        {showList && (
          <div className="mt-4">
            <ItemList items={filteredItems} onSelect={handleSelectItem} />
          </div>
        )}
      </div>
    </div>
  );
}
