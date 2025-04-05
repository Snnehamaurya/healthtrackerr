// Health Monitor AI Application
// Add responsive enhancements for mobile devices
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Function to handle responsive layout adjustments
function handleResponsiveLayout() {
    // Adjust chart dimensions based on screen size
    const width = window.innerWidth;
    
    // Apply specific mobile optimizations
    if (width <= 768) {
        // Mobile-specific adjustments
        document.documentElement.style.setProperty('--sidebar-width', '100%');
    } else {
        // Reset for larger screens
        document.documentElement.style.setProperty('--sidebar-width', '280px');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize responsive layout
    handleResponsiveLayout();
    
    // Listen for window resize to handle responsive layout
    window.addEventListener('resize', handleResponsiveLayout);
    // Initialize demo user database
    if (!localStorage.getItem('users')) {
        const defaultUsers = {
            'admin': {
                username: 'admin',
                password: hashPassword('admin123'),
                role: 'admin',
                name: 'Admin User'
            },
            'doctor': {
                username: 'doctor',
                password: hashPassword('doctor123'),
                role: 'doctor',
                name: 'Dr. Jane Smith'
            },
            'nurse': {
                username: 'nurse',
                password: hashPassword('nurse123'),
                role: 'nurse',
                name: 'Nurse John Davis'
            }
        };
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Initialize patient database if not exists
    if (!localStorage.getItem('patients')) {
        const patients = generatePatients();
        localStorage.setItem('patients', JSON.stringify(patients));
    }

    // DOM Elements
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('register-btn');
    const registrationForm = document.querySelector('.registration-form');
    const regForm = document.getElementById('registrationForm');
    const appContainer = document.getElementById('app-container');
    const logoutBtn = document.getElementById('logout-btn');
    const navLinks = document.querySelectorAll('.nav-links a');
    const patientSelector = document.getElementById('patient-selector');
    const userInfo = document.getElementById('user-info');
    
    // Initialize Authentication
    registerBtn.addEventListener('click', () => {
        document.querySelector('.login-form').style.display = 'none';
        registrationForm.style.display = 'block';
    });
    
    // Login Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (loginUser(username, password)) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            
            // Set user info
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            userInfo.textContent = `Logged in as: ${currentUser.name} (${currentUser.role})`;
            
            // Load patients
            loadPatients();
            
            // Initialize the dashboard
            if (patientSelector.value) {
                loadDashboard(patientSelector.value);
            }
        } else {
            document.getElementById('login-error').textContent = 'Invalid username or password.';
        }
    });
    
    // Registration Form Submission
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const fullName = document.getElementById('full-name').value;
        const role = document.getElementById('role').value;
        
        // Validation
        if (password !== confirmPassword) {
            document.getElementById('register-error').textContent = 'Passwords do not match.';
            return;
        }
        
        if (registerUser(username, password, role, fullName)) {
            document.getElementById('register-success').textContent = 'Registration successful! You can now login.';
            document.getElementById('register-error').textContent = '';
            
            // Reset form
            regForm.reset();
            
            // Switch back to login form after 2 seconds
            setTimeout(() => {
                document.querySelector('.login-form').style.display = 'block';
                registrationForm.style.display = 'none';
                document.getElementById('register-success').textContent = '';
            }, 2000);
        } else {
            document.getElementById('register-error').textContent = 'Username already exists.';
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        appContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-error').textContent = '';
    });
    
    // Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide all page contents
            document.querySelectorAll('.page-content').forEach(page => {
                page.style.display = 'none';
            });
            
            // Show the selected page
            const pageId = link.getAttribute('data-page');
            document.getElementById(`${pageId}-page`).style.display = 'block';
            
            // Load appropriate content based on page
            const patientId = patientSelector.value;
            
            if (patientId) {
                switch (pageId) {
                    case 'dashboard':
                        loadDashboard(patientId);
                        break;
                    case 'patient-profile':
                        loadPatientProfile(patientId);
                        break;
                    case 'historical-data':
                        loadHistoricalData(patientId);
                        break;
                    case 'analytics':
                        loadAnalytics(patientId);
                        break;
                    case 'health-assistant':
                        initializeHealthAssistant(patientId);
                        break;
                }
            }
        });
    });
    
    // Patient Selection Change
    patientSelector.addEventListener('change', () => {
        const patientId = patientSelector.value;
        
        if (patientId) {
            // Get the currently active page
            const activePage = document.querySelector('.nav-links a.active').getAttribute('data-page');
            
            // Load the appropriate content
            switch (activePage) {
                case 'dashboard':
                    loadDashboard(patientId);
                    break;
                case 'patient-profile':
                    loadPatientProfile(patientId);
                    break;
                case 'historical-data':
                    loadHistoricalData(patientId);
                    break;
                case 'analytics':
                    loadAnalytics(patientId);
                    break;
                case 'health-assistant':
                    initializeHealthAssistant(patientId);
                    break;
            }
            
            // Update patient details in sidebar
            updatePatientDetails(patientId);
        }
    });
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tab buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab panels
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Show the selected tab panel
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-panel`).classList.add('active');
        });
    });
    
    // Time window changes for charts
    document.getElementById('time-window').addEventListener('change', () => {
        const patientId = patientSelector.value;
        if (patientId) {
            updateCharts(patientId);
        }
    });
    
    // Initialize Health Assistant functionality
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const symptomInput = document.getElementById('symptom-input');
    const addSymptomBtn = document.getElementById('add-symptom-btn');
    const analyzeBtn = document.getElementById('analyze-symptoms-btn');
    const selectedSymptoms = document.getElementById('selected-symptoms');
    
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const messageInput = document.getElementById('chat-message');
            const message = messageInput.value.trim();
            
            if (message) {
                // Add user message to chat
                addChatMessage('user', message);
                
                // Clear input
                messageInput.value = '';
                
                // Get response from health assistant
                const response = getHealthAssistantResponse(message);
                
                // Add assistant response to chat
                setTimeout(() => {
                    addChatMessage('assistant', response);
                    
                    // Scroll to bottom of chat
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 500);
            }
        });
    }
    
    if (addSymptomBtn) {
        addSymptomBtn.addEventListener('click', () => {
            const symptom = symptomInput.value.trim().toLowerCase();
            
            if (symptom) {
                addSymptom(symptom);
                symptomInput.value = '';
            }
        });
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const symptoms = Array.from(document.querySelectorAll('.symptom-tag'))
                .map(tag => tag.textContent.replace('×', '').trim());
            
            if (symptoms.length > 0) {
                const analysis = analyzeSymptoms(symptoms);
                
                // Add analysis to chat
                addChatMessage('assistant', analysis);
                
                // Scroll to bottom of chat
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }
});

// Authentication Functions
function hashPassword(password) {
    // This is a simple hash for demo purposes only
    // In a real app, use a proper hashing library
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username] && users[username].password === hashPassword(password)) {
        // Store current user info in localStorage (except password)
        const { password: _, ...userInfo } = users[username];
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        return true;
    }
    
    return false;
}

function registerUser(username, password, role, name) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Check if username already exists
    if (users[username]) {
        return false;
    }
    
    // Add new user
    users[username] = {
        username,
        password: hashPassword(password),
        role,
        name: name || username
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

// Patient Data Functions
function loadPatients() {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patientSelector = document.getElementById('patient-selector');
    
    // Clear existing options
    patientSelector.innerHTML = '';
    
    // Add patients to selector
    Object.keys(patients).forEach(patientId => {
        const option = document.createElement('option');
        option.value = patientId;
        option.textContent = patients[patientId].name;
        patientSelector.appendChild(option);
    });
    
    // Select first patient by default
    if (patientSelector.options.length > 0) {
        patientSelector.selectedIndex = 0;
        const firstPatientId = patientSelector.value;
        updatePatientDetails(firstPatientId);
        loadDashboard(firstPatientId);
    }
}

function updatePatientDetails(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    const detailsContainer = document.getElementById('patient-details');
    
    if (patient) {
        detailsContainer.innerHTML = `
            <p><strong>ID:</strong> ${patientId}</p>
            <p><strong>Name:</strong> ${patient.name}</p>
            <p><strong>Age:</strong> ${patient.age}</p>
            <p><strong>Gender:</strong> ${patient.gender}</p>
            <p><strong>Blood Type:</strong> ${patient.bloodType}</p>
            <p><strong>Room:</strong> ${patient.room}</p>
        `;
    }
}

// Dashboard Loading Functions
function loadDashboard(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    
    if (patient) {
        // Update patient name on dashboard
        document.getElementById('dashboard-patient-name').textContent = patient.name;
        
        // Create gauges for vital signs
        createGauges(patient);
        
        // Create assessments for vital signs
        createAssessments(patient);
        
        // Update charts
        updateCharts(patientId);
    }
}

function createGauges(patient) {
    // Heart Rate Gauge
    createGauge('heart-rate-gauge', {
        title: 'Heart Rate',
        value: patient.vitals.heartRate.current,
        min: 40,
        max: 160,
        thresholds: { low: 60, high: 100 },
        unit: 'bpm',
        subtext: assessHeartRate(patient.vitals.heartRate.current)
    });
    
    // Blood Pressure Gauge
    createGauge('blood-pressure-gauge', {
        title: 'Blood Pressure',
        value: patient.vitals.bloodPressure.systolic,
        min: 80,
        max: 200,
        thresholds: { low: 90, high: 140 },
        unit: 'mmHg',
        subtext: `${patient.vitals.bloodPressure.systolic}/${patient.vitals.bloodPressure.diastolic} mmHg`
    });
    
    // Oxygen Gauge
    createGauge('oxygen-gauge', {
        title: 'Oxygen Saturation',
        value: patient.vitals.oxygenSaturation.current,
        min: 80,
        max: 100,
        thresholds: { low: 94, high: 100 },
        unit: '%',
        subtext: assessOxygenSaturation(patient.vitals.oxygenSaturation.current),
        decreasing: true
    });
    
    // Temperature Gauge
    createGauge('temperature-gauge', {
        title: 'Body Temperature',
        value: patient.vitals.temperature.current,
        min: 95,
        max: 104,
        thresholds: { low: 97, high: 99.5 },
        unit: '°F',
        subtext: assessTemperature(patient.vitals.temperature.current)
    });
    
    // Respiratory Gauge
    createGauge('respiratory-gauge', {
        title: 'Respiratory Rate',
        value: patient.vitals.respiratoryRate.current,
        min: 8,
        max: 30,
        thresholds: { low: 12, high: 20 },
        unit: 'bpm',
        subtext: assessRespiratoryRate(patient.vitals.respiratoryRate.current)
    });
    
    // Glucose Gauge
    createGauge('glucose-gauge', {
        title: 'Blood Glucose',
        value: patient.vitals.glucose.current,
        min: 60,
        max: 240,
        thresholds: { low: 70, high: 140 },
        unit: 'mg/dL',
        subtext: assessGlucose(patient.vitals.glucose.current)
    });
}

function createGauge(elementId, config) {
    const { title, value, min, max, thresholds, unit, subtext, decreasing = false } = config;
    
    // Determine color based on thresholds
    let color;
    
    if (decreasing) {
        // For metrics where lower values are concerning (e.g., oxygen)
        if (value < thresholds.low) {
            color = '#dc3545'; // danger
        } else {
            color = '#28a745'; // success
        }
    } else {
        // For metrics where both low and high values are concerning
        if (value < thresholds.low || value > thresholds.high) {
            color = '#dc3545'; // danger
        } else {
            color = '#28a745'; // success
        }
    }
    
    // Create gauge using Plotly
    const data = [{
        type: 'indicator',
        mode: 'gauge+number',
        value: value,
        title: { text: title, font: { size: 18 } },
        gauge: {
            axis: { range: [min, max], tickwidth: 1 },
            bar: { color: color },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "#eee",
            steps: decreasing ? 
                [
                    { range: [min, thresholds.low], color: "#ffdddd" },
                    { range: [thresholds.low, max], color: "#ddffdd" }
                ] : 
                [
                    { range: [min, thresholds.low], color: "#ffdddd" },
                    { range: [thresholds.low, thresholds.high], color: "#ddffdd" },
                    { range: [thresholds.high, max], color: "#ffdddd" }
                ],
            threshold: {
                line: { color: "red", width: 2 },
                thickness: 0.75,
                value: decreasing ? thresholds.low : thresholds.high
            }
        }
    }];
    
    const layout = {
        margin: { t: 25, b: 25, l: 25, r: 25 },
        font: { size: 12 },
        annotations: [{
            text: `${unit}<br>${subtext}`,
            x: 0.5,
            y: 0.85,
            showarrow: false,
            font: { size: 14 }
        }]
    };
    
    Plotly.newPlot(elementId, data, layout, { displayModeBar: false, responsive: true });
}

function createAssessments(patient) {
    // Heart Rate Assessment
    document.getElementById('heart-rate-assessment').innerHTML = `
        <h4><i class="fas fa-heartbeat"></i> Heart Rate</h4>
        <p class="${getAssessmentClass(patient.vitals.heartRate.current, 60, 100)}">
            Current: ${patient.vitals.heartRate.current} bpm<br>
            ${assessHeartRate(patient.vitals.heartRate.current)}
        </p>
        <p>Trend: ${getTrendText(patient.vitals.heartRate.trend)}</p>
    `;
    
    // Blood Pressure Assessment
    document.getElementById('blood-pressure-assessment').innerHTML = `
        <h4><i class="fas fa-stethoscope"></i> Blood Pressure</h4>
        <p class="${getAssessmentClass(patient.vitals.bloodPressure.systolic, 90, 140)}">
            Current: ${patient.vitals.bloodPressure.systolic}/${patient.vitals.bloodPressure.diastolic} mmHg<br>
            ${assessBloodPressure(patient.vitals.bloodPressure.systolic, patient.vitals.bloodPressure.diastolic)}
        </p>
        <p>Trend: ${getTrendText(patient.vitals.bloodPressure.trend)}</p>
    `;
    
    // Oxygen Assessment
    document.getElementById('oxygen-assessment').innerHTML = `
        <h4><i class="fas fa-wind"></i> Oxygen Saturation</h4>
        <p class="${getAssessmentClass(patient.vitals.oxygenSaturation.current, 94, 100, true)}">
            Current: ${patient.vitals.oxygenSaturation.current}%<br>
            ${assessOxygenSaturation(patient.vitals.oxygenSaturation.current)}
        </p>
        <p>Trend: ${getTrendText(patient.vitals.oxygenSaturation.trend)}</p>
    `;
    
    // Temperature Assessment
    document.getElementById('temperature-assessment').innerHTML = `
        <h4><i class="fas fa-thermometer-half"></i> Temperature</h4>
        <p class="${getAssessmentClass(patient.vitals.temperature.current, 97, 99.5)}">
            Current: ${patient.vitals.temperature.current}°F<br>
            ${assessTemperature(patient.vitals.temperature.current)}
        </p>
        <p>Trend: ${getTrendText(patient.vitals.temperature.trend)}</p>
    `;
}

function updateCharts(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    const timeWindow = parseInt(document.getElementById('time-window').value);
    
    if (patient && patient.history) {
        // Filter history based on time window
        const filteredHistory = patient.history.slice(-timeWindow);
        
        // Format timestamps
        const timestamps = filteredHistory.map(h => formatTimestamp(h.timestamp));
        
        // Heart Rate Chart
        const heartRateValues = filteredHistory.map(h => h.heartRate);
        createLineChart('heart-rate-chart', 'Heart Rate Over Time', timestamps, [heartRateValues], ['Heart Rate'], 'bpm');
        
        // Blood Pressure Chart
        const systolicValues = filteredHistory.map(h => h.bloodPressure.systolic);
        const diastolicValues = filteredHistory.map(h => h.bloodPressure.diastolic);
        createLineChart('blood-pressure-chart', 'Blood Pressure Over Time', timestamps, [systolicValues, diastolicValues], ['Systolic', 'Diastolic'], 'mmHg');
        
        // Oxygen Chart
        const oxygenValues = filteredHistory.map(h => h.oxygenSaturation);
        createLineChart('oxygen-chart', 'Oxygen Saturation Over Time', timestamps, [oxygenValues], ['SpO2'], '%');
        
        // Respiratory Chart
        const respiratoryValues = filteredHistory.map(h => h.respiratoryRate);
        createLineChart('respiratory-chart', 'Respiratory Rate Over Time', timestamps, [respiratoryValues], ['Respiratory Rate'], 'bpm');
        
        // Temperature Chart
        const temperatureValues = filteredHistory.map(h => h.temperature);
        createLineChart('temperature-chart', 'Temperature Over Time', timestamps, [temperatureValues], ['Temperature'], '°F');
        
        // Glucose Chart
        const glucoseValues = filteredHistory.map(h => h.glucose);
        createLineChart('glucose-chart', 'Blood Glucose Over Time', timestamps, [glucoseValues], ['Glucose'], 'mg/dL');
    }
}

function createLineChart(elementId, title, xValues, yValuesArray, labels, unit) {
    const traces = [];
    
    for (let i = 0; i < yValuesArray.length; i++) {
        traces.push({
            x: xValues,
            y: yValuesArray[i],
            mode: 'lines+markers',
            name: labels[i],
            line: {
                width: 3,
                shape: 'spline'
            }
        });
    }
    
    const layout = {
        title: title,
        xaxis: {
            title: 'Time',
            showgrid: true,
            gridcolor: '#e9ecef'
        },
        yaxis: {
            title: unit,
            showgrid: true,
            gridcolor: '#e9ecef'
        },
        margin: { t: 50, b: 50, l: 50, r: 20 },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
        showlegend: yValuesArray.length > 1
    };
    
    Plotly.newPlot(elementId, traces, layout, { responsive: true });
}

// Patient Profile Functions
function loadPatientProfile(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    
    if (patient) {
        document.getElementById('patient-profile-content').innerHTML = `
            <div class="patient-card">
                <div class="section-header">
                    <h3>Personal Information</h3>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <strong>Full Name:</strong> ${patient.name}
                    </div>
                    <div class="profile-item">
                        <strong>Patient ID:</strong> ${patientId}
                    </div>
                    <div class="profile-item">
                        <strong>Date of Birth:</strong> ${patient.dob}
                    </div>
                    <div class="profile-item">
                        <strong>Age:</strong> ${patient.age}
                    </div>
                    <div class="profile-item">
                        <strong>Gender:</strong> ${patient.gender}
                    </div>
                    <div class="profile-item">
                        <strong>Blood Type:</strong> ${patient.bloodType}
                    </div>
                    <div class="profile-item">
                        <strong>Height:</strong> ${patient.height} cm
                    </div>
                    <div class="profile-item">
                        <strong>Weight:</strong> ${patient.weight} kg
                    </div>
                    <div class="profile-item">
                        <strong>BMI:</strong> ${calculateBMI(patient.height, patient.weight)}
                    </div>
                </div>
                
                <hr>
                
                <div class="section-header">
                    <h3>Medical Information</h3>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <strong>Allergies:</strong> ${patient.allergies.join(', ') || 'None reported'}
                    </div>
                    <div class="profile-item">
                        <strong>Current Medications:</strong> ${patient.medications.join(', ') || 'None'}
                    </div>
                    <div class="profile-item">
                        <strong>Chronic Conditions:</strong> ${patient.conditions.join(', ') || 'None reported'}
                    </div>
                    <div class="profile-item">
                        <strong>Primary Physician:</strong> ${patient.primaryPhysician}
                    </div>
                </div>
                
                <hr>
                
                <div class="section-header">
                    <h3>Recent Notes</h3>
                </div>
                <div class="notes-list">
                    ${generateNotesList(patient.notes)}
                </div>
            </div>
        `;
    }
}

// Historical Data Functions
function loadHistoricalData(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    
    if (patient) {
        document.getElementById('historical-data-content').innerHTML = `
            <div class="section-header">
                <h3>Recent Vital Signs History</h3>
                <button id="export-data-btn" class="btn-secondary">Export Data</button>
            </div>
            
            <div class="data-filters">
                <div class="form-group">
                    <label>Date Range:</label>
                    <select id="date-range">
                        <option value="7">Last Week</option>
                        <option value="30" selected>Last Month</option>
                        <option value="90">Last 3 Months</option>
                        <option value="all">All Available Data</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Group By:</label>
                    <select id="group-by">
                        <option value="hour">Hour</option>
                        <option value="day" selected>Day</option>
                        <option value="week">Week</option>
                    </select>
                </div>
                <button id="filter-data-btn" class="btn-primary">Apply Filters</button>
            </div>
            
            <div class="historical-table-container">
                <table class="historical-table">
                    <thead>
                        <tr>
                            <th>Date/Time</th>
                            <th>Heart Rate</th>
                            <th>Blood Pressure</th>
                            <th>Oxygen</th>
                            <th>Respiratory</th>
                            <th>Temperature</th>
                            <th>Glucose</th>
                        </tr>
                    </thead>
                    <tbody id="historical-table-body">
                        ${generateHistoricalTable(patient.history)}
                    </tbody>
                </table>
            </div>
            
            <hr>
            
            <div class="anomaly-detection">
                <div class="section-header">
                    <h3>Anomaly Detection</h3>
                    <button id="detect-anomalies-btn" class="btn-primary">Detect Anomalies</button>
                </div>
                <div id="anomalies-container"></div>
            </div>
        `;
        
        // Initialize event listeners for historical data page
        document.getElementById('filter-data-btn').addEventListener('click', () => {
            const dateRange = document.getElementById('date-range').value;
            const groupBy = document.getElementById('group-by').value;
            
            // Update the table with filtered data
            const filteredData = filterHistoricalData(patient.history, dateRange, groupBy);
            document.getElementById('historical-table-body').innerHTML = generateHistoricalTable(filteredData);
        });
        
        document.getElementById('detect-anomalies-btn').addEventListener('click', () => {
            const anomalies = detectAnomalies(patient.history);
            displayAnomalies(anomalies);
        });
        
        document.getElementById('export-data-btn').addEventListener('click', () => {
            exportData(patient);
        });
    }
}

// Analytics Functions
function loadAnalytics(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    
    if (patient) {
        document.getElementById('analytics-content').innerHTML = `
            <div class="section-header">
                <h3>Vital Signs Trends</h3>
                <select id="analytics-time-frame">
                    <option value="7">Last 7 Days</option>
                    <option value="30" selected>Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h4>Heart Rate Analysis</h4>
                    <div id="heart-rate-analytics" class="analytics-chart"></div>
                    <div id="heart-rate-insights" class="analytics-insights"></div>
                </div>
                
                <div class="analytics-card">
                    <h4>Blood Pressure Analysis</h4>
                    <div id="blood-pressure-analytics" class="analytics-chart"></div>
                    <div id="blood-pressure-insights" class="analytics-insights"></div>
                </div>
                
                <div class="analytics-card">
                    <h4>Recovery Patterns</h4>
                    <div id="recovery-analytics" class="analytics-chart"></div>
                    <div id="recovery-insights" class="analytics-insights"></div>
                </div>
                
                <div class="analytics-card">
                    <h4>Health Score Trends</h4>
                    <div id="health-score-analytics" class="analytics-chart"></div>
                    <div id="health-score-insights" class="analytics-insights"></div>
                </div>
            </div>
            
            <hr>
            
            <div class="section-header">
                <h3>AI-Powered Health Insights</h3>
            </div>
            
            <div class="insights-container">
                ${generateHealthInsights(patient)}
            </div>
        `;
        
        // Initialize analytics charts
        generateAnalyticsCharts(patient);
        
        // Add event listener for time frame changes
        document.getElementById('analytics-time-frame').addEventListener('change', () => {
            generateAnalyticsCharts(patient);
        });
    }
}

// Health Assistant Functions
function initializeHealthAssistant(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '{}');
    const patient = patients[patientId];
    
    // Clear previous messages and symptoms
    const chatMessagesEl = document.getElementById('chat-messages');
    if (chatMessagesEl) {
        chatMessagesEl.innerHTML = '';
    }
    
    const selectedSymptomsEl = document.getElementById('selected-symptoms');
    if (selectedSymptomsEl) {
        selectedSymptomsEl.innerHTML = '';
    }
    
    const analyzeBtn = document.getElementById('analyze-symptoms-btn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }
    
    // Add welcome message
    addChatMessage('assistant', `Hello! I'm your health assistant. I can provide information about health conditions, vital signs, nutrition, exercise, or general health guidance. How can I help you today?`);
    
    if (patient) {
        // Add patient context
        const patientContext = `I'm viewing information for ${patient.name}, a ${patient.age}-year-old ${patient.gender.toLowerCase()} with ${patient.conditions.length > 0 ? 'conditions including ' + patient.conditions.join(', ') : 'no known chronic conditions'}.`;
        
        addChatMessage('assistant', `I see you're currently viewing information for ${patient.name}. If you have any questions about their health data or general health inquiries, feel free to ask.`);
    }
}

function addChatMessage(type, message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return; // Exit if chat-messages element doesn't exist
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type}-message`;
    
    // Convert markdown-style formatting to HTML
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    message = message.replace(/\n\n/g, '<br><br>');
    message = message.replace(/\n/g, '<br>');
    
    messageEl.innerHTML = message;
    chatMessages.appendChild(messageEl);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Medical knowledge database for common conditions
const MEDICAL_KNOWLEDGE = {
    "common_cold": {
        "name": "Common Cold",
        "symptoms": ["cough", "runny nose", "sneezing", "sore throat", "congestion", "mild fever", "headache", "body aches"],
        "causes": "Viruses, most commonly rhinoviruses",
        "treatment": "Rest, fluids, over-the-counter medications for symptom relief",
        "when_to_see_doctor": "If symptoms worsen after 10 days, fever above 101.3°F (38.5°C), or if symptoms are severe",
        "prevention": "Frequent handwashing, avoiding close contact with sick people, not touching your face"
    },
    "flu": {
        "name": "Influenza (Flu)",
        "symptoms": ["high fever", "chills", "body aches", "fatigue", "headache", "cough", "sore throat", "runny nose"],
        "causes": "Influenza viruses (typically A or B)",
        "treatment": "Rest, fluids, antiviral medications if prescribed early",
        "when_to_see_doctor": "If experiencing difficulty breathing, persistent fever, severe weakness, or worsening symptoms",
        "prevention": "Annual flu vaccination, good hygiene practices, avoiding close contact with sick individuals"
    },
    "covid19": {
        "name": "COVID-19",
        "symptoms": ["fever", "cough", "shortness of breath", "fatigue", "body aches", "headache", "loss of taste", "loss of smell", "sore throat"],
        "causes": "SARS-CoV-2 virus",
        "treatment": "Rest, fluids, fever reducers, prescribed treatments for severe cases",
        "when_to_see_doctor": "Difficulty breathing, persistent chest pain/pressure, confusion, inability to stay awake, bluish lips or face",
        "prevention": "Vaccination, physical distancing, masks in high-risk situations, good ventilation, hand hygiene"
    },
    "allergies": {
        "name": "Allergies",
        "symptoms": ["sneezing", "itching", "runny nose", "congestion", "watery eyes", "rash", "hives"],
        "causes": "Immune system reaction to allergens like pollen, dust, pet dander, foods",
        "treatment": "Antihistamines, decongestants, nasal steroids, avoiding allergens",
        "when_to_see_doctor": "If symptoms interfere with daily life or if experiencing severe allergic reaction symptoms",
        "prevention": "Allergen avoidance, air filtration, regular cleaning to reduce allergens"
    },
    "hypertension": {
        "name": "Hypertension (High Blood Pressure)",
        "symptoms": ["headache", "shortness of breath", "nosebleeds", "often no symptoms"],
        "causes": "Genetics, age, diet high in sodium, obesity, stress, lack of exercise, other medical conditions",
        "treatment": "Lifestyle changes, medication as prescribed by doctors",
        "when_to_see_doctor": "Regular monitoring, immediate care if BP exceeds 180/120 with symptoms",
        "prevention": "Healthy diet low in sodium, regular exercise, maintain healthy weight, limit alcohol, avoid smoking"
    },
    "diabetes": {
        "name": "Diabetes",
        "symptoms": ["excessive thirst", "frequent urination", "hunger", "fatigue", "blurred vision", "slow-healing sores"],
        "causes": "Type 1: Immune system attacks insulin-producing cells; Type 2: Cells become resistant to insulin",
        "treatment": "Blood sugar monitoring, insulin therapy, oral medications, diet, exercise",
        "when_to_see_doctor": "If experiencing persistent symptoms or known diabetics with blood sugar outside target range",
        "prevention": "Type 2: Healthy weight, regular exercise, balanced diet; Type 1: Not currently preventable"
    },
    "anxiety": {
        "name": "Anxiety Disorders",
        "symptoms": ["excessive worry", "restlessness", "fatigue", "difficulty concentrating", "irritability", "muscle tension", "sleep problems"],
        "causes": "Genetics, brain chemistry, personality, life events, stress",
        "treatment": "Psychotherapy, medication, stress management techniques",
        "when_to_see_doctor": "When anxiety interferes with daily activities or causes significant distress",
        "prevention": "Stress management, regular exercise, healthy sleep habits, limiting caffeine and alcohol"
    },
    "migraine": {
        "name": "Migraine",
        "symptoms": ["severe headache", "throbbing pain", "nausea", "vomiting", "sensitivity to light", "sensitivity to sound"],
        "causes": "Genetic and environmental factors, hormonal changes, certain foods, stress, sensory stimuli",
        "treatment": "Pain relievers, preventive medications, rest in dark quiet room",
        "when_to_see_doctor": "Severe headaches that don't respond to over-the-counter treatment, or new pattern of headaches",
        "prevention": "Identify and avoid triggers, maintain regular sleep schedule, manage stress, preventive medications"
    },
    "strep_throat": {
        "name": "Strep Throat",
        "symptoms": ["sore throat", "painful swallowing", "fever", "red and swollen tonsils", "small red spots on roof of mouth", "swollen lymph nodes"],
        "causes": "Group A Streptococcus bacteria",
        "treatment": "Antibiotics, rest, fluids, pain relievers",
        "when_to_see_doctor": "Sore throat with fever, swollen lymph nodes, no cough or cold symptoms",
        "prevention": "Regular handwashing, avoid sharing utensils or drinks, replace toothbrush after illness"
    },
    "bronchitis": {
        "name": "Bronchitis",
        "symptoms": ["persistent cough", "mucus production", "fatigue", "shortness of breath", "mild fever", "chest discomfort"],
        "causes": "Viral infection, bacteria (less common), irritants like smoke or pollution",
        "treatment": "Rest, fluids, over-the-counter pain relievers, humidifier, antibiotics only if bacterial",
        "when_to_see_doctor": "Cough lasting more than 3 weeks, fever above 100.4°F (38°C), producing discolored mucus, or trouble breathing",
        "prevention": "Avoid smoking, get vaccinated for flu and pneumonia, wash hands frequently"
    },
    "gastroenteritis": {
        "name": "Gastroenteritis (Stomach Flu)",
        "symptoms": ["diarrhea", "nausea", "vomiting", "stomach pain", "cramping", "fever", "headache", "body aches"],
        "causes": "Viruses, bacteria, parasites, or food reactions",
        "treatment": "Fluids, rest, gradual return to normal diet, medication for specific symptoms",
        "when_to_see_doctor": "Signs of dehydration, blood in stool, fever above 102°F (39°C), severe abdominal pain",
        "prevention": "Proper handwashing, food safety, avoid close contact with infected individuals"
    }
};

// Health information database for general health queries
const HEALTH_INFO = {
    "heart_rate": {
        "normal_range": "60-100 beats per minute for adults at rest",
        "high": "Tachycardia is a heart rate over 100 beats per minute. Could indicate stress, exercise, fever, anxiety, or certain heart conditions.",
        "low": "Bradycardia is a heart rate below 60 beats per minute. Common in physically active people, but could indicate heart problems."
    },
    "blood_pressure": {
        "normal_range": "Less than 120/80 mmHg",
        "elevated": "Systolic between 120-129 and diastolic less than 80",
        "high_stage1": "Systolic between 130-139 or diastolic between 80-89",
        "high_stage2": "Systolic at least 140 or diastolic at least 90",
        "crisis": "Systolic over 180 and/or diastolic over 120"
    },
    "oxygen_saturation": {
        "normal_range": "95-100%",
        "concerning": "Below 95% may indicate a health issue",
        "emergency": "Below 90% is a medical emergency requiring immediate attention"
    },
    "temperature": {
        "normal_range": "97.7-99.5°F (36.5-37.5°C)",
        "fever": "Above 100.4°F (38°C)",
        "high_fever": "Above 103°F (39.4°C)"
    },
    "lifestyle": {
        "exercise": "Adults should aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities twice weekly.",
        "diet": "A healthy diet includes vegetables, fruits, whole grains, lean protein, and healthy fats, while limiting sodium, added sugars, and saturated fats.",
        "sleep": "Adults typically need 7-9 hours of sleep per night. Consistent sleep schedule and good sleep environment are important.",
        "stress": "Chronic stress can contribute to health problems. Stress management techniques include mindfulness, exercise, social connection, and setting boundaries."
    }
};

// Nutritional information
const NUTRITION_INFO = {
    "protein": "Essential for building and repairing tissues. Good sources include meat, fish, eggs, dairy, legumes, and nuts. Adults should consume 0.8g per kg of body weight daily.",
    "carbohydrates": "Main energy source for the body. Choose complex carbs like whole grains, fruits, and vegetables over simple carbs like sugar and refined grains.",
    "fat": "Important for hormone production and nutrient absorption. Focus on unsaturated fats (olive oil, avocados, nuts) and limit saturated fats (fatty meats, full-fat dairy).",
    "fiber": "Aids digestion and helps maintain healthy cholesterol. Adults should consume 25-30g daily from fruits, vegetables, legumes, and whole grains.",
    "water": "Essential for all bodily functions. Most people need 8-10 cups (2-2.5 liters) of water daily, though needs vary based on activity level and climate.",
    "vitamins": "Micronutrients essential for various biological processes. A varied, colorful diet typically provides sufficient vitamins for most people."
};

// Mental health information
const MENTAL_HEALTH_INFO = {
    "depression": "A mood disorder characterized by persistent feelings of sadness, hopelessness, and loss of interest in activities. Treatment options include therapy, medication, and lifestyle changes.",
    "anxiety": "Characterized by excessive worry and fear that interferes with daily activities. Can manifest as generalized anxiety, panic disorder, social anxiety, or specific phobias.",
    "stress_management": "Techniques include deep breathing, meditation, physical activity, adequate sleep, setting boundaries, and seeking social support.",
    "mindfulness": "The practice of being fully present and engaged in the moment, aware of thoughts and feelings without judgment. Can reduce stress and improve overall well-being."
};

// Exercise information
const EXERCISE_INFO = {
    "cardio": "Activities like walking, running, cycling, and swimming that increase heart rate and improve cardiovascular health. Aim for 150 minutes of moderate or 75 minutes of vigorous activity weekly.",
    "strength_training": "Resistance exercises that build muscle and bone density. Include 2-3 sessions weekly targeting all major muscle groups.",
    "flexibility": "Stretching exercises that improve range of motion and prevent injury. Include activities like yoga or dedicated stretching sessions several times weekly.",
    "balance": "Exercises that improve stability and prevent falls, especially important for older adults. Examples include tai chi, yoga, and specific balance exercises."
};

function getHealthAssistantResponse(prompt) {
    // Clean prompt
    prompt = prompt.toLowerCase().trim();
    
    // Check if it's a greeting
    if (/^(hello|hi|hey|greetings)/.test(prompt)) {
        return "Hello! I'm your health assistant. How can I help you today? You can ask me about health conditions, vital signs, nutrition, exercise, or general health information.";
    }
    
    // Check for heart rate related questions
    if (/(heart rate|pulse|bpm|beats per minute)/.test(prompt)) {
        const info = HEALTH_INFO["heart_rate"];
        return `Heart rate refers to how many times your heart beats per minute.

Normal range: ${info.normal_range}

High heart rate: ${info.high}

Low heart rate: ${info.low}

Many factors can affect heart rate including age, activity level, medication, and stress.`;
    }
    
    // Check for blood pressure related questions
    if (/(blood pressure|hypertension|bp|systolic|diastolic)/.test(prompt)) {
        const info = HEALTH_INFO["blood_pressure"];
        return `Blood pressure is the force of blood against the walls of arteries.

Normal: ${info.normal_range}

Elevated: ${info.elevated}

High Blood Pressure Stage 1: ${info.high_stage1}

High Blood Pressure Stage 2: ${info.high_stage2}

Hypertensive Crisis: ${info.crisis} (seek immediate medical attention)

Lifestyle factors that can help manage blood pressure include regular physical activity, healthy diet low in sodium, limiting alcohol, avoiding tobacco, and managing stress.`;
    }
    
    // Check for oxygen saturation related questions
    if (/(oxygen|o2|saturation|spo2|pulse ox)/.test(prompt)) {
        const info = HEALTH_INFO["oxygen_saturation"];
        return `Oxygen saturation (SpO2) measures the percentage of hemoglobin binding sites in the bloodstream occupied by oxygen.

Normal range: ${info.normal_range}

Concerning level: ${info.concerning}

Emergency level: ${info.emergency}

Low oxygen levels may cause shortness of breath, confusion, or bluish discoloration of skin.`;
    }
    
    // Check for temperature related questions
    if (/(temperature|fever|celsius|fahrenheit|thermometer)/.test(prompt)) {
        const info = HEALTH_INFO["temperature"];
        return `Body temperature is a measure of the body's ability to generate and get rid of heat.

Normal range: ${info.normal_range}

Fever: ${info.fever}

High fever: ${info.high_fever}

Fever is the body's natural response to infection. Rest, fluids, and fever-reducing medication can help manage fever symptoms.`;
    }
    
    // Check for exercise questions
    if (/(exercise|workout|fitness|physical activity|cardio|strength training)/.test(prompt)) {
        if (/cardio/.test(prompt)) {
            return `**Cardiovascular Exercise**

${EXERCISE_INFO.cardio}

Benefits include improved heart health, increased lung capacity, better circulation, and reduced risk of chronic diseases.

Examples: Walking, jogging, swimming, cycling, dancing, rowing, and team sports.

Getting started: Begin with 10-15 minutes of moderate activity and gradually increase duration and intensity.`;
        } else if (/(strength|weight|resistance|muscle)/.test(prompt)) {
            return `**Strength Training**

${EXERCISE_INFO.strength_training}

Benefits include increased muscle mass, stronger bones, improved metabolism, and better functional strength for daily activities.

Examples: Free weights, resistance bands, weight machines, bodyweight exercises like push-ups and squats.

Getting started: Begin with lighter weights and focus on proper form before increasing resistance.`;
        } else {
            return `**Physical Activity Recommendations**

Adults should aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities twice weekly.

Types of exercise to include in a balanced fitness routine:
- Cardiovascular/aerobic exercise: ${EXERCISE_INFO.cardio.split('.')[0]}.
- Strength training: ${EXERCISE_INFO.strength_training.split('.')[0]}.
- Flexibility: ${EXERCISE_INFO.flexibility.split('.')[0]}.
- Balance: ${EXERCISE_INFO.balance.split('.')[0]}.

The best exercise program is one that you enjoy and can maintain consistently.`;
        }
    }
    
    // Check for nutrition questions
    if (/(nutrition|diet|food|eating|healthy eating|protein|carb|fat|vitamin|mineral)/.test(prompt)) {
        if (/protein/.test(prompt)) {
            return `**Protein**

${NUTRITION_INFO.protein}

Good sources include:
- Animal-based: Chicken, turkey, fish, eggs, dairy products
- Plant-based: Beans, lentils, chickpeas, tofu, tempeh, nuts, seeds

Protein is essential for muscle repair and growth, enzyme and hormone production, and immune function.`;
        } else if (/(carb|carbohydrate)/.test(prompt)) {
            return `**Carbohydrates**

${NUTRITION_INFO.carbohydrates}

Healthy sources include:
- Whole grains: Brown rice, quinoa, oats, whole wheat bread
- Fruits: All fresh fruits, especially berries
- Vegetables: All vegetables, especially starchy ones like sweet potatoes
- Legumes: Beans, lentils, chickpeas

Carbohydrates are the body's primary energy source, especially for brain function and high-intensity exercise.`;
        } else if (/fat/.test(prompt)) {
            return `**Dietary Fats**

${NUTRITION_INFO.fat}

Healthy fat sources:
- Monounsaturated fats: Olive oil, avocados, nuts
- Polyunsaturated fats: Fatty fish, flaxseeds, walnuts
- Omega-3 fatty acids: Salmon, sardines, chia seeds

Fats to limit:
- Saturated fats: Fatty meats, full-fat dairy, coconut oil
- Trans fats: Some processed foods, fried fast foods

Healthy fats support brain health, cell function, and absorption of fat-soluble vitamins.`;
        } else {
            return `**Balanced Nutrition Guidelines**

A healthy diet incorporates a variety of foods from all food groups:

1. Fruits and vegetables: Fill half your plate with colorful varieties
2. Whole grains: Make at least half your grains whole
3. Protein: Include lean protein sources like poultry, fish, beans, or nuts
4. Dairy: Choose low-fat or fat-free options when possible
5. Healthy fats: Incorporate sources like olive oil, avocados, and nuts

Limit added sugars, sodium, saturated fats, and ultra-processed foods. Focus on whole, minimally processed foods whenever possible.

Water should be your primary beverage - aim for 8-10 cups daily.`;
        }
    }
    
    // Check for mental health questions
    if (/(mental health|stress|anxiety|depression|mindfulness|meditation)/.test(prompt)) {
        if (/(stress|stress management)/.test(prompt)) {
            return `**Stress Management**

${MENTAL_HEALTH_INFO.stress_management}

Effective stress management techniques:
- Deep breathing exercises: Try the 4-7-8 technique (inhale 4 seconds, hold 7 seconds, exhale 8 seconds)
- Progressive muscle relaxation: Tense and then release each muscle group
- Physical activity: Even short walks can reduce stress hormones
- Mindfulness practices: Meditation, focused attention on present moment
- Social connection: Talking with supportive friends or family members
- Time management: Setting priorities and boundaries
- Sleep hygiene: Maintaining consistent sleep schedule and bedtime routine

Chronic stress can contribute to health problems including headaches, sleep issues, digestive problems, and increased risk of heart disease.`;
        } else if (/anxiety/.test(prompt)) {
            return `**Anxiety**

${MENTAL_HEALTH_INFO.anxiety}

Common symptoms include:
- Excessive worry about multiple areas of life
- Restlessness or feeling on edge
- Fatigue
- Difficulty concentrating
- Irritability
- Muscle tension
- Sleep disturbances

Management strategies:
- Therapy (especially cognitive-behavioral therapy)
- Mindfulness and meditation
- Regular exercise
- Adequate sleep
- Limiting caffeine and alcohol
- Breathing exercises and progressive muscle relaxation
- Medication when appropriate (consult healthcare provider)

If anxiety is interfering with daily functioning, consider speaking with a mental health professional.`;
        } else if (/depression/.test(prompt)) {
            return `**Depression**

${MENTAL_HEALTH_INFO.depression}

Common symptoms include:
- Persistent sad, anxious, or "empty" mood
- Loss of interest in previously enjoyed activities
- Changes in appetite and weight
- Sleep disturbances
- Fatigue and decreased energy
- Difficulty concentrating or making decisions
- Feelings of hopelessness, worthlessness, or guilt
- Thoughts of death or suicide

Management approaches:
- Professional treatment (therapy, medication, or combination)
- Regular physical activity
- Social connection and support
- Setting small, achievable goals
- Maintaining regular routines
- Healthy diet and adequate sleep

If experiencing depression symptoms, especially thoughts of self-harm, please contact a healthcare provider or crisis helpline immediately.`;
        } else {
            return `**Mental Health and Wellbeing**

Mental health is a crucial component of overall health, affecting how we think, feel, act, handle stress, relate to others, and make choices.

Key aspects of maintaining mental wellbeing:
- Social connections: Regular interaction with supportive people
- Physical activity: Regular exercise improves mood and reduces anxiety
- Stress management: Techniques like mindfulness meditation, deep breathing
- Sleep: Prioritizing quality sleep (7-9 hours for adults)
- Nutrition: Balanced diet with emphasis on foods that support brain health
- Purpose: Engaging in meaningful activities
- Professional support: Therapy or counseling when needed

Mental health conditions are common and treatable. Seeking help is a sign of strength, not weakness.`;
        }
    }
    
    // Check for specific conditions
    for (const condition in MEDICAL_KNOWLEDGE) {
        if (prompt.includes(condition) || prompt.includes(MEDICAL_KNOWLEDGE[condition].name.toLowerCase())) {
            const data = MEDICAL_KNOWLEDGE[condition];
            return `**${data.name}**

**Common symptoms:** ${data.symptoms.join(', ')}

**Causes:** ${data.causes}

**General treatment:** ${data.treatment}

**When to see a doctor:** ${data.when_to_see_doctor}

**Prevention:** ${data.prevention}

*Note: This information is for educational purposes only and should not substitute professional medical advice.*`;
        }
    }
    
    // Default response for unrecognized queries
    return "I can provide information about health conditions, vital signs, nutrition, exercise, mental health, or offer general health guidance. Could you be more specific about what you'd like to know? For example, you can ask about specific conditions like diabetes, healthy eating, exercise recommendations, or how to manage stress.";
}

function addSymptom(symptom) {
    // Get selected symptoms container
    const selectedSymptoms = document.getElementById('selected-symptoms');
    
    // Check if symptom already exists
    const existingSymptoms = Array.from(document.querySelectorAll('.symptom-tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    if (existingSymptoms.includes(symptom)) {
        return;
    }
    
    // Create symptom tag
    const symptomTag = document.createElement('div');
    symptomTag.className = 'symptom-tag';
    symptomTag.innerHTML = `${symptom} <button class="remove-symptom">×</button>`;
    
    // Add event listener to remove button
    symptomTag.querySelector('.remove-symptom').addEventListener('click', () => {
        symptomTag.remove();
        
        // Disable analyze button if no symptoms left
        const symptomsCount = document.querySelectorAll('.symptom-tag').length;
        document.getElementById('analyze-symptoms-btn').disabled = symptomsCount === 0;
    });
    
    // Add to container
    selectedSymptoms.appendChild(symptomTag);
    
    // Enable analyze button
    document.getElementById('analyze-symptoms-btn').disabled = false;
}

function analyzeSymptoms(symptoms) {
    // Check for common colds/flu symptoms
    const coldSymptoms = ['cough', 'runny nose', 'sneezing', 'sore throat', 'congestion', 'mild fever', 'headache'];
    const fluSymptoms = ['high fever', 'chills', 'body aches', 'fatigue', 'headache', 'cough', 'sore throat'];
    const covidSymptoms = ['fever', 'cough', 'shortness of breath', 'fatigue', 'loss of taste', 'loss of smell'];
    const allergySymptoms = ['sneezing', 'itching', 'runny nose', 'congestion', 'watery eyes'];
    
    let coldMatches = 0;
    let fluMatches = 0;
    let covidMatches = 0;
    let allergyMatches = 0;
    
    // Count matching symptoms
    symptoms.forEach(symptom => {
        if (coldSymptoms.includes(symptom)) coldMatches++;
        if (fluSymptoms.includes(symptom)) fluMatches++;
        if (covidSymptoms.includes(symptom)) covidMatches++;
        if (allergySymptoms.includes(symptom)) allergyMatches++;
    });
    
    // Calculate match percentages
    const coldPercent = (coldMatches / coldSymptoms.length) * 100;
    const fluPercent = (fluMatches / fluSymptoms.length) * 100;
    const covidPercent = (covidMatches / covidSymptoms.length) * 100;
    const allergyPercent = (allergyMatches / allergySymptoms.length) * 100;
    
    // Build possible conditions list
    const possibleConditions = [];
    
    if (coldPercent >= 30) possibleConditions.push({ name: 'Common Cold', match: coldPercent });
    if (fluPercent >= 30) possibleConditions.push({ name: 'Influenza (Flu)', match: fluPercent });
    if (covidPercent >= 30) possibleConditions.push({ name: 'COVID-19', match: covidPercent });
    if (allergyPercent >= 30) possibleConditions.push({ name: 'Allergies', match: allergyPercent });
    
    // Check for specific symptom combinations
    if (symptoms.includes('headache') && symptoms.includes('nausea')) {
        possibleConditions.push({ name: 'Migraine', match: 70 });
    }
    
    if (symptoms.includes('chest pain') && symptoms.includes('shortness of breath')) {
        possibleConditions.push({ name: 'Possible cardiac issue', match: 85 });
    }
    
    if (symptoms.includes('diarrhea') && symptoms.includes('vomiting')) {
        possibleConditions.push({ name: 'Gastroenteritis', match: 75 });
    }
    
    // Sort by match percentage
    possibleConditions.sort((a, b) => b.match - a.match);
    
    // Build response
    if (possibleConditions.length > 0) {
        let response = `Based on the symptoms you've described (${symptoms.join(', ')}), here's some information:\n\n`;
        
        response += '**Possible conditions to discuss with your healthcare provider:**\n';
        possibleConditions.slice(0, 5).forEach(condition => {
            response += `- ${condition.name}\n`;
        });
        
        response += '\n**When to seek medical attention:**\n';
        response += '- If symptoms are severe or rapidly worsening\n';
        response += '- If you have difficulty breathing or chest pain\n';
        response += '- If you have high fever that doesn\'t respond to medication\n';
        response += '- If symptoms persist for more than a few days without improvement\n';
        
        response += '\n**General self-care suggestions:**\n';
        response += '- Rest and stay hydrated\n';
        response += '- Over-the-counter pain relievers may help with discomfort\n';
        response += '- Avoid strenuous activities while recovering\n';
        response += '- Monitor your symptoms and track any changes\n';
        
        response += '\n**IMPORTANT DISCLAIMER:**\n';
        response += '*This information is provided for educational purposes only and is not a medical diagnosis. ';
        response += 'The analysis is based on general patterns and should not replace professional medical advice. ';
        response += 'Always consult with a qualified healthcare provider for proper diagnosis and treatment.*';
        
        return response;
    } else {
        return `I don't have enough information to suggest possible conditions based on the symptoms provided (${symptoms.join(', ')}).\n\n` +
               'For a better assessment, please:\n' +
               '- Provide more specific symptoms\n' +
               '- Include details like duration, severity, and any other related symptoms\n\n' +
               'If you\'re experiencing concerning symptoms, it\'s always best to consult with a healthcare professional for proper evaluation.';
    }
}

// Helper Functions
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function calculateBMI(height, weight) {
    // Height in meters
    const heightInMeters = height / 100;
    // BMI formula: weight (kg) / height² (m)
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
}

function getAssessmentClass(value, low, high, decreasing = false) {
    if (decreasing) {
        // For metrics where lower values are concerning (e.g., oxygen)
        return value < low ? 'text-danger' : 'text-success';
    } else {
        // For metrics where both low and high values are concerning
        return value < low || value > high ? 'text-danger' : 'text-success';
    }
}

function getTrendText(trend) {
    switch (trend) {
        case 'increasing':
            return '<span class="text-success"><i class="fas fa-arrow-up"></i> Improving</span>';
        case 'decreasing':
            return '<span class="text-danger"><i class="fas fa-arrow-down"></i> Declining</span>';
        case 'stable':
            return '<span class="text-primary"><i class="fas fa-equals"></i> Stable</span>';
        default:
            return '<span class="text-secondary"><i class="fas fa-minus"></i> No trend data</span>';
    }
}

// Assessment Functions
function assessHeartRate(heartRate) {
    if (heartRate < 60) return 'Below normal range (Bradycardia)';
    if (heartRate > 100) return 'Above normal range (Tachycardia)';
    return 'Within normal range';
}

function assessBloodPressure(systolic, diastolic) {
    if (systolic < 90 || diastolic < 60) return 'Low blood pressure (Hypotension)';
    if (systolic >= 180 || diastolic >= 120) return 'Hypertensive crisis - seek emergency care';
    if (systolic >= 140 || diastolic >= 90) return 'High blood pressure (Stage 2 Hypertension)';
    if (systolic >= 130 || diastolic >= 80) return 'High blood pressure (Stage 1 Hypertension)';
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return 'Elevated blood pressure';
    return 'Normal blood pressure';
}

function assessOxygenSaturation(oxygen) {
    if (oxygen < 90) return 'Severely low - medical emergency';
    if (oxygen < 95) return 'Below normal range - concerning';
    return 'Within normal range';
}

function assessTemperature(temp) {
    if (temp > 103) return 'High grade fever';
    if (temp > 100.4) return 'Fever present';
    if (temp < 97) return 'Below normal range (Hypothermia)';
    return 'Within normal range';
}

function assessRespiratoryRate(rate) {
    if (rate < 12) return 'Below normal range';
    if (rate > 20) return 'Above normal range';
    return 'Within normal range';
}

function assessGlucose(glucose) {
    if (glucose < 70) return 'Below normal range (Hypoglycemia)';
    if (glucose > 180) return 'Above normal range (Hyperglycemia)';
    if (glucose > 140) return 'Slightly elevated';
    return 'Within normal range';
}

// Data Generation Functions
function generatePatients() {
    return {
        'P001': {
            name: 'John Smith',
            gender: 'Male',
            age: 67,
            dob: '04/15/1958',
            height: 178,
            weight: 82,
            bloodType: 'A+',
            room: '203',
            allergies: ['Penicillin', 'Shellfish'],
            medications: ['Lisinopril 10mg', 'Atorvastatin 20mg'],
            conditions: ['Hypertension', 'Hyperlipidemia'],
            primaryPhysician: 'Dr. Jane Williams',
            notes: [
                {
                    date: '2023-04-03',
                    author: 'Dr. Williams',
                    text: 'Patient reports feeling good. Blood pressure controlled with current medication regimen. Continue current plan.'
                },
                {
                    date: '2023-04-01',
                    author: 'Nurse Davis',
                    text: 'Vital signs stable. Patient reports mild ankle swelling in evenings.'
                }
            ],
            vitals: {
                heartRate: { current: 72, trend: 'stable' },
                bloodPressure: { systolic: 132, diastolic: 84, trend: 'decreasing' },
                oxygenSaturation: { current: 97, trend: 'stable' },
                temperature: { current: 98.6, trend: 'stable' },
                respiratoryRate: { current: 14, trend: 'stable' },
                glucose: { current: 118, trend: 'decreasing' }
            },
            history: generateHistoricalData(30)
        },
        'P002': {
            name: 'Mary Johnson',
            gender: 'Female',
            age: 42,
            dob: '09/23/1983',
            height: 165,
            weight: 65,
            bloodType: 'O-',
            room: '108',
            allergies: ['Sulfa drugs'],
            medications: ['Metformin 500mg', 'Levothyroxine 50mcg'],
            conditions: ['Type 2 Diabetes', 'Hypothyroidism'],
            primaryPhysician: 'Dr. Michael Chen',
            notes: [
                {
                    date: '2023-04-02',
                    author: 'Dr. Chen',
                    text: 'Blood glucose levels improved. Thyroid function tests within normal range. Continue current medication doses.'
                },
                {
                    date: '2023-03-25',
                    author: 'Nurse Taylor',
                    text: 'Patient reports fatigue has improved since last visit.'
                }
            ],
            vitals: {
                heartRate: { current: 78, trend: 'stable' },
                bloodPressure: { systolic: 122, diastolic: 78, trend: 'stable' },
                oxygenSaturation: { current: 98, trend: 'stable' },
                temperature: { current: 98.2, trend: 'stable' },
                respiratoryRate: { current: 16, trend: 'stable' },
                glucose: { current: 142, trend: 'decreasing' }
            },
            history: generateHistoricalData(30)
        },
        'P003': {
            name: 'Robert Davis',
            gender: 'Male',
            age: 58,
            dob: '02/10/1967',
            height: 182,
            weight: 95,
            bloodType: 'B+',
            room: '315',
            allergies: [],
            medications: ['Albuterol inhaler', 'Fluticasone 250mcg'],
            conditions: ['Asthma', 'Seasonal Allergies'],
            primaryPhysician: 'Dr. Sarah Johnson',
            notes: [
                {
                    date: '2023-04-01',
                    author: 'Dr. Johnson',
                    text: 'Asthma symptoms well-controlled. Patient reports using rescue inhaler only once in past month. Continue current treatment plan.'
                },
                {
                    date: '2023-03-20',
                    author: 'Nurse Wilson',
                    text: 'Patient reports significant improvement in breathing since starting new inhaler regimen.'
                }
            ],
            vitals: {
                heartRate: { current: 82, trend: 'increasing' },
                bloodPressure: { systolic: 138, diastolic: 88, trend: 'increasing' },
                oxygenSaturation: { current: 96, trend: 'stable' },
                temperature: { current: 98.8, trend: 'stable' },
                respiratoryRate: { current: 18, trend: 'increasing' },
                glucose: { current: 105, trend: 'stable' }
            },
            history: generateHistoricalData(30)
        }
    };
}

function generateHistoricalData(days) {
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
        // Create timestamp for this entry
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - i);
        timestamp.setHours(timestamp.getHours() - Math.round(Math.random() * 24));
        
        // Generate vital signs with some variation
        const heartRate = 70 + Math.round(Math.random() * 15);
        const systolic = 120 + Math.round(Math.random() * 20);
        const diastolic = 80 + Math.round(Math.random() * 10);
        const oxygen = 95 + Math.round(Math.random() * 4);
        const temperature = 98.2 + (Math.random() * 1.2);
        const respiratory = 14 + Math.round(Math.random() * 4);
        const glucose = 100 + Math.round(Math.random() * 40);
        
        data.push({
            timestamp: timestamp.toISOString(),
            heartRate: heartRate,
            bloodPressure: { systolic, diastolic },
            oxygenSaturation: oxygen,
            temperature: temperature,
            respiratoryRate: respiratory,
            glucose: glucose
        });
    }
    
    return data;
}

function generateNotesList(notes) {
    if (!notes || notes.length === 0) {
        return '<p>No notes available.</p>';
    }
    
    // Sort notes by date (newest first)
    const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    
    sortedNotes.forEach(note => {
        const date = new Date(note.date).toLocaleDateString();
        
        html += `
            <div class="note-item">
                <div class="note-header">
                    <span class="note-date">${date}</span>
                    <span class="note-author">${note.author}</span>
                </div>
                <div class="note-text">${note.text}</div>
            </div>
        `;
    });
    
    return html;
}

function generateHistoricalTable(history) {
    if (!history || history.length === 0) {
        return '<tr><td colspan="7">No historical data available.</td></tr>';
    }
    
    // Sort by timestamp (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    
    sortedHistory.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${entry.heartRate} bpm</td>
                <td>${entry.bloodPressure.systolic}/${entry.bloodPressure.diastolic} mmHg</td>
                <td>${entry.oxygenSaturation}%</td>
                <td>${entry.respiratoryRate} bpm</td>
                <td>${entry.temperature.toFixed(1)}°F</td>
                <td>${entry.glucose} mg/dL</td>
            </tr>
        `;
    });
    
    return html;
}

function filterHistoricalData(history, dateRange, groupBy) {
    if (!history || history.length === 0) {
        return [];
    }
    
    const now = new Date();
    let filteredData = [...history];
    
    // Filter by date range
    if (dateRange !== 'all') {
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - daysAgo);
        
        filteredData = filteredData.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    }
    
    // Sort by timestamp (newest first)
    return filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function detectAnomalies(history) {
    if (!history || history.length === 0) {
        return {};
    }
    
    // Calculate mean and standard deviation for each vital sign
    const stats = calculateStats(history);
    
    // Detect anomalies (values outside 2 standard deviations)
    const anomalies = {
        heartRate: [],
        bloodPressure: [],
        oxygenSaturation: [],
        temperature: [],
        respiratoryRate: [],
        glucose: []
    };
    
    history.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        
        // Heart Rate anomalies
        if (
            entry.heartRate > stats.heartRate.mean + (2 * stats.heartRate.stdDev) ||
            entry.heartRate < stats.heartRate.mean - (2 * stats.heartRate.stdDev)
        ) {
            anomalies.heartRate.push({ date, value: entry.heartRate });
        }
        
        // Blood Pressure anomalies
        if (
            entry.bloodPressure.systolic > stats.systolic.mean + (2 * stats.systolic.stdDev) ||
            entry.bloodPressure.systolic < stats.systolic.mean - (2 * stats.systolic.stdDev) ||
            entry.bloodPressure.diastolic > stats.diastolic.mean + (2 * stats.diastolic.stdDev) ||
            entry.bloodPressure.diastolic < stats.diastolic.mean - (2 * stats.diastolic.stdDev)
        ) {
            anomalies.bloodPressure.push({ 
                date, 
                value: `${entry.bloodPressure.systolic}/${entry.bloodPressure.diastolic}` 
            });
        }
        
        // Oxygen anomalies
        if (entry.oxygenSaturation < 94) {
            anomalies.oxygenSaturation.push({ date, value: entry.oxygenSaturation });
        }
        
        // Temperature anomalies
        if (
            entry.temperature > stats.temperature.mean + (2 * stats.temperature.stdDev) ||
            entry.temperature < stats.temperature.mean - (2 * stats.temperature.stdDev)
        ) {
            anomalies.temperature.push({ date, value: entry.temperature.toFixed(1) });
        }
        
        // Respiratory Rate anomalies
        if (
            entry.respiratoryRate > stats.respiratoryRate.mean + (2 * stats.respiratoryRate.stdDev) ||
            entry.respiratoryRate < stats.respiratoryRate.mean - (2 * stats.respiratoryRate.stdDev)
        ) {
            anomalies.respiratoryRate.push({ date, value: entry.respiratoryRate });
        }
        
        // Glucose anomalies
        if (
            entry.glucose > stats.glucose.mean + (2 * stats.glucose.stdDev) ||
            entry.glucose < stats.glucose.mean - (2 * stats.glucose.stdDev)
        ) {
            anomalies.glucose.push({ date, value: entry.glucose });
        }
    });
    
    return anomalies;
}

function calculateStats(data) {
    // Extract data arrays
    const heartRates = data.map(d => d.heartRate);
    const systolic = data.map(d => d.bloodPressure.systolic);
    const diastolic = data.map(d => d.bloodPressure.diastolic);
    const oxygen = data.map(d => d.oxygenSaturation);
    const temperature = data.map(d => d.temperature);
    const respiratory = data.map(d => d.respiratoryRate);
    const glucose = data.map(d => d.glucose);
    
    return {
        heartRate: {
            mean: mean(heartRates),
            stdDev: standardDeviation(heartRates)
        },
        systolic: {
            mean: mean(systolic),
            stdDev: standardDeviation(systolic)
        },
        diastolic: {
            mean: mean(diastolic),
            stdDev: standardDeviation(diastolic)
        },
        oxygenSaturation: {
            mean: mean(oxygen),
            stdDev: standardDeviation(oxygen)
        },
        temperature: {
            mean: mean(temperature),
            stdDev: standardDeviation(temperature)
        },
        respiratoryRate: {
            mean: mean(respiratory),
            stdDev: standardDeviation(respiratory)
        },
        glucose: {
            mean: mean(glucose),
            stdDev: standardDeviation(glucose)
        }
    };
}

function mean(array) {
    return array.reduce((a, b) => a + b, 0) / array.length;
}

function standardDeviation(array) {
    const avg = mean(array);
    const squareDiffs = array.map(value => Math.pow(value - avg, 2));
    const variance = mean(squareDiffs);
    return Math.sqrt(variance);
}

function displayAnomalies(anomalies) {
    const container = document.getElementById('anomalies-container');
    
    let html = '<div class="anomalies-grid">';
    
    // Heart Rate anomalies
    html += `
        <div class="anomaly-card">
            <h4>Heart Rate Anomalies</h4>
            ${generateAnomalyList(anomalies.heartRate, 'bpm')}
        </div>
    `;
    
    // Blood Pressure anomalies
    html += `
        <div class="anomaly-card">
            <h4>Blood Pressure Anomalies</h4>
            ${generateAnomalyList(anomalies.bloodPressure, 'mmHg')}
        </div>
    `;
    
    // Oxygen anomalies
    html += `
        <div class="anomaly-card">
            <h4>Oxygen Saturation Anomalies</h4>
            ${generateAnomalyList(anomalies.oxygenSaturation, '%')}
        </div>
    `;
    
    // Temperature anomalies
    html += `
        <div class="anomaly-card">
            <h4>Temperature Anomalies</h4>
            ${generateAnomalyList(anomalies.temperature, '°F')}
        </div>
    `;
    
    html += '</div>';
    
    container.innerHTML = html;
}

function generateAnomalyList(anomalies, unit) {
    if (anomalies.length === 0) {
        return '<p class="text-success">No anomalies detected</p>';
    }
    
    let html = '<ul class="anomaly-list">';
    
    anomalies.forEach(anomaly => {
        html += `<li>${anomaly.date}: <span class="text-danger">${anomaly.value} ${unit}</span></li>`;
    });
    
    html += '</ul>';
    
    return html;
}

function exportData(patient) {
    // Create CSV content
    let csv = 'Date,Heart Rate (bpm),Systolic (mmHg),Diastolic (mmHg),Oxygen (%),Respiratory Rate (bpm),Temperature (°F),Glucose (mg/dL)\n';
    
    patient.history.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        csv += `"${date}",${entry.heartRate},${entry.bloodPressure.systolic},${entry.bloodPressure.diastolic},`;
        csv += `${entry.oxygenSaturation},${entry.respiratoryRate},${entry.temperature.toFixed(1)},${entry.glucose}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patient.name.replace(/\s+/g, '_')}_health_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateAnalyticsCharts(patient) {
    const timeFrame = document.getElementById('analytics-time-frame').value;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeFrame));
    
    // Filter data by time frame
    const filteredData = patient.history.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    
    // Heart Rate Analysis
    generateHeartRateAnalytics(filteredData);
    
    // Blood Pressure Analysis
    generateBloodPressureAnalytics(filteredData);
    
    // Recovery Patterns (simplified for demo)
    generateRecoveryAnalytics(filteredData);
    
    // Health Score Trends
    generateHealthScoreAnalytics(filteredData);
    
    // Generate insights
    generateInsights(filteredData);
}

function generateHeartRateAnalytics(data) {
    // Calculate statistics
    const heartRates = data.map(d => d.heartRate);
    const avg = mean(heartRates).toFixed(1);
    const max = Math.max(...heartRates);
    const min = Math.min(...heartRates);
    
    // Create insights
    document.getElementById('heart-rate-insights').innerHTML = `
        <p><strong>Average Heart Rate:</strong> ${avg} bpm</p>
        <p><strong>Range:</strong> ${min} - ${max} bpm</p>
        <p>${getHeartRateInsight(avg, min, max)}</p>
    `;
    
    // Create chart data
    const timestamps = data.map(d => new Date(d.timestamp).toLocaleDateString());
    const values = data.map(d => d.heartRate);
    
    // Create chart
    const trace = {
        x: timestamps,
        y: values,
        mode: 'lines+markers',
        name: 'Heart Rate',
        line: {
            color: '#4a6fdc',
            width: 2
        }
    };
    
    const layout = {
        title: 'Heart Rate Trend',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'BPM'
        }
    };
    
    Plotly.newPlot('heart-rate-analytics', [trace], layout, { responsive: true });
}

function getHeartRateInsight(avg, min, max) {
    if (avg < 60) {
        return "Heart rate is below normal range (bradycardia). This could be normal for athletes or may indicate an underlying condition.";
    } else if (avg > 100) {
        return "Heart rate is above normal range (tachycardia). This may indicate stress, anxiety, or an underlying heart condition.";
    } else {
        return "Heart rate is within the normal range for adults. Fluctuations are normal throughout the day based on activity level and stress.";
    }
}

function generateBloodPressureAnalytics(data) {
    // Create chart data
    const timestamps = data.map(d => new Date(d.timestamp).toLocaleDateString());
    const systolic = data.map(d => d.bloodPressure.systolic);
    const diastolic = data.map(d => d.bloodPressure.diastolic);
    
    // Calculate statistics
    const avgSystolic = mean(systolic).toFixed(1);
    const avgDiastolic = mean(diastolic).toFixed(1);
    
    // Create insights
    document.getElementById('blood-pressure-insights').innerHTML = `
        <p><strong>Average BP:</strong> ${avgSystolic}/${avgDiastolic} mmHg</p>
        <p>${getBloodPressureInsight(avgSystolic, avgDiastolic)}</p>
    `;
    
    // Create chart
    const trace1 = {
        x: timestamps,
        y: systolic,
        mode: 'lines+markers',
        name: 'Systolic',
        line: {
            color: '#dc3545',
            width: 2
        }
    };
    
    const trace2 = {
        x: timestamps,
        y: diastolic,
        mode: 'lines+markers',
        name: 'Diastolic',
        line: {
            color: '#6c757d',
            width: 2
        }
    };
    
    const layout = {
        title: 'Blood Pressure Trend',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'mmHg'
        }
    };
    
    Plotly.newPlot('blood-pressure-analytics', [trace1, trace2], layout, { responsive: true });
}

function getBloodPressureInsight(systolic, diastolic) {
    if (systolic > 140 || diastolic > 90) {
        return "Blood pressure is in the high range (Stage 2 Hypertension). This may increase risk for heart disease and stroke. Lifestyle changes and medication may be needed.";
    } else if (systolic > 130 || diastolic > 80) {
        return "Blood pressure is slightly elevated (Stage 1 Hypertension). Consider lifestyle modifications such as reduced sodium intake, regular exercise, and stress management.";
    } else if (systolic > 120 && systolic < 130 && diastolic < 80) {
        return "Blood pressure is in the elevated range. This is not technically hypertension but indicates risk of developing high blood pressure in the future.";
    } else if (systolic < 90 || diastolic < 60) {
        return "Blood pressure is lower than normal (Hypotension). This may cause dizziness, fainting, or fatigue, especially when standing up quickly.";
    } else {
        return "Blood pressure is within the normal range. Continue with healthy lifestyle habits to maintain cardiovascular health.";
    }
}

function generateRecoveryAnalytics(data) {
    // Simplified recovery analysis - looking at oxygen levels
    const oxygenLevels = data.map(d => d.oxygenSaturation);
    
    // Create chart
    const timestamps = data.map(d => new Date(d.timestamp).toLocaleDateString());
    
    const trace = {
        x: timestamps,
        y: oxygenLevels,
        mode: 'lines+markers',
        name: 'Oxygen Saturation',
        line: {
            color: '#28a745',
            width: 2
        }
    };
    
    const layout = {
        title: 'Oxygen Saturation Trend',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: '%',
            range: [90, 100]
        }
    };
    
    Plotly.newPlot('recovery-analytics', [trace], layout, { responsive: true });
    
    // Calculate insights
    const avgOxygen = mean(oxygenLevels).toFixed(1);
    const minOxygen = Math.min(...oxygenLevels);
    
    document.getElementById('recovery-insights').innerHTML = `
        <p><strong>Average O₂ Saturation:</strong> ${avgOxygen}%</p>
        <p><strong>Lowest Reading:</strong> ${minOxygen}%</p>
        <p>${getOxygenInsight(avgOxygen, minOxygen)}</p>
    `;
}

function getOxygenInsight(avg, min) {
    if (min < 90) {
        return "Oxygen saturation dropped to concerning levels (below 90%). This requires medical evaluation as it may indicate respiratory distress.";
    } else if (min < 94) {
        return "Oxygen saturation reached moderately low levels. This may indicate mild respiratory issues that should be monitored.";
    } else if (avg > 95) {
        return "Oxygen saturation levels are consistently within the healthy range, indicating good respiratory function.";
    } else {
        return "Oxygen saturation levels are acceptable but could be improved. Monitoring should continue, especially if the patient has respiratory conditions.";
    }
}

function generateHealthScoreAnalytics(data) {
    // Calculate health scores (simplified algorithm)
    const healthScores = data.map(entry => {
        let score = 100;
        
        // Reduce score for concerning vitals
        if (entry.heartRate < 60 || entry.heartRate > 100) score -= 5;
        if (entry.bloodPressure.systolic > 140 || entry.bloodPressure.diastolic > 90) score -= 10;
        if (entry.bloodPressure.systolic < 90 || entry.bloodPressure.diastolic < 60) score -= 5;
        if (entry.oxygenSaturation < 95) score -= 10;
        if (entry.oxygenSaturation < 90) score -= 20;
        if (entry.temperature > 100.4) score -= 10;
        if (entry.temperature > 103) score -= 20;
        if (entry.respiratoryRate < 12 || entry.respiratoryRate > 20) score -= 5;
        if (entry.glucose > 140) score -= 5;
        if (entry.glucose > 200 || entry.glucose < 70) score -= 10;
        
        // Ensure score doesn't go below 0
        return Math.max(0, score);
    });
    
    // Create chart
    const timestamps = data.map(d => new Date(d.timestamp).toLocaleDateString());
    
    const trace = {
        x: timestamps,
        y: healthScores,
        mode: 'lines+markers',
        name: 'Health Score',
        line: {
            color: '#4a6fdc',
            width: 2
        }
    };
    
    const layout = {
        title: 'Overall Health Score Trend',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Score',
            range: [0, 100]
        }
    };
    
    Plotly.newPlot('health-score-analytics', [trace], layout, { responsive: true });
    
    // Calculate insights
    const avgScore = mean(healthScores).toFixed(1);
    const minScore = Math.min(...healthScores).toFixed(1);
    const maxScore = Math.max(...healthScores).toFixed(1);
    
    document.getElementById('health-score-insights').innerHTML = `
        <p><strong>Average Health Score:</strong> ${avgScore}/100</p>
        <p><strong>Range:</strong> ${minScore} - ${maxScore}</p>
        <p>${getHealthScoreInsight(avgScore)}</p>
    `;
}

function getHealthScoreInsight(score) {
    if (score > 90) {
        return "Overall health score is excellent. Vital signs are consistently within healthy ranges.";
    } else if (score > 80) {
        return "Overall health score is good. There are some minor variations in vital signs that should be monitored but are not concerning.";
    } else if (score > 70) {
        return "Overall health score is fair. There are several vital signs outside of optimal ranges that would benefit from attention.";
    } else {
        return "Overall health score indicates need for intervention. Multiple vital signs are outside of healthy ranges and require medical attention.";
    }
}

function generateInsights(data) {
    // Generate health insights based on trends (simplified)
    const heartRates = data.map(d => d.heartRate);
    const systolic = data.map(d => d.bloodPressure.systolic);
    const diastolic = data.map(d => d.bloodPressure.diastolic);
    const oxygen = data.map(d => d.oxygenSaturation);
    const temperature = data.map(d => d.temperature);
    
    // Detect trends (simple approach - check if last value is higher or lower than first)
    const hrTrend = heartRates[heartRates.length - 1] > heartRates[0] ? 'increasing' : 'decreasing';
    const bpTrend = systolic[systolic.length - 1] > systolic[0] ? 'increasing' : 'decreasing';
    const oxTrend = oxygen[oxygen.length - 1] > oxygen[0] ? 'increasing' : 'decreasing';
    
    return `
        <div class="insight-card">
            <h4><i class="fas fa-heartbeat"></i> Cardiovascular Health</h4>
            <p>${getCardiovascularInsight(hrTrend, bpTrend, mean(heartRates), mean(systolic), mean(diastolic))}</p>
        </div>
        
        <div class="insight-card">
            <h4><i class="fas fa-lungs"></i> Respiratory Health</h4>
            <p>${getRespiratoryInsight(oxTrend, mean(oxygen))}</p>
        </div>
        
        <div class="insight-card">
            <h4><i class="fas fa-chart-line"></i> Trend Analysis</h4>
            <p>Based on the data from the selected time period, the AI has detected the following trends:</p>
            <ul>
                <li>Heart rate is ${hrTrend}</li>
                <li>Blood pressure is ${bpTrend}</li>
                <li>Oxygen saturation is ${oxTrend}</li>
            </ul>
        </div>
        
        <div class="insight-card">
            <h4><i class="fas fa-clipboard-list"></i> Recommendations</h4>
            <p>The AI suggests the following actions based on the analysis:</p>
            <ul>
                <li>Continue regular monitoring of vital signs</li>
                <li>Maintain medication adherence as prescribed</li>
                <li>Discuss any concerning trends with healthcare provider at next appointment</li>
            </ul>
        </div>
    `;
}

function getCardiovascularInsight(hrTrend, bpTrend, avgHR, avgSystolic, avgDiastolic) {
    let insight = '';
    
    if (avgSystolic > 140 || avgDiastolic > 90) {
        insight += 'Blood pressure readings are elevated, which increases cardiovascular risk. ';
    } else if (avgSystolic < 90 || avgDiastolic < 60) {
        insight += 'Blood pressure readings are lower than normal. This may cause dizziness or fatigue. ';
    } else {
        insight += 'Blood pressure is within healthy ranges. ';
    }
    
    if (avgHR > 100) {
        insight += 'Resting heart rate is elevated, which may indicate stress or cardiovascular strain. ';
    } else if (avgHR < 60) {
        insight += 'Resting heart rate is lower than average, which can be normal for physically active individuals but should be monitored. ';
    } else {
        insight += 'Heart rate is within normal limits. ';
    }
    
    if (bpTrend === 'increasing' && avgSystolic > 130) {
        insight += 'The upward trend in blood pressure is concerning and should be addressed with a healthcare provider.';
    } else if (bpTrend === 'decreasing' && avgSystolic > 140) {
        insight += 'The downward trend in blood pressure is positive, suggesting interventions may be working.';
    }
    
    return insight;
}

function getRespiratoryInsight(oxTrend, avgOx) {
    if (avgOx < 90) {
        return 'Oxygen levels are critically low and require immediate medical attention. This may indicate severe respiratory distress.';
    } else if (avgOx < 94) {
        return 'Oxygen levels are below the normal range. This may indicate respiratory issues that should be evaluated by a healthcare professional.';
    } else if (oxTrend === 'decreasing' && avgOx < 96) {
        return 'Oxygen levels are decreasing, which should be monitored closely, especially if the patient has respiratory conditions.';
    } else {
        return 'Oxygen levels are within the healthy range, indicating good respiratory function.';
    }
}

function generateHealthInsights(patient) {
    // In a real application, this would use AI analysis
    // For this demo, we'll use a simplified approach
    
    let insightHtml = generateInsights(patient.history);
    
    return insightHtml;
}