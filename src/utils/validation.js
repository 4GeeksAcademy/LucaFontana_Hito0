/**
 * Brasaland — Brasa Points Registration Form Validation
 * Handles all form validation, dynamic dependent fields, and UI interactions.
 */

// ==================== CONSTANTS ====================

const LOCATIONS_DATA = {
    Colombia: {
        cities: ['Medellín', 'Bogotá', 'Cali'],
        restaurants: {
            'Medellín': ['Brasaland El Poblado', 'Brasaland Laureles', 'Brasaland Envigado', 'Brasaland Sabaneta'],
            'Bogotá': ['Brasaland Usaquén', 'Brasaland Chapinero', 'Brasaland Zona Rosa'],
            'Cali': ['Brasaland Granada', 'Brasaland Ciudad Jardín', 'Brasaland Unicentro']
        }
    },
    'Estados Unidos': {
        cities: ['Miami', 'Orlando'],
        restaurants: {
            'Miami': ['Brasaland Brickell', 'Brasaland Coral Gables'],
            'Orlando': ['Brasaland Downtown', 'Brasaland International Drive']
        }
    }
};

const ERROR_MESSAGES = {
    fullname: 'Ingresa tu nombre completo (nombre y apellido)',
    email: 'Ingresa un email válido (ejemplo: nombre@correo.com)',
    phone: 'El teléfono debe incluir código de país (ejemplo: +57 300 123 4567 o +1 305 123 4567)',
    country: 'Selecciona tu país',
    city: 'Selecciona tu ciudad',
    howFound: 'Cuéntanos cómo conociste Brasaland',
    birthdate: 'Debes ser mayor de 18 años para registrarte en Brasa Points',
    terms: 'Debes aceptar los términos del programa Brasa Points para continuar'
};

// ==================== DOM ELEMENTS ====================

const form = document.getElementById('brasa-form');
const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');
const locationSelect = document.getElementById('location');
const clearBtn = document.getElementById('clear-btn');
const successModal = document.getElementById('success-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validates that the full name contains at least 2 words (name and surname)
 */
function validateFullname(value) {
    const trimmed = value.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
}

/**
 * Validates email format
 */
function validateEmail(value) {
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
}

/**
 * Validates phone number starts with + followed by country code
 */
function validatePhone(value) {
    const trimmed = value.trim();
    const phoneRegex = /^\+\d{1,3}\s?\d[\d\s\-]{6,}$/;
    return phoneRegex.test(trimmed);
}

/**
 * Validates that the user is at least 18 years old
 */
function validateBirthdate(value) {
    if (!value) return false;
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 18;
}

/**
 * Validates a select field has a value selected
 */
function validateSelect(value) {
    return value !== '' && value !== null;
}

/**
 * Validates that the terms checkbox is checked
 */
function validateTerms(checked) {
    return checked === true;
}

// ==================== ERROR DISPLAY FUNCTIONS ====================

/**
 * Shows an error message for a field
 */
function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    if (inputEl) {
        inputEl.classList.add('border-red-500');
        inputEl.classList.remove('border-white/10');
        inputEl.setAttribute('aria-invalid', 'true');
    }
}

/**
 * Hides the error message for a field
 */
function hideError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }

    if (inputEl) {
        inputEl.classList.remove('border-red-500');
        inputEl.classList.add('border-white/10');
        inputEl.removeAttribute('aria-invalid');
    }
}

// ==================== DEPENDENT FIELDS LOGIC ====================

/**
 * Updates city options based on selected country
 */
function updateCities() {
    const country = countrySelect.value;
    citySelect.innerHTML = '<option value="" disabled selected>Selecciona tu ciudad</option>';
    locationSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una ciudad</option>';
    locationSelect.disabled = true;

    if (country && LOCATIONS_DATA[country]) {
        const cities = LOCATIONS_DATA[country].cities;
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    } else {
        citySelect.disabled = true;
    }
}

/**
 * Updates restaurant location options based on selected country and city
 */
function updateLocations() {
    const country = countrySelect.value;
    const city = citySelect.value;
    locationSelect.innerHTML = '<option value="" disabled selected>Selecciona una ubicación (opcional)</option>';

    if (country && city && LOCATIONS_DATA[country] && LOCATIONS_DATA[country].restaurants[city]) {
        const restaurants = LOCATIONS_DATA[country].restaurants[city];
        restaurants.forEach(restaurant => {
            const option = document.createElement('option');
            option.value = restaurant;
            option.textContent = restaurant;
            locationSelect.appendChild(option);
        });
        locationSelect.disabled = false;
    } else {
        locationSelect.disabled = true;
    }
}

// ==================== REAL-TIME VALIDATION ====================

/**
 * Sets up real-time validation event listeners on form fields
 */
function setupRealTimeValidation() {
    // Fullname
    const fullnameInput = document.getElementById('fullname');
    fullnameInput.addEventListener('blur', () => {
        if (fullnameInput.value.trim() !== '') {
            if (validateFullname(fullnameInput.value)) {
                hideError('fullname');
            } else {
                showError('fullname', ERROR_MESSAGES.fullname);
            }
        }
    });
    fullnameInput.addEventListener('input', () => {
        if (fullnameInput.getAttribute('aria-invalid') === 'true') {
            if (validateFullname(fullnameInput.value)) {
                hideError('fullname');
            }
        }
    });

    // Email
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() !== '') {
            if (validateEmail(emailInput.value)) {
                hideError('email');
            } else {
                showError('email', ERROR_MESSAGES.email);
            }
        }
    });
    emailInput.addEventListener('input', () => {
        if (emailInput.getAttribute('aria-invalid') === 'true') {
            if (validateEmail(emailInput.value)) {
                hideError('email');
            }
        }
    });

    // Phone
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim() !== '') {
            if (validatePhone(phoneInput.value)) {
                hideError('phone');
            } else {
                showError('phone', ERROR_MESSAGES.phone);
            }
        }
    });
    phoneInput.addEventListener('input', () => {
        if (phoneInput.getAttribute('aria-invalid') === 'true') {
            if (validatePhone(phoneInput.value)) {
                hideError('phone');
            }
        }
    });

    // Birthdate
    const birthdateInput = document.getElementById('birthdate');
    birthdateInput.addEventListener('change', () => {
        if (birthdateInput.value) {
            if (validateBirthdate(birthdateInput.value)) {
                hideError('birthdate');
            } else {
                showError('birthdate', ERROR_MESSAGES.birthdate);
            }
        }
    });

    // Country
    countrySelect.addEventListener('change', () => {
        hideError('country');
        updateCities();
    });

    // City
    citySelect.addEventListener('change', () => {
        hideError('city');
        updateLocations();
    });

    // How found
    const howFoundSelect = document.getElementById('how-found');
    howFoundSelect.addEventListener('change', () => {
        if (howFoundSelect.value) {
            hideError('how-found');
        }
    });

    // Terms
    const termsCheckbox = document.getElementById('terms');
    termsCheckbox.addEventListener('change', () => {
        if (termsCheckbox.checked) {
            hideError('terms');
        }
    });
}

// ==================== FORM SUBMISSION ====================

/**
 * Validates the entire form and returns whether it's valid
 */
function validateForm() {
    let isValid = true;

    // Fullname
    const fullname = document.getElementById('fullname').value;
    if (!validateFullname(fullname)) {
        showError('fullname', ERROR_MESSAGES.fullname);
        isValid = false;
    } else {
        hideError('fullname');
    }

    // Email
    const email = document.getElementById('email').value;
    if (!validateEmail(email)) {
        showError('email', ERROR_MESSAGES.email);
        isValid = false;
    } else {
        hideError('email');
    }

    // Phone
    const phone = document.getElementById('phone').value;
    if (!validatePhone(phone)) {
        showError('phone', ERROR_MESSAGES.phone);
        isValid = false;
    } else {
        hideError('phone');
    }

    // Birthdate
    const birthdate = document.getElementById('birthdate').value;
    if (!validateBirthdate(birthdate)) {
        showError('birthdate', ERROR_MESSAGES.birthdate);
        isValid = false;
    } else {
        hideError('birthdate');
    }

    // Country
    const country = countrySelect.value;
    if (!validateSelect(country)) {
        showError('country', ERROR_MESSAGES.country);
        isValid = false;
    } else {
        hideError('country');
    }

    // City
    const city = citySelect.value;
    if (!validateSelect(city)) {
        showError('city', ERROR_MESSAGES.city);
        isValid = false;
    } else {
        hideError('city');
    }

    // How Found
    const howFound = document.getElementById('how-found').value;
    if (!validateSelect(howFound)) {
        showError('how-found', ERROR_MESSAGES.howFound);
        isValid = false;
    } else {
        hideError('how-found');
    }

    // Terms
    const terms = document.getElementById('terms').checked;
    if (!validateTerms(terms)) {
        showError('terms', ERROR_MESSAGES.terms);
        isValid = false;
    } else {
        hideError('terms');
    }

    return isValid;
}

/**
 * Handles form submission
 */
function handleSubmit(event) {
    event.preventDefault();

    if (validateForm()) {
        openModal();
    } else {
        // Focus first invalid field for accessibility
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) {
            firstError.focus();
        }
    }
}

// ==================== MODAL FUNCTIONS ====================

/**
 * Opens the success modal
 */
function openModal() {
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');

    // Trigger animation
    requestAnimationFrame(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    });

    // Trap focus in modal
    modalClose.focus();

    // Prevent background scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the success modal
 */
function closeModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        successModal.classList.add('hidden');
        successModal.classList.remove('flex');
        document.body.style.overflow = '';
    }, 300);
}

// ==================== CLEAR FORM ====================

/**
 * Resets the form and all dependent fields
 */
function clearForm() {
    form.reset();

    // Reset dependent selects
    citySelect.innerHTML = '<option value="" disabled selected>Primero selecciona un país</option>';
    citySelect.disabled = true;
    locationSelect.innerHTML = '<option value="" disabled selected>Primero selecciona una ciudad</option>';
    locationSelect.disabled = true;

    // Clear all errors
    const errorFields = ['fullname', 'email', 'phone', 'birthdate', 'country', 'city', 'how-found', 'terms'];
    errorFields.forEach(field => hideError(field));
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Setup real-time validation
    setupRealTimeValidation();

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Clear button
    clearBtn.addEventListener('click', clearForm);

    // Modal close events
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !successModal.classList.contains('hidden')) {
            closeModal();
        }
    });
});
