import React, { useState } from "react";

function AttributeForm() {
  const MAX_GROUP = 2;
  const [groups, setGroups] = useState([
    { name: "", nameError: "", values: [""], valueErrors: [""] }
  ]);

  // Thêm nhóm mới
  const addGroup = () => {
    if (groups.length < MAX_GROUP) {
      setGroups([
        ...groups,
        { name: "", nameError: "", values: [""], valueErrors: [""] }
      ]);
    }
  };

  // Xoá nhóm
  const removeGroup = idx => {
    setGroups(groups.filter((_, i) => i !== idx));
  };

  // Thay đổi tên nhóm
  const handleNameChange = (idx, val) => {
    const newGroups = [...groups];
    newGroups[idx].name = val;
    newGroups[idx].nameError = val.trim() ? "" : "This field cannot be empty!";
    setGroups(newGroups);
  };

  // Thay đổi value
  const handleValueChange = (gIdx, vIdx, val) => {
    const newGroups = [...groups];
    newGroups[gIdx].values[vIdx] = val;
    newGroups[gIdx].valueErrors[vIdx] = val.trim() ? "" : "Can't empty!";
    setGroups(newGroups);
  };

  // Thêm value
  const addValue = gIdx => {
    const newGroups = [...groups];
    newGroups[gIdx].values.push("");
    newGroups[gIdx].valueErrors.push("");
    setGroups(newGroups);
  };

  // Xoá value
  const removeValue = (gIdx, vIdx) => {
    const newGroups = [...groups];
    if (newGroups[gIdx].values.length > 1) {
      newGroups[gIdx].values.splice(vIdx, 1);
      newGroups[gIdx].valueErrors.splice(vIdx, 1);
      setGroups(newGroups);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Attribute</h2>
      {groups.map((group, gIdx) => (
        <div key={gIdx} className="border rounded-lg p-4 mb-4 bg-gray-50 relative">
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            title="Delete group"
            onClick={() => removeGroup(gIdx)}
            disabled={groups.length === 1}
          >
            <i data-feather="x"></i>
          </button>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Attribute Group Name</label>
          <div className="mb-2">
            <input
              type="text"
              className="block w-full px-4 py-2 border rounded-lg"
              maxLength={14}
              placeholder="Enter attribute name (eg: Color)"
              value={group.name}
              onChange={e => handleNameChange(gIdx, e.target.value)}
              required
            />
            {group.nameError && (
              <div className="input-error mt-1 text-xs text-red-600">{group.nameError}</div>
            )}
          </div>
          <div className="flex flex-col gap-2 mb-2 attribute-values">
            {group.values.map((val, vIdx) => (
              <div key={vIdx} className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="block w-[500px] px-4 py-2 border rounded-lg"
                    maxLength={20}
                    placeholder="Enter value (eg: Red, White,...)"
                    value={val}
                    onChange={e => handleValueChange(gIdx, vIdx, e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="add-value px-2 py-1 border rounded text-indigo-600 border-indigo-400 hover:bg-indigo-50"
                    onClick={() => addValue(gIdx)}
                  >+
                  </button>
                  <button
                    type="button"
                    className="remove-value px-2 py-1 border rounded text-red-600 border-red-400 hover:bg-red-50"
                    onClick={() => removeValue(gIdx, vIdx)}
                    disabled={group.values.length === 1}
                  >🗑
                  </button>
                </div>
                {group.valueErrors[vIdx] && (
                  <div className="input-error mt-1 text-xs text-red-600">{group.valueErrors[vIdx]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="mt-2 px-4 py-2 border border-dashed border-red-400 text-red-500 rounded-lg hover:bg-red-50"
        onClick={addGroup}
        disabled={groups.length >= MAX_GROUP}
      >+ Add Attribute</button>
    </div>
  );
}

export default AttributeForm;
