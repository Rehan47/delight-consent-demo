// DELIGHT Digital Consent Management System - JavaScript

class DelightConsentSystem {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 5;
        this.consentData = {
            language: 'en',
            mainConsent: false,
            bloodSample: '',
            brainOxygen: '',
            dataSharing: '',
            participantName: '',
            signature: null,
            timestamp: new Date().toISOString()
        };
        this.signatureCanvas = null;
        this.signatureContext = null;
        this.isDrawing = false;
        this.hasSignature = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Theme management
        this.currentTheme = this.getInitialTheme();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressBar();
        this.updateTimestamp();
        this.expandFirstInfoSection();
        
        // Setup theme after DOM is ready
        setTimeout(() => {
            this.setupTheme();
        }, 50);
        
        // Setup signature canvas after DOM is ready
        setTimeout(() => {
            this.setupSignatureCanvas();
        }, 100);
    }

    setupEventListeners() {
        // Welcome screen
        document.getElementById('startConsentBtn').addEventListener('click', () => {
            this.consentData.language = document.getElementById('languageSelect').value;
            this.goToStep(1);
        });

        // Information screen
        document.getElementById('infoBackBtn').addEventListener('click', () => this.goToStep(0));
        document.getElementById('infoNextBtn').addEventListener('click', () => this.goToStep(2));

        // Consent screen
        document.getElementById('consentBackBtn').addEventListener('click', () => this.goToStep(1));
        document.getElementById('consentNextBtn').addEventListener('click', () => this.validateConsent());

        // Signature screen
        document.getElementById('signatureBackBtn').addEventListener('click', () => this.goToStep(2));
        document.getElementById('signatureNextBtn').addEventListener('click', () => this.validateSignature());
        document.getElementById('clearSignatureBtn').addEventListener('click', () => this.clearSignature());

        // Completion screen
        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadPdf());
        document.getElementById('newConsentBtn').addEventListener('click', () => this.startNewConsent());

        // Info section toggles
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.toggleInfoSection(section, e.currentTarget);
            });
        });

        // Form change listeners
        document.getElementById('mainConsent').addEventListener('change', (e) => {
            this.consentData.mainConsent = e.target.checked;
            this.clearError('mainConsentError');
        });

        document.querySelectorAll('input[name="bloodSample"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.consentData.bloodSample = e.target.value;
            });
        });

        document.querySelectorAll('input[name="brainOxygen"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.consentData.brainOxygen = e.target.value;
            });
        });

        document.querySelectorAll('input[name="dataSharing"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.consentData.dataSharing = e.target.value;
            });
        });

        document.getElementById('participantName').addEventListener('input', (e) => {
            this.consentData.participantName = e.target.value.trim();
            this.clearError('nameError');
        });

        // Language change
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.consentData.language = e.target.value;
        });

        // Theme toggle - with error handling
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Theme toggle clicked. Current theme:', this.currentTheme);
                this.toggleTheme();
            });
        } else {
            console.error('Theme toggle button not found');
        }


    }

    setupSignatureCanvas() {
        this.signatureCanvas = document.getElementById('signatureCanvas');
        if (!this.signatureCanvas) {
            console.error('Signature canvas not found');
            return;
        }
        
        this.signatureContext = this.signatureCanvas.getContext('2d');
        
        // Set canvas size
        const container = this.signatureCanvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.signatureCanvas.width = rect.width - 4; // Account for border
        this.signatureCanvas.height = 198; // Account for border
        
        // Configure drawing context
        this.signatureContext.strokeStyle = '#1f3439';
        this.signatureContext.lineWidth = 2;
        this.signatureContext.lineCap = 'round';
        this.signatureContext.lineJoin = 'round';
        this.signatureContext.imageSmoothingEnabled = true;

        // Mouse events
        this.signatureCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startDrawing(e);
        });
        
        this.signatureCanvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            this.draw(e);
        });
        
        this.signatureCanvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        this.signatureCanvas.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });

        // Touch events for mobile
        this.signatureCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.signatureCanvas.getBoundingClientRect();
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            };
            this.startDrawing(mouseEvent);
        });

        this.signatureCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            };
            this.draw(mouseEvent);
        });

        this.signatureCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.signatureCanvas && this.signatureContext) {
                const imageData = this.signatureContext.getImageData(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);
                const container = this.signatureCanvas.parentElement;
                const rect = container.getBoundingClientRect();
                this.signatureCanvas.width = rect.width - 4;
                this.signatureContext.putImageData(imageData, 0, 0);
                
                // Reconfigure context after resize
                this.signatureContext.strokeStyle = '#1f3439';
                this.signatureContext.lineWidth = 2;
                this.signatureContext.lineCap = 'round';
                this.signatureContext.lineJoin = 'round';
            }
        });
    }

    getPointerPosition(e) {
        const rect = this.signatureCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPointerPosition(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Begin new path
        this.signatureContext.beginPath();
        this.signatureContext.moveTo(this.lastX, this.lastY);
        
        // Hide placeholder on first draw
        if (!this.hasSignature) {
            document.getElementById('signaturePlaceholder').classList.add('hidden');
            this.hasSignature = true;
        }
        
        this.clearError('signatureError');
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getPointerPosition(e);
        
        // Draw line from last position to current position
        this.signatureContext.lineTo(pos.x, pos.y);
        this.signatureContext.stroke();
        
        // Update last position
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.signatureContext.beginPath();
        
        // Save signature data
        this.consentData.signature = this.signatureCanvas.toDataURL();
    }

    clearSignature() {
        if (this.signatureCanvas && this.signatureContext) {
            this.signatureContext.clearRect(0, 0, this.signatureCanvas.width, this.signatureCanvas.height);
            this.hasSignature = false;
            this.consentData.signature = null;
            document.getElementById('signaturePlaceholder').classList.remove('hidden');
            this.clearError('signatureError');
        }
    }

    goToStep(step) {
        // Hide current screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const screens = ['welcomeScreen', 'informationScreen', 'consentScreen', 'signatureScreen', 'completionScreen'];
        document.getElementById(screens[step]).classList.add('active');

        // Update progress
        this.currentStep = step;
        this.updateProgressBar();
        this.updateProgressSteps();

        // Special handling for signature screen
        if (step === 3) {
            // Ensure signature canvas is properly set up
            setTimeout(() => {
                this.setupSignatureCanvas();
            }, 100);
        }

        // Special handling for completion screen
        if (step === 4) {
            this.showConsentSummary();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    updateProgressBar() {
        const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    updateProgressSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index === this.currentStep) {
                step.classList.add('active');
            } else if (index < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    expandFirstInfoSection() {
        // Expand the first info section by default
        setTimeout(() => {
            const firstSection = document.querySelector('.section-header[data-section="purpose"]');
            if (firstSection) {
                this.toggleInfoSection('purpose', firstSection);
            }
        }, 100);
    }

    toggleInfoSection(section, header) {
        const content = document.getElementById(`${section}Content`);
        if (!content) return;
        
        const isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
            content.classList.remove('expanded');
            header.classList.remove('expanded');
            header.setAttribute('aria-expanded', 'false');
        } else {
            content.classList.add('expanded');
            header.classList.add('expanded');
            header.setAttribute('aria-expanded', 'true');
        }
    }

    validateConsent() {
        let isValid = true;
        
        // Check main consent
        if (!this.consentData.mainConsent) {
            this.showError('mainConsentError', 'You must agree to participate in the study to continue.');
            isValid = false;
        }
        
        if (isValid) {
            this.goToStep(3);
        }
    }

    validateSignature() {
        let isValid = true;
        
        // Check participant name
        if (!this.consentData.participantName) {
            this.showError('nameError', 'Please enter your full name.');
            isValid = false;
        }
        
        // Check signature
        if (!this.hasSignature || !this.consentData.signature) {
            this.showError('signatureError', 'Please provide your digital signature.');
            isValid = false;
        }
        
        if (isValid) {
            this.showLoadingState('signatureNextBtn');
            
            // Simulate processing time
            setTimeout(() => {
                this.hideLoadingState('signatureNextBtn');
                this.consentData.timestamp = new Date().toISOString();
                this.goToStep(4);
            }, 1500);
        }
    }

    showConsentSummary() {
        document.getElementById('summaryMainConsent').textContent = 
            this.consentData.mainConsent ? 'Agreed' : 'Not agreed';
        
        document.getElementById('summaryBloodSample').textContent = 
            this.consentData.bloodSample || 'Not selected';
        
        document.getElementById('summaryBrainOxygen').textContent = 
            this.consentData.brainOxygen || 'Not selected';
        
        document.getElementById('summaryDataSharing').textContent = 
            this.consentData.dataSharing || 'Not selected';
    }

    downloadPdf() {
        this.showLoadingState('downloadPdfBtn');
        
        // Simulate PDF generation
        setTimeout(() => {
            this.hideLoadingState('downloadPdfBtn');
            
            // Create a simple text representation for demo
            const consentText = this.generateConsentText();
            const blob = new Blob([consentText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `DELIGHT_Consent_${this.consentData.participantName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);
    }

    generateConsentText() {
        const timestamp = new Date(this.consentData.timestamp).toLocaleString();
        
        return `
DELIGHT PILOT STUDY - DIGITAL CONSENT FORM
==========================================

Participant Name: ${this.consentData.participantName}
Date & Time: ${timestamp}
Language: ${this.consentData.language}

CONSENT RESPONSES:
-----------------
Main Consent: ${this.consentData.mainConsent ? 'I freely agree for my baby to take part in this study' : 'Not agreed'}
Blood Sample Collection: ${this.consentData.bloodSample || 'Not selected'}
Brain Oxygen Sensor: ${this.consentData.brainOxygen || 'Not selected'}
Data Sharing for Future Research: ${this.consentData.dataSharing || 'Not selected'}

STUDY INFORMATION:
-----------------
Study Title: DELIGHT Pilot Study
Purpose: This study aims to find out whether babies with CCHD should have their umbilical cord clamped immediately, or 60 seconds or more after they have been born.
Population: 90 babies in Australia initially
Duration: Up to 2 years after due date

CONTACT INFORMATION:
-------------------
Study Team: DELIGHT Study Team
Phone: 1800-DELIGHT
Email: delight@research.edu.au

Digital Signature: ${this.consentData.signature ? 'Provided' : 'Not provided'}

This consent form was completed using the DELIGHT Digital Consent Management System.
        `.trim();
    }

    startNewConsent() {
        // Reset all data
        this.consentData = {
            language: 'en',
            mainConsent: false,
            bloodSample: '',
            brainOxygen: '',
            dataSharing: '',
            participantName: '',
            signature: null,
            timestamp: new Date().toISOString()
        };
        
        // Reset form fields
        document.getElementById('languageSelect').value = 'en';
        document.getElementById('mainConsent').checked = false;
        document.getElementById('participantName').value = '';
        
        // Clear radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Clear signature
        this.clearSignature();
        
        // Clear all errors
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        
        // Reset to first step
        this.goToStep(0);
    }

    updateTimestamp() {
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('timestamp').textContent = timestamp;
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        const formGroup = errorElement.closest('.form-group');
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        if (formGroup) {
            formGroup.classList.add('error');
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        const formGroup = errorElement.closest('.form-group');
        
        errorElement.classList.remove('show');
        
        if (formGroup) {
            formGroup.classList.remove('error');
        }
    }

    showLoadingState(buttonId) {
        const button = document.getElementById(buttonId);
        button.classList.add('loading');
        button.disabled = true;
    }

    hideLoadingState(buttonId) {
        const button = document.getElementById(buttonId);
        button.classList.remove('loading');
        button.disabled = false;
    }

    // Theme Management Methods
    getInitialTheme() {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('delight-theme');
        if (savedTheme) {
            console.log('Found saved theme:', savedTheme);
            return savedTheme;
        }
        
        // Check for system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            console.log('System prefers dark mode');
            return 'dark';
        }
        
        console.log('Defaulting to light mode');
        return 'light';
    }

    setupTheme() {
        console.log('Setting up theme. Initial theme:', this.currentTheme);
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('delight-theme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(this.currentTheme);
                }
            });
        }
    }

    applyTheme(theme) {
        console.log('Applying theme:', theme);
        
        const html = document.documentElement;
        const body = document.body;
        
        // Remove existing theme attributes and classes
        html.removeAttribute('data-theme');
        html.removeAttribute('data-color-scheme');
        html.className = html.className.replace(/theme-\w+/g, '');
        body.className = body.className.replace(/theme-\w+/g, '');
        
        // Apply new theme
        html.setAttribute('data-theme', theme);
        html.setAttribute('data-color-scheme', theme);
        html.classList.add(`theme-${theme}`);
        body.classList.add(`theme-${theme}`);
        
        // Force CSS recalculation
        html.style.colorScheme = theme;
        
        console.log('Applied theme attributes:', {
            'data-theme': html.getAttribute('data-theme'),
            'data-color-scheme': html.getAttribute('data-color-scheme'),
            'classes': html.className,
            'colorScheme': html.style.colorScheme
        });
        
        // Update toggle appearance and accessibility
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            const newLabel = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
            toggle.setAttribute('aria-label', newLabel);
            toggle.title = newLabel;
        }
        
        // Store preference
        localStorage.setItem('delight-theme', theme);
        
        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: theme }
        }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log('Toggling theme from', this.currentTheme, 'to', newTheme);
        
        this.currentTheme = newTheme;
        this.applyTheme(this.currentTheme);
        
        // Add Material Design 3 compliant animation
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            // Add a subtle bounce animation
            toggle.style.animation = 'none';
            toggle.offsetHeight; // Trigger reflow
            toggle.style.animation = 'md3-toggle-bounce 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Remove animation after completion
            setTimeout(() => {
                toggle.style.animation = '';
            }, 300);
        }
        
        // Force page reflow to ensure styles are applied
        document.body.offsetHeight;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DelightConsentSystem();
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('btn')) {
            activeElement.click();
        }
    }
});

// Add accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels to form elements
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        const label = radio.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            radio.setAttribute('aria-label', label.textContent);
        }
    });
    
    // Add role and aria-expanded to collapsible sections
    document.querySelectorAll('.section-header').forEach(header => {
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('tabindex', '0');
        
        // Add keyboard support for collapsible sections
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    });
});