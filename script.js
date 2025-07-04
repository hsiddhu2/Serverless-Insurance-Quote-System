const form = document.getElementById("quoteForm");
const typeSelect = document.getElementById("insuranceType");
const dynamicFields = document.getElementById("dynamicFields");
const responseBox = document.getElementById("responseBox");
const getQuoteBtn = document.getElementById("getQuoteBtn");

// Prefill email and name if user is logged in
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const name = urlParams.get('name');
  
  if (email) {
    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.value = email;
      emailField.readOnly = true;
    }
  }
  
  if (name) {
    const nameField = document.getElementById('name');
    if (nameField) {
      nameField.value = name;
      nameField.readOnly = true;
    }
  }
});

// Check if elements exist before adding event listeners
if (typeSelect) {
  typeSelect.addEventListener("change", function () {
  const type = this.value;
  dynamicFields.innerHTML = ""; // Clear previous fields

  if (type === "auto") {
    dynamicFields.innerHTML = `
      <div class="form-group">
        <label for="vehicleType">Vehicle Type:</label>
        <select id="vehicleType" required>
          <option value="">Select</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Truck">Truck</option>
          <option value="Coupe">Coupe</option>
        </select>
      </div>
      <div class="form-group">
        <label for="make">Make:</label>
        <input type="text" id="make" required />
      </div>
      <div class="form-group">
        <label for="model">Model:</label>
        <input type="text" id="model" required />
      </div>
      <div class="form-group">
        <label for="year">Year:</label>
        <select id="year" required>
          <option value="">Select</option>
          ${[2020, 2021, 2022, 2023, 2024, 2025].map(year => `<option value="${year}">${year}</option>`).join("")}
        </select>
      </div>
      <div class="form-group full-width">
        <label for="drivingHistory">Driving History:</label>
        <input type="text" id="drivingHistory" required />
      </div>
    `;
  } else if (type === "life") {
    dynamicFields.innerHTML = `
      <div class="form-group">
        <label for="age">Age:</label>
        <input type="number" id="age" min="18" max="100" required />
      </div>
      <div class="form-group">
        <label for="gender">Gender:</label>
        <select id="gender" required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="smoker">Smoker Status:</label>
        <select id="smoker" required>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div class="form-group">
        <label for="health">Health Condition:</label>
        <input type="text" id="health" required />
      </div>
      <div class="form-group full-width">
        <label for="coverage">Coverage Amount ($):</label>
        <select id="coverage" required>
          <option value="">Select</option>
          ${[20000, 50000, 100000, 250000, 500000].map(
            amount => `<option value="${amount}">$${amount.toLocaleString()}</option>`
          ).join("")}
        </select>
      </div>
    `;
  } else if (type === "home") {
    dynamicFields.innerHTML = `
      <div class="form-group">
        <label for="homeType">Home Type:</label>
        <input type="text" id="homeType" required />
      </div>
      <div class="form-group">
        <label for="yearBuilt">Year Built:</label>
        <select id="yearBuilt" required>
          <option value="">Select</option>
          ${[2020, 2021, 2022, 2023, 2024, 2025].map(year => `<option value="${year}">${year}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label for="constructionType">Construction Type:</label>
        <input type="text" id="constructionType" required />
      </div>
      <div class="form-group">
        <label for="squareFootage">Square Footage:</label>
        <input type="number" id="squareFootage" min="100" required />
      </div>
      <div class="form-group full-width">
        <label for="securitySystem">Security System Installed:</label>
        <select id="securitySystem" required>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    `;
  }
  });
}

if (form) {
  form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  const type = typeSelect.value;
  const baseData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    insuranceType: type
  };

  let details = {};

  if (type === "auto") {
    const vehicleType = document.getElementById("vehicleType");
    const make = document.getElementById("make");
    const model = document.getElementById("model");
    const year = document.getElementById("year");
    const drivingHistory = document.getElementById("drivingHistory");
    if (vehicleType && make && model && year && drivingHistory) {
      details = {
        vehicleType: vehicleType.value,
        make: make.value,
        model: model.value,
        year: year.value,
        drivingHistory: drivingHistory.value
      };
    }
  } else if (type === "life") {
    const age = document.getElementById("age");
    const gender = document.getElementById("gender");
    const smoker = document.getElementById("smoker");
    const health = document.getElementById("health");
    const coverage = document.getElementById("coverage");
    if (age && gender && smoker && health && coverage) {
      details = {
        age: age.value,
        gender: gender.value,
        smoker: smoker.value,
        health: health.value,
        coverage: coverage.value
      };
    }
  } else if (type === "home") {
    const homeType = document.getElementById("homeType");
    const yearBuilt = document.getElementById("yearBuilt");
    const constructionType = document.getElementById("constructionType");
    const squareFootage = document.getElementById("squareFootage");
    const securitySystem = document.getElementById("securitySystem");
    if (homeType && yearBuilt && constructionType && squareFootage && securitySystem) {
      details = {
        homeType: homeType.value,
        yearBuilt: yearBuilt.value,
        constructionType: constructionType.value,
        squareFootage: squareFootage.value,
        securitySystem: securitySystem.value
      };
    }
  }

  const fullData = { ...baseData, details };

  responseBox.innerHTML = "Submitting your request...";

  try {
    // Use environment-specific API endpoint
    const API_ENDPOINT = window.API_ENDPOINT || "https://1m8x9psbi2.execute-api.us-east-1.amazonaws.com";
    
    const response = await fetch(`${API_ENDPOINT}/submitQuote`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullData),
    });

    const result = await response.json();

    if (result.premiumAmount) {
      responseBox.innerHTML = `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
          <h3 style="margin: 0 0 10px 0; color: #2e7d32;">✅ Quote Generated Successfully!</h3>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${result.customerName || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Insurance Type:</strong> ${result.insuranceType?.charAt(0).toUpperCase() + result.insuranceType?.slice(1) || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 1.2em;"><strong>Estimated Premium:</strong> <span style="color: #1976d2; font-weight: bold;">$${result.premiumAmount}</span></p>
          <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">Your quote has been submitted for processing. You'll receive a detailed quote via email shortly.</p>
          <div style="margin-top: 15px;">
            <button onclick="form.reset(); dynamicFields.innerHTML=''; responseBox.innerHTML=''; typeSelect.value='';" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Start New Quote</button>
            <button onclick="window.location.href='index.html'" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Back to Home</button>
          </div>
        </div>
      `;
      
      // Auto-clear form after 3 seconds
      setTimeout(() => {
        form.reset();
        dynamicFields.innerHTML = '';
        typeSelect.value = '';
      }, 3000);
    } else if (result.submitted === false && result.message) {
      // Handle duplicate submission
      responseBox.innerHTML = `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0 0 10px 0; color: #f57c00;">⚠️ Duplicate Request</h3>
          <p style="margin: 5px 0;">${result.message}</p>
          <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">You can still get instant quotes with different values or start a new insurance type.</p>
          <div style="margin-top: 15px;">
            <button onclick="typeSelect.value=''; dynamicFields.innerHTML=''; responseBox.innerHTML='';" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Try Different Type</button>
            <button onclick="window.location.href='index.html'" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Back to Home</button>
          </div>
        </div>
      `;
    } else {
      responseBox.innerHTML = `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p style="margin: 0;">${result.message || "Request submitted successfully!"}</p>
        </div>
      `;
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Quote Request";
    }

  } catch (err) {
    console.error(err);
    responseBox.innerHTML = `
      <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
        <p style="margin: 0; color: #c62828;">❌ There was an error submitting your request. Please try again.</p>
      </div>
    `;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Quote Request";
    }
  }
  });
}

// Instant quote calculation
if (getQuoteBtn) {
  getQuoteBtn.addEventListener("click", async function() {
    const type = typeSelect.value;
    if (!type) {
      responseBox.innerHTML = `
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
          <p style="margin: 0; color: #c62828;">Please select an insurance type first.</p>
        </div>
      `;
      return;
    }

    // Validate required fields
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    
    if (!name || !email) {
      responseBox.innerHTML = `
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
          <p style="margin: 0; color: #c62828;">Please fill in your name and email address.</p>
        </div>
      `;
      return;
    }

    // Validate insurance-specific fields
    let missingFields = [];
    let details = {};
    
    if (type === "auto") {
      const vehicleType = document.getElementById("vehicleType");
      const make = document.getElementById("make");
      const model = document.getElementById("model");
      const year = document.getElementById("year");
      const drivingHistory = document.getElementById("drivingHistory");
      
      if (!vehicleType?.value) missingFields.push("Vehicle Type");
      if (!make?.value) missingFields.push("Make");
      if (!model?.value) missingFields.push("Model");
      if (!year?.value) missingFields.push("Year");
      if (!drivingHistory?.value) missingFields.push("Driving History");
      
      if (missingFields.length === 0) {
        details = {
          vehicleType: vehicleType.value,
          make: make.value,
          model: model.value,
          year: year.value,
          drivingHistory: drivingHistory.value
        };
      }
    } else if (type === "life") {
      const age = document.getElementById("age");
      const gender = document.getElementById("gender");
      const smoker = document.getElementById("smoker");
      const health = document.getElementById("health");
      const coverage = document.getElementById("coverage");
      
      if (!age?.value) missingFields.push("Age");
      if (!gender?.value) missingFields.push("Gender");
      if (!smoker?.value) missingFields.push("Smoker Status");
      if (!health?.value) missingFields.push("Health Status");
      if (!coverage?.value) missingFields.push("Coverage Amount");
      
      if (missingFields.length === 0) {
        details = {
          age: age.value,
          gender: gender.value,
          smoker: smoker.value,
          health: health.value,
          coverage: coverage.value
        };
      }
    } else if (type === "home") {
      const homeType = document.getElementById("homeType");
      const yearBuilt = document.getElementById("yearBuilt");
      const constructionType = document.getElementById("constructionType");
      const squareFootage = document.getElementById("squareFootage");
      const securitySystem = document.getElementById("securitySystem");
      
      if (!homeType?.value) missingFields.push("Home Type");
      if (!yearBuilt?.value) missingFields.push("Year Built");
      if (!constructionType?.value) missingFields.push("Construction Type");
      if (!squareFootage?.value) missingFields.push("Square Footage");
      if (!securitySystem?.value) missingFields.push("Security System");
      
      if (missingFields.length === 0) {
        details = {
          homeType: homeType.value,
          yearBuilt: yearBuilt.value,
          constructionType: constructionType.value,
          squareFootage: squareFootage.value,
          securitySystem: securitySystem.value
        };
      }
    }

    if (missingFields.length > 0) {
      responseBox.innerHTML = `
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
          <p style="margin: 0; color: #c62828;">Please fill in the following required fields: ${missingFields.join(", ")}</p>
        </div>
      `;
      return;
    }

    getQuoteBtn.disabled = true;
    getQuoteBtn.textContent = "Calculating...";

    const baseData = {
      name: name,
      email: email,
      insuranceType: type
    };

    const fullData = { ...baseData, details };

    try {
      const API_ENDPOINT = window.API_ENDPOINT || "https://1m8x9psbi2.execute-api.us-east-1.amazonaws.com";
      
      const response = await fetch(`${API_ENDPOINT}/calculatePremium`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullData),
      });

      const result = await response.json();

      if (result.premiumAmount) {
        responseBox.innerHTML = `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 10px 0; color: #1565c0;">📊 Instant Quote Estimate</h3>
            <p style="margin: 5px 0; font-size: 1.2em;"><strong>Estimated Premium:</strong> <span style="color: #1976d2; font-weight: bold;">$${result.premiumAmount}</span></p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; color: #666;">This is an instant estimate. Submit your request for a detailed quote and processing.</p>
          </div>
        `;
      } else {
        responseBox.innerHTML = `
          <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
            <p style="margin: 0; color: #c62828;">Unable to calculate premium. Please check your information.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error(err);
      responseBox.innerHTML = `
        <div style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">
          <p style="margin: 0; color: #c62828;">Error calculating quote. Please try again.</p>
        </div>
      `;
    } finally {
      getQuoteBtn.disabled = false;
      getQuoteBtn.textContent = "Get Instant Quote";
    }
  });
}
