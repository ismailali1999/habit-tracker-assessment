import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "habit-tracker-data";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function getStartOfWeek(date) {
  // Monday start
  const copy = new Date(date);
  const day = copy.getDay(); // Sunday = 0
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function loadSavedData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      habits: [],
      checks: {},
    };
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      habits: parsed.habits || [],
      checks: parsed.checks || {},
    };
  } catch {
    return {
      habits: [],
      checks: {},
    };
  }
}

function App() {
  const savedData = useMemo(() => loadSavedData(), []);

  const [habits, setHabits] = useState(savedData.habits);
  const [checks, setChecks] = useState(savedData.checks);
  const [habitName, setHabitName] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date())
  );

  const todayISO = getTodayISO();

  const weekDays = useMemo(
    () => getWeekDays(currentWeekStart),
    [currentWeekStart]
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        habits,
        checks,
      })
    );
  }, [habits, checks]);

  function addHabit(event) {
    event.preventDefault();

    const trimmedName = habitName.trim();

    if (!trimmedName) return;

    const newHabit = {
      id: crypto.randomUUID(),
      name: trimmedName,
      createdAt: todayISO,
    };

    setHabits((current) => [...current, newHabit]);
    setHabitName("");
  }

  function deleteHabit(habitId) {
    setHabits((current) => current.filter((habit) => habit.id !== habitId));

    setChecks((current) => {
      const copy = { ...current };
      delete copy[habitId];
      return copy;
    });
  }

  function renameHabit(habitId, newName) {
    const trimmedName = newName.trim();

    if (!trimmedName) return;

    setHabits((current) =>
      current.map((habit) =>
        habit.id === habitId ? { ...habit, name: trimmedName } : habit
      )
    );
  }

  function toggleCheck(habitId, dateISO) {
    setChecks((current) => ({
      ...current,
      [habitId]: {
        ...current[habitId],
        [dateISO]: !current[habitId]?.[dateISO],
      },
    }));
  }

  function getStreak(habitId) {
    let streak = 0;
    let cursor = new Date();

    // If today is unchecked, count streak ending yesterday.
    if (!checks[habitId]?.[todayISO]) {
      cursor = addDays(cursor, -1);
    }

    while (checks[habitId]?.[toISODate(cursor)]) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return streak;
  }

  function goToPreviousWeek() {
    setCurrentWeekStart((current) => addDays(current, -7));
  }

  function goToNextWeek() {
    setCurrentWeekStart((current) => addDays(current, 7));
  }

  function goToThisWeek() {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  }

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Weekly Habit Tracker</p>
          <h1>Build better streaks, one day at a time.</h1>
          <p className="subtitle">
            Add your daily habits, check them off during the week, and track
            your current streak.
          </p>
        </div>
      </section>

      <form className="add-form" onSubmit={addHabit}>
        <label htmlFor="habitName">New habit</label>
        <div className="add-row">
          <input
            id="habitName"
            value={habitName}
            onChange={(event) => setHabitName(event.target.value)}
            placeholder="Example: Read 30 min"
          />
          <button type="submit">Add habit</button>
        </div>
      </form>

      <section className="toolbar">
        <button onClick={goToPreviousWeek}>Previous week</button>
        <button onClick={goToThisWeek}>Back to this week</button>
        <button onClick={goToNextWeek}>Next week</button>
      </section>

      {habits.length === 0 ? (
        <section className="empty-state">
          <h2>No habits yet</h2>
          <p>Add your first habit above to start building a weekly streak.</p>
        </section>
      ) : (
        <section className="tracker-card">
          <div className="grid">
            <div className="grid-header habit-column">Habit</div>
            <div className="grid-header streak-column">Streak</div>

            {weekDays.map((day) => {
              const dateISO = toISODate(day);
              const isToday = dateISO === todayISO;

              return (
                <div
                  key={dateISO}
                  className={`grid-header day-header ${
                    isToday ? "today-column" : ""
                  }`}
                >
                  <span>
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <strong>{day.getDate()}</strong>
                </div>
              );
            })}

            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                weekDays={weekDays}
                checks={checks}
                todayISO={todayISO}
                streak={getStreak(habit.id)}
                onToggle={toggleCheck}
                onRename={renameHabit}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function HabitRow({
  habit,
  weekDays,
  checks,
  todayISO,
  streak,
  onToggle,
  onRename,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);

  function saveRename() {
    const trimmedName = draftName.trim();

    if (!trimmedName) {
      setDraftName(habit.name);
      setIsEditing(false);
      return;
    }

    onRename(habit.id, trimmedName);
    setIsEditing(false);
  }

  return (
    <>
      <div className="habit-cell">
        {isEditing ? (
          <input
            className="rename-input"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={saveRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveRename();

              if (event.key === "Escape") {
                setDraftName(habit.name);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <>
            <button
              className="habit-name"
              onClick={() => setIsEditing(true)}
              aria-label={`Rename ${habit.name}`}
            >
              {habit.name}
            </button>
            <button
              className="delete-button"
              onClick={() => onDelete(habit.id)}
              aria-label={`Delete ${habit.name}`}
            >
              Delete
            </button>
          </>
        )}
      </div>

      <div className="streak-cell">
        <strong>{streak}</strong>
        <span>days</span>
      </div>

      {weekDays.map((day) => {
        const dateISO = toISODate(day);
        const checked = Boolean(checks[habit.id]?.[dateISO]);
        const isToday = dateISO === todayISO;

        return (
          <button
            key={dateISO}
            className={`check-cell ${checked ? "checked" : ""} ${
              isToday ? "today-column" : ""
            }`}
            onClick={() => onToggle(habit.id, dateISO)}
            aria-label={`${checked ? "Unmark" : "Mark"} ${
              habit.name
            } for ${day.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}`}
          >
            {checked ? "✓" : ""}
          </button>
        );
      })}
    </>
  );
}

export default App;