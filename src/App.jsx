import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Filter,
  Layout,
  List as ListIcon,
  Pencil,
  Plus,
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

const TaskCard = ({ task, onDragStart, onDelete, onEdit }) => {
  const matrix = MATRIX_TYPES[getMatrixType(task.impact, task.effort)];
  const Icon = matrix.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
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
            onClick={() => onEdit(task)}
            className="text-zinc-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
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
        <p className="text-xs text-zinc-400 mb-2 line-clamp-3 whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2 inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={10} /> Link
        </a>
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
  const [effort, setEffort] = useState("low");
  const [impact, setImpact] = useState("low");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  // Reset or populate form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTimeout(() => {
          setTitle(taskToEdit.title);
          setEffort(taskToEdit.effort);
          setImpact(taskToEdit.impact);
          setUrl(taskToEdit.url || "");
          setDescription(taskToEdit.description || "");
        }, 0);
      } else {
        setTimeout(() => {
          setTitle("");
          setEffort("low");
          setImpact("low");
          setUrl("");
          setDescription("");
        }, 0);
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      effort,
      impact,
      url,
      description,
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

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:border-blue-500 min-h-[80px] h-20 resize-none"
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
  // State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        title: "Research competitors",
        status: "todo",
        effort: "low",
        impact: "high",
        url: "",
      },
      {
        id: "2",
        title: "Design system update",
        status: "inprogress",
        effort: "high",
        impact: "high",
        url: "",
      },
      {
        id: "3",
        title: "Update documentation",
        status: "todo",
        effort: "low",
        impact: "low",
        url: "",
      },
    ];
  });

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem("kanban-notes") || "";
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all"); // all, quickWin, majorProject, etc.
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("kanban-notes", notes);
  }, [notes]);

  // Actions
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      // Update existing
      setTasks(
        tasks.map((t) => t.id === editingTask.id ? { ...t, ...taskData } : t),
      );
    } else {
      // Add new
      const newTask = {
        id: crypto.randomUUID(),
        status: "todo",
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

  const onDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, status) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === draggedTaskId) {
        return { ...t, status };
      }
      return t;
    });
    setTasks(updatedTasks);
    setDraggedTaskId(null);
  };

  const toggleTaskStatus = (id) => {
    // Quick toggle for the list view
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "done" ? "todo" : "done";

    setTasks(tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  };

  // Derived State
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => getMatrixType(t.impact, t.effort) === filter);
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30">
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
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, col.id)}
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
                        />
                      ),
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
                        onClick={() => toggleTaskStatus(task.id)}
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
                        <span
                          className={`text-sm truncate flex-1 ${
                            task.status === "done"
                              ? "text-zinc-600 line-through"
                              : "text-zinc-300"
                          }`}
                        >
                          {task.title}
                        </span>
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
