const STORAGE_KEYS = {
  students: "sms_students",
  teachers: "sms_teachers",
  courses: "sms_courses",
  assignments: "sms_assignments",
  currentUser: "sms_current_user"
};

const authCard = document.getElementById("auth-card");
const dashboardCard = document.getElementById("dashboard-card");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardRole = document.getElementById("dashboardRole");
const navMenu = document.getElementById("navMenu");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceActions = document.getElementById("workspaceActions");
const workspaceContent = document.getElementById("workspaceContent");
const notice = document.getElementById("notice");
const demoPreview = document.getElementById("demoPreview");

seedData();
renderDemoPreview();
setupTabs();
setupForms();
setupLogout();
restoreSession();

function read(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setNotice(message, isError = false) {
  if (!notice) {
    return;
  }
  notice.textContent = message;
  notice.style.color = isError ? "#b42318" : "#33a474";
}

function setupTabs() {
  const mainTabs = document.querySelectorAll(".main-tab");
  const mainPanels = document.querySelectorAll(".main-panel");
  const roleTabs = document.querySelectorAll(".tab");
  const rolePanels = document.querySelectorAll("#signup-panel .tab-content");

  mainTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      mainTabs.forEach((t) => t.classList.remove("active"));
      mainPanels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.main).classList.add("active");
      setNotice("");
    });
  });

  roleTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      roleTabs.forEach((t) => t.classList.remove("active"));
      rolePanels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
      setNotice("");
    });
  });
}

function setupForms() {
  const studentForm = document.getElementById("studentForm");
  const teacherForm = document.getElementById("teacherForm");
  const loginForm = document.getElementById("loginForm");

  studentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(studentForm));

    payload.id = crypto.randomUUID();
    payload.role = "student";
    payload.approved = false;
    payload.enrolledCourses = [];
    payload.attendanceByCourse = {};
    payload.marksByCourse = {};
    payload.assignmentSubmissions = {};

    if (!isUniqueUsername(payload.username)) {
      setNotice("Username already exists.", true);
      return;
    }

    const students = read(STORAGE_KEYS.students);
    students.push(payload);
    write(STORAGE_KEYS.students, students);
    studentForm.reset();
    setNotice("Student registered. Waiting for approval.");
  });

  teacherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(teacherForm));

    payload.id = crypto.randomUUID();
    payload.role = "teacher";

    if (!isUniqueUsername(payload.username)) {
      setNotice("Username already exists.", true);
      return;
    }

    const teachers = read(STORAGE_KEYS.teachers);
    teachers.push(payload);
    write(STORAGE_KEYS.teachers, teachers);
    teacherForm.reset();
    setNotice("Teacher registered successfully.");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(loginForm));
    const user = findUser(payload.username, payload.password);

    if (!user) {
      setNotice("Invalid credentials.", true);
      return;
    }

    if (user.role === "student" && !user.approved) {
      setNotice("Student account is pending approval.", true);
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    renderDashboard(user);
    loginForm.reset();
  });
}

function setupLogout() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(STORAGE_KEYS.currentUser);
    dashboardCard.classList.add("hidden");
    authCard.classList.remove("hidden");

    // Return user to Login panel after logout.
    const loginMainTab = document.querySelector('.main-tab[data-main="login-panel"]');
    const signupMainTab = document.querySelector('.main-tab[data-main="signup-panel"]');
    const loginPanel = document.getElementById("login-panel");
    const signupPanel = document.getElementById("signup-panel");

    if (loginMainTab && signupMainTab && loginPanel && signupPanel) {
      signupMainTab.classList.remove("active");
      signupPanel.classList.remove("active");
      loginMainTab.classList.add("active");
      loginPanel.classList.add("active");
    }

    setNotice("Logged out.");
  });
}

function restoreSession() {
  const currentUser = sessionStorage.getItem(STORAGE_KEYS.currentUser);
  if (!currentUser) {
    return;
  }

  renderDashboard(JSON.parse(currentUser));
}

function renderDashboard(user) {
  const freshUser = getFreshCurrentUser() || user;
  authCard.classList.add("hidden");
  dashboardCard.classList.remove("hidden");
  dashboardTitle.textContent = `${freshUser.firstName} ${freshUser.lastName}`;
  dashboardRole.textContent = `${toTitle(freshUser.role)} Portal`;

  const views = getViewsForRole(freshUser.role);
  renderNav(views, freshUser);
  renderView(views[0].id, freshUser);
}

function getViewsForRole(role) {
  if (role === "admin" || role === "teacher") {
    return [
      { id: "overview", label: "Overview" },
      { id: "students", label: "Student Directory" },
      { id: "courses", label: "Course Registration" },
      { id: "attendance", label: "Attendance Manager" },
      { id: "marks", label: "Mark Summary Manager" },
      { id: "assignments", label: "Assignment Portal" },
      { id: "teachers", label: "Teacher Directory" }
    ];
  }

  return [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "My Profile" },
    { id: "course-registration", label: "Course Registration" },
    { id: "current-courses", label: "Current Courses" },
    { id: "attendance", label: "Attendance" },
    { id: "marks", label: "Mark Summary" },
    { id: "assignments", label: "Assignment Portal" },
    { id: "teachers", label: "Teacher Directory" }
  ];
}

function renderNav(views, user) {
  navMenu.innerHTML = "";
  views.forEach((view, index) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.dataset.view = view.id;
    if (index === 0) {
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      [...navMenu.children].forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      renderView(view.id, getFreshCurrentUser() || user);
    });
    navMenu.appendChild(btn);
  });
}

function renderView(viewId, user) {
  workspaceActions.innerHTML = "";

  if (viewId === "overview") {
    renderOverview(user);
    return;
  }

  if (viewId === "profile") {
    renderProfile(user);
    return;
  }

  if (viewId === "students") {
    renderStudentDirectory(user.role);
    return;
  }

  if (viewId === "courses") {
    renderCourseManager(user.role);
    return;
  }

  if (viewId === "course-registration") {
    renderStudentCourseRegistration(user);
    return;
  }

  if (viewId === "current-courses") {
    renderCurrentCourses(user);
    return;
  }

  if (viewId === "attendance") {
    if (user.role === "student") {
      renderStudentAttendance(user);
    } else {
      renderAttendanceManager();
    }
    return;
  }

  if (viewId === "marks") {
    if (user.role === "student") {
      renderStudentMarks(user);
    } else {
      renderMarksManager();
    }
    return;
  }

  if (viewId === "assignments") {
    if (user.role === "student") {
      renderStudentAssignments(user);
    } else {
      renderAssignmentManager();
    }
    return;
  }

  if (viewId === "teachers") {
    renderTeacherDirectory();
  }
}

function renderOverview(user) {
  workspaceTitle.textContent = "Overview";
  const students = read(STORAGE_KEYS.students);
  const courses = read(STORAGE_KEYS.courses);
  const assignments = read(STORAGE_KEYS.assignments);

  if (user.role === "student") {
    const me = getFreshCurrentUser();
    const enrolledCount = (me.enrolledCourses || []).length;
    const attendanceAvg = getStudentAttendanceAverage(me);
    const markAvg = getStudentMarkAverage(me);

    workspaceContent.innerHTML = `
      <div class="stats-grid">
        <article class="stat-card"><h4>Enrolled Courses</h4><p>${enrolledCount}</p></article>
        <article class="stat-card"><h4>Attendance</h4><p>${attendanceAvg}%</p></article>
        <article class="stat-card"><h4>Average Marks</h4><p>${markAvg}%</p></article>
        <article class="stat-card"><h4>Pending Assignments</h4><p>${countPendingAssignments(me)}</p></article>
      </div>
      <div class="panel-card" style="margin-top:12px;">
        <h4>Current Semester</h4>
        <p class="muted">Program: ${me.program || "-"} | Semester: ${me.semester || "-"}</p>
      </div>
    `;
    return;
  }

  const approvedCount = students.filter((s) => s.approved).length;
  const avgAttendance = students.length
    ? Math.round(students.reduce((acc, s) => acc + getStudentAttendanceAverage(s), 0) / students.length)
    : 0;

  workspaceActions.appendChild(makeActionButton("Export Students CSV", exportStudentsCSV));

  workspaceContent.innerHTML = `
    <div class="stats-grid">
      <article class="stat-card"><h4>Total Students</h4><p>${students.length}</p></article>
      <article class="stat-card"><h4>Approved Students</h4><p>${approvedCount}</p></article>
      <article class="stat-card"><h4>Active Courses</h4><p>${courses.length}</p></article>
      <article class="stat-card"><h4>Assignments Published</h4><p>${assignments.length}</p></article>
    </div>
    <div class="panel-card" style="margin-top:12px;">
      <h4>University Snapshot</h4>
      <p class="muted">Average attendance across students: ${avgAttendance}%</p>
    </div>
  `;
}

function renderProfile(user) {
  workspaceTitle.textContent = "My Profile";
  const me = getFreshCurrentUser() || user;

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <form id="profileForm" class="form-grid">
        <input name="firstName" value="${escapeHtml(me.firstName || "")}" required>
        <input name="lastName" value="${escapeHtml(me.lastName || "")}" required>
        <input name="email" value="${escapeHtml(me.email || "")}" required>
        <input name="phone" value="${escapeHtml(me.phone || "")}" required>
        <input name="address" value="${escapeHtml(me.address || "")}" required>
        <input name="guardian" value="${escapeHtml(me.guardian || "")}" ${me.role === "student" ? "required" : ""}>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  `;

  document.getElementById("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(event.target));
    updateUserRecord(me, payload);
    setNotice("Profile updated.");
  });
}

function renderStudentDirectory(actorRole) {
  workspaceTitle.textContent = "Student Directory";
  const students = read(STORAGE_KEYS.students);

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <div class="inline-form">
        <input id="studentSearch" placeholder="Search by name, program or email">
        <select id="studentStatus">
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Program</th>
              <th>Semester</th>
              <th>Email</th>
              <th>Attendance</th>
              <th>Marks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="studentsTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = document.getElementById("studentsTbody");
  const search = document.getElementById("studentSearch");
  const status = document.getElementById("studentStatus");

  const draw = () => {
    const q = search.value.trim().toLowerCase();
    const st = status.value;

    const filtered = students.filter((s) => {
      if (st === "approved" && !s.approved) {
        return false;
      }
      if (st === "pending" && s.approved) {
        return false;
      }
      if (!q) {
        return true;
      }
      return `${s.firstName} ${s.lastName} ${s.program || ""} ${s.email}`.toLowerCase().includes(q);
    });

    tbody.innerHTML = "";
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8">No students found.</td></tr>`;
      return;
    }

    filtered.forEach((student) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${student.firstName} ${student.lastName}</td>
        <td>${student.program || "-"}</td>
        <td>${student.semester || "-"}</td>
        <td>${student.email}</td>
        <td>${getStudentAttendanceAverage(student)}%</td>
        <td>${getStudentMarkAverage(student)}%</td>
        <td>${student.approved ? "Approved" : "Pending"}</td>
        <td></td>
      `;

      const td = tr.lastElementChild;
      const approveBtn = document.createElement("button");
      approveBtn.className = "small-btn";
      approveBtn.textContent = student.approved ? "Approved" : "Approve";
      approveBtn.disabled = student.approved;
      approveBtn.addEventListener("click", () => {
        approveStudent(student.id);
        renderStudentDirectory(actorRole);
      });
      td.appendChild(approveBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "small-btn delete";
      deleteBtn.style.marginLeft = "6px";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        deleteStudent(student.id);
        renderStudentDirectory(actorRole);
      });
      td.appendChild(deleteBtn);

      tbody.appendChild(tr);
    });
  };

  search.addEventListener("input", draw);
  status.addEventListener("change", draw);
  draw();
}

function renderCourseManager(actorRole) {
  workspaceTitle.textContent = "Course Registration";
  const courses = read(STORAGE_KEYS.courses);

  const createBlock = actorRole === "student"
    ? ""
    : `
    <div class="panel-card" style="margin-bottom:12px;">
      <h4>Create Course</h4>
      <form id="createCourseForm" class="inline-form">
        <input name="code" placeholder="Course code" required>
        <input name="title" placeholder="Course title" required>
        <input name="credits" type="number" min="1" max="6" placeholder="Credits" required>
        <input name="semester" placeholder="Semester" required>
        <button type="submit">Add Course</button>
      </form>
    </div>
  `;

  workspaceContent.innerHTML = `
    ${createBlock}
    <div class="panel-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Credits</th>
              <th>Semester</th>
            </tr>
          </thead>
          <tbody>
            ${courses.length
              ? courses
                  .map(
                    (course) => `
                      <tr>
                        <td>${course.code}</td>
                        <td>${course.title}</td>
                        <td>${course.credits}</td>
                        <td>${course.semester}</td>
                      </tr>
                    `
                  )
                  .join("")
              : '<tr><td colspan="4">No courses found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = document.getElementById("createCourseForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = formDataToObject(new FormData(form));
      payload.id = crypto.randomUUID();

      const updated = read(STORAGE_KEYS.courses);
      updated.push(payload);
      write(STORAGE_KEYS.courses, updated);
      setNotice("Course added.");
      renderCourseManager(actorRole);
    });
  }
}

function renderStudentCourseRegistration(user) {
  workspaceTitle.textContent = "Course Registration";
  const me = getFreshCurrentUser() || user;
  const courses = read(STORAGE_KEYS.courses);

  if (!courses.length) {
    workspaceContent.innerHTML = '<div class="panel-card">No courses available right now.</div>';
    return;
  }

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <p class="muted">Select courses for your current semester.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Enroll</th><th>Code</th><th>Title</th><th>Credits</th><th>Semester</th></tr>
          </thead>
          <tbody id="courseRegistrationBody"></tbody>
        </table>
      </div>
      <button id="saveRegistrationBtn" style="margin-top:10px;">Save Registration</button>
    </div>
  `;

  const body = document.getElementById("courseRegistrationBody");
  const selected = new Set(me.enrolledCourses || []);

  courses.forEach((course) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" data-course-id="${course.id}" ${selected.has(course.id) ? "checked" : ""}></td>
      <td>${course.code}</td>
      <td>${course.title}</td>
      <td>${course.credits}</td>
      <td>${course.semester}</td>
    `;
    body.appendChild(row);
  });

  document.getElementById("saveRegistrationBtn").addEventListener("click", () => {
    const checked = [...body.querySelectorAll("input[type='checkbox']:checked")].map((el) => el.dataset.courseId);
    updateUserRecord(me, { enrolledCourses: checked });
    setNotice("Course registration updated.");
    renderStudentCourseRegistration(getFreshCurrentUser());
  });
}

function renderCurrentCourses(user) {
  workspaceTitle.textContent = "Current Courses";
  const me = getFreshCurrentUser() || user;
  const courses = read(STORAGE_KEYS.courses);
  const current = courses.filter((course) => (me.enrolledCourses || []).includes(course.id));

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Code</th><th>Course</th><th>Credits</th><th>Semester</th></tr>
          </thead>
          <tbody>
            ${current.length
              ? current
                  .map(
                    (course) => `
                      <tr>
                        <td>${course.code}</td>
                        <td>${course.title}</td>
                        <td>${course.credits}</td>
                        <td>${course.semester}</td>
                      </tr>
                    `
                  )
                  .join("")
              : '<tr><td colspan="4">No registered courses yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAttendanceManager() {
  workspaceTitle.textContent = "Attendance Manager";
  const students = read(STORAGE_KEYS.students).filter((s) => s.approved);
  const courses = read(STORAGE_KEYS.courses);

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <form id="attendanceForm" class="inline-form">
        <select name="studentId" id="attendanceStudent" required></select>
        <select name="courseId" id="attendanceCourse" required></select>
        <input type="number" name="attendance" min="0" max="100" placeholder="Attendance %" required>
        <button type="submit">Update Attendance</button>
      </form>
      <p class="muted">Set attendance by student and course.</p>
    </div>
  `;

  const studentSelect = document.getElementById("attendanceStudent");
  const courseSelect = document.getElementById("attendanceCourse");

  studentSelect.innerHTML = students.length
    ? `<option value="" disabled selected>Select student</option>${students
        .map((s) => `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`)
        .join("")}`
    : `<option value="">No students</option>`;

  courseSelect.innerHTML = courses.length
    ? `<option value="" disabled selected>Select course</option>${courses
        .map((c) => `<option value="${c.id}">${c.code} - ${c.title}</option>`)
        .join("")}`
    : `<option value="">No courses</option>`;

  document.getElementById("attendanceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(event.target));

    const list = read(STORAGE_KEYS.students);
    const index = list.findIndex((s) => s.id === payload.studentId);
    if (index === -1) {
      return;
    }

    const student = list[index];
    student.attendanceByCourse = student.attendanceByCourse || {};
    student.attendanceByCourse[payload.courseId] = clampNumber(payload.attendance, 0, 100);
    list[index] = student;
    write(STORAGE_KEYS.students, list);

    setNotice("Attendance updated.");
    event.target.reset();
  });
}

function renderStudentAttendance(user) {
  workspaceTitle.textContent = "Attendance";
  const me = getFreshCurrentUser() || user;
  const courses = read(STORAGE_KEYS.courses).filter((course) => (me.enrolledCourses || []).includes(course.id));

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Course</th><th>Attendance</th><th>Status</th></tr></thead>
          <tbody>
            ${courses.length
              ? courses
                  .map((course) => {
                    const pct = getAttendanceForCourse(me, course.id);
                    return `
                      <tr>
                        <td>${course.code} - ${course.title}</td>
                        <td>${pct}%</td>
                        <td><span class="badge ${pct < 75 ? "warn" : ""}">${pct < 75 ? "Shortage" : "Eligible"}</span></td>
                      </tr>
                    `;
                  })
                  .join("")
              : '<tr><td colspan="3">No enrolled courses.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMarksManager() {
  workspaceTitle.textContent = "Mark Summary Manager";
  const students = read(STORAGE_KEYS.students).filter((s) => s.approved);
  const courses = read(STORAGE_KEYS.courses);

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <form id="marksForm" class="inline-form">
        <select name="studentId" id="marksStudent" required></select>
        <select name="courseId" id="marksCourse" required></select>
        <input type="number" name="internal" min="0" max="40" placeholder="Internal (40)" required>
        <input type="number" name="external" min="0" max="60" placeholder="External (60)" required>
        <button type="submit">Update Marks</button>
      </form>
      <p class="muted">Marks are stored per student and course.</p>
    </div>
  `;

  document.getElementById("marksStudent").innerHTML = students.length
    ? `<option value="" disabled selected>Select student</option>${students
        .map((s) => `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`)
        .join("")}`
    : `<option value="">No students</option>`;

  document.getElementById("marksCourse").innerHTML = courses.length
    ? `<option value="" disabled selected>Select course</option>${courses
        .map((c) => `<option value="${c.id}">${c.code} - ${c.title}</option>`)
        .join("")}`
    : `<option value="">No courses</option>`;

  document.getElementById("marksForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(event.target));

    const list = read(STORAGE_KEYS.students);
    const index = list.findIndex((s) => s.id === payload.studentId);
    if (index === -1) {
      return;
    }

    const student = list[index];
    student.marksByCourse = student.marksByCourse || {};
    student.marksByCourse[payload.courseId] = {
      internal: clampNumber(payload.internal, 0, 40),
      external: clampNumber(payload.external, 0, 60)
    };
    list[index] = student;
    write(STORAGE_KEYS.students, list);

    setNotice("Marks updated.");
    event.target.reset();
  });
}

function renderStudentMarks(user) {
  workspaceTitle.textContent = "Mark Summary";
  const me = getFreshCurrentUser() || user;
  const courses = read(STORAGE_KEYS.courses).filter((course) => (me.enrolledCourses || []).includes(course.id));

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Course</th><th>Internal</th><th>External</th><th>Total</th><th>Grade</th></tr></thead>
          <tbody>
            ${courses.length
              ? courses
                  .map((course) => {
                    const mk = getMarksForCourse(me, course.id);
                    const total = mk.internal + mk.external;
                    return `
                      <tr>
                        <td>${course.code} - ${course.title}</td>
                        <td>${mk.internal}</td>
                        <td>${mk.external}</td>
                        <td>${total}</td>
                        <td>${gradeFor(total)}</td>
                      </tr>
                    `;
                  })
                  .join("")
              : '<tr><td colspan="5">No marks available.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAssignmentManager() {
  workspaceTitle.textContent = "Assignment Portal";
  const courses = read(STORAGE_KEYS.courses);
  const assignments = read(STORAGE_KEYS.assignments);

  workspaceContent.innerHTML = `
    <div class="split-grid">
      <div class="panel-card">
        <h4>Create Assignment</h4>
        <form id="assignmentForm" class="form-grid">
          <select name="courseId" id="assignmentCourse" required></select>
          <input name="title" placeholder="Assignment title" required>
          <input type="date" name="dueDate" required>
          <input type="number" name="maxMarks" min="1" max="100" placeholder="Max marks" required>
          <input name="description" placeholder="Short description" required>
          <button type="submit">Publish Assignment</button>
        </form>
      </div>
      <div class="panel-card">
        <h4>Published Assignments</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Course</th><th>Title</th><th>Due</th><th>Max</th></tr></thead>
            <tbody>
              ${assignments.length
                ? assignments
                    .map((a) => {
                      const c = courses.find((course) => course.id === a.courseId);
                      return `<tr><td>${c ? c.code : "-"}</td><td>${a.title}</td><td>${a.dueDate}</td><td>${a.maxMarks}</td></tr>`;
                    })
                    .join("")
                : '<tr><td colspan="4">No assignments published.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const courseSelect = document.getElementById("assignmentCourse");
  courseSelect.innerHTML = courses.length
    ? `<option value="" disabled selected>Select course</option>${courses
        .map((course) => `<option value="${course.id}">${course.code} - ${course.title}</option>`)
        .join("")}`
    : `<option value="">No courses</option>`;

  document.getElementById("assignmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = formDataToObject(new FormData(event.target));
    payload.id = crypto.randomUUID();

    const list = read(STORAGE_KEYS.assignments);
    list.push(payload);
    write(STORAGE_KEYS.assignments, list);
    setNotice("Assignment published.");
    renderAssignmentManager();
  });
}

function renderStudentAssignments(user) {
  workspaceTitle.textContent = "Assignment Portal";
  const me = getFreshCurrentUser() || user;
  const assignments = read(STORAGE_KEYS.assignments).filter((a) => (me.enrolledCourses || []).includes(a.courseId));
  const courses = read(STORAGE_KEYS.courses);

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Course</th><th>Title</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody id="studentAssignmentBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = document.getElementById("studentAssignmentBody");
  tbody.innerHTML = "";

  if (!assignments.length) {
    tbody.innerHTML = '<tr><td colspan="5">No assignments for your courses.</td></tr>';
    return;
  }

  assignments.forEach((assignment) => {
    const row = document.createElement("tr");
    const course = courses.find((c) => c.id === assignment.courseId);
    const submitted = Boolean((me.assignmentSubmissions || {})[assignment.id]);

    row.innerHTML = `
      <td>${course ? course.code : "-"}</td>
      <td>${assignment.title}</td>
      <td>${assignment.dueDate}</td>
      <td><span class="badge ${submitted ? "" : "warn"}">${submitted ? "Submitted" : "Pending"}</span></td>
      <td></td>
    `;

    const td = row.lastElementChild;
    const btn = document.createElement("button");
    btn.className = "small-btn";
    btn.textContent = submitted ? "Submitted" : "Mark Submitted";
    btn.disabled = submitted;
    btn.addEventListener("click", () => {
      markAssignmentSubmitted(me, assignment.id);
      renderStudentAssignments(getFreshCurrentUser());
    });

    td.appendChild(btn);
    tbody.appendChild(row);
  });
}

function renderTeacherDirectory() {
  workspaceTitle.textContent = "Teacher Directory";
  const teachers = read(STORAGE_KEYS.teachers);

  workspaceContent.innerHTML = `
    <div class="panel-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Experience</th>
            </tr>
          </thead>
          <tbody>
            ${teachers.length
              ? teachers
                  .map(
                    (teacher) => `
                      <tr>
                        <td>${teacher.firstName} ${teacher.lastName}</td>
                        <td>${teacher.department || "-"}</td>
                        <td>${teacher.email}</td>
                        <td>${teacher.experience}</td>
                      </tr>
                    `
                  )
                  .join("")
              : '<tr><td colspan="4">No teachers found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function approveStudent(studentId) {
  const students = read(STORAGE_KEYS.students);
  const index = students.findIndex((student) => student.id === studentId);
  if (index === -1) {
    return;
  }
  students[index].approved = true;
  write(STORAGE_KEYS.students, students);
}

function deleteStudent(studentId) {
  const students = read(STORAGE_KEYS.students).filter((student) => student.id !== studentId);
  write(STORAGE_KEYS.students, students);
}

function markAssignmentSubmitted(user, assignmentId) {
  const students = read(STORAGE_KEYS.students);
  const index = students.findIndex((student) => student.id === user.id);
  if (index === -1) {
    return;
  }

  const student = students[index];
  student.assignmentSubmissions = student.assignmentSubmissions || {};
  student.assignmentSubmissions[assignmentId] = true;

  students[index] = student;
  write(STORAGE_KEYS.students, students);
  sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(student));
  setNotice("Assignment marked as submitted.");
}

function updateUserRecord(user, updated) {
  const key = user.role === "teacher" ? STORAGE_KEYS.teachers : STORAGE_KEYS.students;
  const list = read(key);
  const index = list.findIndex((item) => item.id === user.id);

  if (index === -1) {
    return;
  }

  list[index] = { ...list[index], ...updated };
  write(key, list);
  sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(list[index]));
  renderDashboard(list[index]);
}

function getFreshCurrentUser() {
  const session = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.currentUser) || "null");
  if (!session || session.role === "admin") {
    return session;
  }

  const key = session.role === "teacher" ? STORAGE_KEYS.teachers : STORAGE_KEYS.students;
  const list = read(key);
  const fresh = list.find((item) => item.id === session.id) || session;
  sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(fresh));
  return fresh;
}

function getAttendanceForCourse(student, courseId) {
  return clampNumber((student.attendanceByCourse || {})[courseId] || 0, 0, 100);
}

function getStudentAttendanceAverage(student) {
  const values = Object.values(student.attendanceByCourse || {});
  if (!values.length) {
    return 0;
  }
  return Math.round(values.reduce((acc, value) => acc + Number(value || 0), 0) / values.length);
}

function getMarksForCourse(student, courseId) {
  const data = (student.marksByCourse || {})[courseId] || { internal: 0, external: 0 };
  return {
    internal: clampNumber(data.internal, 0, 40),
    external: clampNumber(data.external, 0, 60)
  };
}

function getStudentMarkAverage(student) {
  const entries = Object.values(student.marksByCourse || {});
  if (!entries.length) {
    return 0;
  }

  const total = entries.reduce((acc, m) => acc + clampNumber(m.internal, 0, 40) + clampNumber(m.external, 0, 60), 0);
  return Math.round(total / entries.length);
}

function countPendingAssignments(student) {
  const assignments = read(STORAGE_KEYS.assignments).filter((a) => (student.enrolledCourses || []).includes(a.courseId));
  const submissions = student.assignmentSubmissions || {};
  return assignments.filter((assignment) => !submissions[assignment.id]).length;
}

function exportStudentsCSV() {
  const students = read(STORAGE_KEYS.students);
  if (!students.length) {
    setNotice("No student data to export.", true);
    return;
  }

  const header = [
    "first_name",
    "last_name",
    "email",
    "program",
    "semester",
    "courses_registered",
    "attendance_average",
    "mark_average",
    "approved"
  ];

  const rows = students.map((student) => [
    student.firstName,
    student.lastName,
    student.email,
    student.program || "",
    student.semester || "",
    (student.enrolledCourses || []).length,
    getStudentAttendanceAverage(student),
    getStudentMarkAverage(student),
    student.approved ? "yes" : "no"
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "students_export.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setNotice("Student CSV exported.");
}

function gradeFor(total) {
  if (total >= 85) {
    return "A";
  }
  if (total >= 70) {
    return "B";
  }
  if (total >= 55) {
    return "C";
  }
  if (total >= 40) {
    return "D";
  }
  return "F";
}

function makeActionButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function findUser(username, password) {
  const students = read(STORAGE_KEYS.students);
  const teachers = read(STORAGE_KEYS.teachers);
  const admin = {
    id: "admin-seed",
    role: "admin",
    username: "admin",
    password: "admin123",
    firstName: "System",
    lastName: "Admin"
  };

  const allUsers = [admin, ...students, ...teachers];
  return allUsers.find((user) => user.username === username && user.password === password) || null;
}

function isUniqueUsername(username) {
  const students = read(STORAGE_KEYS.students);
  const teachers = read(STORAGE_KEYS.teachers);
  const all = [...students, ...teachers, { username: "admin" }];
  return !all.some((user) => user.username === username);
}

function seedData() {
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);

  write(STORAGE_KEYS.students, [
    {
      id: "student-1",
      role: "student",
      approved: true,
      firstName: "Amina",
      lastName: "Khan",
      email: "amina.khan@uni.edu",
      program: "BSc Computer Science",
      semester: "4",
      username: "amina",
      password: "student123",
      address: "North Campus Road",
      phone: "03001234567",
      guardian: "Farooq Khan",
      enrolledCourses: ["course-cs101", "course-db301"],
      attendanceByCourse: {
        "course-cs101": 92,
        "course-db301": 86
      },
      marksByCourse: {
        "course-cs101": { internal: 34, external: 48 },
        "course-db301": { internal: 31, external: 44 }
      },
      assignmentSubmissions: {
        "assignment-1": true
      }
    },
    {
      id: "student-2",
      role: "student",
      approved: true,
      firstName: "Bilal",
      lastName: "Ahmed",
      email: "bilal.ahmed@uni.edu",
      program: "BSc Software Engineering",
      semester: "6",
      username: "bilal",
      password: "student123",
      address: "City Heights",
      phone: "03009876543",
      guardian: "Rashid Ahmed",
      enrolledCourses: ["course-cs101", "course-ma201"],
      attendanceByCourse: {
        "course-cs101": 74,
        "course-ma201": 79
      },
      marksByCourse: {
        "course-cs101": { internal: 27, external: 39 },
        "course-ma201": { internal: 30, external: 41 }
      },
      assignmentSubmissions: {}
    },
    {
      id: "student-3",
      role: "student",
      approved: false,
      firstName: "Sara",
      lastName: "Malik",
      email: "sara.malik@uni.edu",
      program: "BS Information Technology",
      semester: "2",
      username: "sara",
      password: "student123",
      address: "Lake View Apartments",
      phone: "03111234567",
      guardian: "Hassan Malik",
      enrolledCourses: ["course-ma201"],
      attendanceByCourse: {},
      marksByCourse: {},
      assignmentSubmissions: {}
    }
  ]);

  write(STORAGE_KEYS.teachers, [
    {
      id: "teacher-1",
      role: "teacher",
      firstName: "Dr. Sarah",
      lastName: "Ibrahim",
      email: "sarah.ibrahim@uni.edu",
      department: "Computer Science",
      username: "sarahib",
      password: "teacher123",
      address: "Faculty Housing Block A",
      phone: "03005554444",
      experience: 8,
      salary: 180000
    },
    {
      id: "teacher-2",
      role: "teacher",
      firstName: "Prof. Imran",
      lastName: "Sheikh",
      email: "imran.sheikh@uni.edu",
      department: "Mathematics",
      username: "imrans",
      password: "teacher123",
      address: "Faculty Housing Block B",
      phone: "03006667777",
      experience: 12,
      salary: 220000
    }
  ]);

  write(STORAGE_KEYS.courses, [
    { id: "course-cs101", code: "CS101", title: "Programming Fundamentals", credits: 3, semester: "1" },
    { id: "course-ma201", code: "MA201", title: "Discrete Mathematics", credits: 3, semester: "2" },
    { id: "course-db301", code: "DB301", title: "Database Systems", credits: 4, semester: "3" }
  ]);

  write(STORAGE_KEYS.assignments, [
    {
      id: "assignment-1",
      courseId: "course-cs101",
      title: "Build a Login Screen",
      dueDate: "2026-04-18",
      maxMarks: 50,
      description: "Create a responsive login UI with form validation."
    },
    {
      id: "assignment-2",
      courseId: "course-db301",
      title: "Database Schema Design",
      dueDate: "2026-04-22",
      maxMarks: 40,
      description: "Design tables for a student registration workflow."
    },
    {
      id: "assignment-3",
      courseId: "course-ma201",
      title: "Graph Theory Worksheet",
      dueDate: "2026-04-25",
      maxMarks: 30,
      description: "Solve the attached graph theory problems."
    }
  ]);
}

function renderDemoPreview() {
  if (!demoPreview) {
    return;
  }

  const students = read(STORAGE_KEYS.students);
  const teachers = read(STORAGE_KEYS.teachers);
  const courses = read(STORAGE_KEYS.courses);
  const assignments = read(STORAGE_KEYS.assignments);

  demoPreview.innerHTML = `
    <div class="demo-preview-head">
      <h4>Demo Data</h4>
      <p class="muted">Sample records reset on every load</p>
    </div>
    <div class="demo-cards">
      <div class="demo-card"><strong>Students</strong><span>${students.length} records</span></div>
      <div class="demo-card"><strong>Teachers</strong><span>${teachers.length} records</span></div>
      <div class="demo-card"><strong>Courses</strong><span>${courses.length} records</span></div>
      <div class="demo-card"><strong>Assignments</strong><span>${assignments.length} records</span></div>
    </div>
    <ul class="demo-list">
      <li>Admin login: admin / admin123</li>
      <li>Student login: amina / student123</li>
      <li>Teacher login: sarahib / teacher123</li>
    </ul>
  `;
}

function formDataToObject(formData) {
  return Object.fromEntries(formData.entries());
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) {
    return min;
  }
  return Math.min(Math.max(n, min), max);
}

function toTitle(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
