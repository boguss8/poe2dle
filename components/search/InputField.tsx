"use client";

import { useState } from "react";
import ItemList from "./ItemList";

export default function InputField() {
  const [showList, setShowList] = useState(false);

  return (
    <div className="bg-gray-400 p-4 rounded-lg">
      <input
        name="guess"
        className="mb-2 rounded border border-gray-300 bg-white px-3 py-2"
        placeholder="Type a skill name..."
        onFocus={() => setShowList(true)}
        onBlur={() => setShowList(false)}
      />
      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>

      {showList && (
        <div className="mt-4">
          <ItemList />
        </div>
      )}
    </div>
  );
}
