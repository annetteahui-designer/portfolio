(function () {
    // Sticky notes dev tool. Two kinds of note:
    //   yellow ("claude")   — feedback to hand to Claude: "Copy Claude Notes" puts every one of
    //                         them on the clipboard, grouped by page.
    //   green  ("reminder") — reminders for the site owner. They are never copied; they gather
    //                         in the Reminders panel (all pages, grouped by page) where each can
    //                         be ticked off, deleted, or jumped to. Open ones are counted in a
    //                         badge on the N toggle even while the tool is off.
    // Notes without a type (saved before there were two) count as yellow.
    var STORAGE_KEY = 'portfolio-sticky-notes';
    var TYPE_KEY = 'portfolio-sticky-notes-type';
    var JUMP_KEY = 'portfolio-sticky-notes-jump';

    var CLAUDE = 'claude';
    var REMINDER = 'reminder';

    var IGNORE_SELECTOR = [
        '.dev-toggles',
        '.notes-toolbar',
        '.reminders-panel',
        '.sticky-note',
        '#grid-overlay',
        '#tokens-panel',
        '.cursor-dot',
        '.measure-highlight',
        '.measure-label',
        '.measure-distance-line',
        '.measure-distance-label',
        '.reveal-filenames-overlay'
    ].join(', ');

    function loadNotes() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveNotes(notes) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    // a note with nothing in it (or only spaces) is clutter — they are removed automatically
    function isBlank(note) {
        return !note.text || !note.text.trim();
    }

    function typeOf(note) {
        return note.type === REMINDER ? REMINDER : CLAUDE;
    }

    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('notes-toggle');

        if (!toggle) {
            return;
        }

        var active = false;
        var notes = loadNotes();

        // sweep out blank notes left over from earlier (a note is only ever blank while it is
        // being written — see the blur handler below)
        var storedCount = notes.length;
        notes = notes.filter(function (n) {
            return !isBlank(n);
        });

        if (notes.length !== storedCount) {
            saveNotes(notes);
        }

        var page = location.pathname.split('/').pop() || 'index.html';
        var currentType = localStorage.getItem(TYPE_KEY) === REMINDER ? REMINDER : CLAUDE;
        var noteEls = {}; // id -> { el, textarea }

        // ---- toolbar ---------------------------------------------------------------------
        var toolbar = document.createElement('div');
        toolbar.className = 'notes-toolbar';
        toolbar.innerHTML =
            '<span class="notes-toolbar__types" role="group" aria-label="Note type">' +
                '<button type="button" class="notes-toolbar__type notes-toolbar__type--claude" data-type="claude" aria-pressed="false">' +
                    '<span class="notes-toolbar__swatch"></span>For Claude</button>' +
                '<button type="button" class="notes-toolbar__type notes-toolbar__type--reminder" data-type="reminder" aria-pressed="false">' +
                    '<span class="notes-toolbar__swatch"></span>Reminder</button>' +
            '</span>' +
            '<span class="notes-toolbar__count"></span>' +
            '<button type="button" class="notes-toolbar__button notes-toolbar__button--copy">Copy Claude Notes</button>' +
            '<button type="button" class="notes-toolbar__button notes-toolbar__button--clear">Clear Claude Notes</button>' +
            '<button type="button" class="notes-toolbar__button notes-toolbar__button--reminders">Reminders <span class="notes-toolbar__reminder-count"></span></button>';
        document.body.appendChild(toolbar);

        var countEl = toolbar.querySelector('.notes-toolbar__count');
        var copyBtn = toolbar.querySelector('.notes-toolbar__button--copy');
        var clearBtn = toolbar.querySelector('.notes-toolbar__button--clear');
        var remindersBtn = toolbar.querySelector('.notes-toolbar__button--reminders');
        var remindersCountEl = toolbar.querySelector('.notes-toolbar__reminder-count');
        var typeButtons = Array.prototype.slice.call(toolbar.querySelectorAll('.notes-toolbar__type'));

        // ---- badge on the N toggle -------------------------------------------------------
        var badge = document.createElement('span');
        badge.className = 'dev-toggle__badge';
        badge.hidden = true;
        badge.setAttribute('aria-hidden', 'true');
        toggle.appendChild(badge);

        // ---- reminders panel -------------------------------------------------------------
        var panel = document.createElement('div');
        panel.className = 'reminders-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Reminders');
        panel.innerHTML =
            '<div class="reminders-panel__header">' +
                '<span class="reminders-panel__title">Reminders</span>' +
                '<button type="button" class="reminders-panel__close" aria-label="Close reminders">×</button>' +
            '</div>' +
            '<div class="reminders-panel__body"></div>';
        document.body.appendChild(panel);

        var panelBody = panel.querySelector('.reminders-panel__body');

        function ofType(type) {
            return notes.filter(function (n) {
                return typeOf(n) === type;
            });
        }

        function openReminders() {
            return ofType(REMINDER).filter(function (n) {
                return !n.done;
            });
        }

        function updateCount() {
            var claude = ofType(CLAUDE).length;
            var reminders = ofType(REMINDER).length;
            var open = openReminders().length;

            countEl.textContent = claude + ' for Claude · ' + reminders + (reminders === 1 ? ' reminder' : ' reminders') + ' (all pages)';
            remindersCountEl.textContent = open ? '(' + open + ')' : '';
            badge.textContent = open;
            badge.hidden = !open;
            toggle.setAttribute('aria-label', open ? 'Notes — ' + open + ' open reminder' + (open === 1 ? '' : 's') : 'Notes');
        }

        function setType(type) {
            currentType = type;
            localStorage.setItem(TYPE_KEY, type);
            typeButtons.forEach(function (button) {
                var on = button.getAttribute('data-type') === type;
                button.classList.toggle('is-active', on);
                button.setAttribute('aria-pressed', String(on));
            });
        }

        function applyTypeToEl(note, el, switchBtn) {
            var isReminder = typeOf(note) === REMINDER;
            el.classList.toggle('sticky-note--reminder', isReminder);
            el.classList.toggle('is-done', isReminder && !!note.done);
            switchBtn.setAttribute('aria-label', isReminder ? 'Turn into a note for Claude' : 'Turn into a reminder');
            switchBtn.title = isReminder ? 'Green: reminder — click to make it a note for Claude' : 'Yellow: for Claude — click to make it a reminder';
        }

        function jumpTo(note) {
            var rendered = noteEls[note.id];

            if (!rendered) {
                return;
            }

            window.scrollTo({ top: Math.max(0, note.y - 160), behavior: 'smooth' });
            rendered.el.classList.remove('is-flashing');
            void rendered.el.offsetWidth; // restart the animation if it is already running
            rendered.el.classList.add('is-flashing');
            setTimeout(function () {
                rendered.el.classList.remove('is-flashing');
            }, 2200);
        }

        function renderPanel() {
            var reminders = ofType(REMINDER);

            panelBody.innerHTML = '';

            if (!reminders.length) {
                var empty = document.createElement('p');
                empty.className = 'reminders-panel__empty';
                empty.textContent = 'No reminders yet. Pick "Reminder", then click anywhere on a page.';
                panelBody.appendChild(empty);
                return;
            }

            var byPage = {};

            reminders.forEach(function (n) {
                byPage[n.page] = byPage[n.page] || [];
                byPage[n.page].push(n);
            });

            Object.keys(byPage).sort().forEach(function (p) {
                var group = document.createElement('div');
                group.className = 'reminders-panel__group';

                var heading = document.createElement('p');
                heading.className = 'reminders-panel__page';
                heading.textContent = p + (p === page ? ' (this page)' : '');
                group.appendChild(heading);

                byPage[p].forEach(function (n) {
                    var item = document.createElement('div');
                    item.className = 'reminders-panel__item' + (n.done ? ' is-done' : '');

                    var check = document.createElement('button');
                    check.type = 'button';
                    check.className = 'reminders-panel__check';
                    check.setAttribute('aria-label', n.done ? 'Mark as not done' : 'Mark as done');
                    check.setAttribute('aria-pressed', String(!!n.done));
                    check.textContent = n.done ? '✓' : '';
                    check.addEventListener('click', function () {
                        n.done = !n.done;
                        saveNotes(notes);
                        refreshNoteEl(n);
                        updateCount();
                        renderPanel();
                    });

                    var text = document.createElement('button');
                    text.type = 'button';
                    text.className = 'reminders-panel__text';
                    text.textContent = n.text.trim() || '(empty reminder)';
                    text.title = p === page ? 'Scroll to this reminder' : 'Open ' + p + ' at this reminder';
                    text.addEventListener('click', function () {
                        if (p === page) {
                            jumpTo(n);
                        } else {
                            sessionStorage.setItem(JUMP_KEY, n.id);
                            location.href = p;
                        }
                    });

                    var remove = document.createElement('button');
                    remove.type = 'button';
                    remove.className = 'reminders-panel__delete';
                    remove.setAttribute('aria-label', 'Delete reminder');
                    remove.textContent = '×';
                    remove.addEventListener('click', function () {
                        deleteNote(n.id);
                    });

                    item.appendChild(check);
                    item.appendChild(text);
                    item.appendChild(remove);
                    group.appendChild(item);
                });

                panelBody.appendChild(group);
            });
        }

        function setPanelOpen(open) {
            panel.classList.toggle('is-open', open);
            remindersBtn.classList.toggle('is-active', open);

            if (open) {
                renderPanel();
            }
        }

        // ---- notes on the page -----------------------------------------------------------
        function refreshNoteEl(note) {
            var rendered = noteEls[note.id];

            if (rendered) {
                applyTypeToEl(note, rendered.el, rendered.switchBtn);
            }
        }

        function deleteNote(id) {
            notes = notes.filter(function (n) {
                return n.id !== id;
            });
            saveNotes(notes);

            if (noteEls[id]) {
                noteEls[id].el.remove();
                delete noteEls[id];
            }

            updateCount();

            if (panel.classList.contains('is-open')) {
                renderPanel();
            }
        }

        function renderNoteEl(note) {
            var el = document.createElement('div');
            el.className = 'sticky-note';
            el.style.top = note.y + 'px';
            el.style.left = note.x + 'px';
            el.dataset.id = note.id;

            var del = document.createElement('button');
            del.type = 'button';
            del.className = 'sticky-note__delete';
            del.setAttribute('aria-label', 'Delete note');
            del.textContent = '×';

            // small swatch top-left: flips the note between yellow (for Claude) and green (reminder)
            var switchBtn = document.createElement('button');
            switchBtn.type = 'button';
            switchBtn.className = 'sticky-note__type';

            var textarea = document.createElement('textarea');
            textarea.className = 'sticky-note__textarea';
            textarea.value = note.text;
            textarea.placeholder = typeOf(note) === REMINDER ? 'Remind me…' : 'Leave a note…';

            // leaving a note empty deletes it. Deferred one tick so that moving focus to another
            // control on the same note (its swatch) or the window itself losing focus — the
            // textarea stays the active element then — doesn't count as leaving it.
            textarea.addEventListener('blur', function () {
                setTimeout(function () {
                    if (document.activeElement === textarea || !isBlank(note)) {
                        return;
                    }

                    deleteNote(note.id);
                }, 0);
            });

            textarea.addEventListener('input', function () {
                note.text = textarea.value;
                saveNotes(notes);

                if (panel.classList.contains('is-open')) {
                    renderPanel();
                }
            });

            del.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteNote(note.id);
            });

            switchBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                note.type = typeOf(note) === REMINDER ? CLAUDE : REMINDER;

                if (typeOf(note) === CLAUDE) {
                    delete note.done;
                }

                textarea.placeholder = typeOf(note) === REMINDER ? 'Remind me…' : 'Leave a note…';
                saveNotes(notes);
                applyTypeToEl(note, el, switchBtn);
                updateCount();

                if (panel.classList.contains('is-open')) {
                    renderPanel();
                }
            });

            el.appendChild(switchBtn);
            el.appendChild(del);
            el.appendChild(textarea);
            document.body.appendChild(el);

            var rendered = { el: el, textarea: textarea, switchBtn: switchBtn };
            noteEls[note.id] = rendered;
            applyTypeToEl(note, el, switchBtn);

            return rendered;
        }

        function renderExisting() {
            notes
                .filter(function (n) {
                    return n.page === page;
                })
                .forEach(renderNoteEl);

            updateCount();
        }

        function onClick(e) {
            // let clicks on the dev-tool chrome / existing notes behave normally
            // instead of dropping a new note on top of them
            if (e.target.closest(IGNORE_SELECTOR)) {
                return;
            }

            // stop links/buttons under the click from firing their normal action
            // (e.g. navigating away) while we're annotating the page
            e.preventDefault();

            var note = {
                id: Date.now() + '-' + Math.random().toString(36).slice(2),
                page: page,
                type: currentType,
                x: e.pageX,
                y: e.pageY,
                text: '',
                createdAt: new Date().toISOString()
            };

            notes.push(note);
            saveNotes(notes);
            updateCount();

            var rendered = renderNoteEl(note);
            rendered.textarea.focus();
        }

        // Only yellow notes leave the page: reminders are for the owner and are never exported.
        function formatClaudeNotesForExport() {
            var byPage = {};

            ofType(CLAUDE).forEach(function (n) {
                byPage[n.page] = byPage[n.page] || [];
                byPage[n.page].push(n);
            });

            var lines = [];

            Object.keys(byPage)
                .sort()
                .forEach(function (p) {
                    lines.push('## ' + p);
                    byPage[p].forEach(function (n) {
                        lines.push('- ' + (n.text.trim() || '(empty note)'));
                    });
                    lines.push('');
                });

            return lines.join('\n').trim();
        }

        // ---- wiring ----------------------------------------------------------------------
        typeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                setType(button.getAttribute('data-type'));
            });
        });

        copyBtn.addEventListener('click', function () {
            var text = formatClaudeNotesForExport();

            if (!text) {
                return;
            }

            navigator.clipboard.writeText(text).then(function () {
                copyBtn.classList.add('is-copied');
                copyBtn.textContent = 'Copied!';
                setTimeout(function () {
                    copyBtn.classList.remove('is-copied');
                    copyBtn.textContent = 'Copy Claude Notes';
                }, 1200);
            });
        });

        clearBtn.addEventListener('click', function () {
            var claude = ofType(CLAUDE);

            if (!claude.length || !window.confirm('Clear the ' + claude.length + ' yellow note' + (claude.length === 1 ? '' : 's') + ' for Claude across every page? Your green reminders are kept.')) {
                return;
            }

            claude.forEach(function (n) {
                if (noteEls[n.id]) {
                    noteEls[n.id].el.remove();
                    delete noteEls[n.id];
                }
            });

            notes = notes.filter(function (n) {
                return typeOf(n) === REMINDER;
            });
            saveNotes(notes);
            updateCount();
        });

        remindersBtn.addEventListener('click', function () {
            setPanelOpen(!panel.classList.contains('is-open'));
        });

        panel.querySelector('.reminders-panel__close').addEventListener('click', function () {
            setPanelOpen(false);
        });

        toggle.addEventListener('click', function () {
            active = !active;
            toggle.classList.toggle('is-active', active);
            toggle.setAttribute('aria-pressed', String(active));
            toolbar.classList.toggle('is-active', active);
            // notes are visible by default; turning the tool on (to place new ones without
            // existing notes cluttering the page) hides them, turning it off brings them back
            document.body.classList.toggle('notes-hidden', active);

            if (active) {
                document.addEventListener('click', onClick, true);
            } else {
                document.removeEventListener('click', onClick, true);
                setPanelOpen(false);
            }
        });

        setType(currentType);
        renderExisting();

        // arriving from the Reminders panel on another page: scroll to the reminder and flash it
        var jumpId = sessionStorage.getItem(JUMP_KEY);

        if (jumpId) {
            sessionStorage.removeItem(JUMP_KEY);

            var target = notes.filter(function (n) {
                return n.id === jumpId;
            })[0];

            if (target) {
                // after layout settles (images and the like can still move the page)
                window.addEventListener('load', function () {
                    jumpTo(target);
                });

                if (document.readyState === 'complete') {
                    jumpTo(target);
                }
            }
        }
    });
})();
