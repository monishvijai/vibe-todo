/*
 * Vibe To-Do - GNOME Shell Extension
 * Copyright (C) 2024 Monish
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let tasks = [];
let taskFile = '';
let vibeButton = null;
let checkInterval = null;

function loadTasks() {
    try {
        if (GLib.file_test(taskFile, GLib.FileTest.EXISTS)) {
            let [success, contents] = GLib.file_get_contents(taskFile);
            if (success) {
                let loadedTasks = JSON.parse(new TextDecoder().decode(contents));
                tasks = loadedTasks.map(task => {
                    if (typeof task === 'string') {
                        return { text: task, completed: false, deadline: null };
                    }
                    return task;
                });
            }
        }
    } catch (e) {
        tasks = [];
    }
}

function saveTasks() {
    GLib.file_set_contents(taskFile, JSON.stringify(tasks));
}

function checkDeadlines() {
    let now = new Date();
    
    tasks.forEach((task, index) => {
        if (task.deadline && !task.completed && !task.notified) {
            let deadline = new Date(task.deadline);
            
            // Check if deadline has passed
            if (now >= deadline) {
                Main.notify('⚠️ Task Deadline!', `"${task.text}" is now due!`);
                tasks[index].notified = true;
                saveTasks();
            }
            // Remind 10 minutes before
            else if (deadline - now <= 600000 && deadline - now > 0 && !task.reminded) {
                Main.notify('⏰ Task Reminder', `"${task.text}" is due in 10 minutes!`);
                tasks[index].reminded = true;
                saveTasks();
            }
        }
    });
    
    refreshList();
}

function getTimeRemaining(deadline) {
    let now = new Date();
    let target = new Date(deadline);
    let diff = target - now;

    if (diff < 0) return '⚠️ OVERDUE';
    
    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
        let days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function formatDateTime(date) {
    let d = new Date(date);
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let month = months[d.getMonth()];
    let day = d.getDate();
    let hours = String(d.getHours()).padStart(2, '0');
    let minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${hours}:${minutes}`;
}

export default class Extension {
    enable() {
        taskFile = GLib.get_home_dir() + '/.vibe_tasks.json';
        loadTasks();

        vibeButton = new PanelMenu.Button(0.0, 'Vibe To-Do', false);

        let icon = new St.Icon({ 
            icon_name: 'view-list-symbolic', 
            style_class: 'system-status-icon' 
        });
        vibeButton.add_child(icon);

        // Task input section
        let inputBox = new St.BoxLayout({ 
            vertical: true, 
            style_class: 'input-box'
        });

        let taskEntry = new St.Entry({ 
            hint_text: 'Task name...', 
            style_class: 'task-entry',
            can_focus: true
        });
        inputBox.add_child(taskEntry);

        // Quick time buttons section
        let quickTimeLabel = new St.Label({
            text: 'Quick Deadlines:',
            style_class: 'quick-time-label'
        });
        inputBox.add_child(quickTimeLabel);

        let quickTimeBox = new St.BoxLayout({ 
            style_class: 'quick-time-box'
        });

        // Quick time buttons
        let btn1h = new St.Button({ label: '+1h', style_class: 'quick-btn' });
        let btn3h = new St.Button({ label: '+3h', style_class: 'quick-btn' });
        let btn1d = new St.Button({ label: '+1d', style_class: 'quick-btn' });
        let btn1w = new St.Button({ label: '+1w', style_class: 'quick-btn' });

        quickTimeBox.add_child(btn1h);
        quickTimeBox.add_child(btn3h);
        quickTimeBox.add_child(btn1d);
        quickTimeBox.add_child(btn1w);
        inputBox.add_child(quickTimeBox);

        // Manual deadline input
        let manualLabel = new St.Label({
            text: 'Or set custom:',
            style_class: 'manual-label'
        });
        inputBox.add_child(manualLabel);

        let deadlineBox = new St.BoxLayout({ 
            style_class: 'deadline-box'
        });

        let dateEntry = new St.Entry({ 
            hint_text: 'YYYY-MM-DD', 
            style_class: 'date-entry',
            can_focus: true
        });
        
        let timeEntry = new St.Entry({ 
            hint_text: 'HH:MM', 
            style_class: 'time-entry',
            can_focus: true
        });

        let nowBtn = new St.Button({ label: 'Now', style_class: 'now-btn' });
        
        deadlineBox.add_child(dateEntry);
        deadlineBox.add_child(timeEntry);
        deadlineBox.add_child(nowBtn);
        inputBox.add_child(deadlineBox);

        vibeButton.menu.box.add_child(inputBox);

        // Fill current date/time when "Now" is clicked
        nowBtn.connect('clicked', () => {
            let now = new Date();
            let year = now.getFullYear();
            let month = String(now.getMonth() + 1).padStart(2, '0');
            let day = String(now.getDate()).padStart(2, '0');
            let hours = String(now.getHours()).padStart(2, '0');
            let minutes = String(now.getMinutes()).padStart(2, '0');
            
            dateEntry.set_text(`${year}-${month}-${day}`);
            timeEntry.set_text(`${hours}:${minutes}`);
        });

        // Quick time button handlers
        let addQuickTask = (hoursToAdd) => {
            let text = taskEntry.get_text().trim();
            if (text.length > 0) {
                let deadline = new Date();
                deadline.setHours(deadline.getHours() + hoursToAdd);
                
                tasks.push({
                    text: text,
                    completed: false,
                    deadline: deadline.toISOString(),
                    notified: false,
                    reminded: false
                });
                
                saveTasks();
                taskEntry.set_text('');
                refreshList();
                Main.notify('Task Added', `"${text}" - Due in ${hoursToAdd}h`);
            }
        };

        btn1h.connect('clicked', () => addQuickTask(1));
        btn3h.connect('clicked', () => addQuickTask(3));
        btn1d.connect('clicked', () => addQuickTask(24));
        btn1w.connect('clicked', () => addQuickTask(168));

        // Add button for manual entry
        let addButton = new PopupMenu.PopupMenuItem('➕ Add Task (Custom Time)');
        addButton.connect('activate', () => {
            let text = taskEntry.get_text().trim();
            if (text.length > 0) {
                let dateText = dateEntry.get_text().trim();
                let timeText = timeEntry.get_text().trim();
                
                let task = {
                    text: text,
                    completed: false,
                    deadline: null,
                    notified: false,
                    reminded: false
                };

                if (dateText && timeText) {
                    let [year, month, day] = dateText.split('-');
                    let [hours, minutes] = timeText.split(':');
                    
                    if (year && month && day && hours && minutes) {
                        task.deadline = new Date(year, month - 1, day, hours, minutes).toISOString();
                    }
                }

                tasks.push(task);
                saveTasks();
                taskEntry.set_text('');
                dateEntry.set_text('');
                timeEntry.set_text('');
                refreshList();
            }
        });

        vibeButton.menu.addMenuItem(addButton);
        vibeButton.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        refreshList();

        Main.panel.addToStatusArea('vibe-todo', vibeButton);

        // Check every minute for deadlines
        checkInterval = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
            checkDeadlines();
            return true;
        });
    }

    disable() {
        if (checkInterval) {
            GLib.source_remove(checkInterval);
            checkInterval = null;
        }
        if (vibeButton) {
            vibeButton.destroy();
            vibeButton = null;
        }
        tasks = [];
    }
}

function refreshList() {
    vibeButton.menu._getMenuItems().forEach((item, index) => {
        if (index > 2) item.destroy();
    });

    if (tasks.length === 0) {
        let emptyItem = new PopupMenu.PopupMenuItem('No tasks yet! ✨', { 
            reactive: false 
        });
        vibeButton.menu.addMenuItem(emptyItem);
        return;
    }

    // Sort by deadline (soonest first)
    let sortedTasks = tasks.map((task, index) => ({ task, index }))
        .sort((a, b) => {
            if (!a.task.deadline) return 1;
            if (!b.task.deadline) return -1;
            return new Date(a.task.deadline) - new Date(b.task.deadline);
        });

    sortedTasks.forEach(({ task, index }) => {
        let taskBox = new St.BoxLayout({ 
            vertical: true,
            style_class: 'task-item-box'
        });

        // Main task row
        let mainRow = new St.BoxLayout({ 
            style_class: 'task-main-row'
        });

        let checkbox = new St.Button({ 
            label: task.completed ? '✓' : '○',
            style_class: task.completed ? 'checkbox-checked' : 'checkbox'
        });

        checkbox.connect('clicked', () => {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            refreshList();
        });

        let taskLabel = new St.Label({ 
            text: task.text || 'Untitled Task',
            style_class: task.completed ? 'task-text-completed' : 'task-text'
        });

        let removeBtn = new St.Button({ 
            label: '✖', 
            style_class: 'remove-btn' 
        });

        removeBtn.connect('clicked', () => {
            tasks.splice(index, 1);
            saveTasks();
            refreshList();
        });

        mainRow.add_child(checkbox);
        mainRow.add_child(taskLabel);
        mainRow.add_child(removeBtn);

        taskBox.add_child(mainRow);

        // Deadline row
        if (task.deadline) {
            let deadlineRow = new St.BoxLayout({ 
                style_class: 'deadline-row'
            });

            let timeRemaining = getTimeRemaining(task.deadline);
            let isOverdue = timeRemaining.includes('OVERDUE');
            
            let deadlineLabel = new St.Label({ 
                text: `⏰ ${formatDateTime(task.deadline)} (${timeRemaining})`,
                style_class: isOverdue ? 'deadline-overdue' : 'deadline-text'
            });

            deadlineRow.add_child(deadlineLabel);
            taskBox.add_child(deadlineRow);
        }

        let menuItem = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        menuItem.actor.add_child(taskBox);
        vibeButton.menu.addMenuItem(menuItem);
    });
}
