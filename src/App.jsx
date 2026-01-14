import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  ExternalLink,
  Filter,
  FolderPlus,
  GripVertical,
  Layout,
  LayoutDashboard,
  List as ListIcon,
  Menu,
  MoreVertical,
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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <div className="bg-amber-500/10 p-2 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white rounded-lg transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = (
  {
    task,
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
  const [isPending, startTransition] = React.useTransition();

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
  // --- State Initialization with Migration Logic ---
  const [boards, setBoards] = useState(() => {
    const savedBoards = localStorage.getItem("kanban-boards");
    if (savedBoards) {
      return JSON.parse(savedBoards);
    }

    // Migration logic for existing users
    const oldTasks = localStorage.getItem("kanban-tasks");
    const tasks = oldTasks ? JSON.parse(oldTasks) : [
      {
        id: "1",
        title: "Welcome to FocusBoard",
        description: "This is your first task.",
        status: "todo",
        effort: "low",
        impact: "high",
        url: "",
        subtasks: [],
      },
    ];

    const oldNotes = localStorage.getItem("kanban-notes") || "";

    // Create a default board with old data
    const initialBoards = [{
      id: "default-board",
      name: "Main Board",
      tasks: tasks,
      notes: oldNotes,
    }];
    return initialBoards;
  });
  const [isPending, startTransition] = React.useTransition();

  const [activeBoardId, setActiveBoardId] = useState(() => {
    return localStorage.getItem("kanban-active-board") || "default-board";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Ensure activeBoardId is valid
  useEffect(() => {
    if (boards.length > 0 && !boards.find((b) => b.id === activeBoardId)) {
      startTransition(() => {
        setActiveBoardId(boards[0].id);
      });
    }
  }, [boards, activeBoardId]);

  // Derived state for the CURRENT board
  const activeBoard = useMemo(() => {
    return boards.find((b) => b.id === activeBoardId) || boards[0];
  }, [boards, activeBoardId]);

  // Helper to update CURRENT board state
  const setActiveBoardData = (newTasksOrFn, newNotes) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== activeBoardId) return board;

        const updatedTasks = typeof newTasksOrFn === "function"
          ? newTasksOrFn(board.tasks)
          : (newTasksOrFn !== undefined ? newTasksOrFn : board.tasks);

        const updatedNotes = newNotes !== undefined ? newNotes : board.notes;

        return {
          ...board,
          tasks: updatedTasks,
          notes: updatedNotes,
        };
      })
    );
  };

  // Wrapper for setTasks to maintain compatibility with existing logic
  const setTasks = (newTasksOrFn) =>
    setActiveBoardData(newTasksOrFn, undefined);
  const setNotes = (newNotes) => setActiveBoardData(undefined, newNotes);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editingBoardId, setEditingBoardId] = useState(null);

  // Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: null,
  });

  // Popover State & Refs
  const popoverRef = useRef(null);
  const [viewingSubtask, setViewingSubtask] = useState(null);
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState("");

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem("kanban-boards", JSON.stringify(boards));
    // We can clear the old keys to avoid confusion, or keep them as backup.
    // For now, we just update the new key.
  }, [boards]);

  useEffect(() => {
    localStorage.setItem("kanban-active-board", activeBoardId);
  }, [activeBoardId]);

  // --- Board Actions ---
  const addBoard = () => {
    const newBoard = {
      id: crypto.randomUUID(),
      name: "New Board",
      tasks: [],
      notes: "",
    };
    setBoards([...boards, newBoard]);
    setActiveBoardId(newBoard.id);
    // Automatically start editing name
    setEditingBoardId(newBoard.id);
  };

  const deleteBoard = (e, id) => {
    e.stopPropagation();
    if (boards.length <= 1) {
      alert("You must have at least one board.");
      return;
    }
    const confirm = window.confirm(
      "Are you sure? This will delete all tasks in this board.",
    );
    if (confirm) {
      const newBoards = boards.filter((b) => b.id !== id);
      setBoards(newBoards);
      if (activeBoardId === id) {
        setActiveBoardId(newBoards[0].id);
      }
    }
  };

  const renameBoard = (id, newName) => {
    setBoards(boards.map((b) => b.id === id ? { ...b, name: newName } : b));
    setEditingBoardId(null);
  };

  // --- Task Actions ---
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t.id === editingTask.id ? { ...t, ...taskData } : t
        )
      );
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        status: "todo",
        subtasks: [],
        ...taskData,
      };
      setTasks((currentTasks) => [...currentTasks, newTask]);
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

  const requestDeleteTask = (id) => {
    setDeleteModal({ isOpen: true, taskId: id });
  };

  const confirmDeleteTask = () => {
    if (deleteModal.taskId) {
      setTasks((currentTasks) =>
        currentTasks.filter((t) => t.id !== deleteModal.taskId)
      );
    }
    setDeleteModal({ isOpen: false, taskId: null });
  };

  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((t) => {
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

  // --- Subtask Popover Logic ---
  const handleViewSubtask = (taskId, subtask) => {
    setViewingTaskId(taskId);
    setViewingSubtask(subtask);
    setTempDesc(subtask.description || "");
    setIsEditingDesc(false);

    if (popoverRef.current) {
      try {
        popoverRef.current.showPopover();
      } catch (e) {}
    }
  };

  const handleSaveSubtaskDescription = () => {
    if (!viewingTaskId || !viewingSubtask) return;
    const updatedSubtask = { ...viewingSubtask, description: tempDesc };

    setTasks((currentTasks) =>
      currentTasks.map((t) => {
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
      } catch (e) {}
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
        // Move subtask to main board
        const currentTasks = activeBoard.tasks;
        const parentTask = currentTasks.find((t) => t.id === parentId);
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

      targetTask.subtasks = [...targetTask.subtasks, {
        ...taskToMove,
        status: "todo",
      }];
      newTasks[targetIndex] = targetTask;

      return newTasks;
    });
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

  const handleBoardDragStart = (e, boardId) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: boardId,
        type: "board",
      }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleBoardDrop = (e, targetBoardId) => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const { id, type, parentId } = data;

      // --- 1. REORDER BOARDS ---
      if (type === "board") {
        const sourceIndex = boards.findIndex((b) => b.id === id);
        const targetIndex = boards.findIndex((b) => b.id === targetBoardId);

        if (
          sourceIndex === -1 || targetIndex === -1 ||
          sourceIndex === targetIndex
        ) return;

        setBoards((prev) => {
          const newBoards = [...prev];
          const [moved] = newBoards.splice(sourceIndex, 1);
          newBoards.splice(targetIndex, 0, moved);
          return newBoards;
        });
        return;
      }

      // --- 2. MOVE TASK TO BOARD ---
      if (targetBoardId === activeBoardId) return;

      setBoards((prevBoards) => {
        const newBoards = [...prevBoards];
        const sourceBoardIndex = newBoards.findIndex((b) =>
          b.id === activeBoardId
        );
        const targetBoardIndex = newBoards.findIndex((b) =>
          b.id === targetBoardId
        );

        if (sourceBoardIndex === -1 || targetBoardIndex === -1) {
          return prevBoards;
        }

        const sourceBoard = { ...newBoards[sourceBoardIndex] };
        const targetBoard = { ...newBoards[targetBoardIndex] };

        let taskToMove;

        // Find and remove from source
        if (type === "task") {
          taskToMove = sourceBoard.tasks.find((t) => t.id === id);
          if (!taskToMove) return prevBoards;
          sourceBoard.tasks = sourceBoard.tasks.filter((t) => t.id !== id);
        } else if (type === "subtask") {
          const parentTask = sourceBoard.tasks.find((t) => t.id === parentId);
          if (!parentTask) return prevBoards;

          taskToMove = parentTask.subtasks.find((s) => s.id === id);
          if (!taskToMove) return prevBoards;

          // Update parent task in source board
          sourceBoard.tasks = sourceBoard.tasks.map((t) => {
            if (t.id === parentId) {
              return {
                ...t,
                subtasks: t.subtasks.filter((s) => s.id !== id),
              };
            }
            return t;
          });
        }

        if (!taskToMove) return prevBoards;

        // Add to target (unnest if it was a subtask)
        const movedTask = {
          ...taskToMove,
          status: "todo", // Default to todo column in new board
          subtasks: taskToMove.subtasks || [],
        };

        targetBoard.tasks = [...targetBoard.tasks, movedTask];

        newBoards[sourceBoardIndex] = sourceBoard;
        newBoards[targetBoardIndex] = targetBoard;

        return newBoards;
      });
    } catch (err) {
      console.error("Board drop failed", err);
    }
  };

  // Derived State
  const filteredTasks = useMemo(() => {
    if (!activeBoard) return [];
    if (filter === "all") return activeBoard.tasks;
    return activeBoard.tasks.filter((t) =>
      getMatrixType(t.impact, t.effort) === filter
    );
  }, [activeBoard, filter]);

  if (!activeBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />

      {/* --- NATIVE POPOVER API ELEMENT --- */}
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

      {/* --- SIDEBAR --- */}
      <aside
        className={`${
          isSidebarOpen ? "w-64 border-r" : "w-0 border-r-0"
        } bg-zinc-900 border-zinc-800 flex flex-col flex-shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="h-14 flex items-center gap-3 px-4 border-b border-zinc-800/50 min-w-64">
          <div className="bg-blue-600/20 p-1.5 rounded-lg">
            <LayoutDashboard className="text-blue-500" size={20} />
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight">
            FocusBoard
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 min-w-64">
          <div className="px-2 mb-2">
            <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Your Boards
            </h3>
          </div>

          {boards.map((board) => (
            <div
              key={board.id}
              draggable={editingBoardId !== board.id}
              onDragStart={(e) => handleBoardDragStart(e, board.id)}
              onClick={() => setActiveBoardId(board.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "bg-zinc-800/80",
                  "ring-1",
                  "ring-blue-500/50",
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "bg-zinc-800/80",
                  "ring-1",
                  "ring-blue-500/50",
                );
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove(
                  "bg-zinc-800/80",
                  "ring-1",
                  "ring-blue-500/50",
                );
                handleBoardDrop(e, board.id);
              }}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                activeBoardId === board.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div
                className="mr-2 text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
              >
                <GripVertical size={12} />
              </div>

              {editingBoardId === board.id
                ? (
                  <input
                    autoFocus
                    type="text"
                    defaultValue={board.name}
                    onBlur={(e) => renameBoard(board.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameBoard(board.id, e.currentTarget.value);
                      }
                    }}
                    className="bg-zinc-950 border border-blue-500/50 rounded px-1.5 py-0.5 w-full text-zinc-200 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                )
                : (
                  <div className="flex-1 flex items-center gap-2 truncate pointer-events-none">
                    <span className="truncate">{board.name}</span>
                  </div>
                )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingBoardId(board.id);
                  }}
                  className="p-1 text-zinc-500 hover:text-blue-400 rounded"
                  title="Rename"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => deleteBoard(e, board.id)}
                  className="p-1 text-zinc-500 hover:text-red-400 rounded"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800/50 min-w-64">
          <button
            onClick={addBoard}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700 hover:border-zinc-600"
          >
            <FolderPlus size={16} /> New Board
          </button>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-semibold text-zinc-100 truncate">
              {activeBoard.name}
            </h2>
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
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shrink-0"
            >
              <Plus size={16} />{" "}
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            {/* Kanban Board Area */}
            <div className="lg:col-span-8 flex flex-col min-h-[500px]">
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
                          <h2 className="font-medium text-zinc-300">
                            {col.title}
                          </h2>
                          <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded text-xs font-mono">
                            {filteredTasks.filter((t) => t.status === col.id)
                              .length}
                          </span>
                        </div>
                      </div>

                      {/* Column Body */}
                      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent min-h-[200px]">
                        {filteredTasks.filter((t) => t.status === col.id).map(
                          (task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onDelete={requestDeleteTask}
                              onEdit={openEditModal}
                              onTaskDrop={handleTaskDrop}
                              onSubtaskDrop={handleSubtaskReorder}
                              onToggleSubtask={toggleSubtaskCompletion}
                              onViewSubtask={handleViewSubtask}
                            />
                          ),
                        )}

                        {filteredTasks.filter((t) => t.status === col.id)
                              .length === 0 && (
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
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Quick List */}
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 flex flex-col min-h-[300px] max-h-[500px]">
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
              <div className="min-h-[300px] bg-amber-100/5 rounded-xl border border-amber-900/20 flex flex-col">
                <div className="p-3 border-b border-amber-900/20 flex items-center justify-between bg-amber-900/10 rounded-t-xl">
                  <div className="flex items-center gap-2 text-amber-500">
                    <StickyNote size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Scratchpad
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-500/60">
                    Auto-saving
                  </span>
                </div>
                <textarea
                  className="flex-1 w-full bg-transparent resize-none p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none text-sm leading-relaxed"
                  placeholder="Jot down quick thoughts, meeting notes, or ideas here..."
                  value={activeBoard.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
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
