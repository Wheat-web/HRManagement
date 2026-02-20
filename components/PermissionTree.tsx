import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { PermissionNode } from "../types";

interface Props {
  nodes: PermissionNode[];
  selected: string[];
  setSelected: (perms: string[]) => void;
  isEditing: boolean;
}

const PermissionTree: React.FC<Props> = ({
  nodes,
  selected,
  setSelected,
  isEditing
}) => {

  const getAllChildIds = (node: PermissionNode): string[] => {
    if (!node.children) return [node.id];
    return [
      node.id,
      ...node.children.flatMap(child => getAllChildIds(child))
    ];
  };

  const handleToggle = (node: PermissionNode) => {
    const allIds = getAllChildIds(node);
    const allSelected = allIds.every(id => selected.includes(id));

    if (allSelected) {
      setSelected(selected.filter(id => !allIds.includes(id)));
    } else {
      setSelected([...new Set([...selected, ...allIds])]);
    }
  };

  const getCheckboxState = (node: PermissionNode) => {
    const allIds = getAllChildIds(node);
    const checkedCount = allIds.filter(id => selected.includes(id)).length;

    if (checkedCount === 0) return "unchecked";
    if (checkedCount === allIds.length) return "checked";
    return "indeterminate";
  };

  const TreeNode: React.FC<{ node: PermissionNode }> = ({ node }) => {
    const [open, setOpen] = useState(true);
    const hasChildren = !!node.children?.length;
    const state = getCheckboxState(node);

    return (
      <div className="ml-4">
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <button onClick={() => setOpen(!open)}>
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          <button
            disabled={!isEditing}
            onClick={() => handleToggle(node)}
            className={`w-4 h-4 border rounded flex items-center justify-center
              ${state === "checked" ? "bg-indigo-600 border-indigo-600" : ""}
              ${state === "indeterminate" ? "bg-indigo-400 border-indigo-400" : ""}
              ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}
            `}
          />

          <span className="text-sm">{node.label}</span>
        </div>

        {hasChildren && open && (
          <div className="ml-6 border-l border-slate-200 pl-3">
            {node.children!.map(child => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {nodes.map(node => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};

export default PermissionTree;