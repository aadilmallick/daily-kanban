import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  ExternalLink,
  Filter,
  GripVertical,
  Layout,
  List as ListIcon,
  Pencil,
  Plus,
  Save,
  StickyNote,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";

// --- Constants & Utilities ---

const COLUMNS = [
  { id: "todo", title: "To Do", color: "border-zinc-600" },
  { id: "inprogress", title: "In Progress", color: "border-blue-500" },
  { id: "done", title: "Complete", color: "border-emerald-500" },
];

const MATRIX_TYPES = {
  quickWin: {
    label: "Quick Win",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    icon: Zap,
    desc: "High Impact, Low Effort",
  },
  majorProject: {
    label: "Major Project",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    icon: Target,
    desc: "High Impact, High Effort",
  },
  fillIn: {
    label: "Fill In",
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    borderColor: "border-zinc-400/20",
    icon: Clock,
    desc: "Low Impact, Low Effort",
  },
  thankless: {
    label: "Slog",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    icon: AlertCircle,
    desc: "Low Impact, High Effort",
  },
};

const getMatrixType = (impact, effort) => {
  if (impact === "high" && effort === "low") return "quickWin";
  if (impact === "high" && effort === "high") return "majorProject";
  if (impact === "low" && effort === "low") return "fillIn";
  return "thankless"; // Low impact, high effort
};

// --- Components ---

const TaskCard = (
  {
    task,
    onDragStart,
    onDelete,
    onEdit,
    onTaskDrop,
    onSubtaskDrop,
    onToggleSubtask,
    onViewSubtask,
  },
) => {
  const matrix = MATRIX_TYPES[getMatrixType(task.impact, task.effort)];
  const Icon = matrix.icon;
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: task.id,
        type: "task",
        parentId: null,
      }),
    );
    e.dataTransfer.effectAllowed = "move";
    onDragStart(task.id);
  };

  const handleSubtaskDragStart = (e, subtask) => {
    e.stopPropagation();
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: subtask.id,
        type: "subtask",
        parentId: task.id,
      }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.id === task.id) return;
      onTaskDrop(data, task.id);
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleDropOnSubtask = (e, targetSubtaskIndex) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      onSubtaskDrop(data, task.id, targetSubtaskIndex);
    } catch (err) {
      console.error("Subtask drop error", err);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropOnCard}
      className="group relative bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-lg p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <div
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${matrix.bg} ${matrix.color} border ${matrix.borderColor}`}
        >
          <Icon size={12} />
          {matrix.label}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-zinc-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h4 className="text-zinc-200 font-medium text-sm mb-1 leading-snug">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-zinc-500 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-2 inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={10} /> Link
        </a>
      )}

      {/* Subtasks Area */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-2 border-t border-zinc-700/50">
          <div
            className="flex items-center gap-1 text-xs text-zinc-500 mb-2 cursor-pointer hover:text-zinc-300 select-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded
              ? <ChevronDown size={12} />
              : <ChevronRight size={12} />}
            <span>
              Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task
                .subtasks.length})
            </span>
          </div>

          {isExpanded && (
            <div className="space-y-1 ml-1">
              {task.subtasks.map((sub, index) => (
                <div
                  key={sub.id}
                  draggable
                  onDragStart={(e) => handleSubtaskDragStart(e, sub)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnSubtask(e, index)}
                  className={`flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded border ${
                    sub.completed
                      ? "border-zinc-800/50 opacity-60"
                      : "border-zinc-800 hover:border-zinc-600"
                  } group/sub transition-all`}
                >
                  <GripVertical
                    size={10}
                    className="text-zinc-600 cursor-grab shrink-0"
                  />

                  {/* Subtask Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSubtask(task.id, sub.id);
                    }}
                    className={`shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                      sub.completed
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500"
                        : "border-zinc-600 hover:border-zinc-500"
                    }`}
                  >
                    {sub.completed && <Check size={8} strokeWidth={4} />}
                  </button>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewSubtask(task.id, sub);
                    }}
                    className={`text-xs flex-1 truncate cursor-pointer hover:text-blue-400 transition-colors ${
                      sub.completed
                        ? "text-zinc-500 line-through"
                        : "text-zinc-300"
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
        <span>{task.effort} Effort</span>
        <span>{task.impact} Impact</span>
      </div>
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [effort, setEffort] = useState("low");
  const [impact, setImpact] = useState("low");
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        startTransition(() => {
          setTitle(taskToEdit.title);
          setDescription(taskToEdit.description || "");
          setEffort(taskToEdit.effort);
          setImpact(taskToEdit.impact);
          setUrl(taskToEdit.url || "");
        });
      } else {
        startTransition(() => {
          setTitle("");
          setDescription("");
          setEffort("low");
          setImpact("low");
          setUrl("");
        });
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      effort,
      impact,
      url,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-zinc-100 font-medium">
            {taskToEdit ? "Edit Task" : "New Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Task Title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Effort</label>
              <div className="flex bg-zinc-950 rounded-lg border border-zinc-700 p-1">
                {["low", "high"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEffort(v)}
                    className={`flex-1 text-xs py-1.5 rounded capitalize transition-colors ${
                      effort === v
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Impact</label>
              <div className="flex bg-zinc-950 rounded-lg border border-zinc-700 p-1">
                {["low", "high"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setImpact(v)}
                    className={`flex-1 text-xs py-1.5 rounded capitalize transition-colors ${
                      impact === v
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              URL (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {taskToEdit ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        title: "Research competitors",
        description: "Look at top 3 market leaders",
        status: "todo",
        effort: "low",
        impact: "high",
        url: "",
        subtasks: [],
      },
      {
        id: "2",
        title: "Design system update",
        description: "",
        status: "inprogress",
        effort: "high",
        impact: "high",
        url: "",
        subtasks: [],
      },
    ];
  });

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem("kanban-notes") || "";
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Popover State & Refs
  const popoverRef = useRef(null);
  const [viewingSubtask, setViewingSubtask] = useState(null);
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState("");

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("kanban-notes", notes);
  }, [notes]);

  // Actions
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks(
        tasks.map((t) => t.id === editingTask.id ? { ...t, ...taskData } : t),
      );
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        status: "todo",
        subtasks: [],
        ...taskData,
      };
      setTasks([...tasks, newTask]);
    }
    setEditingTask(null);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const onDragStart = (id) => {
    setDraggedTaskId(id);
  };

  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
        };
      })
    );
  };

  const handleViewSubtask = (taskId, subtask) => {
    setViewingTaskId(taskId);
    setViewingSubtask(subtask);
    setTempDesc(subtask.description || "");
    setIsEditingDesc(false);

    if (popoverRef.current) {
      // Native Popover API Method
      try {
        popoverRef.current.showPopover();
      } catch (e) {
        console.warn(
          "Browser doesn't support native popover API yet, or popover is already open.",
        );
      }
    }
  };

  const handleSaveSubtaskDescription = () => {
    if (!viewingTaskId || !viewingSubtask) return;

    const updatedSubtask = { ...viewingSubtask, description: tempDesc };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== viewingTaskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === viewingSubtask.id ? updatedSubtask : s
          ),
        };
      })
    );

    setViewingSubtask(updatedSubtask);
    setIsEditingDesc(false);
  };

  const closePopover = () => {
    if (popoverRef.current) {
      try {
        popoverRef.current.hidePopover();
      } catch (e) {
        alert("failed to close popover");
      }
    }
    setViewingSubtask(null);
    setViewingTaskId(null);
    setIsEditingDesc(false);
  };

  // --- Drag & Drop Handlers ---

  const handleColumnDrop = (e, status) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const { id, type, parentId } = data;

      if (type === "task") {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
      } else if (type === "subtask") {
        const parentTask = tasks.find((t) => t.id === parentId);
        if (!parentTask) return;

        const subtaskToPromote = parentTask.subtasks.find((s) => s.id === id);
        if (!subtaskToPromote) return;

        const newParent = {
          ...parentTask,
          subtasks: parentTask.subtasks.filter((s) => s.id !== id),
        };

        const newTask = {
          ...subtaskToPromote,
          status,
          subtasks: [],
        };

        setTasks((prev) => [
          ...prev.map((t) => t.id === parentId ? newParent : t),
          newTask,
        ]);
      }
    } catch (err) {
      console.error("Column drop failed", err);
    }
    setDraggedTaskId(null);
  };

  const handleTaskDrop = (draggedData, targetTaskId) => {
    const { id, type, parentId } = draggedData;
    if (id === targetTaskId) return;

    setTasks((prev) => {
      let taskToMove;
      let newTasks = [...prev];

      if (type === "task") {
        taskToMove = newTasks.find((t) => t.id === id);
        if (taskToMove?.subtasks?.length > 0) return prev;
        newTasks = newTasks.filter((t) => t.id !== id);
      } else if (type === "subtask") {
        const oldParentIndex = newTasks.findIndex((t) => t.id === parentId);
        if (oldParentIndex === -1) return prev;

        const oldParent = { ...newTasks[oldParentIndex] };
        taskToMove = oldParent.subtasks.find((s) => s.id === id);
        oldParent.subtasks = oldParent.subtasks.filter((s) => s.id !== id);
        newTasks[oldParentIndex] = oldParent;
      }

      if (!taskToMove) return prev;

      const targetIndex = newTasks.findIndex((t) => t.id === targetTaskId);
      if (targetIndex === -1) return prev;

      const targetTask = { ...newTasks[targetIndex] };
      if (!targetTask.subtasks) targetTask.subtasks = [];

      // Ensure we clear status from subtask so it doesn't look weird if moved back out later
      // But we keep completion status
      targetTask.subtasks = [...targetTask.subtasks, {
        ...taskToMove,
        status: "todo",
      }];
      newTasks[targetIndex] = targetTask;

      return newTasks;
    });
    setDraggedTaskId(null);
  };

  const handleSubtaskReorder = (draggedData, targetParentId, targetIndex) => {
    const { id, parentId: sourceParentId } = draggedData;

    if (sourceParentId !== targetParentId) {
      handleTaskDrop(draggedData, targetParentId);
      return;
    }

    setTasks((prev) => {
      const newTasks = [...prev];
      const parentIndex = newTasks.findIndex((t) => t.id === targetParentId);
      if (parentIndex === -1) return prev;

      const parent = { ...newTasks[parentIndex] };
      const subtasks = [...parent.subtasks];

      const sourceIndex = subtasks.findIndex((s) => s.id === id);
      if (sourceIndex === -1) return prev;

      const [movedSubtask] = subtasks.splice(sourceIndex, 1);
      subtasks.splice(targetIndex, 0, movedSubtask);

      parent.subtasks = subtasks;
      newTasks[parentIndex] = parent;
      return newTasks;
    });
  };

  // Derived State
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => getMatrixType(t.impact, t.effort) === filter);
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 relative">
      {/* --- NATIVE POPOVER API ELEMENT --- */}
      {/* Note: 'popover' attribute is handled by browser. Tailwind 'backdrop:' targets the ::backdrop pseudo-element */}
      <div
        ref={popoverRef}
        popover="auto"
        className="
            bg-zinc-900 border border-zinc-700 text-zinc-200 
            rounded-xl shadow-2xl p-0 w-full max-w-sm 
            backdrop:bg-black/60 backdrop:backdrop-blur-sm
            transition-all outline-none
            m-auto
        "
      >
        {viewingSubtask && (
          <div className="flex flex-col">
            <div className="flex items-start justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-semibold text-lg leading-snug pr-4">
                {viewingSubtask.title}
              </h3>
              <button
                onClick={closePopover}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    viewingSubtask.completed
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {viewingSubtask.completed
                    ? (
                      <>
                        <CheckCircle2 size={12} /> Completed
                      </>
                    )
                    : (
                      <>
                        <Circle size={12} /> In Progress
                      </>
                    )}
                </span>
              </div>

              {/* Description Area */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    Description
                  </span>
                  {!isEditingDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      <Pencil size={10} /> Edit
                    </button>
                  )}
                </div>

                {isEditingDesc
                  ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempDesc}
                        onChange={(e) => setTempDesc(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 resize-none"
                        rows={4}
                        placeholder="Add subtask details..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsEditingDesc(false)}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSubtaskDescription}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                        >
                          <Save size={12} /> Save
                        </button>
                      </div>
                    </div>
                  )
                  : (
                    <>
                      {viewingSubtask.description
                        ? (
                          <div className="prose prose-invert prose-sm max-w-none">
                            <p className="whitespace-pre-wrap text-zinc-300 leading-relaxed">
                              {viewingSubtask.description}
                            </p>
                          </div>
                        )
                        : (
                          <div className="text-zinc-600 italic text-sm py-4 text-center border-2 border-dashed border-zinc-800 rounded-lg">
                            No description provided.
                          </div>
                        )}
                    </>
                  )}
              </div>

              {viewingSubtask.url && (
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <a
                    href={viewingSubtask.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    <ExternalLink size={14} />
                    Open Attached Link
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-1.5 rounded-lg">
            <Layout className="text-blue-500" size={20} />
          </div>
          <h1 className="font-semibold text-zinc-100 tracking-tight">
            FocusBoard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter Pills */}
          <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <div className="px-2 border-r border-zinc-800 mr-1 text-zinc-500">
              <Filter size={14} />
            </div>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All
            </button>
            {Object.entries(MATRIX_TYPES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                  filter === key
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={config.desc}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    config.color.replace("text-", "bg-")
                  }`}
                >
                </div>
                {config.label}
              </button>
            ))}
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />{" "}
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3.5rem)]">
        {/* Kanban Board Area */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex h-full min-w-[800px] gap-4">
              {COLUMNS.map((col) => (
                <div
                  key={col.id}
                  className="flex-1 flex flex-col min-w-[280px] bg-zinc-900/50 rounded-xl border border-zinc-800/50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleColumnDrop(e, col.id)}
                >
                  {/* Column Header */}
                  <div
                    className={`p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-sm rounded-t-xl z-10`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          col.id === "todo"
                            ? "bg-zinc-500"
                            : col.id === "inprogress"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <h2 className="font-medium text-zinc-300">{col.title}</h2>
                      <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded text-xs font-mono">
                        {filteredTasks.filter((t) => t.status === col.id)
                          .length}
                      </span>
                    </div>
                  </div>

                  {/* Column Body */}
                  <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {filteredTasks.filter((t) => t.status === col.id).map(
                      (task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDragStart={onDragStart}
                          onDelete={deleteTask}
                          onEdit={openEditModal}
                          onTaskDrop={handleTaskDrop}
                          onSubtaskDrop={handleSubtaskReorder}
                          onToggleSubtask={toggleSubtaskCompletion}
                          onViewSubtask={handleViewSubtask}
                        />
                      )
                    )}

                    {filteredTasks.filter((t) => t.status === col.id).length ===
                        0 && (
                      <div className="h-24 border-2 border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-sm">
                        Drop items here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Notes & List */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          {/* Quick List */}
          <div className="flex-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
              <ListIcon size={16} className="text-zinc-400" />
              <h3 className="font-medium text-zinc-300">Task List</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {filteredTasks.length === 0
                ? (
                  <div className="text-center text-zinc-600 py-8 text-sm">
                    No tasks found
                  </div>
                )
                : (
                  <div className="space-y-1">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <button
                          className={`shrink-0 transition-colors ${
                            task.status === "done"
                              ? "text-emerald-500"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        >
                          {task.status === "done"
                            ? <CheckCircle2 size={16} />
                            : <Circle size={16} />}
                        </button>
                        <div className="flex-1 overflow-hidden">
                          <div
                            className={`text-sm truncate ${
                              task.status === "done"
                                ? "text-zinc-600 line-through"
                                : "text-zinc-300"
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              {task.subtasks.length}{" "}
                              subtask{task.subtasks.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            MATRIX_TYPES[
                              getMatrixType(task.impact, task.effort)
                            ].bg.replace("/10", "")
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Notepad */}
          <div className="h-1/2 min-h-[250px] bg-amber-100/5 rounded-xl border border-amber-900/20 flex flex-col">
            <div className="p-3 border-b border-amber-900/20 flex items-center justify-between bg-amber-900/10 rounded-t-xl">
              <div className="flex items-center gap-2 text-amber-500">
                <StickyNote size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Scratchpad
                </span>
              </div>
              <span className="text-[10px] text-amber-500/60">Auto-saving</span>
            </div>
            <textarea
              className="flex-1 w-full bg-transparent resize-none p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none text-sm leading-relaxed"
              placeholder="Jot down quick thoughts, meeting notes, or ideas here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />
    </div>
  );
}
