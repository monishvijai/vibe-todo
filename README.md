# 🎯 Vibe To-Do

A sleek, minimalist to-do list extension for GNOME Shell that lives in your system tray. Stay on top of your tasks with deadline tracking, overdue notifications, and a beautiful interface that vibes with your workflow.



## ✨ Features

- **Quick Access**: Click the list icon in your top panel to instantly view and manage tasks
- **Deadline Tracking**: Set specific dates and times for your tasks
- **Smart Notifications**: Get alerted when tasks become overdue
- **Time Remaining Display**: See at a glance how much time you have left
- **Clean Interface**: Minimalist design that doesn't get in your way
- **Persistent Storage**: Your tasks are saved automatically and survive system restarts
- **Checkbox Completion**: Mark tasks as done with a single click

## 🚀 Installation

### Method 1: Manual Installation

1. Clone or download this repository
2. Copy the extension files to your GNOME extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/vibe-todo@monish
   cp -r * ~/.local/share/gnome-shell/extensions/vibe-todo@monish/
   ```
3. Restart GNOME Shell:
   - On X11: Press `Alt + F2`, type `r`, and press Enter
   - On Wayland: Log out and log back in
4. Enable the extension:
   ```bash
   gnome-extensions enable vibe-todo@monish
   ```

### Method 2: Using Extensions App

1. Download the extension files
2. Open the Extensions app (GNOME Extensions)
3. Click "Install from File" and select the extension directory
4. Enable "Vibe To-Do"

## 📖 Usage

### Adding a Task

1. Click the list icon in your top panel
2. Enter your task name in the text field
3. (Optional) Set a deadline:
   - Enter date in `MM/DD` format
   - Enter time in `HH:MM` format (24-hour)
4. Click "➕ Add Task"

### Managing Tasks

- **Complete a task**: Click the circle (○) next to the task. It will change to a checkmark (✓)
- **Delete a task**: Click the ✖ button on the right side
- **View deadline info**: Tasks with deadlines show the date, time, and countdown

### Deadline Colors

- **Blue** (🔵): Task deadline is upcoming
- **Red** (🔴): Task is overdue with ⚠️ OVERDUE warning

### Notifications

The extension checks for overdue tasks every 5 minutes and sends you a notification showing:
- Number of overdue tasks
- Names of up to 3 overdue tasks

## 🎨 Customization

Tasks are stored in `~/.vibe_tasks.json`. The extension uses your system theme with custom styling defined in `stylesheet.css`. You can modify the colors and spacing to match your preferences.

## 🔧 Technical Details

- **Compatible with**: GNOME Shell 45, 46, 47, 48, 49
- **Data storage**: JSON file in home directory
- **Update interval**: 5 minutes for overdue checks
- **UI Framework**: St (Shell Toolkit), Clutter

## 🐛 Troubleshooting

**Extension not showing up?**
- Make sure the UUID in `metadata.json` matches the folder name
- Check extension is enabled: `gnome-extensions list`
- Look for errors: `journalctl -f -o cat /usr/bin/gnome-shell`

**Tasks not saving?**
- Verify write permissions in your home directory
- Check `~/.vibe_tasks.json` exists and is readable

**Time zones incorrect?**
- The extension uses your system's local time

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🙏 Acknowledgments

Built for the GNOME community with a focus on simplicity and functionality.

---

**Made with ❤️ for productivity enthusiasts**