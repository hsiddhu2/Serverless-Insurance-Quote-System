// Cognito Hosted UI Integration
function getCognitoDomain() {
    if (!window.COGNITO_CONFIG || !window.COGNITO_CONFIG.userPoolId) {
        console.error('Cognito configuration not loaded');
        return null;
    }
    const accountId = window.COGNITO_CONFIG.accountId;
    return `insurance-quotes-${accountId}.auth.${window.COGNITO_CONFIG.region}.amazoncognito.com`;
}

function getClientId() {
    return window.COGNITO_CONFIG ? window.COGNITO_CONFIG.clientId : null;
}

const REDIRECT_URI = window.location.origin + window.location.pathname;

// Redirect to custom login page
function loginWithCognito() {
    window.location.href = 'login.html';
}

// Go to quotes page (for logged in users)
function goToQuotes() {
    window.location.href = 'quotes.html';
}

// Check if JWT token is valid (not expired)
function isTokenValid(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
    } catch (error) {
        return false;
    }
}

// Handle OAuth callback
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Exchange code for tokens
        exchangeCodeForTokens(code);
    }
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code) {
    try {
        const cognitoDomain = getCognitoDomain();
        const clientId = getClientId();
        
        if (!cognitoDomain || !clientId) {
            throw new Error('Cognito configuration not available');
        }
        
        const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });
        
        const tokens = await response.json();
        console.log('Token exchange response:', response.status, tokens);
        
        if (response.ok && tokens.access_token) {
            // Store tokens
            localStorage.setItem('accessToken', tokens.access_token);
            localStorage.setItem('idToken', tokens.id_token);
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to quotes page
            window.location.href = 'quotes.html';
        } else {
            console.error('Token exchange failed:', tokens);
            throw new Error(tokens.error_description || tokens.error || 'Token exchange failed');
        }
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        alert('Login failed. Please try again.');
    }
}

// Redirect to quotes page after login
function redirectToQuotes() {
    window.location.href = 'quotes.html';
}

// Logout function
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    
    // Show confirmation and redirect
    alert('You have been logged out successfully.');
    window.location.href = 'index.html';
}

// Check for OAuth callback and update UI on page load
document.addEventListener('DOMContentLoaded', function() {
    handleOAuthCallback();
    updateUIBasedOnLoginStatus();
});

// Update UI based on login status
function updateUIBasedOnLoginStatus() {
    const idToken = localStorage.getItem('idToken');
    const loginButton = document.getElementById('loginButton');
    const quotesButton = document.getElementById('quotesButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (idToken && isTokenValid(idToken)) {
        // User is logged in
        if (loginButton) loginButton.style.display = 'none';
        if (quotesButton) quotesButton.style.display = 'inline-block';
        if (logoutButton) logoutButton.style.display = 'inline-block';
    } else {
        // User is logged out
        if (loginButton) loginButton.style.display = 'inline-block';
        if (quotesButton) quotesButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
    }
}