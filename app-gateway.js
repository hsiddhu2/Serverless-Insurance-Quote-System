// Application Access Control System
class AppGateway {
    constructor() {
        this.API_ENDPOINT = null;
        this.COGNITO_CONFIG = null;
        this.init();
    }

    init() {
        this.checkAccess();
        this.addSystemBanner();
        this.trackVisit();
    }

    checkAccess() {
        const idToken = localStorage.getItem('idToken');
        
        // If user is logged in, skip access check
        if (idToken && this.isTokenValid(idToken)) {
            return true;
        }
        
        // Check session-based access (resets on refresh/new browser)
        const sessionAccess = sessionStorage.getItem('sessionAccess');
        if (sessionAccess === 'granted') {
            return true;
        }
        
        // Show access dialog for new sessions
        this.showAccessDialog();
        return false;
    }

    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    showAccessDialog() {
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div class="system-overlay">
                <div class="system-dialog">
                    <h2>🏢 Serverless Insurance Quote System</h2>
                    <p><strong>Complete serverless application built with AWS services</strong></p>
                    
                    <div class="system-features">
                        <h3>Serverless Architecture Benefits:</h3>
                        <ul>
                            <li>📈 <strong>Auto-Scaling:</strong> Lambda functions scale from 0 to 1000+ concurrent executions</li>
                            <li>🌍 <strong>High Availability:</strong> Multi-AZ deployment with 99.95% SLA guarantee</li>
                            <li>⚡ <strong>Performance:</strong> Sub-second response times with CloudFront CDN</li>
                            <li>🔄 <strong>Decoupled Architecture:</strong> SNS/SQS ensures guaranteed message delivery</li>
                            <li>🛡️ <strong>Built-in Security:</strong> API Gateway rate limiting + CORS protection</li>
                            <li>💰 <strong>Cost Efficient:</strong> Pay-per-request model with no idle costs</li>
                        </ul>
                    </div>
                    
                    <div class="access-section">
                        <p>💼 <strong>Connect with me on LinkedIn for access code</strong></p>
                        <input type="password" id="systemCode" placeholder="Enter access code" maxlength="20">
                        <button onclick="appGateway.validateAccess()">Access System</button>
                    </div>
                    
                    <div class="contact-info">
                        <p>💼 LinkedIn: <a href="https://linkedin.com/in/your-profile" target="_blank">Connect with me</a></p>
                    </div>
                    
                    <div class="tech-stack">
                        <p><strong>Enterprise-Grade Features:</strong></p>
                        <p>Event-Driven Processing • Guaranteed Delivery • JWT Authentication • Rate Limiting • CORS Security</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        this.addStyles();
        
        // Focus on input field
        setTimeout(() => {
            document.getElementById('systemCode').focus();
        }, 100);
        
        // Allow Enter key to submit
        document.getElementById('systemCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateAccess();
            }
        });
    }

    async validateAccess() {
        const code = document.getElementById('systemCode').value.trim();
        
        if (!code) {
            this.showErrorMessage('Please enter an access code');
            return;
        }
        
        try {
            // API Gateway URL is visible in network calls anyway, so it's not a secret
            const apiEndpoint = 'https://xhd82rv7a5.execute-api.us-west-2.amazonaws.com/Prod';
            console.log('Using API endpoint:', apiEndpoint);
            
            const response = await fetch(`${apiEndpoint}/validate-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accessCode: code })
            });
            
            const result = await response.json();
            
            if (response.ok && result.valid) {
                // Store access in session (resets on refresh/new browser)
                sessionStorage.setItem('sessionAccess', 'granted');
                this.trackAccess('demo');
                
                this.showSuccessMessage();
                setTimeout(() => {
                    document.querySelector('.system-overlay').remove();
                }, 1500);
            } else {
                this.showErrorMessage(result.message || 'Invalid access code');
            }
        } catch (error) {
            console.error('Access validation error:', error);
            this.showErrorMessage('Connection error. Please try again.');
        }
    }

    showSuccessMessage() {
        const input = document.getElementById('systemCode');
        const button = input.nextElementSibling;
        
        input.style.borderColor = '#27ae60';
        button.innerHTML = '✅ Access Granted!';
        button.style.background = '#27ae60';
    }

    showErrorMessage(message = 'Invalid code - contact me on LinkedIn') {
        const input = document.getElementById('systemCode');
        
        input.style.borderColor = '#e74c3c';
        input.value = '';
        input.placeholder = message;
        
        // Reset after 3 seconds
        setTimeout(() => {
            input.style.borderColor = '#ddd';
            input.placeholder = 'Enter access code';
        }, 3000);
    }

    addSystemBanner() {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div class="system-banner">
                🏢 <strong>Serverless Insurance System</strong> | 
                Built with AWS Serverless Technologies | 
                <a href="https://linkedin.com/in/harpreetsiddhu" target="_blank" style="color: #333; text-decoration: underline;">
                    Contact Developer
                </a>
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Add top margin to body to account for banner
        document.body.style.marginTop = '50px';
    }



    getExpiryDate(days, hours, minutes) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        date.setHours(date.getHours() + hours);
        date.setMinutes(date.getMinutes() + minutes);
        return date.toISOString();
    }

    trackAccess(type) {
        console.log(`System access granted: ${type} at ${new Date().toISOString()}`);
        
        // Store access log
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        logs.push({
            type: type,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 100)
        });
        
        // Keep only last 10 logs
        if (logs.length > 10) {
            logs.splice(0, logs.length - 10);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(logs));
    }

    trackVisit() {
        const visits = parseInt(localStorage.getItem('systemVisits') || '0') + 1;
        localStorage.setItem('systemVisits', visits.toString());
        localStorage.setItem('lastVisit', new Date().toISOString());
    }

    addStyles() {
        const styles = `
            <style>
            .system-overlay {
                position: fixed; 
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); 
                z-index: 10000;
                display: flex; 
                align-items: center; 
                justify-content: center;
                backdrop-filter: blur(5px);
            }
            
            .system-dialog {
                background: white; 
                padding: 40px; 
                border-radius: 15px;
                max-width: 600px; 
                text-align: center; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .system-dialog h2 {
                color: #2c3e50;
                margin-bottom: 10px;
                font-size: 24px;
            }
            
            .system-features { 
                text-align: left; 
                margin: 25px 0; 
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
            }
            
            .system-features h3 {
                margin-top: 0;
                color: #2c3e50;
            }
            
            .system-features ul { 
                padding-left: 20px; 
                margin: 10px 0;
            }
            
            .system-features li {
                margin: 8px 0;
                line-height: 1.4;
            }
            
            .access-section {
                margin: 25px 0;
                padding: 20px;
                background: #e8f4f8;
                border-radius: 8px;
            }
            
            .contact-info { 
                margin: 25px 0; 
                font-size: 14px; 
                color: #666;
                background: #f0f8ff;
                padding: 15px;
                border-radius: 8px;
            }
            
            .contact-info a {
                color: #2c3e50;
                text-decoration: none;
                font-weight: bold;
            }
            
            .contact-info a:hover {
                text-decoration: underline;
            }
            
            .tech-stack {
                margin-top: 20px;
                font-size: 12px;
                color: #7f8c8d;
                border-top: 1px solid #ecf0f1;
                padding-top: 15px;
            }
            
            #systemCode { 
                padding: 12px 15px; 
                margin: 15px; 
                width: 250px; 
                border: 2px solid #ddd; 
                border-radius: 8px;
                font-size: 16px;
                text-align: center;
                transition: border-color 0.3s ease;
            }
            
            #systemCode:focus {
                outline: none;
                border-color: #3498db;
            }
            
            .system-dialog button { 
                padding: 12px 30px; 
                background: #2c3e50; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s ease;
                margin-top: 10px;
            }
            
            .system-dialog button:hover {
                background: #34495e;
            }
            
            .system-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 12px 20px; 
                text-align: center;
                position: fixed; 
                top: 0; left: 0; right: 0; 
                z-index: 1000;
                font-size: 14px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
            }
            

            
            @media (max-width: 600px) {
                .system-dialog {
                    margin: 20px;
                    padding: 30px 20px;
                    max-width: none;
                }
                
                #systemCode {
                    width: 200px;
                }
                
                .system-banner {
                    font-size: 12px;
                    padding: 10px;
                    flex-direction: column;
                    gap: 5px;
                }
            }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Method to revoke access (for testing)
    revokeAccess() {
        localStorage.removeItem('systemLogs');
        localStorage.removeItem('systemVisits');
        localStorage.removeItem('lastVisit');
        location.reload();
    }
    
    // Method to clear all access immediately
    clearAccess() {
        this.revokeAccess();
    }
}

// Initialize system gateway when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.appGateway = new AppGateway();
    });
} else {
    window.appGateway = new AppGateway();
}