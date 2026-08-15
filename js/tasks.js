/**
 * Tasks Management Engine
 */

const TaskManager = (() => {
  let tasks = [];
  let currentFilter = 'all'; // 'all' | 'today' | 'pending' | 'completed'

  const INITIAL_TASKS = [
    {
      id: 't_demo_1',
      title: 'Chào mừng cậu đến với chiếc To-Do List của riêng mình! 🌸',
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 't_demo_2',
      title: 'Thử tick vào ô vuông bên trái để xem bạn đồng hành chúc mừng nhé 🎉',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: Date.now()
    },
    {
      id: 't_demo_3',
      title: 'Bấm vào nút "Đổi Nền" hoặc "Nhân Vật" ở trên để tùy biến theo ý thích ✨',
      priority: 'low',
      dueDate: '',
      completed: false,
      createdAt: Date.now()
    }
  ];

  function init() {
    tasks = Storage.get('app_tasks_list', INITIAL_TASKS);
    render();
    updateProgress();
  }

  function save() {
    Storage.set('app_tasks_list', tasks);
    updateProgress();
    render();
  }

  function addTask(title, priority = 'medium', dueDate = '') {
    if (!title || !title.trim()) return;

    const newTask = {
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    SoundEngine.playPopSound();
    save();
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
      // Trigger Companion Mascot celebration!
      CompanionManager.celebrate();
    }

    save();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
  }

  function setFilter(filter) {
    currentFilter = filter;
    render();
  }

  function getFilteredTasks() {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
      if (currentFilter === 'today') {
        return task.dueDate === todayStr;
      }
      if (currentFilter === 'pending') {
        return !task.completed;
      }
      if (currentFilter === 'completed') {
        return task.completed;
      }
      return true; // 'all'
    });
  }

  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const fillElem = document.getElementById('progress-fill');
    const textElem = document.getElementById('progress-stats-text');

    if (fillElem) {
      fillElem.style.width = `${percent}%`;
    }
    if (textElem) {
      textElem.textContent = `${completed}/${total} hoàn thành (${percent}%)`;
    }

    // Update filter counts
    const todayStr = new Date().toISOString().split('T')[0];
    const countAll = total;
    const countToday = tasks.filter(t => t.dueDate === todayStr).length;
    const countPending = tasks.filter(t => !t.completed).length;
    const countCompleted = completed;

    updateCountBadge('count-all', countAll);
    updateCountBadge('count-today', countToday);
    updateCountBadge('count-pending', countPending);
    updateCountBadge('count-completed', countCompleted);
  }

  function updateCountBadge(id, count) {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  }

  function render() {
    const container = document.getElementById('task-list-container');
    if (!container) return;

    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🍃</div>
          <h3>Không có công việc nào ở đây</h3>
          <p>Hãy thêm một việc mới để bắt đầu một ngày thật năng suất nhé!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(task => {
      const isDone = task.completed;
      const prioLabel = task.priority === 'high' ? '🔥 Gấp' : task.priority === 'medium' ? '⭐ Thường' : '🌿 Thư thả';
      const formattedDate = task.dueDate ? formatDueDate(task.dueDate) : '';

      return `
        <div class="task-item ${isDone ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-left">
            <div class="custom-checkbox" data-action="toggle" title="Đánh dấu hoàn thành">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="task-content">
              <div class="task-title">${escapeHtml(task.title)}</div>
              <div class="task-sub-info">
                <span class="badge-prio ${task.priority}">${prioLabel}</span>
                ${formattedDate ? `<span class="task-due-date">📅 ${formattedDate}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-action-icon" data-action="delete" title="Xóa công việc">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners to task cards
    container.querySelectorAll('.task-item').forEach(item => {
      const id = item.dataset.id;
      
      const chk = item.querySelector('[data-action="toggle"]');
      if (chk) {
        chk.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTask(id);
        });
      }

      const delBtn = item.querySelector('[data-action="delete"]');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(id);
        });
      }
    });

    // Update filter active button states
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });
  }

  function formatDueDate(dateStr) {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    init,
    addTask,
    toggleTask,
    deleteTask,
    setFilter
  };
})();
