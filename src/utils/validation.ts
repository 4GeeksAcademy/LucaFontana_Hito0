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

const form = document.getElementById('brasa-form') as HTMLFormElement | null;
const countrySelect = document.getElementById('country') as  HTMLSelectElement | null; 
const citySelect = document.getElementById('city') as  HTMLSelectElement | null;
const locationSelect = document.getElementById('location') as  HTMLSelectElement | null;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement | null;
const successModal = document.getElementById('success-modal') as HTMLDivElement | null;
const modalBackdrop = document.getElementById('modal-backdrop') as HTMLDivElement | null;
const modalContent = document.getElementById('modal-content') as HTMLDivElement | null;
const modalClose = document.getElementById('modal-close') as HTMLButtonElement | null;

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validates that the full name contains at least 2 words (name and surname)
 */
function validateFullname(value: string): boolean {
    const trimmed = value.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
}

/**
 * Validates email format
 */
function validateEmail(value: string): boolean {
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
}

/**
 * Validates phone number starts with + followed by country code
 */
function validatePhone(value: string): boolean {
    const trimmed = value.trim();
    const phoneRegex = /^\+\d{1,3}\s?\d[\d\s\-]{6,}$/;
    return phoneRegex.test(trimmed);
}

/**
 * Validates that the user is at least 18 years old
 */
function validateBirthdate(value: string): boolean {
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
function validateSelect(value: string): boolean {
    return value !== '' && value !== null;
}

/**
 * Validates that the terms checkbox is checked
 */
function validateTerms(checked: boolean): boolean {
    return checked === true;
}

// ==================== ERROR DISPLAY FUNCTIONS ====================

/**
 * Shows an error message for a field
 */
function showError(fieldId: string, message: string) {
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
function hideError(fieldId: string) {
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
    if (!countrySelect || !citySelect || !locationSelect) return;
    
    const country: string | null = countrySelect.value;
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
    if (!countrySelect || !citySelect || !locationSelect) return;

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

    const fullnameInput = document.getElementById('fullname') as HTMLInputElement;
    if (!fullnameInput) return;

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
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (!emailInput) return;
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
    const phoneInput = document.getElementById('phone') as HTMLInputElement | null;

    if (!phoneInput) return;
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
    const birthdateInput = document.getElementById('birthdate') as HTMLInputElement;
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
    if (!countrySelect) return;

    countrySelect.addEventListener('change', () => {
        hideError('country');
        updateCities();
    });

    // City
    if (!citySelect) return;

    citySelect.addEventListener('change', () => {
        hideError('city');
        updateLocations();
    });

    // How found
    const howFoundSelect = document.getElementById('how-found') as HTMLSelectElement | null;
    if (!howFoundSelect) return;

    howFoundSelect.addEventListener('change', () => {
        if (howFoundSelect.value) {
            hideError('how-found');
        }
    });

    // Terms
    const termsCheckbox = document.getElementById('terms') as HTMLInputElement | null;
    if (!termsCheckbox) return;

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
    const fullnameInput = document.querySelector<HTMLInputElement>('#fullname');

    // 2. Verificas de forma segura que el elemento realmente exista
    if (!fullnameInput) return;

    // 3. Ahora que TypeScript está seguro de que existe y es un input, extraes el valor
    const fullname = fullnameInput.value;

    if (!fullname) return;

    if (!validateFullname(fullname)) {
        showError('fullname', ERROR_MESSAGES.fullname);
        isValid = false;
    } else {
        hideError('fullname');
    }

    const emailInput = document.querySelector<HTMLInputElement>('#email');

    if (!emailInput) return;

    const email = fullnameInput.value;
    // Email

    if (!validateEmail(email)) {
        showError('email', ERROR_MESSAGES.email);
        isValid = false;
    } else {
        hideError('email');
    }

    // Phone
    const phoneInput = document.querySelector<HTMLInputElement>('#phone');

    if (!phoneInput) return;

    const phone = phoneInput.value;

    if (!validatePhone(phone)) {
        showError('phone', ERROR_MESSAGES.phone);
        isValid = false;
    } else {
        hideError('phone');
    }

    // Birthdate
    const birthdayInput = document.querySelector<HTMLInputElement>('#birthdate');

    if (!birthdayInput) return;

    const birthdate = birthdayInput.value;

    if (!validateBirthdate(birthdate)) {
        showError('birthdate', ERROR_MESSAGES.birthdate);
        isValid = false;
    } else {
        hideError('birthdate');
    }

const howFoundSelect = document.querySelector<HTMLSelectElement>('#how-found');
    const termsInput = document.querySelector<HTMLInputElement>('#terms');

    // --- 2. VALIDACIONES DE SEGURIDAD (Control de Nulls) ---
    // Nos aseguramos de que todos los elementos existan en el DOM antes de leer sus valores
    if (!countrySelect || !citySelect || !howFoundSelect || !termsInput) return false;


    // --- 3. LÓGICA DE VALIDACIÓN ---

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

    // How Found (Ya no da error porque howFoundSelect está controlado)
    const howFound = howFoundSelect.value;
    if (!validateSelect(howFound)) {
        showError('how-found', ERROR_MESSAGES.howFound);
        isValid = false;
    } else {
        hideError('how-found');
    }

    // Terms (Ya puedes usar .checked de forma segura gracias a HTMLInputElement)
    const terms = termsInput.checked;
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
function handleSubmit(event: any) {
    event.preventDefault();

    if (validateForm()) {
        openModal();
    } else {
        // Focus first invalid field for accessibility
        if (!form) return;
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
    if (!successModal || !modalContent || !modalClose) return;
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
    if (!modalContent || !successModal) return;
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
    if (!form || !citySelect || !locationSelect) return;
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

    if (!form || !clearBtn || !modalClose || ! modalBackdrop || !successModal) return;

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
