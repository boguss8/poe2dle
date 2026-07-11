export default function ResultsTable() {
  return (
    <table className="w-full text-left text-sm text-gray-600">
      <thead>
        <tr>
          <th className="border-b p-2">Name</th>
          <th className="border-b p-2">Requirement</th>
          <th className="border-b p-2">Minimum Level</th>
          <th className="border-b p-2">Required Weapon</th>
          <th className="border-b p-2">Tags</th>
          <th className="border-b p-2">Released</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border-b p-2">Ice Shot</td>
          <td className="border-b p-2">Dex</td>
          <td className="border-b p-2">9</td>
          <td className="border-b p-2">Bow</td>
          <td className="border-b p-2">Dexterity, Active Skill, Attack, Projectile, Cold, Repeatable</td>
          <td className="border-b p-2">0.1</td>
        </tr>
      </tbody>
    </table>
  );
}
