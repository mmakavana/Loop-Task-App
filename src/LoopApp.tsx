
import React, { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Settings,
  Info,
  Check,
  X,
  Plus,
  Star,
  DollarSign,
} from "lucide-react";

/** Types */
type Kid = { id: number; name: string; avatar: string; centsPerPoint: number | null };
type Task = { id: number; title: string; points: number; daysOfWeek: number[]; active: boolean };
type Completion = { kidId: number; taskId: number; date: string; approved: boolean };

/** Helpers */
const todayStr = () => new Date().toISOString().split("T")[0];
const formatCurrency = (cents: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(cents / 100);

/** Main Component */
const LoopApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"board" | "calendar" | "reports" | "manage" | "info">("board");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [kids, setKids] = useState<Kid[]>([
    { id: 1, name: "Emma", avatar: "👧", centsPerPoint: 5 },
    { id: 2, name: "Liam", avatar: "👦", centsPerPoint: 5 },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Make bed", points: 2, daysOfWeek: [1,2,3,4,5,6,7], active: true },
    { id: 2, title: "Dishes", points: 3, daysOfWeek: [1,2,3,4,5,6,7], active: true },
  ]);
  const [completions, setCompletions] = useState<Completion[]>([]);

  // Manage modal state
  const [newTask, setNewTask] = useState<{ title: string; points: number; daysOfWeek: number[] }>({
    title: "",
    points: 1,
    daysOfWeek: [1,2,3,4,5,6,7],
  });
  const [newKid, setNewKid] = useState<{ name: string; avatar: string; centsPerPoint: number | null }>({
    name: "",
    avatar: "🙂",
    centsPerPoint: 5,
  });

  /** Derived data */
  const tasksForDate = useMemo(() => {
    const weekday = (new Date(selectedDate).getDay() + 6) % 7 + 1; // Mon=1..Sun=7
    return tasks.filter((t) => t.active && t.daysOfWeek.includes(weekday));
  }, [tasks, selectedDate]);

  const isComplete = (kidId: number, taskId: number, date: string) =>
    completions.some((c) => c.kidId === kidId && c.taskId === taskId && c.date === date);

  const toggleComplete = (kidId: number, taskId: number, date: string) => {
    setCompletions((prev) => {
      const exists = prev.find((c) => c.kidId === kidId && c.taskId === taskId && c.date === date);
      if (exists) return prev.filter((c) => !(c.kidId === kidId && c.taskId === taskId && c.date === date));
      return [...prev, { kidId, taskId, date, approved: true }];
    });
  };

  const pointsForKidOnDate = (kidId: number, date: string) =>
    completions
      .filter((c) => c.kidId === kidId && c.date === date && c.approved)
      .reduce((sum, c) => {
        const t = tasks.find((t) => t.id === c.taskId);
        return sum + (t?.points ?? 0);
      }, 0);

  const lifetimePoints = (kidId: number) =>
    completions
      .filter((c) => c.kidId === kidId && c.approved)
      .reduce((sum, c) => {
        const t = tasks.find((t) => t.id === c.taskId);
        return sum + (t?.points ?? 0);
      }, 0);

  /** UI sections */
  const TabButton: React.FC<{ id: typeof activeTab; icon: React.ReactNode; label: string }> = ({
    id,
    icon,
    label,
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
        activeTab === id ? "bg-indigo-600 text-white" : "bg-white/70 hover:bg-white"
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      {label}
    </button>
  );

  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-extrabold tracking-tight">Loop</div>
          <div className="text-xs opacity-90">Do it. Earn it. Repeat it.</div>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded bg-white/10 px-2 py-1 text-sm outline-none ring-1 ring-white/30"
        />
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="max-w-6xl mx-auto mt-3 px-4 flex flex-wrap gap-2">
      <TabButton id="board" icon={<Users className="w-4 h-4" />} label="Board" />
      <TabButton id="calendar" icon={<CalendarIcon className="w-4 h-4" />} label="Calendar" />
      <TabButton id="reports" icon={<BarChart3 className="w-4 h-4" />} label="Reports" />
      <TabButton id="manage" icon={<Settings className="w-4 h-4" />} label="Manage" />
      <TabButton id="info" icon={<Info className="w-4 h-4" />} label="Info" />
    </div>
  );

  const renderBoard = () => (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-4">
        {kids.map((kid) => (
          <div key={kid.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{kid.avatar}</div>
                <div className="font-semibold">{kid.name}</div>
              </div>
              <div className="text-sm text-gray-500">
                Today: <span className="font-semibold">{pointsForKidOnDate(kid.id, selectedDate)}</span> pts
              </div>
            </div>

            <div className="space-y-2">
              {tasksForDate.map((task) => {
                const done = isComplete(kid.id, task.id, selectedDate);
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleComplete(kid.id, task.id, selectedDate)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded border text-left transition ${
                      done ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <div className="font-medium">{task.title}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{task.points} pts</span>
                      {done ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-300" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="mb-4 font-semibold">Pick a date to mark chores:</div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded border px-2 py-1"
        />
        <div className="text-sm text-gray-600 mt-3">
          You&apos;re editing: <span className="font-semibold">{selectedDate}</span>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4" />
          <div className="font-semibold">Totals</div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Kid</th>
              <th className="py-2">Lifetime Points</th>
              <th className="py-2">Estimated $</th>
            </tr>
          </thead>
          <tbody>
            {kids.map((kid) => {
              const pts = lifetimePoints(kid.id);
              const cents = kid.centsPerPoint ? pts * kid.centsPerPoint : 0;
              return (
                <tr key={kid.id} className="border-b last:border-b-0">
                  <td className="py-2">{kid.name}</td>
                  <td className="py-2">{pts}</td>
                  <td className="py-2">{kid.centsPerPoint ? `${formatCurrency(cents)}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderManage = () => (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4" />
          <div className="font-semibold">Add Task</div>
        </div>
        <div className="space-y-2">
          <input
            placeholder="Task name"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full rounded border px-2 py-1"
          />
          <input
            type="number"
            min={1}
            placeholder="Points"
            value={newTask.points}
            onChange={(e) => setNewTask({ ...newTask, points: Number(e.target.value || 0) })}
            className="w-full rounded border px-2 py-1"
          />
          <button
            onClick={() => {
              if (!newTask.title.trim()) return;
              setTasks((prev) => [
                ...prev,
                { id: prev.length ? Math.max(...prev.map((t) => t.id)) + 1 : 1, title: newTask.title.trim(), points: newTask.points || 1, daysOfWeek: newTask.daysOfWeek, active: true },
              ]);
              setNewTask({ title: "", points: 1, daysOfWeek: [1,2,3,4,5,6,7] });
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        <div className="mt-4">
          <div className="font-semibold mb-2">Existing Tasks</div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between border rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <div>{t.title}</div>
                </div>
                <div className="text-sm text-gray-500">{t.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" />
          <div className="font-semibold">Add Kid</div>
        </div>
        <div className="space-y-2">
          <input
            placeholder="Name"
            value={newKid.name}
            onChange={(e) => setNewKid({ ...newKid, name: e.target.value })}
            className="w-full rounded border px-2 py-1"
          />
          <input
            placeholder="Avatar (emoji)"
            value={newKid.avatar}
            onChange={(e) => setNewKid({ ...newKid, avatar: e.target.value })}
            className="w-full rounded border px-2 py-1"
          />
          <input
            type="number"
            placeholder="Cents per point (e.g., 5)"
            value={newKid.centsPerPoint ?? 0}
            onChange={(e) => setNewKid({ ...newKid, centsPerPoint: Number(e.target.value || 0) })}
            className="w-full rounded border px-2 py-1"
          />
          <button
            onClick={() => {
              if (!newKid.name.trim()) return;
              setKids((prev) => [
                ...prev,
                {
                  id: prev.length ? Math.max(...prev.map((k) => k.id)) + 1 : 1,
                  name: newKid.name.trim(),
                  avatar: newKid.avatar || "🙂",
                  centsPerPoint: newKid.centsPerPoint ?? null,
                },
              ]);
              setNewKid({ name: "", avatar: "🙂", centsPerPoint: 5 });
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
          >
            <Plus className="w-4 h-4" /> Add Kid
          </button>
        </div>
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow p-6 leading-relaxed">
        <div className="text-xl font-bold mb-2">How Loop works</div>
        <ul className="list-disc ml-6 space-y-1 text-gray-700">
          <li>Pick a date at the top.</li>
          <li>On the Board tab, tap a task to mark it complete for each kid.</li>
          <li>Add more tasks or kids on the Manage tab.</li>
          <li>See totals and estimated payout on the Reports tab.</li>
        </ul>
        <div className="mt-4 flex items-center gap-2 text-gray-600">
          <DollarSign className="w-4 h-4" /> 1 point × cents-per-point = payout estimate.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {renderHeader()}
      {renderTabs()}
      {activeTab === "board" && renderBoard()}
      {activeTab === "calendar" && renderCalendar()}
      {activeTab === "reports" && renderReports()}
      {activeTab === "manage" && renderManage()}
      {activeTab === "info" && renderInfo()}
    </div>
  );
};

export default LoopApp;
