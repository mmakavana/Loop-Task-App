import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Settings, Info, Plus, Check, X, Star, DollarSign } from 'lucide-react';

const LoopApp = () => {
  const [activeTab, setActiveTab] = useState('board');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isManageLocked, setIsManageLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // App state
  const [kids, setKids] = useState([
    { id: 1, name: 'Emma', avatar: '👧', centsPerPoint: null },
    { id: 2, name: 'Liam', avatar: '👦', centsPerPoint: null }
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, name: 'Make bed', defaultPoints: 2, frequency: 'daily', daysOfWeek: [1,2,3,4,5,6,7], assignedKidIds: [1,2] },
    { id: 2, name: 'Brush teeth', defaultPoints: 1, frequency: 'daily', daysOfWeek: [1,2,3,4,5,6,7], assignedKidIds: [1,2] },
    { id: 3, name: 'Clean room', defaultPoints: 5, frequency: 'weekly', daysOfWeek: [6], assignedKidIds: [1] },
    { id: 4, name: 'Feed pet', defaultPoints: 3, frequency: 'daily', daysOfWeek: [1,2,3,4,5,6,7], assignedKidIds: [2] }
  ]);

  const [completions, setCompletions] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [settings, setSettings] = useState({ moneyPerPoint: 25 }); // 25 cents per point

  // Kid avatars
  const kidAvatars = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩', '🙎‍♂️', '🙎‍♀️', '👱‍♂️', '👱‍♀️', '🦱'];

  // Form states
  const [newKid, setNewKid] = useState({ name: '', avatar: '👧' });
  const [newTask, setNewTask] = useState({
    name: '', 
    defaultPoints: 1, 
    frequency: 'daily', 
    daysOfWeek: [1,2,3,4,5,6,7], 
    assignedKidIds: []
  });
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({ kidId: null, delta: 0 });

  const PIN = '1234';

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper functions
  const isTaskDueOnDate = (task, date) => {
    const dayOfWeek = new Date(date).getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
    
    if (task.frequency === 'daily') {
      return task.daysOfWeek.includes(adjustedDay);
    } else if (task.frequency === 'weekly') {
      return task.daysOfWeek.includes(adjustedDay);
    }
    return false;
  };

  const isTaskCompleted = (taskId, kidId, date) => {
    return completions.some(c => 
      c.taskId === taskId && c.kidId === kidId && c.dateISO === date
    );
  };

  const toggleTaskCompletion = (taskId, kidId, date) => {
    const isCompleted = isTaskCompleted(taskId, kidId, date);
    
    if (isCompleted) {
      setCompletions(prev => 
        prev.filter(c => !(c.taskId === taskId && c.kidId === kidId && c.dateISO === date))
      );
    } else {
      setCompletions(prev => [...prev, { taskId, kidId, dateISO: date }]);
    }
  };

  const getTasksForKidOnDate = (kidId, date) => {
    return tasks.filter(task => 
      task.assignedKidIds.includes(kidId) && isTaskDueOnDate(task, date)
    );
  };

  const getPointsForKidOnDate = (kidId, date) => {
    const kidTasks = getTasksForKidOnDate(kidId, date);
    const completedPoints = kidTasks.reduce((total, task) => {
      if (isTaskCompleted(task.id, kidId, date)) {
        return total + task.defaultPoints;
      }
      return total;
    }, 0);

    const dayAdjustments = adjustments
      .filter(adj => adj.kidId === kidId && adj.createdISO.startsWith(date))
      .reduce((total, adj) => total + adj.deltaPoints, 0);

    const dayBonuses = bonuses
      .filter(bonus => bonus.kidId === kidId && bonus.dateISO === date)
      .reduce((total, bonus) => total + bonus.points, 0);

    return completedPoints + dayAdjustments + dayBonuses;
  };

  const areAllTasksCompletedForKidOnDate = (kidId, date) => {
    const kidTasks = getTasksForKidOnDate(kidId, date);
    return kidTasks.length > 0 && kidTasks.every(task => isTaskCompleted(task.id, kidId, date));
  };

  const addKid = () => {
    if (newKid.name.trim()) {
      const id = Math.max(...kids.map(k => k.id), 0) + 1;
      setKids(prev => [...prev, { ...newKid, id, centsPerPoint: null }]);
      setNewKid({ name: '', avatar: '👧' });
    }
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      const id = Math.max(...tasks.map(t => t.id), 0) + 1;
      setTasks(prev => [...prev, { ...newTask, id }]);
      setNewTask({
        name: '', 
        defaultPoints: 1, 
        frequency: 'daily', 
        daysOfWeek: [1,2,3,4,5,6,7], 
        assignedKidIds: []
      });
    }
  };

  const handleAdjustment = (kidId, delta) => {
    setAdjustmentData({ kidId, delta });
    setShowAdjustmentModal(true);
  };

  const submitAdjustment = () => {
    if (adjustmentReason.trim()) {
      const adjustment = {
        kidId: adjustmentData.kidId,
        deltaPoints: adjustmentData.delta,
        reason: adjustmentReason,
        createdISO: new Date().toISOString()
      };
      setAdjustments(prev => [...prev, adjustment]);
      setAdjustmentReason('');
      setShowAdjustmentModal(false);
      setAdjustmentData({ kidId: null, delta: 0 });
    }
  };

  const handlePayout = (kidId) => {
    // Calculate net points for this kid
    const netPoints = calculateNetPoints(kidId);
    if (netPoints > 0) {
      const payout = {
        kidId,
        createdISO: new Date().toISOString(),
        points: netPoints,
        dollarsAtTime: (netPoints * settings.moneyPerPoint) / 100,
        rateCentsAtTime: settings.moneyPerPoint
      };
      setPayouts(prev => [...prev, payout]);
    }
  };

  const calculateNetPoints = (kidId) => {
    const taskPoints = completions
      .filter(c => c.kidId === kidId)
      .reduce((total, completion) => {
        const task = tasks.find(t => t.id === completion.taskId);
        return total + (task ? task.defaultPoints : 0);
      }, 0);

    const adjustmentPoints = adjustments
      .filter(adj => adj.kidId === kidId)
      .reduce((total, adj) => total + adj.deltaPoints, 0);

    const bonusPoints = bonuses
      .filter(bonus => bonus.kidId === kidId)
      .reduce((total, bonus) => total + bonus.points, 0);

    const paidPoints = payouts
      .filter(payout => payout.kidId === kidId)
      .reduce((total, payout) => total + payout.points, 0);

    return taskPoints + adjustmentPoints + bonusPoints - paidPoints;
  };

  const unlockManage = () => {
    if (pinInput === PIN) {
      setIsManageLocked(false);
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert('Incorrect PIN');
      setPinInput('');
    }
  };

  const renderLogo = () => (
    <div className="text-center">
      <div className="text-3xl font-bold text-white mb-1" style={{fontFamily: 'Candara, sans-serif'}}>
        L<span className="inline-block transform rotate-90">∞</span><span className="inline-block transform rotate-90">∞</span>p
      </div>
      <div className="text-sm text-white opacity-90" style={{fontFamily: 'Candara, sans-serif'}}>
        Do it. Earn it. Repeat it.
      </div>
    </div>
  );

  const renderBoard = () => (
    <div className="p-4" style={{fontFamily: 'Candara, sans-serif'}}>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium mb-1">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
            style={{fontFamily: 'Candara, sans-serif'}}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hideCompleted"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="hideCompleted" className="text-sm">Hide completed</label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kids.map(kid => {
          const kidTasks = getTasksForKidOnDate(kid.id, selectedDate);
          const visibleTasks = hideCompleted ? 
            kidTasks.filter(task => !isTaskCompleted(task.id, kid.id, selectedDate)) : 
            kidTasks;

          return (
            <div key={kid.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <span className="text-2xl">{kid.avatar}</span>
                <h3 className="font-semibold text-lg">{kid.name}</h3>
              </div>
              
              <div className="space-y-2">
                {visibleTasks.map(task => {
                  const isCompleted = isTaskCompleted(task.id, kid.id, selectedDate);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task.id, kid.id, selectedDate)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isCompleted 
                          ? 'bg-green-100 text-white' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: isCompleted ? '#9CAF88' : '#f9fafb',
                        color: isCompleted ? 'white' : 'black'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isCompleted ? 'border-white bg-white' : 'border-gray-300'
                        }`}>
                          {isCompleted && <Check size={12} className="text-green-600" />}
                        </div>
                        <span className="font-medium">{task.name}</span>
                      </div>
                      <span className={`text-sm ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                        +{task.defaultPoints}
                      </span>
                    </div>
                  );
                })}
                {visibleTasks.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tasks for today</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return (
      <div className="p-4" style={{fontFamily: 'Candara, sans-serif'}}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={dateStr}
                className={`min-h-20 p-2 border rounded ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1 text-xs">
                  {kids.map(kid => {
                    const points = getPointsForKidOnDate(kid.id, dateStr);
                    const allCompleted = areAllTasksCompletedForKidOnDate(kid.id, dateStr);
                    
                    if (points > 0) {
                      return (
                        <div key={kid.id} className="flex items-center gap-1">
                          <span>{kid.name}: {points}</span>
                          {allCompleted && <Star size={10} className="text-yellow-500 fill-current" />}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderManage = () => {
    if (isManageLocked) {
      return (
        <div className="p-8 text-center" style={{fontFamily: 'Candara, sans-serif'}}>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Manage Settings</h2>
            <p className="text-gray-600 mb-6">This section is locked for parents only.</p>
            <button
              onClick={() => setShowPinModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              style={{fontFamily: 'Candara, sans-serif'}}
            >
              Enter Parent PIN
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 max-w-4xl mx-auto" style={{fontFamily: 'Candara, sans-serif'}}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage</h2>
          <button
            onClick={() => setIsManageLocked(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Lock Settings
          </button>
        </div>

        {/* Kids Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Kids</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Kid name"
              value={newKid.name}
              onChange={(e) => setNewKid(prev => ({...prev, name: e.target.value}))}
              className="px-3 py-2 border rounded-lg"
              style={{fontFamily: 'Candara, sans-serif'}}
            />
            <div className="flex items-center gap-2">
              <select
                value={newKid.avatar}
                onChange={(e) => setNewKid(prev => ({...prev, avatar: e.target.value}))}
                className="px-3 py-2 border rounded-lg flex-1"
                style={{fontFamily: 'Candara, sans-serif'}}
              >
                {kidAvatars.map(avatar => (
                  <option key={avatar} value={avatar}>{avatar}</option>
                ))}
              </select>
              <button
                onClick={addKid}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kids.map(kid => (
              <div key={kid.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{kid.avatar}</span>
                <span className="font-medium">{kid.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Tasks</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Task name"
                value={newTask.name}
                onChange={(e) => setNewTask(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border rounded-lg mb-3"
                style={{fontFamily: 'Candara, sans-serif'}}
              />
              <input
                type="number"
                placeholder="Points"
                min="1"
                value={newTask.defaultPoints}
                onChange={(e) => setNewTask(prev => ({...prev, defaultPoints: parseInt(e.target.value) || 1}))}
                className="w-full px-3 py-2 border rounded-lg"
                style={{fontFamily: 'Candara, sans-serif'}}
              />
            </div>
            
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Days of Week:</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => {
                        const dayNum = idx + 1;
                        setNewTask(prev => ({
                          ...prev,
                          daysOfWeek: prev.daysOfWeek.includes(dayNum)
                            ? prev.daysOfWeek.filter(d => d !== dayNum)
                            : [...prev.daysOfWeek, dayNum]
                        }));
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        newTask.daysOfWeek.includes(idx + 1)
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: newTask.daysOfWeek.includes(idx + 1) ? '#9CAF88' : '',
                        fontFamily: 'Candara, sans-serif'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Assign to:</label>
                <div className="flex flex-wrap gap-2">
                  {kids.map(kid => (
                    <button
                      key={kid.id}
                      onClick={() => {
                        setNewTask(prev => ({
                          ...prev,
                          assignedKidIds: prev.assignedKidIds.includes(kid.id)
                            ? prev.assignedKidIds.filter(id => id !== kid.id)
                            : [...prev.assignedKidIds, kid.id]
                        }));
                      }}
                      className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
                        newTask.assignedKidIds.includes(kid.id)
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: newTask.assignedKidIds.includes(kid.id) ? '#9CAF88' : '',
                        fontFamily: 'Candara, sans-serif'
                      }}
                    >
                      <span>{kid.avatar}</span>
                      <span>{kid.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={addTask}
            disabled={!newTask.name.trim() || newTask.assignedKidIds.length === 0 || newTask.daysOfWeek.length === 0}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            style={{fontFamily: 'Candara, sans-serif'}}
          >
            Add Task
          </button>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Current Tasks:</h4>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{task.name}</span>
                      <span className="text-gray-600 ml-2">({task.defaultPoints} pts)</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {task.daysOfWeek.map(d => dayNames[d-1]).join(', ')}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {task.assignedKidIds.map(kidId => {
                      const kid = kids.find(k => k.id === kidId);
                      return kid ? (
                        <span key={kidId} className="text-xs bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
                          {kid.avatar} {kid.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Point Adjustments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Point Adjustments</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kids.map(kid => (
              <div key={kid.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{kid.avatar}</span>
                  <span className="font-medium">{kid.name}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[1, 5, 10, 20].map(points => (
                    <button
                      key={points}
                      onClick={() => handleAdjustment(kid.id, points)}
                      className="bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
                      style={{fontFamily: 'Candara, sans-serif'}}
                    >
                      +{points}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 20].map(points => (
                    <button
                      key={points}
                      onClick={() => handleAdjustment(kid.id, -points)}
                      className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                      style={{fontFamily: 'Candara, sans-serif'}}
                    >
                      -{points}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Settings</h3>
          
          <div className="max-w-sm">
            <label className="block text-sm font-medium mb-2">Money per point (cents):</label>
            <input
              type="number"
              min="1"
              value={settings.moneyPerPoint}
              onChange={(e) => setSettings(prev => ({...prev, moneyPerPoint: parseInt(e.target.value) || 25}))}
              className="px-3 py-2 border rounded-lg w-full"
              style={{fontFamily: 'Candara, sans-serif'}}
            />
            <p className="text-xs text-gray-500 mt-1">
              Currently: {settings.moneyPerPoint}¢ = ${(settings.moneyPerPoint / 100).toFixed(2)} per point
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="p-4 max-w-6xl mx-auto" style={{fontFamily: 'Candara, sans-serif'}}>
      <h2 className="text-2xl font-bold mb-6">Reports</h2>
      
      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Points Summary</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b" style={{fontFamily: 'Candara, sans-serif'}}>
                <th className="text-left py-3 px-4">Kid</th>
                <th className="text-right py-3 px-4">Task Points</th>
                <th className="text-right py-3 px-4">Adjustments</th>
                <th className="text-right py-3 px-4">Streak Bonuses</th>
                <th className="text-right py-3 px-4">Net Points</th>
                <th className="text-right py-3 px-4">Earnings</th>
                <th className="text-center py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {kids.map(kid => {
                const netPoints = calculateNetPoints(kid.id);
                const taskPoints = completions
                  .filter(c => c.kidId === kid.id)
                  .reduce((total, completion) => {
                    const task = tasks.find(t => t.id === completion

export default LoopApp;
